-- ============================================================================
-- SUPABASE MIGRATION: 0004_ad_media_library.sql
-- Multi-Media Ad Library: Normalized Media Items, Storage Bucket & RLS
-- Supports multiple media items per ad (embeds, hosted videos, images, links)
-- ============================================================================

-- 1. NORMALIZED MEDIA ITEMS TABLE
-- Allows one ad listing to contain multiple media items (variants, carousel assets,
-- multi-platform cuts, video embeds, and screenshots).
create table if not exists public.ad_media_items (
  id uuid primary key default gen_random_uuid(),
  ad_listing_id uuid not null references public.ad_listings(id) on delete cascade,
  media_type text not null check (media_type in ('embed', 'hosted_video', 'image', 'source_link')),
  media_url text not null,
  thumbnail_url text,
  caption text,
  display_order int not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Automatic updated_at trigger (idempotent without DROP)
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'ad_media_items_touch') then
    create trigger ad_media_items_touch before update on public.ad_media_items
    for each row execute function public.touch_updated_at();
  end if;
end $$;

-- Indexes for performance
create index if not exists idx_ad_media_items_ad_id on public.ad_media_items (ad_listing_id, display_order asc);
create index if not exists idx_ad_media_items_type on public.ad_media_items (media_type);

-- 2. ROW LEVEL SECURITY (RLS) FOR MEDIA ITEMS
alter table public.ad_media_items enable row level security;

do $$
begin
  -- Public can read media items if parent listing is published (or user is admin)
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'ad_media_items' and policyname = 'Public can read published ad media items'
  ) then
    create policy "Public can read published ad media items"
      on public.ad_media_items for select
      using (
        exists (
          select 1 from public.ad_listings
          where ad_listings.id = ad_media_items.ad_listing_id
            and (ad_listings.status = 'published' or public.is_admin())
        )
      );
  end if;

  -- Admins full management access (insert, update, delete)
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'ad_media_items' and policyname = 'Admins manage ad media items'
  ) then
    create policy "Admins manage ad media items"
      on public.ad_media_items for all
      using (public.is_admin())
      with check (public.is_admin());
  end if;
end $$;

-- 3. STORAGE BUCKET CONFIGURATION FOR AD PREVIEWS (ad-previews)
-- Enforces 50 MB file size limit and authorized media mime types
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ad-previews',
  'ad-previews',
  true,
  52428800, -- 50 MB in bytes
  array['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = array['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/png', 'image/webp'];

do $$
begin
  -- Storage RLS: Public can view assets
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public can view ad preview files'
  ) then
    create policy "Public can view ad preview files"
      on storage.objects for select
      using (bucket_id = 'ad-previews');
  end if;

  -- Storage RLS: Only authenticated administrators can upload assets
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admins can upload ad previews'
  ) then
    create policy "Admins can upload ad previews"
      on storage.objects for insert
      with check (bucket_id = 'ad-previews' and public.is_admin());
  end if;

  -- Storage RLS: Only administrators can update or delete preview files
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admins can update and delete ad previews'
  ) then
    create policy "Admins can update and delete ad previews"
      on storage.objects for all
      using (bucket_id = 'ad-previews' and public.is_admin());
  end if;
end $$;

-- 4. BACKFILL EXISTING MEDIA FROM AD_LISTINGS INTO AD_MEDIA_ITEMS
-- Ensures zero data loss and backwards compatibility for existing listings
insert into public.ad_media_items (ad_listing_id, media_type, media_url, thumbnail_url, display_order)
select
  l.id,
  case
    when l.media_url ilike '%.mp4' or l.media_url ilike '%.webm' or l.media_url ilike '%.mov' then 'hosted_video'
    when l.media_url is not null and trim(l.media_url) <> '' then 'embed'
    when l.preview_image_path is not null and trim(l.preview_image_path) <> '' then 'image'
    else 'source_link'
  end as media_type,
  coalesce(nullif(trim(l.media_url), ''), nullif(trim(l.preview_image_path), ''), l.source_url) as media_url,
  l.preview_image_path as thumbnail_url,
  0 as display_order
from public.ad_listings l
where not exists (
  select 1 from public.ad_media_items m where m.ad_listing_id = l.id
);

-- 5. UPDATED SEARCH_AD_LISTINGS RPC WITH MEDIA ITEMS AGGREGATION
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
  -- Total count matching search & filters
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
      brand_name ilike '%' || trim(q) || '%' or
      advertiser_name ilike '%' || trim(q) || '%' or
      title ilike '%' || trim(q) || '%' or
      short_description ilike '%' || trim(q) || '%' or
      hook_summary ilike '%' || trim(q) || '%' or
      curator_note ilike '%' || trim(q) || '%' or
      category ilike '%' || trim(q) || '%' or
      asin ilike '%' || trim(q) || '%' or
      search_term ilike '%' || trim(q) || '%'
    );

  -- Paged listings with joined media items
  select coalesce(json_agg(row_to_json(t)), '[]'::json)
  into v_items
  from (
    select
      l.id,
      l.platform,
      l.platform_surface,
      l.brand_name,
      l.advertiser_name,
      l.title,
      l.short_description,
      l.hook_summary,
      l.call_to_action,
      l.category,
      l.country_code,
      l.creative_format,
      l.source_url,
      l.source_ad_id,
      l.media_url,
      l.media_provider,
      l.preview_image_path,
      l.product_url,
      l.landing_page_url,
      l.asin,
      l.amazon_ad_type,
      l.search_term,
      l.marketplace,
      l.media_rights_status,
      l.first_seen_at,
      l.last_reviewed_at,
      l.status,
      l.curator_note,
      l.signal_labels,
      l.is_featured,
      l.performance_evidence_note,
      l.created_at,
      coalesce(
        (
          select json_agg(
            json_build_object(
              'id', m.id,
              'ad_listing_id', m.ad_listing_id,
              'media_type', m.media_type,
              'media_url', m.media_url,
              'thumbnail_url', m.thumbnail_url,
              'caption', m.caption,
              'display_order', m.display_order,
              'metadata', m.metadata,
              'created_at', m.created_at
            ) order by m.display_order asc, m.created_at asc
          )
          from public.ad_media_items m
          where m.ad_listing_id = l.id
        ),
        '[]'::json
      ) as media_items
    from public.ad_listings l
    where l.status = 'published'
      and (p_platforms is null or cardinality(p_platforms) = 0 or l.platform = any(p_platforms))
      and (p_category is null or p_category = 'all' or l.category = p_category)
      and (p_country is null or p_country = 'all' or l.country_code = p_country)
      and (p_format is null or p_format = 'all' or l.creative_format = p_format)
      and (p_signal is null or p_signal = 'all' or p_signal = any(l.signal_labels))
      and (
        q is null or trim(q) = '' or
        l.brand_name ilike '%' || trim(q) || '%' or
        l.advertiser_name ilike '%' || trim(q) || '%' or
        l.title ilike '%' || trim(q) || '%' or
        l.short_description ilike '%' || trim(q) || '%' or
        l.hook_summary ilike '%' || trim(q) || '%' or
        l.curator_note ilike '%' || trim(q) || '%' or
        l.category ilike '%' || trim(q) || '%' or
        l.asin ilike '%' || trim(q) || '%' or
        l.search_term ilike '%' || trim(q) || '%'
      )
    order by
      case
        when q is not null and trim(q) <> '' and (lower(l.brand_name) = lower(trim(q)) or lower(coalesce(l.advertiser_name, '')) = lower(trim(q))) then 1
        when q is not null and trim(q) <> '' and (l.brand_name ilike '%' || trim(q) || '%' or coalesce(l.advertiser_name, '') ilike '%' || trim(q) || '%') then 2
        else 3
      end asc,
      case when p_sort = 'featured' then l.is_featured end desc nulls last,
      case when p_sort = 'added' then l.created_at end desc nulls last,
      case when p_sort = 'reviewed' then l.last_reviewed_at end desc nulls last,
      l.last_reviewed_at desc
    limit p_limit
    offset p_offset
  ) t;

  return json_build_object(
    'items', v_items,
    'total', v_total
  );
end;
$$;
