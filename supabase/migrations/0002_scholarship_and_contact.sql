-- Step 2 additions:
--   1. scholarship_applications had no INSERT policy for regular
--      students in 0001 (only SELECT-own and admin ALL) — added here.
--   2. A Postgres sequence + function to generate application IDs
--      atomically (SRIT-SCH-{year}-{6-digit sequence}), avoiding a
--      race condition if two students apply at the same moment.
--   3. contact_messages table for the Contact Us form (didn't exist
--      in the original schema).

create policy "Users submit own scholarship application" on scholarship_applications
  for insert
  with check (auth.uid() = user_id);

create sequence if not exists scholarship_application_seq;

create or replace function public.generate_scholarship_application_number()
returns text
language plpgsql
as $$
declare
  seq_val bigint;
begin
  seq_val := nextval('scholarship_application_seq');
  return 'SRIT-SCH-' || to_char(now(), 'YYYY') || '-' || lpad(seq_val::text, 6, '0');
end;
$$;

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  mobile_number text not null,
  email text,
  message text not null,
  created_at timestamptz not null default now()
);

alter table contact_messages enable row level security;

create policy "Anyone can submit a contact message" on contact_messages
  for insert
  with check (true);

create policy "Admins view contact messages" on contact_messages
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
