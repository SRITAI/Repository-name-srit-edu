-- SRIT EDU — initial schema
-- Run via: supabase db push  (or paste into the Supabase SQL editor)

-- ── ENUMS ──────────────────────────────────────────────
create type course_category    as enum ('pcm', 'pcb', 'question_papers');
create type language_code      as enum ('hi', 'en');
create type payment_status     as enum ('created', 'pending', 'paid', 'failed', 'refunded');
create type enrollment_status  as enum ('active', 'revoked', 'refunded');
create type scholarship_status as enum ('submitted', 'under_review', 'approved', 'rejected');
create type update_status      as enum ('draft', 'published');
create type user_role          as enum ('student', 'admin');

-- ── PROFILES (extends Supabase auth.users) ────────────
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  mobile_number text unique not null,
  email text unique,
  role user_role not null default 'student',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── COURSES ────────────────────────────────────────────
create table courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category course_category not null,
  description text,
  languages language_code[] not null default '{en}',
  price_paise integer not null,
  original_price_paise integer,
  is_published boolean not null default false,
  ncert_based boolean not null default true,
  board_focused boolean not null default true,
  paper_analysis_years integer not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table course_subjects (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0
);

create table course_chapters (
  id uuid primary key default gen_random_uuid(),
  course_subject_id uuid not null references course_subjects(id) on delete cascade,
  title text not null,
  sort_order integer not null default 0
);

create table course_files (
  id uuid primary key default gen_random_uuid(),
  course_chapter_id uuid not null references course_chapters(id) on delete cascade,
  language language_code not null,
  storage_path text not null,
  file_name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ── QUESTION PAPERS ────────────────────────────────────
create table question_papers (
  id uuid primary key default gen_random_uuid(),
  category course_category not null check (category in ('pcm','pcb')),
  subject text not null,
  class text not null,
  board text not null default 'UP Board (UPMSP)',
  year integer not null,
  language language_code not null,
  is_free boolean not null default false,
  price_paise integer,
  storage_path text not null,
  created_at timestamptz not null default now()
);

-- ── COUPONS ────────────────────────────────────────────
create table coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  percent_discount integer,
  fixed_discount_paise integer,
  is_active boolean not null default true,
  expires_at timestamptz,
  max_usage integer,
  used_count integer not null default 0,
  created_at timestamptz not null default now(),
  check (percent_discount is not null or fixed_discount_paise is not null)
);

-- ── ORDERS ─────────────────────────────────────────────
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  course_id uuid references courses(id),
  question_paper_id uuid references question_papers(id),
  coupon_id uuid references coupons(id),
  amount_paise integer not null,
  discount_paise integer not null default 0,
  razorpay_order_id text unique not null,
  status payment_status not null default 'created',
  created_at timestamptz not null default now(),
  check (course_id is not null or question_paper_id is not null)
);

-- ── PAYMENTS ───────────────────────────────────────────
create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  razorpay_payment_id text unique,
  razorpay_signature text,
  status payment_status not null,
  raw_webhook_payload jsonb,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

-- ── ENROLLMENTS ────────────────────────────────────────
create table enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  question_paper_id uuid references question_papers(id) on delete cascade,
  order_id uuid not null references orders(id),
  status enrollment_status not null default 'active',
  granted_at timestamptz not null default now(),
  check (course_id is not null or question_paper_id is not null)
);

-- ── COUPON USAGE ───────────────────────────────────────
create table coupon_usage (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references coupons(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  order_id uuid not null references orders(id) on delete cascade,
  used_at timestamptz not null default now()
);

-- ── SCHOLARSHIP APPLICATIONS ───────────────────────────
create table scholarship_applications (
  id uuid primary key default gen_random_uuid(),
  application_number text unique not null,
  user_id uuid references profiles(id) on delete set null,
  full_name text not null,
  mobile_number text not null,
  email text,
  class text not null,
  education text,
  school_name text not null,
  school_address text not null,
  district text not null,
  state text not null,
  father_name text not null,
  mother_name text not null,
  caste text,
  status scholarship_status not null default 'submitted',
  admin_remarks text,
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ── ANNOUNCEMENTS ──────────────────────────────────────
create table announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  image_url text,
  status update_status not null default 'draft',
  publish_date timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ── STUDENT SESSIONS ───────────────────────────────────
create table student_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  device_label text,
  user_agent text,
  ip_address text,
  last_active_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

-- ── INDEXES ────────────────────────────────────────────
create index idx_courses_category     on courses(category);
create index idx_orders_user          on orders(user_id);
create index idx_orders_razorpay_id   on orders(razorpay_order_id);
create index idx_payments_order       on payments(order_id);
create index idx_enrollments_user     on enrollments(user_id);
create index idx_scholarship_status   on scholarship_applications(status);
create index idx_scholarship_location on scholarship_applications(state, district);
create index idx_announcements_pub    on announcements(status, publish_date);
create index idx_sessions_user        on student_sessions(user_id);

-- ── ROW LEVEL SECURITY ─────────────────────────────────

alter table profiles enable row level security;
create policy "Users view own profile" on profiles for select using (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

alter table courses enable row level security;
create policy "Published courses are public" on courses for select using (is_published = true);
create policy "Admins manage courses" on courses for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

alter table course_subjects enable row level security;
create policy "Subjects follow course visibility" on course_subjects for select using (
  exists (select 1 from courses c where c.id = course_id and c.is_published = true)
);
create policy "Admins manage subjects" on course_subjects for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

alter table course_chapters enable row level security;
create policy "Chapters follow course visibility" on course_chapters for select using (
  exists (
    select 1 from course_subjects s
    join courses c on c.id = s.course_id
    where s.id = course_subject_id and c.is_published = true
  )
);
create policy "Admins manage chapters" on course_chapters for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- course_files: deliberately NO client-side select policy — only the
-- service-role client inside /api/files/signed-url may read this table,
-- and only after checking the caller's enrollment first.
alter table course_files enable row level security;
create policy "Admins manage files" on course_files for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

alter table question_papers enable row level security;
create policy "Question papers are browsable" on question_papers for select using (true);
create policy "Admins manage question papers" on question_papers for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- coupons: no client select policy at all — codes are validated only
-- through /api/coupons/validate, server-side.
alter table coupons enable row level security;
create policy "Admins manage coupons" on coupons for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

alter table orders enable row level security;
create policy "Users view own orders" on orders for select using (auth.uid() = user_id);
create policy "Admins view all orders" on orders for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

alter table payments enable row level security;
create policy "Users view own payments" on payments for select using (
  exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid())
);
create policy "Admins view all payments" on payments for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

alter table enrollments enable row level security;
create policy "Users view own enrollments" on enrollments for select using (auth.uid() = user_id);
create policy "Admins view all enrollments" on enrollments for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

alter table coupon_usage enable row level security;
create policy "Admins view coupon usage" on coupon_usage for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

alter table scholarship_applications enable row level security;
create policy "Users view own scholarship applications" on scholarship_applications for select using (auth.uid() = user_id);
create policy "Admins manage scholarship applications" on scholarship_applications for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

alter table announcements enable row level security;
create policy "Published announcements are public" on announcements for select using (status = 'published');
create policy "Admins manage announcements" on announcements for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

alter table student_sessions enable row level security;
create policy "Users view own sessions" on student_sessions for select using (auth.uid() = user_id);
create policy "Admins manage sessions" on student_sessions for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- ── AUTO-CREATE A PROFILE ON SIGNUP ────────────────────
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, mobile_number, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'mobile_number', ''),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
