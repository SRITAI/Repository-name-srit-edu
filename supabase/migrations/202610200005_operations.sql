create function public.service_metrics() returns jsonb language plpgsql stable security definer set search_path='' as $$begin
if not private.staff() then raise exception 'Restricted to community care';end if;
return jsonb_build_object('accounts',(select count(*)from public.profiles),'stories',(select count(*)from public.posts where not removed and audience<>'draft'),'open_reports',(select count(*)from public.reports where status in('open','reviewing')),'media_objects',(select count(*)from public.post_media)+(select count(*)from public.message_media),'pending_cleanup',(select count(*)from private.cleanup_jobs));end$$;
-- An appeal remains available to a suspended/deactivated authenticated owner.
create function public.submit_appeal(target_id uuid,reason text) returns void language plpgsql security definer set search_path='' as $$begin
if auth.uid() is null or not exists(select 1 from public.profiles where id=auth.uid()) then raise exception 'Sign in to appeal';end if;
perform private.consume('appeal',3);
if length(reason)not between 5 and 2000 then raise exception 'Use 5–2000 characters';end if;
if target_id<>auth.uid() and not exists(select 1 from public.posts where id=target_id and author_id=auth.uid())then raise exception 'This item is not yours to appeal';end if;
insert into public.reports(reporter_id,target_type,target_id,reason,evidence)values(auth.uid(),'appeal',target_id,reason,jsonb_build_object('author_id',auth.uid(),'body','Owner requested review of their content or account restriction.'));end$$;
create function public.my_cases() returns jsonb language sql stable security definer set search_path='' as $$select jsonb_build_object('reports',coalesce((select jsonb_agg(x)from(select id,target_type,target_id,reason,status,created_at from public.reports where reporter_id=auth.uid()order by created_at desc limit 50)x),'[]'),'removed',coalesce((select jsonb_agg(x)from(select id,body,created_at from public.posts where author_id=auth.uid()and removed order by created_at desc limit 50)x),'[]'))$$;
create function public.restore_account(case_id uuid,note text) returns void language plpgsql security definer set search_path='' as $$declare target uuid;begin
if public.my_role()<>'admin' then raise exception 'Administrator required';end if;
select target_id into target from public.reports where id=case_id and target_type='appeal' and target_id=reporter_id;
if target is null then raise exception 'Account appeal unavailable';end if;
update public.private_profile_settings set suspended=false,deactivated=false where user_id=target;
update public.reports set status='resolved' where id=case_id;
insert into public.moderation_actions(actor_id,report_id,action,note)values(auth.uid(),case_id,'account_restored',left(note,2000));end$$;
revoke all on function public.service_metrics(),public.submit_appeal(uuid,text),public.my_cases(),public.restore_account(uuid,text) from public,anon,authenticated;
grant execute on function public.service_metrics(),public.submit_appeal(uuid,text),public.my_cases(),public.restore_account(uuid,text) to authenticated;

-- User deletion also queues their avatar; media table cascades queue post/message assets.
-- Moderators can remove a reported comment/message/media without reading unrelated items.
create function public.remove_reported_item(case_id uuid,note text) returns void language plpgsql security definer set search_path='' as $$declare r public.reports;begin
if not private.staff() then raise exception 'Restricted to community care';end if;
select * into r from public.reports where id=case_id;if not found then raise exception 'Report unavailable';end if;
case r.target_type
when 'comment' then delete from public.comments where id=r.target_id;
when 'message' then delete from public.messages where id=r.target_id;
when 'media' then delete from public.post_media where id=r.target_id;delete from public.message_media where id=r.target_id;
when 'post' then update public.posts set removed=true where id=r.target_id;
else raise exception 'This report does not reference removable content';end case;
update public.reports set status='resolved' where id=case_id;
insert into public.moderation_actions(actor_id,report_id,action,note)values(auth.uid(),case_id,'content_removed',left(note,2000));end$$;
revoke all on function public.remove_reported_item(uuid,text) from public,anon,authenticated;
grant execute on function public.remove_reported_item(uuid,text) to authenticated;

create function private.report_status_changed() returns trigger language plpgsql set search_path='' as $$begin if new.status in('resolved','dismissed')and new.status<>old.status then new.resolved_at=now();elsif new.status in('open','reviewing')then new.resolved_at=null;end if;return new;end$$;
create trigger report_resolution_time before update of status on public.reports for each row execute function private.report_status_changed();
revoke all on function private.report_status_changed() from public,anon,authenticated;
grant select on all tables in schema public to service_role;
create function public.conversation_unread() returns jsonb language sql stable security definer set search_path='' as $$select coalesce(jsonb_object_agg(x.id,x.unread),'{}')from(select c.id,count(m.id)as unread from public.conversations c join public.conversation_members cm on cm.conversation_id=c.id and cm.user_id=auth.uid()left join public.messages m on m.conversation_id=c.id and m.sender_id<>auth.uid()and(cm.last_read_at is null or m.created_at>cm.last_read_at)where private.read_conversation(c.id)group by c.id)x$$;
revoke all on function public.conversation_unread() from public,anon,authenticated;
grant execute on function public.conversation_unread() to authenticated;
