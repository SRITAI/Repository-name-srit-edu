-- 0008_support_chat.sql
-- Live support chat foundation. Requires 0006_employee_program_foundation.sql.
-- Realtime Broadcast delivers events; these tables retain message history.

create table public.support_conversations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  student_display_name text not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz,
  constraint support_conversations_closed_at_check check (
    (status = 'open' and closed_at is null) or
    (status = 'closed' and closed_at is not null)
  )
);

-- A student may have one open conversation. Closed conversations remain history.
create unique index support_conversations_one_open_per_student
  on public.support_conversations(student_id)
  where status = 'open';

create index support_conversations_open_updated_at
  on public.support_conversations(updated_at desc)
  where status = 'open';

create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null
    references public.support_conversations(id) on delete cascade,
  sender_type text not null check (sender_type in ('student', 'employee')),
  sender_user_id uuid not null references public.profiles(id) on delete restrict,
  sender_employee_id text,
  sender_display_name text not null,
  body text not null check (length(btrim(body)) between 1 and 4000),
  created_at timestamptz not null default now(),
  constraint support_messages_employee_id_check check (
    (sender_type = 'student' and sender_employee_id is null) or
    (sender_type = 'employee' and sender_employee_id is not null)
  )
);

create index support_messages_conversation_order
  on public.support_messages(conversation_id, created_at, id);

create index support_messages_sender
  on public.support_messages(sender_user_id, created_at desc);

-- Derive student identity and display name from the authenticated user.
-- Conversation ownership and creation time cannot be changed later.
create function public.support_chat_prepare_conversation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text;
begin
  if tg_op = 'INSERT' then
    select p.full_name into v_name
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'student';

    if not found then
      raise exception 'Only students can start support conversations'
        using errcode = '42501';
    end if;

    new.student_id := (select auth.uid());
    new.student_display_name :=
      coalesce(nullif(btrim(v_name), ''), 'Student');
    new.status := 'open';
    new.created_at := now();
    new.updated_at := new.created_at;
    new.closed_at := null;
    return new;
  end if;

  if new.id is distinct from old.id
     or new.student_id is distinct from old.student_id
     or new.student_display_name is distinct from old.student_display_name
     or new.created_at is distinct from old.created_at then
    raise exception 'Conversation identity cannot be changed'
      using errcode = '42501';
  end if;

  if new.status is distinct from old.status then
    if old.status <> 'open' or new.status <> 'closed' then
      raise exception 'Only open conversations can be closed'
        using errcode = '23514';
    end if;
    new.closed_at := now();
  elsif new.closed_at is distinct from old.closed_at then
    raise exception 'closed_at is managed by the database'
      using errcode = '42501';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger support_chat_prepare_conversation_trigger
  before insert or update on public.support_conversations
  for each row execute function public.support_chat_prepare_conversation();

-- Serialize sends with conversation closure, validate the caller, and
-- overwrite all client-provided sender fields with database-derived values.
create function public.support_chat_prepare_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_status text;
  v_role text;
  v_name text;
  v_employee_id text;
begin
  select c.student_id, c.status into v_student_id, v_status
  from public.support_conversations c
  where c.id = new.conversation_id
  for update;

  if not found or v_status <> 'open' then
    raise exception 'Open support conversation required'
      using errcode = '42501';
  end if;

  select p.role::text, p.full_name into v_role, v_name
  from public.profiles p
  where p.id = (select auth.uid());

  if v_role = 'student' and v_student_id = (select auth.uid()) then
    new.sender_type := 'student';
    new.sender_employee_id := null;
  elsif v_role = 'employee' then
    select e.employee_id into v_employee_id
    from public.employee_profiles e
    where e.id = (select auth.uid())
      and e.status = 'active';

    if v_employee_id is null then
      raise exception 'Active employee required'
        using errcode = '42501';
    end if;

    new.sender_type := 'employee';
    new.sender_employee_id := v_employee_id;
  else
    raise exception 'Not authorized for this conversation'
      using errcode = '42501';
  end if;

  new.sender_user_id := (select auth.uid());
  new.sender_display_name :=
    coalesce(
      nullif(btrim(v_name), ''),
      case when new.sender_type = 'employee'
        then 'Employee' else 'Student' end
    );
  new.body := btrim(new.body);
  new.created_at := now();
  return new;
end;
$$;

create trigger support_chat_prepare_message_trigger
  before insert on public.support_messages
  for each row execute function public.support_chat_prepare_message();

-- Send only an explicit safe projection. Never broadcast the complete row:
-- it contains sender_user_id and sender_employee_id.
create function public.support_chat_broadcast_conversation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payload jsonb;
begin
  v_payload := jsonb_build_object(
    'conversation_id', new.id,
    'student_display_name', new.student_display_name,
    'status', new.status,
    'updated_at', new.updated_at
  );

  perform realtime.send(
    v_payload, 'conversation', 'support:employees', true
  );

  perform realtime.send(
    v_payload, 'conversation',
    'support:student:' || new.student_id::text, true
  );

  return new;
end;
$$;

create trigger support_chat_broadcast_conversation_trigger
  after insert or update of status on public.support_conversations
  for each row execute function public.support_chat_broadcast_conversation();

create function public.support_chat_broadcast_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_payload jsonb;
begin
  select c.student_id into v_student_id
  from public.support_conversations c
  where c.id = new.conversation_id;

  -- Keep the active-conversation ordering current after each message.
  update public.support_conversations
  set updated_at = now()
  where id = new.conversation_id;

  v_payload := jsonb_build_object(
    'id', new.id,
    'conversation_id', new.conversation_id,
    'sender_type', new.sender_type,
    'sender_display_name', new.sender_display_name,
    'body', new.body,
    'created_at', new.created_at
  );

  -- The owning student receives both student and employee messages.
  perform realtime.send(
    v_payload, 'message',
    'support:student:' || v_student_id::text, true
  );

  if new.sender_type = 'student' then
    -- Student messages go to all active employee listeners.
    perform realtime.send(
      v_payload, 'message', 'support:employees', true
    );
  else
    -- An employee reply goes only to its author on the employee side.
    perform realtime.send(
      v_payload, 'message',
      'support:employee:' || new.sender_user_id::text, true
    );
  end if;

  return new;
end;
$$;

create trigger support_chat_broadcast_message_trigger
  after insert on public.support_messages
  for each row execute function public.support_chat_broadcast_message();

alter table public.support_conversations enable row level security;
alter table public.support_messages enable row level security;

create policy "Students read own support conversations"
  on public.support_conversations
  for select to authenticated
  using (student_id = (select auth.uid()));

create policy "Active employees read open support conversations"
  on public.support_conversations
  for select to authenticated
  using (
    status = 'open'
    and exists (
      select 1
      from public.profiles p
      join public.employee_profiles e on e.id = p.id
      where p.id = (select auth.uid())
        and p.role = 'employee'
        and e.status = 'active'
    )
  );

create policy "Admins read support conversations"
  on public.support_conversations
  for select to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

create policy "Students start own support conversations"
  on public.support_conversations
  for insert to authenticated
  with check (
    student_id = (select auth.uid())
    and status = 'open'
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'student'
    )
  );

create policy "Admins close support conversations"
  on public.support_conversations
  for update to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

-- A student can read every message in their own conversation.
create policy "Students read all messages in own support conversations"
  on public.support_messages
  for select to authenticated
  using (
    exists (
      select 1
      from public.support_conversations c
      join public.profiles p on p.id = c.student_id
      where c.id = conversation_id
        and c.student_id = (select auth.uid())
        and p.role = 'student'
    )
  );

-- An active employee can read student messages in open conversations.
create policy "Active employees read student messages in open conversations"
  on public.support_messages
  for select to authenticated
  using (
    sender_type = 'student'
    and exists (
      select 1 from public.support_conversations c
      where c.id = conversation_id and c.status = 'open'
    )
    and exists (
      select 1
      from public.profiles p
      join public.employee_profiles e on e.id = p.id
      where p.id = (select auth.uid())
        and p.role = 'employee'
        and e.status = 'active'
    )
  );

-- An active employee can read their own replies, including after closure.
-- There is no policy granting access to another employee's replies.
create policy "Active employees read only their own replies"
  on public.support_messages
  for select to authenticated
  using (
    sender_type = 'employee'
    and sender_user_id = (select auth.uid())
    and exists (
      select 1
      from public.profiles p
      join public.employee_profiles e on e.id = p.id
      where p.id = (select auth.uid())
        and p.role = 'employee'
        and e.status = 'active'
    )
  );

create policy "Admins read all support messages"
  on public.support_messages
  for select to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

create policy "Students send messages in own open conversations"
  on public.support_messages
  for insert to authenticated
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
  );

create policy "Active employees send only their own replies"
  on public.support_messages
  for insert to authenticated
  with check (
    sender_type = 'employee'
    and sender_user_id = (select auth.uid())
    and exists (
      select 1 from public.support_conversations c
      where c.id = conversation_id and c.status = 'open'
    )
    and exists (
      select 1
      from public.profiles p
      join public.employee_profiles e on e.id = p.id
      where p.id = (select auth.uid())
        and p.role = 'employee'
        and e.status = 'active'
    )
  );

-- No support_messages UPDATE or DELETE policies are created.
-- Column privileges prevent direct API reads of internal sender IDs.
revoke all on public.support_conversations
  from public, anon, authenticated;
revoke all on public.support_messages
  from public, anon, authenticated;

-- student_id is required by the student message ownership policy above.
grant select (
  id, student_id, student_display_name, status, created_at, updated_at, closed_at
) on public.support_conversations to authenticated;

grant insert (student_id), update (status)
  on public.support_conversations to authenticated;

grant select (
  id, conversation_id, sender_type, sender_display_name, body, created_at
) on public.support_messages to authenticated;

grant insert (conversation_id, body)
  on public.support_messages to authenticated;

-- Trigger functions are not application RPC endpoints.
revoke all on function public.support_chat_prepare_conversation()
  from public, anon, authenticated;
revoke all on function public.support_chat_prepare_message()
  from public, anon, authenticated;
revoke all on function public.support_chat_broadcast_conversation()
  from public, anon, authenticated;
revoke all on function public.support_chat_broadcast_message()
  from public, anon, authenticated;

-- Realtime private Broadcast authorization. No Presence policy and no
-- client Broadcast INSERT policy are added by this migration.
create policy "Active employees receive support broadcasts"
  on realtime.messages
  for select to authenticated
  using (
    extension = 'broadcast'
    and (select realtime.topic()) in (
      'support:employees',
      'support:employee:' || (select auth.uid())::text
    )
    and exists (
      select 1
      from public.profiles p
      join public.employee_profiles e on e.id = p.id
      where p.id = (select auth.uid())
        and p.role = 'employee'
        and e.status = 'active'
    )
  );

create policy "Students receive only their own support broadcasts"
  on realtime.messages
  for select to authenticated
  using (
    extension = 'broadcast'
    and (select realtime.topic()) =
      'support:student:' || (select auth.uid())::text
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'student'
    )
  );
