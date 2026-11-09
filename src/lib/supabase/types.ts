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
