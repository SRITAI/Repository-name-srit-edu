-- ============================================================================
-- SUPABASE MIGRATION: 20261115110000_homepage_video_library.sql
-- Homepage Video Library: Persistent Admin-Curated Videos & Flow Gallery
-- Supports cinematic hero drift, trending rails, non-destructive trimming & RLS
-- ============================================================================

-- 1. HOMEPAGE VIDEOS TABLE
create table if not exists public.homepage_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  caption text,
  alt_text text,
  category text default 'general',
  video_url text not null,
  storage_path text,
  poster_url text,
  placement text not null default 'hero_drift_top' check (placement in ('hero_drift_top', 'hero_drift_bottom', 'trending_rail', 'curated_feature')),
  aspect_ratio text not null default '9:16' check (aspect_ratio in ('9:16', '16:9')),
  trim_start_seconds numeric,
  trim_end_seconds numeric,
  display_order int not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Idempotent updated_at trigger
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'homepage_videos_touch') then
    create trigger homepage_videos_touch before update on public.homepage_videos
    for each row execute function public.touch_updated_at();
  end if;
end $$;

-- 2. INDEXES FOR FAST QUERYING
create index if not exists idx_homepage_videos_query on public.homepage_videos (status, placement, display_order asc);
create index if not exists idx_homepage_videos_created on public.homepage_videos (created_at desc);

-- 3. ROW LEVEL SECURITY (RLS)
alter table public.homepage_videos enable row level security;

do $$
begin
  -- Public visitors can read published videos
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'homepage_videos' and policyname = 'Public visitors can read published homepage videos'
  ) then
    create policy "Public visitors can read published homepage videos"
      on public.homepage_videos for select
      using (status = 'published' or public.is_admin());
  end if;

  -- Administrators have full management access (insert, update, delete, drafts)
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'homepage_videos' and policyname = 'Admins have full access to homepage videos'
  ) then
    create policy "Admins have full access to homepage videos"
      on public.homepage_videos for all
      using (public.is_admin())
      with check (public.is_admin());
  end if;
end $$;
