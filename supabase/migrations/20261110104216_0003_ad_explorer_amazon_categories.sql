-- ============================================================================
-- SUPABASE MIGRATION: 0003_ad_explorer_amazon_categories.sql
-- Ad Explorer Upgrades: Amazon Ads Curation, Dynamic Categories & New Fields
-- ============================================================================

-- 1. EXTEND PLATFORM CHECK CONSTRAINT TO INCLUDE 'amazon'
alter table public.ad_listings drop constraint if exists ad_listings_platform_check;
alter table public.ad_listings add constraint ad_listings_platform_check
  check (platform in ('meta', 'google', 'linkedin', 'tiktok', 'x', 'amazon'));

-- 2. SAFE IDEMPOTENT ADDITION OF AMAZON & EXTENDED URL FIELDS
alter table public.ad_listings add column if not exists asin text;
alter table public.ad_listings add column if not exists product_url text;
alter table public.ad_listings add column if not exists landing_page_url text;
alter table public.ad_listings add column if not exists amazon_ad_type text;
alter table public.ad_listings add column if not exists search_term text;
alter table public.ad_listings add column if not exists marketplace text;

-- Index for ASIN and product research lookup
create index if not exists idx_ad_listings_asin on public.ad_listings (asin) where asin is not null;
create index if not exists idx_ad_listings_amazon_type on public.ad_listings (amazon_ad_type) where amazon_ad_type is not null;

-- 3. DEDICATED ISOLATED AD EXPLORER CATEGORIES TABLE
-- Isolated from public.categories (which is shared with Studio briefs, projects, and trending reels)
create table if not exists public.ad_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  icon text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS for ad_categories
alter table public.ad_categories enable row level security;

-- Public read for active categories
drop policy if exists "Public can read active ad categories" on public.ad_categories;
create policy "Public can read active ad categories"
  on public.ad_categories for select
  using (is_active = true or public.is_admin());

-- Admins full management
drop policy if exists "Admins manage ad categories" on public.ad_categories;
create policy "Admins manage ad categories"
  on public.ad_categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- Seed editable initial categories into isolated ad_categories table
insert into public.ad_categories (slug, name, description, icon, sort_order, is_active)
values
  (
    'health-ayurvedic',
    'Health & Ayurvedic Products',
    'Ayurvedic supplements, herbal wellness, digestion, stamina & immunity brands (e.g. Kapiva)',
    'Leaf',
    1,
    true
  ),
  (
    'makeup-skincare-reels',
    'Makeup & Skincare Reels',
    'Cosmetics, lip shades, clinical skincare, UV sunscreen wear tests & beauty unboxings',
    'Sparkles',
    2,
    true
  ),
  (
    'clothing-fashion',
    'Clothing & Fashion',
    'Streetwear, ethnic apparel, candid try-on hauls & lifestyle fashion videos',
    'Shirt',
    3,
    true
  )
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

-- 4. UPDATE SEARCH_AD_LISTINGS RPC WITH AMAZON & EXTENDED FIELDS
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
  -- Total count matching filters (public read sees published only)
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
      category ilike '%' || q || '%' or
      asin ilike '%' || q || '%' or
      search_term ilike '%' || q || '%'
    );

  -- Retrieve paged items with all platform metadata
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
      landing_page_url,
      product_url,
      asin,
      amazon_ad_type,
      search_term,
      marketplace,
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
        category ilike '%' || q || '%' or
        asin ilike '%' || q || '%' or
        search_term ilike '%' || q || '%'
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
