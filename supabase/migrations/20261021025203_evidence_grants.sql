-- Evidence access must go through the audited case RPC, including for moderators.
revoke select on public.reports from authenticated;
grant select(id,reporter_id,target_type,target_id,reason,status,created_at) on public.reports to authenticated;
