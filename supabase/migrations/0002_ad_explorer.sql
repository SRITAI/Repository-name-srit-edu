-- ============================================================================
-- SUPABASE MIGRATION: 0002_ad_explorer.sql
-- Multi-Platform Ad Explorer: Schema, Indexes, Search Engine & RLS Policies
-- Meta, Google, LinkedIn, TikTok, and X Curated Intelligence Catalogue
-- ============================================================================

-- 1. AD LISTINGS TABLE
create table if not exists public.ad_listings (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('meta', 'google', 'linkedin', 'tiktok', 'x', 'amazon')),
  platform_surface text, -- 'Instagram Reels', 'Facebook Feed', 'Google Search', 'YouTube Shorts', 'LinkedIn Video', 'TikTok In-Feed', 'X Promoted Post'
  brand_name text not null,
  advertiser_name text,
  title text not null,
  short_description text,
  hook_summary text,
  call_to_action text,
  category text not null,
  country_code text not null default 'US',
  creative_format text not null default 'video' check (creative_format in ('video', 'image', 'carousel', 'text', 'other')),
  source_url text not null,
  source_ad_id text,
  media_url text,
  media_provider text,
  preview_image_path text,
  media_rights_status text not null default 'platform_link_only' check (media_rights_status in ('platform_link_only', 'licensed', 'fair_use_editorial', 'client_authorized')),
  first_seen_at timestamptz,
  last_reviewed_at timestamptz not null default now(),
  status text not null default 'published' check (status in ('draft', 'review', 'published', 'archived')),
  curator_note text,
  signal_labels text[] not null default '{}',
  is_featured boolean not null default false,
  performance_evidence_note text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Safe idempotent column additions if table already existed
alter table public.ad_listings add column if not exists media_url text;
alter table public.ad_listings add column if not exists media_provider text;

-- 2. AUTOMATIC UPDATED_AT TRIGGER
drop trigger if exists ad_listings_touch on public.ad_listings;
create trigger ad_listings_touch before update on public.ad_listings
for each row execute function public.touch_updated_at();

-- 3. INDEXES FOR MULTI-DIMENSIONAL QUERYING
create index if not exists idx_ad_listings_platform_status on public.ad_listings (platform, status);
create index if not exists idx_ad_listings_status on public.ad_listings (status);
create index if not exists idx_ad_listings_category on public.ad_listings (category);
create index if not exists idx_ad_listings_country on public.ad_listings (country_code);
create index if not exists idx_ad_listings_format on public.ad_listings (creative_format);
create index if not exists idx_ad_listings_featured on public.ad_listings (is_featured) where is_featured = true;
create index if not exists idx_ad_listings_last_reviewed on public.ad_listings (last_reviewed_at desc);
create index if not exists idx_ad_listings_created_at on public.ad_listings (created_at desc);

-- Trigram index for full-text search across brands, titles, summaries, and hooks
create index if not exists idx_ad_listings_trgm on public.ad_listings using gin (
  (
    coalesce(brand_name, '') || ' ' ||
    coalesce(advertiser_name, '') || ' ' ||
    coalesce(title, '') || ' ' ||
    coalesce(short_description, '') || ' ' ||
    coalesce(hook_summary, '') || ' ' ||
    coalesce(category, '')
  ) gin_trgm_ops
);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.ad_listings enable row level security;

-- Public Anonymous & Authenticated Visitors can only read published listings
drop policy if exists "Public visitors can read published ad listings" on public.ad_listings;
create policy "Public visitors can read published ad listings"
  on public.ad_listings for select
  using (status = 'published' or public.is_admin());

-- Administrators have full management access (insert, update, delete, view drafts)
drop policy if exists "Admins have full access to ad listings" on public.ad_listings;
create policy "Admins have full access to ad listings"
  on public.ad_listings for all
  using (public.is_admin())
  with check (public.is_admin());

-- 5. STORAGE BUCKET FOR LICENSED / CLIENT AUTHORIZED AD PREVIEWS
insert into storage.buckets (id, name, public)
values ('ad-previews', 'ad-previews', true)
on conflict (id) do update set public = true;

-- Storage RLS: Public read
drop policy if exists "Public read for ad previews" on storage.objects;
create policy "Public read for ad previews"
  on storage.objects for select
  using (bucket_id = 'ad-previews');

-- Storage RLS: Admin upload & management
drop policy if exists "Admins can upload ad previews" on storage.objects;
create policy "Admins can upload ad previews"
  on storage.objects for insert
  with check (bucket_id = 'ad-previews' and public.is_admin());

drop policy if exists "Admins can update and delete ad previews" on storage.objects;
create policy "Admins can update and delete ad previews"
  on storage.objects for all
  using (bucket_id = 'ad-previews' and public.is_admin());

-- 6. SEARCH & FILTER RPC FUNCTION
create or replace function public.search_ad_listings(
  q text default null,
  p_platforms text[] default null,
  p_category text default null,
  p_country text default null,
  p_format text default null,
  p_signal text default null,
  p_sort text default 'reviewed',
  p_limit int default 24,
  p_offset int default 0
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_items json;
  v_total bigint;
begin
  -- Total count matching filters
  select count(*)
  into v_total
  from public.ad_listings
  where status = 'published'
    and (p_platforms is null or cardinality(p_platforms) = 0 or platform = any(p_platforms))
    and (p_category is null or p_category = 'all' or category = p_category)
    and (p_country is null or p_country = 'all' or country_code = p_country)
    and (p_format is null or p_format = 'all' or creative_format = p_format)
    and (p_signal is null or p_signal = 'all' or p_signal = any(signal_labels))
    and (
      q is null or trim(q) = '' or
      brand_name ilike '%' || q || '%' or
      advertiser_name ilike '%' || q || '%' or
      title ilike '%' || q || '%' or
      short_description ilike '%' || q || '%' or
      hook_summary ilike '%' || q || '%' or
      curator_note ilike '%' || q || '%' or
      category ilike '%' || q || '%'
    );

  -- Retrieve paged items
  select coalesce(json_agg(row_to_json(t)), '[]'::json)
  into v_items
  from (
    select
      id,
      platform,
      platform_surface,
      brand_name,
      advertiser_name,
      title,
      short_description,
      hook_summary,
      call_to_action,
      category,
      country_code,
      creative_format,
      source_url,
      source_ad_id,
      media_url,
      media_provider,
      preview_image_path,
      media_rights_status,
      first_seen_at,
      last_reviewed_at,
      status,
      curator_note,
      signal_labels,
      is_featured,
      performance_evidence_note,
      created_at
    from public.ad_listings
    where status = 'published'
      and (p_platforms is null or cardinality(p_platforms) = 0 or platform = any(p_platforms))
      and (p_category is null or p_category = 'all' or category = p_category)
      and (p_country is null or p_country = 'all' or country_code = p_country)
      and (p_format is null or p_format = 'all' or creative_format = p_format)
      and (p_signal is null or p_signal = 'all' or p_signal = any(signal_labels))
      and (
        q is null or trim(q) = '' or
        brand_name ilike '%' || q || '%' or
        advertiser_name ilike '%' || q || '%' or
        title ilike '%' || q || '%' or
        short_description ilike '%' || q || '%' or
        hook_summary ilike '%' || q || '%' or
        curator_note ilike '%' || q || '%' or
        category ilike '%' || q || '%'
      )
    order by
      case
        when q is not null and trim(q) <> '' and (lower(brand_name) = lower(trim(q)) or lower(coalesce(advertiser_name, '')) = lower(trim(q))) then 1
        when q is not null and trim(q) <> '' and (brand_name ilike '%' || trim(q) || '%' or coalesce(advertiser_name, '') ilike '%' || trim(q) || '%') then 2
        else 3
      end asc,
      case when p_sort = 'featured' then is_featured end desc nulls last,
      case when p_sort = 'added' then created_at end desc nulls last,
      case when p_sort = 'reviewed' then last_reviewed_at end desc nulls last,
      last_reviewed_at desc
    limit p_limit
    offset p_offset
  ) t;

  return json_build_object(
    'items', v_items,
    'total', v_total
  );
end;
$$;
