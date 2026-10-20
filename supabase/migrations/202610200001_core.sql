-- Apply with Supabase CLI. No client has a service-role key or direct write grants.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.profiles (
 id uuid primary key references auth.users on delete cascade,
 username text not null unique check(username ~ '^[a-z0-9_]{3,24}$'),
 display_name text not null check(length(display_name) between 2 and 50),
 bio text not null default '' check(length(bio)<=300), avatar text not null default 'bloom',
 created_at timestamptz not null default now()
);
create table public.private_profile_settings (
 user_id uuid primary key references public.profiles on delete cascade,
 adult_declared_at timestamptz not null default now(), terms_accepted_at timestamptz not null default now(),
 topics text[] not null default '{}', discovery boolean not null default false,
 show_topics boolean not null default false, profile_visible boolean not null default true,
 accept_requests boolean not null default true, reduce_motion boolean not null default false,
 read_receipts boolean not null default false, notifications boolean not null default true,
 quiet_start time not null default '22:00', quiet_end time not null default '08:00',
 muted_topics text[] not null default '{}', suspended boolean not null default false,
 deactivated boolean not null default false, updated_at timestamptz not null default now()
);
create table private.roles(user_id uuid primary key references public.profiles on delete cascade, role text not null check(role in ('moderator','admin')));
create table public.communities (
 slug text primary key, name text not null, description text not null, guidelines text not null,
 pinned text not null default 'Take your time. Share only what feels comfortable. This is peer support, not clinical care.', created_at timestamptz not null default now()
);
create table public.memberships(user_id uuid references public.profiles on delete cascade,community_slug text references public.communities on delete cascade,created_at timestamptz not null default now(),primary key(user_id,community_slug));
create table public.discovery_preferences(user_id uuid primary key references public.profiles on delete cascade,allowed_topics text[] not null default '{}',language text not null check(language in ('English','Hindi','Hinglish')),intent text not null default '');
create table public.blocks(blocker_id uuid references public.profiles on delete cascade,blocked_id uuid references public.profiles on delete cascade,created_at timestamptz not null default now(),primary key(blocker_id,blocked_id),check(blocker_id<>blocked_id));
create table public.discovery_dismissals(user_id uuid references public.profiles on delete cascade,target_id uuid references public.profiles on delete cascade,primary key(user_id,target_id));
create table public.connections(id uuid primary key default gen_random_uuid(),requester_id uuid not null references public.profiles on delete cascade,recipient_id uuid not null references public.profiles on delete cascade,status text not null default 'pending' check(status in ('pending','accepted','declined')),note text not null check(length(note) between 1 and 300),created_at timestamptz not null default now(),check(requester_id<>recipient_id));
create unique index connection_pair on public.connections(least(requester_id,recipient_id),greatest(requester_id,recipient_id));
create table public.posts(id uuid primary key default gen_random_uuid(),author_id uuid not null references public.profiles on delete cascade,community_slug text not null references public.communities,body text not null check(length(body) between 1 and 10000),audience text not null check(audience in ('community','connections','draft')),warning text not null default '' check(length(warning)<=120),comments_enabled boolean not null default true,hide_counts boolean not null default false,journey_id uuid references public.posts on delete set null,removed boolean not null default false,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create index posts_page on public.posts(created_at desc,id desc);
create index posts_community on public.posts(community_slug,created_at desc);
create table public.journey_entries(id uuid primary key default gen_random_uuid(),journey_id uuid not null references public.posts on delete cascade,post_id uuid not null unique references public.posts on delete cascade,created_at timestamptz not null default now());
create table public.comments(id uuid primary key default gen_random_uuid(),post_id uuid not null references public.posts on delete cascade,author_id uuid not null references public.profiles on delete cascade,parent_id uuid references public.comments on delete cascade,body text not null check(length(body) between 1 and 2000),created_at timestamptz not null default now());
create index comments_post on public.comments(post_id,created_at);
create table public.reactions(post_id uuid references public.posts on delete cascade,user_id uuid references public.profiles on delete cascade,kind text not null check(kind in ('I hear you','Sending support','Thank you for sharing')),created_at timestamptz not null default now(),primary key(post_id,user_id));
create table public.bookmarks(post_id uuid references public.posts on delete cascade,user_id uuid references public.profiles on delete cascade,created_at timestamptz not null default now(),primary key(post_id,user_id));
create table public.conversations(id uuid primary key default gen_random_uuid(),connection_id uuid not null unique references public.connections on delete cascade,ended boolean not null default false,created_at timestamptz not null default now());
create table public.conversation_members(conversation_id uuid references public.conversations on delete cascade,user_id uuid references public.profiles on delete cascade,muted boolean not null default false,archived boolean not null default false,last_read_at timestamptz,primary key(conversation_id,user_id));
create table public.messages(id uuid primary key default gen_random_uuid(),conversation_id uuid not null references public.conversations on delete cascade,sender_id uuid not null references public.profiles on delete cascade,body text not null check(length(body)<=4000),reply_to uuid references public.messages on delete set null,created_at timestamptz not null default now());
create index messages_page on public.messages(conversation_id,created_at desc,id desc);
create table public.message_reactions(message_id uuid references public.messages on delete cascade,user_id uuid references public.profiles on delete cascade,kind text not null check(kind in ('Sending support','Thank you')),primary key(message_id,user_id));
create table public.post_media(id uuid primary key,post_id uuid not null references public.posts on delete cascade,kind text not null check(kind in ('image','video')),path text not null unique,caption text not null default '' check(length(caption)<=300),created_at timestamptz not null default now());
create table public.message_media(id uuid primary key,message_id uuid not null references public.messages on delete cascade,kind text not null check(kind in ('image','video')),path text not null unique,caption text not null default '' check(length(caption)<=300),created_at timestamptz not null default now());
create table public.notifications(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles on delete cascade,body text not null default 'You have an update',href text not null default '/notifications',read boolean not null default false,created_at timestamptz not null default now());
create table public.reports(id uuid primary key default gen_random_uuid(),reporter_id uuid not null references public.profiles on delete cascade,target_type text not null check(target_type in ('profile','post','comment','message','media','appeal')),target_id uuid not null,reason text not null check(length(reason) between 5 and 2000),status text not null default 'open' check(status in ('open','reviewing','resolved','dismissed')),evidence jsonb not null default '{}',resolved_at timestamptz,created_at timestamptz not null default now());
create table public.moderation_actions(id uuid primary key default gen_random_uuid(),actor_id uuid references public.profiles on delete set null,report_id uuid references public.reports on delete set null,action text not null,note text not null,created_at timestamptz not null default now());
create table public.resource_entries(id uuid primary key default gen_random_uuid(),region text not null,name text not null,url text not null check(url ~ '^https://'),source_url text not null check(source_url ~ '^https://'),last_checked date not null,verified_by uuid references public.profiles on delete set null,created_at timestamptz not null default now());
create table private.rate_limits(user_id uuid not null references auth.users on delete cascade,action text not null,bucket timestamptz not null,uses int not null default 1,primary key(user_id,action,bucket));
create table private.cleanup_jobs(id bigint generated always as identity primary key,path text not null,attempts int not null default 0,created_at timestamptz not null default now());
create table private.upload_tickets(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles on delete cascade,target_type text not null,target_id uuid not null,path text not null unique,created_at timestamptz not null default now());

create function private.active() returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.private_profile_settings where user_id=auth.uid() and not suspended and not deactivated)$$;
create function private.blocked(a uuid,b uuid) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.blocks where (blocker_id=a and blocked_id=b) or (blocker_id=b and blocked_id=a))$$;
create function private.staff() returns boolean language sql stable security definer set search_path='' as $$select private.active() and exists(select 1 from private.roles where user_id=auth.uid())$$;
create function private.connected(a uuid,b uuid) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.connections where status='accepted' and ((requester_id=a and recipient_id=b) or(requester_id=b and recipient_id=a)))$$;
create function private.read_post(pid uuid) returns boolean language sql stable security definer set search_path='' as $$
select private.active() and exists(select 1 from public.posts p join public.private_profile_settings s on s.user_id=p.author_id where p.id=pid and not p.removed and not s.suspended and not s.deactivated and not private.blocked(auth.uid(),p.author_id) and (p.author_id=auth.uid() or (p.audience='community' and exists(select 1 from public.memberships m where m.user_id=auth.uid() and m.community_slug=p.community_slug)) or(p.audience='connections' and private.connected(auth.uid(),p.author_id))))$$;
create function private.read_conversation(cid uuid) returns boolean language sql stable security definer set search_path='' as $$
select private.active() and exists(select 1 from public.conversation_members m join public.conversations c on c.id=m.conversation_id where m.conversation_id=cid and m.user_id=auth.uid() and not c.ended) and not exists(select 1 from public.conversation_members m join public.private_profile_settings s on s.user_id=m.user_id where m.conversation_id=cid and (s.suspended or s.deactivated or private.blocked(auth.uid(),m.user_id)))$$;
create function private.consume(action_name text,maximum int) returns void language plpgsql security definer set search_path='' as $$declare n int;begin
insert into private.rate_limits(user_id,action,bucket) values(auth.uid(),action_name,date_trunc('minute',now())) on conflict(user_id,action,bucket) do update set uses=private.rate_limits.uses+1 returning uses into n;
if n>maximum then raise exception 'Please take a moment and try again.';end if;end$$;

-- All mutations are mediated by validated, narrowly scoped RPCs. No INSERT/UPDATE grants.
create function public.onboard(p jsonb) returns void language plpgsql security definer set search_path='' as $$begin
if auth.uid() is null or coalesce((p->>'accepted')::boolean,false)=false then raise exception 'Authentication and agreement required';end if;
if exists(select 1 from public.private_profile_settings where user_id=auth.uid() and (suspended or deactivated)) then raise exception 'Account unavailable';end if;
if exists(select 1 from jsonb_array_elements_text(p->'topics')t(slug)where not exists(select 1 from public.communities c where c.slug=t.slug))then raise exception 'Choose an available community';end if;
if jsonb_array_length(p->'topics')>10 or length(coalesce(p->>'intent',''))>80 then raise exception 'Invalid preferences';end if;
insert into public.profiles(id,username,display_name,bio,avatar) values(auth.uid(),p->>'username',p->>'display_name',coalesce(p->>'bio',''),case when p->>'avatar' in('bloom','orbit','moon')then p->>'avatar'else 'bloom'end) on conflict(id) do update set username=excluded.username,display_name=excluded.display_name,bio=excluded.bio,avatar=case when p->>'avatar' in('bloom','orbit','moon')then excluded.avatar else public.profiles.avatar end;
insert into public.private_profile_settings(user_id,topics,discovery,show_topics,profile_visible,accept_requests) values(auth.uid(),array(select jsonb_array_elements_text(p->'topics')),(p->>'discovery')::boolean,(p->>'show_topics')::boolean,(p->>'profile_visible')::boolean,(p->>'accept_requests')::boolean) on conflict(user_id) do update set topics=excluded.topics,discovery=excluded.discovery,show_topics=excluded.show_topics,profile_visible=excluded.profile_visible,accept_requests=excluded.accept_requests,updated_at=now();
insert into public.discovery_preferences(user_id,allowed_topics,language,intent) values(auth.uid(),case when (p->>'show_topics')::boolean then array(select jsonb_array_elements_text(p->'topics')) else '{}' end,p->>'language',coalesce(p->>'intent','')) on conflict(user_id) do update set allowed_topics=excluded.allowed_topics,language=excluded.language,intent=excluded.intent;
insert into public.memberships(user_id,community_slug) select auth.uid(),c.slug from public.communities c where c.slug in(select jsonb_array_elements_text(p->'topics')) on conflict do nothing;
end$$;

create function public.my_role() returns text language sql stable security definer set search_path='' as $$select case when private.active() then coalesce((select role from private.roles where user_id=auth.uid()),'member') else 'member' end$$;
create function public.discover_people() returns jsonb language sql stable security definer set search_path='' as $$
select coalesce(jsonb_agg(x),'[]') from (select p.id,p.username,p.display_name,p.bio,p.avatar,d.language,d.intent,d.allowed_topics as topics,
case when d.allowed_topics && mine.allowed_topics then 'You both chose '||(select c.name from public.communities c where c.slug=any(d.allowed_topics) and c.slug=any(mine.allowed_topics) limit 1) else 'You both chose '||d.language end as reason
from public.profiles p join public.private_profile_settings s on s.user_id=p.id join public.discovery_preferences d on d.user_id=p.id join public.discovery_preferences mine on mine.user_id=auth.uid()
where private.active() and exists(select 1 from public.private_profile_settings where user_id=auth.uid() and discovery) and p.id<>auth.uid() and s.discovery and s.profile_visible and s.accept_requests and not s.suspended and not s.deactivated and not private.blocked(auth.uid(),p.id) and not exists(select 1 from public.discovery_dismissals where user_id=auth.uid() and target_id=p.id)
and (d.allowed_topics && mine.allowed_topics or d.language=mine.language) order by p.created_at desc limit 40)x$$;

create function public.act(kind text,p jsonb default '{}') returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); rid uuid; tid uuid; target uuid; row_connection public.connections; post_row public.posts; msg public.messages; val text; is_admin boolean;begin
if uid is null or not private.active() then raise exception 'Your account is unavailable. Sign in or contact support.';end if;
perform private.consume('all',90);
case kind
when 'membership' then
 if (p->>'joined')::boolean then insert into public.memberships values(uid,p->>'slug',now()) on conflict do nothing;else delete from public.memberships where user_id=uid and community_slug=p->>'slug';end if;
when 'post' then
 perform private.consume('post',5);
 if not exists(select 1 from public.memberships where user_id=uid and community_slug=p->>'community_slug') then raise exception 'Join this community before sharing.';end if;
 if p->>'id' is not null then
  update public.posts set body=p->>'body',audience=p->>'audience',warning=coalesce(p->>'warning',''),comments_enabled=coalesce((p->>'comments_enabled')::boolean,true),hide_counts=coalesce((p->>'hide_counts')::boolean,false),updated_at=now() where id=(p->>'id')::uuid and author_id=uid returning id into rid;
  if rid is null then raise exception 'Post unavailable';end if;
 else
  if p->>'journey_id' is not null and not exists(select 1 from public.posts where id=(p->>'journey_id')::uuid and author_id=uid) then raise exception 'Journey unavailable';end if;
  insert into public.posts(author_id,community_slug,body,audience,warning,comments_enabled,hide_counts,journey_id) values(uid,p->>'community_slug',p->>'body',p->>'audience',coalesce(p->>'warning',''),coalesce((p->>'comments_enabled')::boolean,true),coalesce((p->>'hide_counts')::boolean,false),(p->>'journey_id')::uuid) returning id into rid;
  if p->>'journey_id' is not null then insert into public.journey_entries(journey_id,post_id) values((p->>'journey_id')::uuid,rid);end if;
 end if;
 return jsonb_build_object('id',rid);
when 'delete_post' then delete from public.posts where id=(p->>'id')::uuid and author_id=uid;
when 'reaction' then
 tid:=(p->>'id')::uuid;if not private.read_post(tid) then raise exception 'Post unavailable';end if;
 if exists(select 1 from public.reactions where post_id=tid and user_id=uid and public.reactions.kind=p->>'reaction') then delete from public.reactions where post_id=tid and user_id=uid;else insert into public.reactions(post_id,user_id,kind) values(tid,uid,p->>'reaction') on conflict(post_id,user_id) do update set kind=excluded.kind;end if;
when 'bookmark' then
 tid:=(p->>'id')::uuid;if not private.read_post(tid) then raise exception 'Post unavailable';end if;
 if exists(select 1 from public.bookmarks where post_id=tid and user_id=uid) then delete from public.bookmarks where post_id=tid and user_id=uid;else insert into public.bookmarks values(tid,uid,now());end if;
when 'comment' then
 perform private.consume('comment',12);tid:=(p->>'post_id')::uuid;
 if not private.read_post(tid) or not exists(select 1 from public.posts where id=tid and comments_enabled) then raise exception 'Comments are unavailable';end if;
 if p->>'parent_id' is not null and not exists(select 1 from public.comments where id=(p->>'parent_id')::uuid and post_id=tid and parent_id is null) then raise exception 'Reply unavailable';end if;
 insert into public.comments(post_id,author_id,parent_id,body) values(tid,uid,(p->>'parent_id')::uuid,p->>'body');
when 'delete_comment' then delete from public.comments where id=(p->>'id')::uuid and author_id=uid;
when 'request' then
 perform private.consume('request',3);target:=(p->>'target_id')::uuid;
 if private.blocked(uid,target) or not exists(select 1 from public.private_profile_settings where user_id=target and discovery and profile_visible and accept_requests and not suspended and not deactivated) then raise exception 'This person isn’t accepting requests.';end if;
 insert into public.connections(requester_id,recipient_id,note) values(uid,target,p->>'note');
 insert into public.notifications(user_id,body,href) values(target,'You have a connection request','/discover');
when 'connection' then
 select * into row_connection from public.connections where id=(p->>'id')::uuid for update;
 if not found or uid not in(row_connection.requester_id,row_connection.recipient_id) then raise exception 'Request unavailable';end if;
 if p->>'status'='cancel' then
  if uid<>row_connection.requester_id or row_connection.status<>'pending' then raise exception 'Request unavailable';end if;
  delete from public.connections where id=row_connection.id;
 elsif p->>'status' in('accepted','declined') then
  if uid<>row_connection.recipient_id or row_connection.status<>'pending' or private.blocked(uid,row_connection.requester_id) then raise exception 'Request unavailable';end if;
  update public.connections set status=p->>'status' where id=row_connection.id;
  if p->>'status'='accepted' then
   insert into public.conversations(connection_id) values(row_connection.id) returning id into rid;
   insert into public.conversation_members values(rid,uid,false,false,null),(rid,row_connection.requester_id,false,false,null);
   insert into public.notifications(user_id,body,href) values(row_connection.requester_id,'Your connection request was accepted','/messages');
  end if;
 else raise exception 'Invalid request action';end if;
when 'message' then
 perform private.consume('message',30);tid:=(p->>'conversation_id')::uuid;
 if not private.read_conversation(tid) then raise exception 'Conversation unavailable';end if;
 if p->>'reply_to' is not null and not exists(select 1 from public.messages where id=(p->>'reply_to')::uuid and conversation_id=tid) then raise exception 'Reply unavailable';end if;
 insert into public.messages(conversation_id,sender_id,body,reply_to) values(tid,uid,coalesce(p->>'body',''),(p->>'reply_to')::uuid) returning id into rid;
 insert into public.notifications(user_id,body,href) select m.user_id,'You have a new message','/messages/'||tid from public.conversation_members m join public.private_profile_settings s on s.user_id=m.user_id where m.conversation_id=tid and m.user_id<>uid and not m.muted and s.notifications and not(case when s.quiet_start<s.quiet_end then now()::time between s.quiet_start and s.quiet_end else now()::time>=s.quiet_start or now()::time<=s.quiet_end end);
 return jsonb_build_object('id',rid);
when 'message_reaction' then
 select * into msg from public.messages where id=(p->>'id')::uuid;
 if not private.read_conversation(msg.conversation_id) then raise exception 'Message unavailable';end if;
 if exists(select 1 from public.message_reactions where message_id=msg.id and user_id=uid) then delete from public.message_reactions where message_id=msg.id and user_id=uid;else insert into public.message_reactions values(msg.id,uid,'Sending support');end if;
when 'conversation' then
 tid:=(p->>'id')::uuid;if not private.read_conversation(tid) then raise exception 'Conversation unavailable';end if;
 if coalesce((p->>'end')::boolean,false) then update public.conversations set ended=true where id=tid;else
 update public.conversation_members set muted=coalesce((p->>'muted')::boolean,muted),archived=coalesce((p->>'archived')::boolean,archived),last_read_at=case when coalesce((p->>'read')::boolean,false) then now() else last_read_at end where conversation_id=tid and user_id=uid;end if;
when 'block' then
 target:=(p->>'target_id')::uuid;
 if coalesce((p->>'unblock')::boolean,false) then delete from public.blocks where blocker_id=uid and blocked_id=target;else
 insert into public.blocks values(uid,target,now()) on conflict do nothing;
 update public.conversations set ended=true where connection_id in(select id from public.connections where (requester_id=uid and recipient_id=target)or(requester_id=target and recipient_id=uid));end if;
when 'dismiss' then insert into public.discovery_dismissals values(uid,(p->>'target_id')::uuid) on conflict do nothing;
when 'settings' then
 update public.private_profile_settings set discovery=(p->>'discovery')::boolean,show_topics=(p->>'show_topics')::boolean,profile_visible=(p->>'profile_visible')::boolean,accept_requests=(p->>'accept_requests')::boolean,reduce_motion=(p->>'reduce_motion')::boolean,read_receipts=(p->>'read_receipts')::boolean,notifications=(p->>'notifications')::boolean,quiet_start=(p->>'quiet_start')::time,quiet_end=(p->>'quiet_end')::time,muted_topics=array(select jsonb_array_elements_text(p->'muted_topics')),updated_at=now() where user_id=uid;
 update public.discovery_preferences set allowed_topics=case when(p->>'show_topics')::boolean then(select topics from public.private_profile_settings where user_id=uid)else '{}' end where user_id=uid;
when 'read_notifications' then update public.notifications set read=true where user_id=uid;
when 'report' then
 perform private.consume('report',5);tid:=(p->>'target_id')::uuid;val:=p->>'target_type';
 if val='post' then if not private.read_post(tid) then raise exception 'Post unavailable';end if;select p||jsonb_build_object('evidence',jsonb_build_object('body',body,'author_id',author_id)) into p from public.posts where id=tid;
 elsif val='message' then select * into msg from public.messages where id=tid;if not private.read_conversation(msg.conversation_id) then raise exception 'Message unavailable';end if;select p||jsonb_build_object('evidence',jsonb_build_object('body',msg.body,'author_id',msg.sender_id)) into p;
 elsif val='comment' then if not exists(select 1 from public.comments c where c.id=tid and private.read_post(c.post_id)) then raise exception 'Comment unavailable';end if;select p||jsonb_build_object('evidence',(select jsonb_build_object('body',body,'author_id',author_id)from public.comments where id=tid)) into p;
 elsif val='media' then if not exists(select 1 from public.post_media where id=tid and private.read_post(post_id)) and not exists(select 1 from public.message_media mm join public.messages m on m.id=mm.message_id where mm.id=tid and private.read_conversation(m.conversation_id)) then raise exception 'Media unavailable';end if;
 elsif val='profile' then if not exists(select 1 from public.profiles where id=tid) then raise exception 'Profile unavailable';end if;
 elsif val='appeal' then if not exists(select 1 from public.posts where id=tid and author_id=uid) then raise exception 'Appeal unavailable';end if;
 else raise exception 'Invalid report';end if;
 -- evidence is a minimal immutable snapshot; never grant moderators blanket chat access.
 insert into public.reports(reporter_id,target_type,target_id,reason,evidence) values(uid,val,tid,coalesce(p->>'reason','Reported content requires review'),coalesce(p->'evidence',p-'reason'-'target_id'-'target_type')) returning id into rid;
 return jsonb_build_object('id',rid);
when 'moderate' then
 if not private.staff() then raise exception 'Restricted to moderators';end if;
 if not exists(select 1 from public.reports where id=(p->>'id')::uuid) then raise exception 'Report unavailable';end if;
 if p->>'action'='remove' then
  update public.posts set removed=true where id=(select target_id from public.reports where id=(p->>'id')::uuid and target_type='post');
 elsif p->>'action'='restore' then update public.posts set removed=false where id=(select target_id from public.reports where id=(p->>'id')::uuid and target_type in('post','appeal'));
 elsif p->>'action'='suspend' then
  select role='admin' into is_admin from private.roles where user_id=uid;
  if not coalesce(is_admin,false) then raise exception 'Administrator required';end if;
  target:=(select coalesce(evidence->>'author_id',case when target_type='profile' then target_id::text end)::uuid from public.reports where id=(p->>'id')::uuid);
  if target is null or exists(select 1 from private.roles where user_id=target) then raise exception 'Cannot suspend this account here';end if;
  update public.private_profile_settings set suspended=true where user_id=target;
 elsif p->>'action' not in('resolve','dismiss','review') then raise exception 'Invalid action';end if;
 update public.reports set status=case p->>'action' when 'dismiss' then 'dismissed' when 'review' then 'reviewing' else 'resolved' end where id=(p->>'id')::uuid;
 insert into public.moderation_actions(actor_id,report_id,action,note) values(uid,(p->>'id')::uuid,p->>'action',coalesce(p->>'note',''));
when 'community_edit' then
 if not private.staff() then raise exception 'Restricted to moderators';end if;
 update public.communities set description=left(p->>'description',1000),guidelines=left(p->>'guidelines',3000),pinned=left(p->>'pinned',1000) where slug=p->>'slug';
 insert into public.moderation_actions(actor_id,action,note) values(uid,'community_edit',p->>'slug');
when 'resource' then
 if not private.staff() then raise exception 'Restricted to moderators';end if;
 if (p->>'last_checked')::date>current_date then raise exception 'Invalid verification date';end if;
 insert into public.resource_entries(region,name,url,source_url,last_checked,verified_by) values(left(p->>'region',100),left(p->>'name',200),p->>'url',p->>'source_url',(p->>'last_checked')::date,uid);
 insert into public.moderation_actions(actor_id,action,note) values(uid,'resource_verified',p->>'name');
when 'deactivate' then update public.private_profile_settings set deactivated=true,discovery=false,accept_requests=false where user_id=uid;
else raise exception 'Unsupported action';end case;
return '{}'::jsonb;end$$;

-- Minimal receipts: never expose another member's setting or timestamps unless opted in.
create function public.conversation_receipts() returns jsonb language sql stable security definer set search_path='' as $$select coalesce(jsonb_agg(jsonb_build_object('conversation_id',m.conversation_id,'user_id',m.user_id,'last_read_at',m.last_read_at)),'[]') from public.conversation_members m join public.private_profile_settings s on s.user_id=m.user_id where private.read_conversation(m.conversation_id) and (m.user_id=auth.uid() or s.read_receipts)$$;

-- Every exposed table is RLS protected; policies are evaluated for each realtime change.
do $$declare t text;begin foreach t in array array['profiles','private_profile_settings','communities','memberships','discovery_preferences','discovery_dismissals','connections','posts','journey_entries','comments','reactions','bookmarks','conversations','conversation_members','messages','message_reactions','post_media','message_media','notifications','blocks','reports','moderation_actions','resource_entries'] loop execute format('alter table public.%I enable row level security',t);execute format('revoke all on public.%I from anon, authenticated',t);execute format('grant select on public.%I to authenticated',t);end loop;end$$;
create policy profiles_read on public.profiles for select to authenticated using (id=auth.uid() or(private.active() and not private.blocked(auth.uid(),id) and exists(select 1 from public.private_profile_settings s where s.user_id=id and s.profile_visible and not s.suspended and not s.deactivated)));
-- Helper avoids exposing settings through a policy subquery (which would itself be RLS filtered).
create function private.visible_profile(pid uuid) returns boolean language sql stable security definer set search_path='' as $$select private.active() and not private.blocked(auth.uid(),pid) and exists(select 1 from public.private_profile_settings where user_id=pid and profile_visible and not suspended and not deactivated)$$;
drop policy profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated using(id=auth.uid() or private.visible_profile(id));
create policy settings_owner on public.private_profile_settings for select to authenticated using(user_id=auth.uid());
create policy communities_read on public.communities for select to authenticated using(private.active());
create policy membership_owner on public.memberships for select to authenticated using(user_id=auth.uid() and private.active());
create policy discovery_owner on public.discovery_preferences for select to authenticated using(user_id=auth.uid() and private.active());
create policy dismissal_owner on public.discovery_dismissals for select to authenticated using(user_id=auth.uid() and private.active());
create policy connections_member on public.connections for select to authenticated using(private.active() and auth.uid() in(requester_id,recipient_id) and not private.blocked(requester_id,recipient_id));
create policy posts_audience on public.posts for select to authenticated using(private.read_post(id));
create policy journey_audience on public.journey_entries for select to authenticated using(private.read_post(post_id) and private.read_post(journey_id));
create policy comments_audience on public.comments for select to authenticated using(private.read_post(post_id) and not private.blocked(auth.uid(),author_id));
create policy reactions_audience on public.reactions for select to authenticated using(private.read_post(post_id) and (user_id=auth.uid() or exists(select 1 from public.posts p where p.id=post_id and not p.hide_counts)) and not private.blocked(auth.uid(),user_id));
create policy bookmarks_owner on public.bookmarks for select to authenticated using(user_id=auth.uid() and private.read_post(post_id));
create policy conversation_member on public.conversations for select to authenticated using(private.read_conversation(id));
create policy conversation_settings_owner on public.conversation_members for select to authenticated using(user_id=auth.uid() and private.read_conversation(conversation_id));
create policy messages_member on public.messages for select to authenticated using(private.read_conversation(conversation_id));
create policy message_reactions_member on public.message_reactions for select to authenticated using(exists(select 1 from public.messages m where m.id=message_id and private.read_conversation(m.conversation_id)));
create policy post_media_audience on public.post_media for select to authenticated using(private.read_post(post_id));
create policy message_media_member on public.message_media for select to authenticated using(exists(select 1 from public.messages m where m.id=message_id and private.read_conversation(m.conversation_id)));
create policy notifications_owner on public.notifications for select to authenticated using(user_id=auth.uid() and private.active());
create policy blocks_owner on public.blocks for select to authenticated using(blocker_id=auth.uid() and private.active());
create policy reports_owner_staff on public.reports for select to authenticated using(private.active() and (reporter_id=auth.uid() or private.staff()));
create policy moderation_staff on public.moderation_actions for select to authenticated using(private.staff());
create policy verified_resources on public.resource_entries for select to authenticated using(private.active() and (private.staff() or last_checked>=current_date-180));
-- policy helpers need schema usage, not table or function ownership.
grant usage on schema private to authenticated;
revoke all on all functions in schema private from public,anon,authenticated;
grant execute on function private.active(),private.blocked(uuid,uuid),private.staff(),private.read_post(uuid),private.read_conversation(uuid),private.visible_profile(uuid) to authenticated;
revoke all on all functions in schema public from public,anon,authenticated;
grant execute on function public.onboard(jsonb),public.my_role(),public.discover_people(),public.act(text,jsonb),public.conversation_receipts() to authenticated;

-- Authorized changes only. No presence/broadcast payloads contain private content.
alter publication supabase_realtime add table public.messages,public.notifications;

-- Private storage: upload/download only through server after authorization. No object policies.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('private-media','private-media',false,52428800,array['image/webp','video/mp4','video/webm']) on conflict(id) do nothing;
create function private.media_deleted() returns trigger language plpgsql security definer set search_path='' as $$begin insert into private.cleanup_jobs(path)values(old.path);return old;end$$;
create trigger post_media_cleanup after delete on public.post_media for each row execute function private.media_deleted();
create trigger message_media_cleanup after delete on public.message_media for each row execute function private.media_deleted();
