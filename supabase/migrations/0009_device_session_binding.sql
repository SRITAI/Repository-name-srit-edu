-- Bind support-chat access to the current Supabase Auth session and the
-- existing, server-managed student device session. Apply as one transaction.
begin;

alter table public.student_sessions
  add column auth_session_id uuid;

create unique index student_sessions_auth_session_id_unique
  on public.student_sessions (auth_session_id)
  where auth_session_id is not null;

-- All application reads and writes of this table use the server-only
-- service-role client. Do not let a browser undo revocation or change binding.
revoke all on public.student_sessions from anon, authenticated;
revoke all (
  id, user_id, device_label, user_agent, ip_address, last_active_at,
  revoked_at, created_at, session_token_hash, expires_at, auth_session_id
) on public.student_sessions from anon, authenticated;

drop policy "Users update own sessions" on public.student_sessions;

-- Replace the old service-role-only signature so it cannot register an
-- unbound student session through a legacy overload.
drop function public.register_device_session(
  uuid, text, text, text, text, integer, interval
);

create function public.register_device_session(
  p_user_id uuid,
  p_session_token_hash text,
  p_device_label text,
  p_user_agent text,
  p_ip_address text,
  p_auth_session_id uuid,
  p_max_devices integer default 2,
  p_session_duration interval default interval '30 days',
  p_fresh_session_token_hash text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_active_count integer;
  v_session_id uuid;
  v_now timestamptz := now();
  v_role text;
begin
  select p.role::text into v_role
  from public.profiles p
  where p.id = p_user_id;

  if v_role is null then
    return jsonb_build_object('success', false, 'error', 'PROFILE_NOT_FOUND');
  end if;

  if v_role = 'student' and p_auth_session_id is null then
    return jsonb_build_object('success', false, 'error', 'AUTH_SESSION_REQUIRED');
  end if;

  if v_role = 'student' and nullif(p_fresh_session_token_hash, '') is null then
    return jsonb_build_object('success', false, 'error', 'FRESH_DEVICE_TOKEN_REQUIRED');
  end if;

  -- Serialize device registration and the active-device count per user.
  perform 1 from public.profiles p where p.id = p_user_id for update;

  if p_session_token_hash is not null then
    select s.id into v_session_id
    from public.student_sessions s
    where s.session_token_hash = p_session_token_hash
      and s.user_id = p_user_id
      and s.revoked_at is null
      and s.expires_at > v_now
    for update;

    if v_session_id is not null then
      update public.student_sessions s
      set last_active_at = v_now,
          expires_at = v_now + p_session_duration,
          user_agent = coalesce(p_user_agent, s.user_agent),
          ip_address = coalesce(p_ip_address, s.ip_address),
          device_label = coalesce(p_device_label, s.device_label),
          auth_session_id = p_auth_session_id
      where s.id = v_session_id;

      return jsonb_build_object(
        'success', true, 'session_id', v_session_id, 'reused', true
      );
    end if;
  end if;

  if v_role = 'student' then
    select count(*) into v_active_count
    from public.student_sessions s
    where s.user_id = p_user_id
      and s.revoked_at is null
      and s.expires_at > v_now;

    if v_active_count >= p_max_devices then
      return jsonb_build_object('success', false, 'error', 'MAX_DEVICES_REACHED');
    end if;
  end if;

  -- The candidate cookie row may have been revoked or expired since the
  -- server checked it. Students insert with the independently generated hash.
  insert into public.student_sessions (
    user_id, session_token_hash, auth_session_id, device_label,
    user_agent, ip_address, last_active_at, expires_at, created_at
  ) values (
    p_user_id,
    case when v_role = 'student' then p_fresh_session_token_hash else p_session_token_hash end,
    p_auth_session_id, p_device_label,
    p_user_agent, p_ip_address, v_now, v_now + p_session_duration, v_now
  ) returning id into v_session_id;

  return jsonb_build_object(
    'success', true, 'session_id', v_session_id, 'reused', false
  );
end;
$$;

revoke all on function public.register_device_session(
  uuid, text, text, text, text, uuid, integer, interval, text
) from public, anon, authenticated;
grant execute on function public.register_device_session(
  uuid, text, text, text, text, uuid, integer, interval, text
) to service_role;

-- A malformed or absent claim returns false. The function reveals only a
-- Boolean for the authenticated caller, never device-session row data.
create function public.support_student_has_active_device()
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_auth_session_id uuid;
begin
  if (select auth.uid()) is null then
    return false;
  end if;

  begin
    v_auth_session_id := nullif((select auth.jwt())->>'session_id', '')::uuid;
  exception when invalid_text_representation then
    return false;
  end;

  if v_auth_session_id is null then
    return false;
  end if;

  return exists (
    select 1
    from public.student_sessions s
    where s.user_id = (select auth.uid())
      and s.auth_session_id = v_auth_session_id
      and s.revoked_at is null
      and s.expires_at > now()
  );
end;
$$;

revoke all on function public.support_student_has_active_device()
  from public, anon, authenticated;
grant execute on function public.support_student_has_active_device()
  to authenticated;

-- There is no trustworthy mapping from old cookie hashes to Auth sessions.
-- Revoke old active student rows; students sign in again to bind a new row.
update public.student_sessions s
set revoked_at = now()
from public.profiles p
where p.id = s.user_id
  and p.role = 'student'
  and s.auth_session_id is null
  and s.revoked_at is null
  and s.expires_at > now();

-- Keep every ownership, role, and open-state predicate from migration 0008.
alter policy "Students read own support conversations"
  on public.support_conversations
  using (
    student_id = (select auth.uid())
    and (select public.support_student_has_active_device())
  );

alter policy "Students start own support conversations"
  on public.support_conversations
  with check (
    student_id = (select auth.uid())
    and status = 'open'
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'student'
    )
    and (select public.support_student_has_active_device())
  );

alter policy "Students read all messages in own support conversations"
  on public.support_messages
  using (
    exists (
      select 1
      from public.support_conversations c
      join public.profiles p on p.id = c.student_id
      where c.id = conversation_id
        and c.student_id = (select auth.uid())
        and p.role = 'student'
    )
    and (select public.support_student_has_active_device())
  );

alter policy "Students send messages in own open conversations"
  on public.support_messages
  with check (
    sender_type = 'student'
    and sender_user_id = (select auth.uid())
    and exists (
      select 1 from public.support_conversations c
      where c.id = conversation_id
        and c.student_id = (select auth.uid())
        and c.status = 'open'
    )
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'student'
    )
    and (select public.support_student_has_active_device())
  );

alter policy "Students receive only their own support broadcasts"
  on realtime.messages
  using (
    extension = 'broadcast'
    and (select realtime.topic()) =
      'support:student:' || (select auth.uid())::text
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'student'
    )
    and (select public.support_student_has_active_device())
  );

commit;
