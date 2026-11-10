export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = 'client' | 'creator' | 'admin';
export type InputMode = 'script' | 'product_images' | 'drive_link';
export type ProjectStatus =
  | 'draft'
  | 'submitted'
  | 'brief_review'
  | 'script_approved'
  | 'creator_assigned'
  | 'shooting'
  | 'ai_enhancement'
  | 'qa_review'
  | 'delivered'
  | 'revision_requested'
  | 'completed'
  | 'cancelled';

export interface Profile {
  id: string;
  full_name: string | null;
  role: AppRole;
  is_adult_verified: boolean;
  release_signed: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  accent_color: string | null;
  keywords: string[];
  insights_md: string | null;
  is_adult: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface DriveLinkItem {
  url: string;
  file_id?: string;
  kind?: 'file' | 'folder';
  access_status?: 'ok' | 'no_access' | 'unchecked';
}

export interface CreatorPreference {
  gender?: string;
  age_range?: string;
  look_notes?: string;
  language_spoken?: string;
}

export interface Project {
  id: string;
  user_id: string;
  category_id: string | null;
  brand_name: string | null;
  brand_link: string | null;
  goal: string | null;
  platform: string | null;
  formats: string[];
  duration_seconds: number | null;
  language: string;
  tone: string | null;
  creator_preference: CreatorPreference;
  input_modes: InputMode[];
  script_text: string | null;
  script_source: 'client' | 'ai_draft' | 'human_written' | null;
  product_name: string | null;
  product_benefits: string[] | null;
  product_usp: string | null;
  target_audience: string | null;
  drive_links: DriveLinkItem[];
  reference_urls: string[];
  status: ProjectStatus;
  assigned_creator_id: string | null;
  rights_confirmed: boolean;
  due_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectAsset {
  id: string;
  project_id: string;
  user_id: string;
  kind: 'product_image' | 'reference' | 'deliverable';
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  is_primary: boolean;
  created_at: string;
}

export interface ProjectEvent {
  id: string;
  project_id: string;
  actor_id: string | null;
  event_type: string;
  from_status: ProjectStatus | null;
  to_status: ProjectStatus | null;
  note: string | null;
  created_at: string;
}

export interface TrendingReel {
  id: string;
  category_id: string | null;
  instagram_url: string;
  shortcode: string | null;
  thumbnail_url: string | null;
  caption: string | null;
  creator_handle: string | null;
  views_label: string | null;
  is_featured: boolean;
  is_published: boolean;
  is_seed: boolean;
  sort_order: number;
  created_at: string;
  category?: Category;
}

export interface FamousAd {
  id: string;
  category_id: string | null;
  title: string;
  brand_name: string | null;
  platform: string | null;
  format: string | null;
  source_url: string | null;
  thumbnail_url: string | null;
  hook_type: string | null;
  why_it_works: string[];
  cta_style: string | null;
  region: string | null;
  is_published: boolean;
  is_seed: boolean;
  sort_order: number;
  created_at: string;
  category?: Category;
}

export interface SavedItem {
  user_id: string;
  item_type: 'reel' | 'ad';
  item_id: string;
  created_at: string;
}

export interface SearchLog {
  id: number;
  user_id: string | null;
  query: string;
  category_slug: string | null;
  results_count: number | null;
  created_at: string;
}

export interface SearchResults {
  categories: Category[];
  reels: (TrendingReel & { category_slug?: string; category_name?: string })[];
  ads: (FamousAd & { category_slug?: string; category_name?: string })[];
}

export type AdPlatform = 'meta' | 'google' | 'linkedin' | 'tiktok' | 'x' | 'amazon';
export type CreativeFormat = 'video' | 'image' | 'carousel' | 'text' | 'other';
export type MediaRightsStatus = 'platform_link_only' | 'licensed' | 'fair_use_editorial' | 'client_authorized';
export type AdListingStatus = 'draft' | 'review' | 'published' | 'archived';
export type AdMediaType = 'embed' | 'hosted_video' | 'image' | 'source_link';

export interface AdMediaItem {
  id?: string;
  ad_listing_id?: string;
  media_type: AdMediaType;
  media_url: string;
  thumbnail_url?: string | null;
  caption?: string | null;
  display_order: number;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface AdListing {
  id: string;
  platform: AdPlatform;
  platform_surface?: string | null;
  brand_name: string;
  advertiser_name?: string | null;
  title: string;
  short_description?: string | null;
  hook_summary?: string | null;
  call_to_action?: string | null;
  category: string;
  country_code: string;
  creative_format: CreativeFormat;
  source_url: string;
  source_ad_id?: string | null;
  media_url?: string | null;
  media_provider?: string | null;
  preview_image_path?: string | null;
  landing_page_url?: string | null;
  product_url?: string | null;
  asin?: string | null;
  amazon_ad_type?: string | null;
  search_term?: string | null;
  marketplace?: string | null;
  media_rights_status: MediaRightsStatus;
  first_seen_at?: string | null;
  last_reviewed_at: string;
  status: AdListingStatus;
  curator_note?: string | null;
  signal_labels: string[];
  is_featured: boolean;
  performance_evidence_note?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at?: string;
  media_items?: AdMediaItem[];
}

export interface AdSearchFilters {
  query?: string;
  platforms?: AdPlatform[];
  category?: string;
  country?: string;
  format?: CreativeFormat | 'all';
  signal?: string;
  sort?: 'reviewed' | 'added' | 'featured';
  limit?: number;
  offset?: number;
}

export interface AdSearchResult {
  items: AdListing[];
  total: number;
}
