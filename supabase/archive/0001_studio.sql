-- ============================================================================
-- SUPABASE MIGRATION: 0001_studio.sql
-- "Human + AI" Brand Video Studio: Schema, RLS, Storage & Search Engine
-- ============================================================================

-- 1. EXTENSIONS
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- 2. ENUMS
do $$ begin
  create type app_role as enum ('client', 'creator', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type input_mode as enum ('script', 'product_images', 'drive_link');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type project_status as enum (
    'draft',
    'submitted',
    'brief_review',
    'script_approved',
    'creator_assigned',
    'shooting',
    'ai_enhancement',
    'qa_review',
    'delivered',
    'revision_requested',
    'completed',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

-- 3. TABLES

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  role app_role not null default 'client',
  is_adult_verified boolean not null default false,
  release_signed boolean not null default false,
  created_at timestamptz not null default now()
);

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  icon text,
  accent_color text,
  keywords text[] not null default '{}',
  insights_md text,
  is_adult boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0
);

-- Projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id),
  brand_name text,
  brand_link text,
  goal text,
  platform text,
  formats text[] not null default '{}',
  duration_seconds int,
  language text default 'en',
  tone text,
  creator_preference jsonb not null default '{}',
  input_modes input_mode[] not null default '{}',
  script_text text,
  script_source text check (script_source in ('client', 'ai_draft', 'human_written')),
  product_name text,
  product_benefits text[],
  product_usp text,
  target_audience text,
  drive_links jsonb not null default '[]',      -- [{url, file_id, kind, access_status}]
  reference_urls text[] not null default '{}',
  status project_status not null default 'draft',
  assigned_creator_id uuid references public.profiles(id),
  rights_confirmed boolean not null default false,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Project Assets
create table if not exists public.project_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  kind text not null check (kind in ('product_image', 'reference', 'deliverable')),
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

-- Project Events (Audit log & timeline)
create table if not exists public.project_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  event_type text not null,
  from_status project_status,
  to_status project_status,
  note text,
  created_at timestamptz not null default now()
);

-- Trending Reels (Curated Instagram Reels)
create table if not exists public.trending_reels (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id),
  instagram_url text unique not null,
  shortcode text,
  thumbnail_url text,
  caption text,
  creator_handle text,
  views_label text,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  is_seed boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Famous Ads (Curated Benchmark Ads)
create table if not exists public.famous_ads (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id),
  title text not null,
  brand_name text,
  platform text,
  format text,
  source_url text,
  thumbnail_url text,
  hook_type text,
  why_it_works text[] not null default '{}',
  cta_style text,
  region text default 'IN',
  is_published boolean not null default false,
  is_seed boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Saved Items (Bookmarks/favorites)
create table if not exists public.saved_items (
  user_id uuid references public.profiles(id) on delete cascade,
  item_type text check (item_type in ('reel', 'ad')),
  item_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (user_id, item_type, item_id)
);

-- Search Logs (Server-logged telemetry)
create table if not exists public.search_logs (
  id bigint generated always as identity primary key,
  user_id uuid,
  query text not null,
  category_slug text,
  results_count int,
  created_at timestamptz not null default now()
);

-- 4. SEARCH & PERFORMANCE INDEXES
create index if not exists idx_categories_name_trgm on public.categories using gin (name gin_trgm_ops);
create index if not exists idx_reels_caption_trgm on public.trending_reels using gin (caption gin_trgm_ops);
create index if not exists idx_famous_ads_search_trgm on public.famous_ads using gin (
  (coalesce(title, '') || ' ' || coalesce(brand_name, '') || ' ' || coalesce(hook_type, '')) gin_trgm_ops
);
create index if not exists idx_projects_user_status on public.projects (user_id, status);
create index if not exists idx_project_assets_project_id on public.project_assets (project_id);
create index if not exists idx_project_events_project_id on public.project_events (project_id);

-- 5. HELPER FUNCTIONS & TRIGGERS

-- Check if current authenticated user is an admin
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Touch updated_at timestamp on projects
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects
for each row execute function public.touch_updated_at();

-- Auto-create profile on auth.users signup
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    'client'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- Trigger to protect profiles role and is_adult_verified from client tampering
create or replace function public.protect_profile_fields() returns trigger
language plpgsql as $$
begin
  if not public.is_admin() then
    if old.role is distinct from new.role then
      raise exception 'Only administrators may alter user roles.';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_protect_profile_fields on public.profiles;
create trigger trg_protect_profile_fields before update on public.profiles
for each row execute function public.protect_profile_fields();

-- 6. ROW LEVEL SECURITY (RLS) POLICIES

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.projects enable row level security;
alter table public.project_assets enable row level security;
alter table public.project_events enable row level security;
alter table public.trending_reels enable row level security;
alter table public.famous_ads enable row level security;
alter table public.saved_items enable row level security;
alter table public.search_logs enable row level security;

-- Profiles Policies
create policy "Public can view creator profile basic info"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Categories Policies
create policy "Anyone can read active categories"
  on public.categories for select
  using (is_active = true or public.is_admin());

create policy "Admins can manage categories"
  on public.categories for all
  using (public.is_admin());

-- Projects Policies
create policy "Users can read own projects"
  on public.projects for select
  using (auth.uid() = user_id or auth.uid() = assigned_creator_id or public.is_admin());

create policy "Users can insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own draft projects"
  on public.projects for update
  using (
    (auth.uid() = user_id and status in ('draft', 'submitted')) or
    public.is_admin()
  );

create policy "Admins have full project management"
  on public.projects for all
  using (public.is_admin());

-- Project Assets Policies
create policy "Project participants can view assets"
  on public.project_assets for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and (
        p.user_id = auth.uid() or
        p.assigned_creator_id = auth.uid() or
        public.is_admin()
      )
    )
  );

create policy "Project owners can insert client assets"
  on public.project_assets for insert
  with check (
    auth.uid() = user_id and (
      kind in ('product_image', 'reference') or
      public.is_admin()
    )
  );

create policy "Admins and assigned creators can manage deliverables"
  on public.project_assets for all
  using (public.is_admin() or exists (
    select 1 from public.projects p
    where p.id = project_id and p.assigned_creator_id = auth.uid()
  ));

-- Project Events Policies
create policy "Participants can view project events"
  on public.project_events for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and (
        p.user_id = auth.uid() or
        p.assigned_creator_id = auth.uid() or
        public.is_admin()
      )
    )
  );

create policy "Authenticated users and admins can record events"
  on public.project_events for insert
  with check (auth.uid() = actor_id or public.is_admin());

-- Trending Reels Policies
create policy "Anyone can read published reels"
  on public.trending_reels for select
  using (is_published = true or public.is_admin());

create policy "Admins manage trending reels"
  on public.trending_reels for all
  using (public.is_admin());

-- Famous Ads Policies
create policy "Anyone can read published famous ads"
  on public.famous_ads for select
  using (is_published = true or public.is_admin());

create policy "Admins manage famous ads"
  on public.famous_ads for all
  using (public.is_admin());

-- Saved Items Policies
create policy "Users manage own saved items"
  on public.saved_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Search Logs Policies
create policy "Admins can view search logs"
  on public.search_logs for select
  using (public.is_admin());

-- 7. GLOBAL SEARCH RPC
create or replace function public.search_all(
  q text,
  category_slug text default null,
  lim int default 20,
  include_adult boolean default false
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_res json;
  v_cat_id uuid;
begin
  if category_slug is not null and category_slug <> '' then
    select id into v_cat_id from public.categories where slug = category_slug;
  end if;

  select json_build_object(
    'categories', coalesce((
      select json_agg(c)
      from (
        select id, slug, name, icon, accent_color, is_adult
        from public.categories
        where is_active = true
          and (include_adult = true or is_adult = false)
          and (
            name ilike '%' || q || '%' or
            q = any(keywords)
          )
        order by sort_order asc
        limit lim
      ) c
    ), '[]'::json),
    'reels', coalesce((
      select json_agg(r)
      from (
        select tr.id, tr.shortcode, tr.thumbnail_url, tr.caption, tr.creator_handle, tr.views_label,
               tr.instagram_url, tr.is_featured, tr.is_seed, c.slug as category_slug, c.name as category_name
        from public.trending_reels tr
        left join public.categories c on c.id = tr.category_id
        where tr.is_published = true
          and (include_adult = true or c.is_adult = false or c.is_adult is null)
          and (v_cat_id is null or tr.category_id = v_cat_id)
          and (
            tr.caption ilike '%' || q || '%' or
            tr.creator_handle ilike '%' || q || '%' or
            c.name ilike '%' || q || '%'
          )
        order by tr.sort_order asc, tr.created_at desc
        limit lim
      ) r
    ), '[]'::json),
    'ads', coalesce((
      select json_agg(a)
      from (
        select fa.id, fa.title, fa.brand_name, fa.platform, fa.format, fa.source_url,
               fa.thumbnail_url, fa.hook_type, fa.why_it_works, fa.cta_style, fa.region, fa.is_seed,
               c.slug as category_slug, c.name as category_name
        from public.famous_ads fa
        left join public.categories c on c.id = fa.category_id
        where fa.is_published = true
          and (include_adult = true or c.is_adult = false or c.is_adult is null)
          and (v_cat_id is null or fa.category_id = v_cat_id)
          and (
            fa.title ilike '%' || q || '%' or
            fa.brand_name ilike '%' || q || '%' or
            fa.hook_type ilike '%' || q || '%' or
            c.name ilike '%' || q || '%'
          )
        order by fa.sort_order asc, fa.created_at desc
        limit lim
      ) a
    ), '[]'::json)
  ) into v_res;

  return v_res;
end;
$$;
