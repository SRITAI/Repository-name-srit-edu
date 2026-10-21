alter table public.post_media add column poster_path text;
alter table public.message_media add column poster_path text;
alter table private.upload_tickets add column kind text not null check(kind in('image','video')) default 'image';
create table private.avatar_media(id uuid primary key,user_id uuid not null references public.community_profiles on delete cascade,path text not null unique);
create function private.avatar_changed() returns trigger language plpgsql security definer set search_path='' as $$begin if old.avatar like 'media:%'and new.avatar<>old.avatar then delete from private.avatar_media where user_id=new.id and id=substring(old.avatar from 7)::uuid;end if;return new;end$$;
create trigger avatar_replacement_cleanup after update of avatar on public.community_profiles for each row execute function private.avatar_changed();
revoke all on function private.avatar_changed() from public,anon,authenticated;
create trigger avatar_media_cleanup after delete on private.avatar_media for each row execute function private.media_deleted();
create or replace function private.media_deleted() returns trigger language plpgsql security definer set search_path='' as $$begin insert into private.cleanup_jobs(path)values(old.path);if to_jsonb(old)->>'poster_path' is not null then insert into private.cleanup_jobs(path)values(to_jsonb(old)->>'poster_path');end if;return old;end$$;
create function public.reserve_upload(target_type text,target_id uuid,media_kind text) returns jsonb language plpgsql security definer set search_path='' as $$declare ticket uuid:=gen_random_uuid();p text;begin
if not private.active() then raise exception 'Account unavailable';end if;
perform private.consume('upload',8);
if media_kind not in('image','video') then raise exception 'Invalid media';end if;
if target_type='post' then
 perform 1 from public.posts where id=target_id and author_id=auth.uid() and private.read_post(id) for update;if not found then raise exception 'Post unavailable';end if;
 if (select count(*) from public.post_media where post_id=target_id)+(select count(*)from private.upload_tickets t where t.target_id=reserve_upload.target_id and t.created_at>now()-interval '1 hour')>=6 then raise exception 'Maximum 6 attachments';end if;
elsif target_type='message' then
 if not exists(select 1 from public.messages where id=target_id and sender_id=auth.uid() and private.read_conversation(conversation_id)) then raise exception 'Conversation unavailable';end if;
 if (select count(*) from public.message_media where message_id=target_id)>=6 then raise exception 'Maximum 6 attachments';end if;
elsif target_type='avatar' then if target_id<>auth.uid() or media_kind<>'image' then raise exception 'Profile unavailable';end if;
else raise exception 'Invalid target';end if;
p:='media/'||ticket::text||case media_kind when 'image' then '.webp' else '.mp4' end;
insert into private.upload_tickets(id,user_id,target_type,target_id,path,kind) values(ticket,auth.uid(),target_type,target_id,p,media_kind);
return jsonb_build_object('id',ticket,'path',p);end$$;
create function public.finalize_upload(ticket_id uuid,owner_id uuid,caption text,has_poster boolean default false) returns void language plpgsql security definer set search_path='' as $$declare t private.upload_tickets;poster text;begin
select * into t from private.upload_tickets where id=ticket_id and user_id=owner_id for update;
if not found then raise exception 'Upload expired';end if;
if not exists(select 1 from public.private_profile_settings where user_id=owner_id and not suspended and not deactivated) then raise exception 'Account unavailable';end if;
poster:=case when has_poster then 'media/'||ticket_id||'-poster.webp' else null end;
if t.target_type='post' then
 if not exists(select 1 from public.posts where id=t.target_id and author_id=owner_id and not removed) then raise exception 'Post unavailable';end if;
 insert into public.post_media(id,post_id,kind,path,caption,poster_path)values(t.id,t.target_id,t.kind,t.path,left(caption,300),poster);
elsif t.target_type='message' then
 if not exists(select 1 from public.messages m join public.conversations c on c.id=m.conversation_id where m.id=t.target_id and m.sender_id=owner_id and not c.ended and not exists(select 1 from public.conversation_members cm join public.private_profile_settings s on s.user_id=cm.user_id where cm.conversation_id=c.id and (s.suspended or s.deactivated or private.blocked(owner_id,cm.user_id)))) then raise exception 'Conversation unavailable';end if;
 insert into public.message_media(id,message_id,kind,path,caption,poster_path) values(t.id,t.target_id,t.kind,t.path,left(caption,300),poster);
else
 delete from private.avatar_media where user_id=owner_id;
 insert into private.avatar_media values(t.id,owner_id,t.path);
 update public.community_profiles set avatar='media:'||t.id where id=owner_id;
end if;
delete from private.upload_tickets where id=t.id;end$$;
-- Return paths only after checking current authorization; server proxies bytes with no caching.
create function public.media_access(media_id uuid,want_poster boolean default false) returns text language plpgsql stable security definer set search_path='' as $$declare path text;begin
if not private.active() then return null;end if;
select case when want_poster then m.poster_path else m.path end into path from public.post_media m where m.id=media_id and private.read_post(m.post_id);
if path is null then select case when want_poster then m.poster_path else m.path end into path from public.message_media m join public.messages msg on msg.id=m.message_id where m.id=media_id and private.read_conversation(msg.conversation_id);end if;
if path is null and not want_poster then select m.path into path from private.avatar_media m where m.id=media_id and(m.user_id=auth.uid() or private.visible_profile(m.user_id));end if;
return path;end$$;
create function public.review_evidence(case_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$declare r public.reports;result jsonb;begin
if not private.staff() then raise exception 'Restricted to moderators';end if;
select * into r from public.reports where id=case_id;if not found then raise exception 'Case unavailable';end if;
insert into public.moderation_actions(actor_id,report_id,action,note)values(auth.uid(),case_id,'evidence_access','Reported evidence opened');
select jsonb_build_object('report',to_jsonb(r),'media',case when r.target_type='message' then coalesce((select jsonb_agg(jsonb_build_object('id',id,'kind',kind,'caption',caption))from public.message_media where message_id=r.target_id),'[]') when r.target_type='post' then coalesce((select jsonb_agg(jsonb_build_object('id',id,'kind',kind,'caption',caption))from public.post_media where post_id=r.target_id),'[]')else '[]'::jsonb end)into result;
return result;end$$;
create function public.evidence_media_access(case_id uuid,media_id uuid) returns text language plpgsql security definer set search_path='' as $$declare r public.reports;p text;begin
if not private.staff() then raise exception 'Restricted to moderators';end if;
select * into r from public.reports where id=case_id;
if r.target_type='post' then select path into p from public.post_media where id=media_id and post_id=r.target_id;
elsif r.target_type='message' then select path into p from public.message_media where id=media_id and message_id=r.target_id;
elsif r.target_type='media' and r.target_id=media_id then select path into p from public.post_media where id=media_id; if p is null then select path into p from public.message_media where id=media_id;end if;end if;
if p is not null then insert into public.moderation_actions(actor_id,report_id,action,note)values(auth.uid(),case_id,'evidence_media_access',media_id::text);end if;return p;end$$;
create function public.cleanup_batch() returns jsonb language plpgsql security definer set search_path='' as $$begin
insert into private.cleanup_jobs(path)select path from private.upload_tickets where created_at<now()-interval '1 hour';
insert into private.cleanup_jobs(path)select 'media/'||id||'-poster.webp' from private.upload_tickets where kind='video' and created_at<now()-interval '1 hour';
delete from private.upload_tickets where created_at<now()-interval '1 hour';
delete from public.reports where coalesce(resolved_at,created_at)<now()-interval '90 days' and status in('resolved','dismissed');
delete from private.rate_limits where bucket<now()-interval '1 day';
return coalesce((select jsonb_agg(x) from (select * from private.cleanup_jobs order by created_at limit 100)x),'[]');end$$;
create function public.cleanup_result(job_id bigint,success boolean) returns void language plpgsql security definer set search_path='' as $$begin if success then delete from private.cleanup_jobs where id=job_id;else update private.cleanup_jobs set attempts=attempts+1 where id=job_id;end if;end$$;
create function public.set_role(target uuid,new_role text,actor uuid) returns void language plpgsql security definer set search_path='' as $$begin
if new_role not in('member','moderator','admin') then raise exception 'Invalid role';end if;
if new_role='member' then delete from private.roles where user_id=target;else insert into private.roles values(target,new_role) on conflict(user_id)do update set role=excluded.role;end if;
insert into public.moderation_actions(actor_id,action,note)values(actor,'role_change',target::text||' → '||new_role);end$$;
revoke all on function public.reserve_upload(text,uuid,text),public.finalize_upload(uuid,uuid,text,boolean),public.media_access(uuid,boolean),public.review_evidence(uuid),public.evidence_media_access(uuid,uuid),public.cleanup_batch(),public.cleanup_result(bigint,boolean),public.set_role(uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.reserve_upload(text,uuid,text),public.media_access(uuid,boolean),public.review_evidence(uuid),public.evidence_media_access(uuid,uuid) to authenticated;
grant execute on function public.finalize_upload(uuid,uuid,text,boolean),public.cleanup_batch(),public.cleanup_result(bigint,boolean),public.set_role(uuid,text,uuid) to service_role;
