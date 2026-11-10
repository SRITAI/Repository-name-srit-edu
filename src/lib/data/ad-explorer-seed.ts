import { AdListing, AdSearchFilters, AdSearchResult, AdPlatform, CreativeFormat } from '../supabase/types';

export interface PlatformConfig {
  id: AdPlatform;
  name: string;
  shortName: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  libraryName: string;
  surfaces: string[];
}

export const PLATFORMS_CONFIG: Record<AdPlatform, PlatformConfig> = {
  meta: {
    id: 'meta',
    name: 'Meta',
    shortName: 'Meta',
    accentColor: '#0081FB',
    badgeBg: 'rgba(0, 129, 251, 0.12)',
    badgeText: '#60A5FA',
    libraryName: 'Meta Ad Library',
    surfaces: ['Instagram Reels', 'Facebook Feed', 'Instagram Stories', 'Audience Network'],
  },
  google: {
    id: 'google',
    name: 'Google',
    shortName: 'Google',
    accentColor: '#EA4335',
    badgeBg: 'rgba(234, 67, 53, 0.12)',
    badgeText: '#F87171',
    libraryName: 'Google Ads Transparency Center',
    surfaces: ['YouTube Shorts', 'YouTube In-Stream', 'Google Search', 'Google Display'],
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    shortName: 'LinkedIn',
    accentColor: '#0A66C2',
    badgeBg: 'rgba(10, 102, 194, 0.12)',
    badgeText: '#38BDF8',
    libraryName: 'LinkedIn Ad Library',
    surfaces: ['Sponsored Content', 'Video Ad', 'Carousel Ad', 'Direct Message'],
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    shortName: 'TikTok',
    accentColor: '#EE1D52',
    badgeBg: 'rgba(238, 29, 82, 0.12)',
    badgeText: '#FB7185',
    libraryName: 'TikTok Creative Center',
    surfaces: ['In-Feed Video', 'Spark Ads', 'TopView', 'Brand Takeover'],
  },
  x: {
    id: 'x',
    name: 'X (Twitter)',
    shortName: 'X',
    accentColor: '#FFFFFF',
    badgeBg: 'rgba(255, 255, 255, 0.12)',
    badgeText: '#F4F4F5',
    libraryName: 'X Transparency / Public Post',
    surfaces: ['Promoted Post', 'Promoted Video', 'Amplify Pre-roll', 'Trend Takeover'],
  },
  amazon: {
    id: 'amazon',
    name: 'Amazon Ads',
    shortName: 'Amazon',
    accentColor: '#FF9900',
    badgeBg: 'rgba(255, 153, 0, 0.15)',
    badgeText: '#FFB84D',
    libraryName: 'Amazon Search & Storefronts',
    surfaces: [
      'Sponsored Products',
      'Sponsored Brands (Headline Video)',
      'Sponsored Display',
      'Prime Video Placement',
      'Amazon DSP / Video',
      'Storefront Spotlight',
    ],
  },
};

export const INITIAL_AD_CATEGORIES = [
  { id: 'health-ayurvedic', label: 'Health & Ayurvedic Products', slug: 'health-ayurvedic', description: 'Ayurvedic supplements, herbal wellness, digestion & stamina (e.g. Kapiva)' },
  { id: 'makeup-skincare-reels', label: 'Makeup & Skincare Reels', slug: 'makeup-skincare-reels', description: 'Cosmetics, derma skincare, UGC unboxing & beauty routines' },
  { id: 'clothing-fashion', label: 'Clothing & Fashion', slug: 'clothing-fashion', description: 'Streetwear, apparel, try-on hauls & lifestyle fashion' },
];

export const AD_CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'health-ayurvedic', label: 'Health & Ayurvedic Products' },
  { id: 'makeup-skincare-reels', label: 'Makeup & Skincare Reels' },
  { id: 'clothing-fashion', label: 'Clothing & Fashion' },
  { id: 'fashion', label: 'Clothing & Fashion (Legacy)' },
  { id: 'beauty', label: 'Makeup & Beauty (Legacy)' },
  { id: 'skincare', label: 'Skincare & Derma (Legacy)' },
  { id: 'saas', label: 'Tech & SaaS' },
  { id: 'b2b', label: 'B2B & Enterprise' },
  { id: 'dtc', label: 'DTC & Consumer' },
  { id: 'fitness', label: 'Health & Fitness' },
  { id: 'wellness', label: 'Sexual Wellness (18+)' },
];

export const AD_COUNTRIES = [
  { id: 'all', label: 'All Markets' },
  { id: 'US', label: 'United States (US)' },
  { id: 'UK', label: 'United Kingdom (UK)' },
  { id: 'EU', label: 'European Union (EU)' },
  { id: 'IN', label: 'India (IN)' },
  { id: 'Global', label: 'Global / Multi-region' },
];

export const CREATIVE_FORMATS: { id: CreativeFormat | 'all'; label: string }[] = [
  { id: 'all', label: 'All Formats' },
  { id: 'video', label: 'Video (9:16 / 16:9)' },
  { id: 'image', label: 'Single Image' },
  { id: 'carousel', label: 'Carousel Deck' },
  { id: 'text', label: 'Search & Text' },
];

export const CURATOR_SIGNALS = [
  { id: 'all', label: 'All Signals' },
  { id: 'Editor\'s pick', label: 'Editor\'s Pick' },
  { id: 'Long-running', label: 'Long-Running (>60 Days)' },
  { id: 'Multiple versions', label: 'Multiple A/B Iterations' },
  { id: 'Recently spotted', label: 'Recently Spotted' },
  { id: 'High retention', label: 'High Retention Hook' },
];

export const SEED_AD_LISTINGS: AdListing[] = [
  // 1. META (Instagram / Facebook)
  {
    id: 'ad-meta-001',
    platform: 'meta',
    platform_surface: 'Instagram Reels',
    brand_name: 'Gymshark',
    advertiser_name: 'Gymshark Ltd',
    title: 'Seamless Gymwear Real Athlete Stress Test',
    short_description: 'Fast-paced, candid gym wear test highlighting squat-proof fabric and sweat absorption.',
    hook_summary: 'Squats, deadlifts, and real chalk: testing if this waistband rolls down under tension.',
    call_to_action: 'Shop Now ↗',
    category: 'fashion',
    country_code: 'US',
    creative_format: 'video',
    source_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Gymshark',
    source_ad_id: 'meta_gs_884920',
    preview_image_path: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    media_rights_status: 'platform_link_only',
    first_seen_at: '2026-08-15T00:00:00Z',
    last_reviewed_at: '2026-11-04T10:00:00Z',
    status: 'published',
    curator_note: 'Demonstrates authentic athletic motion rather than sterile studio posing. Notice the immediate 2-second hook testing the product promise.',
    signal_labels: ['Long-running', 'Editor\'s pick', 'High retention'],
    is_featured: true,
    performance_evidence_note: 'Verified in Meta Ad Library across 4 global regions with 6 active creative iterations.',
    created_at: '2026-09-01T12:00:00Z',
  },
  {
    id: 'ad-meta-002',
    platform: 'meta',
    platform_surface: 'Facebook Feed',
    brand_name: 'Glossier',
    advertiser_name: 'Glossier Inc.',
    title: 'Cloud Paint Natural Cheek Glow Multi-Skin Swatch',
    short_description: 'Close-up tactile finger swatch demonstration across four distinct skin tones with candid sunlight lighting.',
    hook_summary: 'Finding your exact Cloud Paint match in under 5 seconds.',
    call_to_action: 'Shop Collection ↗',
    category: 'beauty',
    country_code: 'US',
    creative_format: 'video',
    source_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Glossier',
    source_ad_id: 'meta_glo_441092',
    preview_image_path: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    media_rights_status: 'platform_link_only',
    first_seen_at: '2026-09-10T00:00:00Z',
    last_reviewed_at: '2026-11-02T14:30:00Z',
    status: 'published',
    curator_note: 'Strong macro focus on skin hydration texture. No heavy beauty filters, enhancing customer trust.',
    signal_labels: ['Multiple versions', 'Editor\'s pick'],
    is_featured: true,
    performance_evidence_note: 'Consistent visual benchmark running across Instagram and Facebook placements.',
    created_at: '2026-09-15T09:00:00Z',
  },
  {
    id: 'ad-meta-003',
    platform: 'meta',
    platform_surface: 'Instagram Stories',
    brand_name: 'AG1 (Athletic Greens)',
    advertiser_name: 'Athletic Greens International',
    title: 'Morning Routine Daily Scoop Habit Hook',
    short_description: 'Single-take creator kitchen routine replacing cabinet pills with one simple cold green drink.',
    hook_summary: 'I replaced 9 different daily supplements with one 30-second morning glass.',
    call_to_action: 'Claim Free Shaker & Vitamin D3 ↗',
    category: 'fitness',
    country_code: 'US',
    creative_format: 'video',
    source_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Athletic+Greens',
    source_ad_id: 'meta_ag1_9021',
    preview_image_path: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    media_rights_status: 'platform_link_only',
    first_seen_at: '2026-05-12T00:00:00Z',
    last_reviewed_at: '2026-10-28T16:00:00Z',
    status: 'published',
    curator_note: 'Classic problem-agitation with physical simplification. The shaker bottle clink creates distinct ASMR audio pacing.',
    signal_labels: ['Long-running', 'Multiple versions'],
    is_featured: false,
    performance_evidence_note: 'Active for over 180 days with variations in founder vs. UGC creator talent.',
    created_at: '2026-06-01T08:00:00Z',
  },

  // 2. GOOGLE & YOUTUBE
  {
    id: 'ad-goog-001',
    platform: 'google',
    platform_surface: 'YouTube Shorts',
    brand_name: 'Duolingo',
    advertiser_name: 'Duolingo, Inc.',
    title: 'Language Streak Threat & Comic Urgency',
    short_description: 'High-energy vertical Shorts ad tapping into organic meme culture and unhinged green owl personality.',
    hook_summary: 'Your streak will not survive midnight unless you complete this 2-minute lesson right now.',
    call_to_action: 'Install App ↗',
    category: 'saas',
    country_code: 'Global',
    creative_format: 'video',
    source_url: 'https://adstransparency.google.com/advertiser/AR09988124039128473601?region=US',
    source_ad_id: 'goog_duo_7718',
    preview_image_path: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    media_rights_status: 'platform_link_only',
    first_seen_at: '2026-07-20T00:00:00Z',
    last_reviewed_at: '2026-11-06T11:00:00Z',
    status: 'published',
    curator_note: 'Subverts typical polished SaaS ads by adopting native internet meme cadence and comic urgency.',
    signal_labels: ['Editor\'s pick', 'High retention'],
    is_featured: true,
    performance_evidence_note: 'Logged in Google Ads Transparency Center with millions of organic and paid impressions.',
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    id: 'ad-goog-002',
    platform: 'google',
    platform_surface: 'YouTube In-Stream',
    brand_name: 'Monday.com',
    advertiser_name: 'Monday.com Ltd.',
    title: 'Team Chaos vs Visual Work OS Workflow Demo',
    short_description: 'Split-screen comparative format demonstrating chaotic spreadsheet threads versus organized color-coded boards.',
    hook_summary: 'How many unread Slack threads did you wake up to today?',
    call_to_action: 'Try Free for 14 Days ↗',
    category: 'b2b',
    country_code: 'US',
    creative_format: 'video',
    source_url: 'https://adstransparency.google.com/?region=US',
    source_ad_id: 'goog_mon_33091',
    preview_image_path: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    media_rights_status: 'platform_link_only',
    first_seen_at: '2026-04-10T00:00:00Z',
    last_reviewed_at: '2026-10-30T15:20:00Z',
    status: 'published',
    curator_note: 'Direct pain-point hook in the unskippable first 5 seconds of YouTube playback. Strong audio clarity.',
    signal_labels: ['Long-running', 'Multiple versions'],
    is_featured: false,
    performance_evidence_note: 'Continuous placement on tech and productivity YouTube channels.',
    created_at: '2026-05-01T09:00:00Z',
  },
  {
    id: 'ad-goog-003',
    platform: 'google',
    platform_surface: 'Google Search',
    brand_name: 'Notion',
    advertiser_name: 'Notion Labs, Inc.',
    title: 'The Connected Workspace for Docs, Wikis & Projects',
    short_description: 'High-intent search ad highlighting unified team collaboration with site-link extensions for templates.',
    hook_summary: 'Replace Slack notes, Google Docs, and Jira tickets with one connected workspace.',
    call_to_action: 'Get Notion Free ↗',
    category: 'saas',
    country_code: 'US',
    creative_format: 'text',
    source_url: 'https://adstransparency.google.com/?region=US',
    source_ad_id: 'goog_not_txt_11',
    preview_image_path: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
    media_rights_status: 'platform_link_only',
    first_seen_at: '2026-01-15T00:00:00Z',
    last_reviewed_at: '2026-11-01T12:00:00Z',
    status: 'published',
    curator_note: 'Clean copy hierarchy with direct tool-replacement value propositions targeting competitor queries.',
    signal_labels: ['Long-running'],
    is_featured: false,
    performance_evidence_note: 'Perennial Google Search brand and category defense campaign.',
    created_at: '2026-02-01T10:00:00Z',
  },

  // 3. LINKEDIN
  {
    id: 'ad-lnkd-001',
    platform: 'linkedin',
    platform_surface: 'Sponsored Content',
    brand_name: 'Figma',
    advertiser_name: 'Figma, Inc.',
    title: 'Design Systems at Enterprise Scale Benchmark Report',
    short_description: 'Executive-level carousel presenting real data on designer-developer velocity in unified component libraries.',
    hook_summary: 'How 500+ design teams eliminate rework and handoff bottlenecks.',
    call_to_action: 'Download 2026 Report ↗',
    category: 'b2b',
    country_code: 'US',
    creative_format: 'carousel',
    source_url: 'https://www.linkedin.com/ad-library/',
    source_ad_id: 'lnkd_fig_99182',
    preview_image_path: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
    media_rights_status: 'platform_link_only',
    first_seen_at: '2026-08-01T00:00:00Z',
    last_reviewed_at: '2026-11-05T09:45:00Z',
    status: 'published',
    curator_note: 'High-authority benchmark report serving as top-of-funnel lead generation for Enterprise tier accounts.',
    signal_labels: ['Editor\'s pick', 'Multiple versions'],
    is_featured: true,
    performance_evidence_note: 'Spotted across B2B VP Design and Head of Product demographics in US & UK.',
    created_at: '2026-08-10T11:00:00Z',
  },
  {
    id: 'ad-lnkd-002',
    platform: 'linkedin',
    platform_surface: 'Video Ad',
    brand_name: 'Loom',
    advertiser_name: 'Loom, an Atlassian Company',
    title: 'Kill the 30-Minute Status Call with a 90-Second Loom',
    short_description: 'Relatable workplace satire showing calendar exhaustion versus sending an expressive screen recording.',
    hook_summary: 'Could this meeting have been a 90-second Loom?',
    call_to_action: 'Try Loom Free ↗',
    category: 'saas',
    country_code: 'Global',
    creative_format: 'video',
    source_url: 'https://www.linkedin.com/ad-library/',
    source_ad_id: 'lnkd_loom_5541',
    preview_image_path: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
    media_rights_status: 'platform_link_only',
    first_seen_at: '2026-07-15T00:00:00Z',
    last_reviewed_at: '2026-10-25T14:00:00Z',
    status: 'published',
    curator_note: 'Humorous workplace tension paired with instant tangible product solution shown right inside the video frame.',
    signal_labels: ['High retention', 'Recently spotted'],
    is_featured: false,
    performance_evidence_note: 'Active on LinkedIn targeting product managers, engineering directors, and agency leads.',
    created_at: '2026-08-01T14:00:00Z',
  },
  {
    id: 'ad-lnkd-003',
    platform: 'linkedin',
    platform_surface: 'Sponsored Content',
    brand_name: 'HubSpot',
    advertiser_name: 'HubSpot, Inc.',
    title: 'State of Marketing 2026 Trend Playbook',
    short_description: 'Clean editorial visual featuring verified benchmark conversion rates across inbound and outbound channels.',
    hook_summary: 'What 1,500 CMOs are changing about their customer acquisition strategy this quarter.',
    call_to_action: 'Get the Free Playbook ↗',
    category: 'b2b',
    country_code: 'US',
    creative_format: 'image',
    source_url: 'https://www.linkedin.com/ad-library/',
    source_ad_id: 'lnkd_hub_2210',
    preview_image_path: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    media_rights_status: 'platform_link_only',
    first_seen_at: '2026-09-05T00:00:00Z',
    last_reviewed_at: '2026-11-03T11:30:00Z',
    status: 'published',
    curator_note: 'Uses high-contrast corporate typography and trusted survey data to drive massive qualified form submissions.',
    signal_labels: ['Long-running'],
    is_featured: false,
    performance_evidence_note: 'Standard quarterly anchor campaign across corporate marketing feeds.',
    created_at: '2026-09-10T10:00:00Z',
  },

  // 4. TIKTOK
  {
    id: 'ad-tt-001',
    platform: 'tiktok',
    platform_surface: 'Spark Ads',
    brand_name: 'Rare Beauty',
    advertiser_name: 'Rare Beauty Brands LLC',
    title: 'One Dot Pigment Challenge Wear Test',
    short_description: 'Unfiltered authentic bathroom creator test demonstrating intense liquid blush payoff with zero synthetic filters.',
    hook_summary: 'I put ONE micro dot on my cheek and this is what happened after blending.',
    call_to_action: 'Get Soft Pinch ↗',
    category: 'beauty',
    country_code: 'US',
    creative_format: 'video',
    source_url: 'https://ads.tiktok.com/business/creativecenter/inspiration/popular/pc/en',
    source_ad_id: 'tt_rare_902',
    preview_image_path: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
    media_rights_status: 'platform_link_only',
    first_seen_at: '2026-08-14T00:00:00Z',
    last_reviewed_at: '2026-11-07T16:00:00Z',
    status: 'published',
    curator_note: 'Native TikTok UGC storytelling that looks completely organic until the subtle product tag appears at second 4.',
    signal_labels: ['Editor\'s pick', 'High retention', 'Multiple versions'],
    is_featured: true,
    performance_evidence_note: 'Indexed in TikTok Creative Center top ads in beauty vertical with above-average watch-time.',
    created_at: '2026-08-20T12:00:00Z',
  },
  {
    id: 'ad-tt-002',
    platform: 'tiktok',
    platform_surface: 'In-Feed Video',
    brand_name: 'CeraVe',
    advertiser_name: 'L\'Oréal USA',
    title: 'Board-Certified Dermatologist Barrier Repair Hook',
    short_description: 'Split-screen doctor reaction to viral over-exfoliation trend, gently steering users toward ceramides.',
    hook_summary: 'Stop destroying your skin barrier with 8 harsh acids every night.',
    call_to_action: 'Shop Dermatologist Recommended ↗',
    category: 'skincare',
    country_code: 'US',
    creative_format: 'video',
    source_url: 'https://ads.tiktok.com/business/creativecenter/inspiration/popular/pc/en',
    source_ad_id: 'tt_cer_4011',
    preview_image_path: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    media_rights_status: 'platform_link_only',
    first_seen_at: '2026-06-25T00:00:00Z',
    last_reviewed_at: '2026-10-29T10:15:00Z',
    status: 'published',
    curator_note: 'Clinical authority combined with relatable internet conversation. Highly educational tone.',
    signal_labels: ['Long-running', 'High retention'],
    is_featured: false,
    performance_evidence_note: 'Evergreen presence in US and UK Skincare category on TikTok Ads.',
    created_at: '2026-07-01T15:00:00Z',
  },
  {
    id: 'ad-tt-003',
    platform: 'tiktok',
    platform_surface: 'In-Feed Video',
    brand_name: 'Fenty Skin',
    advertiser_name: 'Kendo Holdings, Inc.',
    title: 'Night Melt Cleansing Balm Pore Dissolve Demo',
    short_description: 'Extreme macro tactile melt shot dissolving waterproof mascara instantly under running warm water.',
    hook_summary: 'Watch stubborn waterproof mascara vanish with zero tugging or burning eyes.',
    call_to_action: 'Melt It Off ↗',
    category: 'beauty',
    country_code: 'Global',
    creative_format: 'video',
    source_url: 'https://ads.tiktok.com/business/creativecenter/inspiration/popular/pc/en',
    source_ad_id: 'tt_fent_112',
    preview_image_path: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
    media_rights_status: 'platform_link_only',
    first_seen_at: '2026-09-01T00:00:00Z',
    last_reviewed_at: '2026-11-03T18:00:00Z',
    status: 'published',
    curator_note: 'Immediate sensory gratification in first second. Clean, high-fidelity real skin lighting.',
    signal_labels: ['Recently spotted', 'Editor\'s pick'],
    is_featured: false,
    performance_evidence_note: 'Recent creative refresh in Fenty global catalog.',
    created_at: '2026-09-10T16:00:00Z',
  },

  // 5. X (TWITTER)
  {
    id: 'ad-x-001',
    platform: 'x',
    platform_surface: 'Promoted Post',
    brand_name: 'Stripe',
    advertiser_name: 'Stripe, Inc.',
    title: 'Real-Time Global Agentic Payments Architecture',
    short_description: 'Clean developer code snippet and architectural diagram showing instant settlement for autonomous agents.',
    hook_summary: 'Accept programmable payments in 135+ currencies with 7 lines of code.',
    call_to_action: 'Read API Docs ↗',
    category: 'fintech',
    country_code: 'Global',
    creative_format: 'image',
    source_url: 'https://x.com/stripe',
    source_ad_id: 'x_str_8819',
    preview_image_path: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
    media_rights_status: 'platform_link_only',
    first_seen_at: '2026-08-28T00:00:00Z',
    last_reviewed_at: '2026-11-05T12:00:00Z',
    status: 'published',
    curator_note: 'Developer-first craftsmanship. Zero buzzwords, clear code snippet typography that respects software engineers on X.',
    signal_labels: ['Editor\'s pick', 'Recently spotted'],
    is_featured: true,
    performance_evidence_note: 'Verified in public X promoted stream targeted to engineering and founder accounts.',
    created_at: '2026-09-01T10:00:00Z',
  },
  {
    id: 'ad-x-002',
    platform: 'x',
    platform_surface: 'Promoted Video',
    brand_name: 'Vercel',
    advertiser_name: 'Vercel Inc.',
    title: 'Deploy Full-Stack AI Workflows to the Edge in Seconds',
    short_description: 'High-density terminal and browser screen recording showing instant build, preview branch, and edge streaming.',
    hook_summary: 'From local git push to global edge deployment in under 8 seconds.',
    call_to_action: 'Deploy Now ↗',
    category: 'saas',
    country_code: 'Global',
    creative_format: 'video',
    source_url: 'https://x.com/vercel',
    source_ad_id: 'x_vc_2910',
    preview_image_path: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    media_rights_status: 'platform_link_only',
    first_seen_at: '2026-07-10T00:00:00Z',
    last_reviewed_at: '2026-10-31T17:00:00Z',
    status: 'published',
    curator_note: 'Fast keyboard typing sound effects and slick terminal UI make this unskippable for frontend engineers.',
    signal_labels: ['High retention', 'Multiple versions'],
    is_featured: false,
    performance_evidence_note: 'Promoted post with high repost-to-view ratios among tech communities.',
    created_at: '2026-07-20T11:00:00Z',
  },
  {
    id: 'ad-x-003',
    platform: 'x',
    platform_surface: 'Promoted Post',
    brand_name: 'Linear',
    advertiser_name: 'Linear Orbit Inc.',
    title: 'The Purpose-Built Tool for Modern Software Teams',
    short_description: 'Minimalist dark-mode cinematic product trailer showcasing keyboard shortcuts and zero-latency issue tracking.',
    hook_summary: 'Software project management engineered for speed, not status meetings.',
    call_to_action: 'Switch to Linear ↗',
    category: 'saas',
    country_code: 'US',
    creative_format: 'video',
    source_url: 'https://x.com/linear',
    source_ad_id: 'x_lin_440',
    preview_image_path: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    media_rights_status: 'platform_link_only',
    first_seen_at: '2026-05-18T00:00:00Z',
    last_reviewed_at: '2026-10-26T13:40:00Z',
    status: 'published',
    curator_note: 'Pure design aesthetic matching Linear brand guidelines. Appeals strongly to product designers and startup founders.',
    signal_labels: ['Long-running', 'Editor\'s pick'],
    is_featured: true,
    performance_evidence_note: 'Continuous long-term brand equity campaign running on X tech feeds.',
    created_at: '2026-06-01T14:00:00Z',
  },
  // 6. AMAZON ADS (Manual Research & Curation)
  {
    id: 'ad-amz-001',
    platform: 'amazon',
    platform_surface: 'Sponsored Brands (Headline Video)',
    brand_name: 'Kapiva',
    advertiser_name: 'Kapiva Ayurveda (Adret Retail Pvt Ltd)',
    title: 'Pure Himalayan Shilajit Resin Authentic Lab-Tested Potency',
    short_description: 'High-conversion in-search video ad demonstrating dissolution test in warm milk, raw resin texture, and NABL lab certification.',
    hook_summary: 'Watch raw Himalayan resin dissolve without sediment: 3-second proof of purity.',
    call_to_action: 'View on Amazon Store ↗',
    category: 'health-ayurvedic',
    country_code: 'IN',
    creative_format: 'video',
    source_url: 'https://www.amazon.in/dp/B08HSHILAJ',
    source_ad_id: 'amz_kp_shilajit_99',
    product_url: 'https://www.amazon.in/dp/B08HSHILAJ',
    landing_page_url: 'https://www.amazon.in/stores/Kapiva/page/A4F79F9B-983C-4340',
    asin: 'B08HSHILAJ',
    amazon_ad_type: 'Sponsored Brands',
    search_term: 'shilajit gold resin pure',
    marketplace: 'Amazon India (IN)',
    preview_image_path: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    media_rights_status: 'platform_link_only',
    first_seen_at: '2026-08-10T00:00:00Z',
    last_reviewed_at: '2026-11-08T11:00:00Z',
    status: 'draft',
    curator_note: 'Benchmark Amazon search ad in Ayurvedic wellness. Autoplays muted with bold high-contrast subtitles highlighting stamina and heavy-metal testing.',
    signal_labels: ['Long-running', 'Editor\'s pick', 'High retention'],
    is_featured: true,
    performance_evidence_note: 'Observed as top Sponsored Brands headline video for key Ayurvedic search terms across Q3/Q4 2026.',
    created_at: '2026-08-12T10:00:00Z',
  },
  {
    id: 'ad-amz-002',
    platform: 'amazon',
    platform_surface: 'Sponsored Products',
    brand_name: 'Minimalist',
    advertiser_name: 'Uprising Science Pvt Ltd',
    title: '10% Niacinamide Serum Acne Marks & Sebum Control',
    short_description: 'Clean macro clinical product photography with ingredient percentage callouts and transparent dermatological formulation.',
    hook_summary: 'Clear clinical formulation with zero added fragrance or dyes.',
    call_to_action: 'Shop on Amazon ↗',
    category: 'makeup-skincare-reels',
    country_code: 'IN',
    creative_format: 'image',
    source_url: 'https://www.amazon.in/dp/B08C789NIAC',
    source_ad_id: 'amz_min_niacin_01',
    product_url: 'https://www.amazon.in/dp/B08C789NIAC',
    asin: 'B08C789NIAC',
    amazon_ad_type: 'Sponsored Products',
    search_term: 'niacinamide serum for dark spots',
    marketplace: 'Amazon India (IN)',
    preview_image_path: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    media_rights_status: 'platform_link_only',
    first_seen_at: '2026-09-01T00:00:00Z',
    last_reviewed_at: '2026-11-07T09:30:00Z',
    status: 'draft',
    curator_note: 'Exceptional visual contrast on white Amazon marketplace backgrounds. Clear bottle label legibility even in mobile app search grids.',
    signal_labels: ['Multiple versions', 'Editor\'s pick'],
    is_featured: false,
    performance_evidence_note: 'Consistently appears on high-volume skincare search queries with Amazon Choice badge verification.',
    created_at: '2026-09-05T08:00:00Z',
  },
];

/**
 * Robust in-memory search and filter function for offline / demo mode
 * and instant fallback when Supabase connection is pending or table is initializing.
 */
export function searchAdListingsLocal(filters: AdSearchFilters = {}): AdSearchResult {
  const {
    query = '',
    platforms = [],
    category = 'all',
    country = 'all',
    format = 'all',
    signal = 'all',
    sort = 'reviewed',
    limit = 24,
    offset = 0,
  } = filters;

  const normalizedQ = query.trim().toLowerCase();

  let filtered = SEED_AD_LISTINGS.filter((ad) => {
    if (ad.status !== 'published') return false;

    // Platform filter: if platforms selected, ad.platform must match
    if (platforms.length > 0 && !platforms.includes(ad.platform)) {
      return false;
    }

    // Category filter
    if (category && category !== 'all' && ad.category !== category) {
      return false;
    }

    // Country filter
    if (country && country !== 'all' && ad.country_code !== country) {
      return false;
    }

    // Creative format filter
    if (format && format !== 'all' && ad.creative_format !== format) {
      return false;
    }

    // Signal label filter
    if (signal && signal !== 'all' && !ad.signal_labels.includes(signal)) {
      return false;
    }

    // Text search query matching across all candidate fields
    if (normalizedQ) {
      const matchBrand = ad.brand_name.toLowerCase().includes(normalizedQ);
      const matchAdv = (ad.advertiser_name || '').toLowerCase().includes(normalizedQ);
      const matchTitle = ad.title.toLowerCase().includes(normalizedQ);
      const matchDesc = (ad.short_description || '').toLowerCase().includes(normalizedQ);
      const matchHook = (ad.hook_summary || '').toLowerCase().includes(normalizedQ);
      const matchCurator = (ad.curator_note || '').toLowerCase().includes(normalizedQ);
      const matchCat = ad.category.toLowerCase().includes(normalizedQ);
      const matchSurface = (ad.platform_surface || '').toLowerCase().includes(normalizedQ);
      const matchTags = ad.signal_labels.some((l) => l.toLowerCase().includes(normalizedQ));
      const matchAsin = (ad.asin || '').toLowerCase().includes(normalizedQ);
      const matchSearchTerm = (ad.search_term || '').toLowerCase().includes(normalizedQ);
      const matchMarketplace = (ad.marketplace || '').toLowerCase().includes(normalizedQ);

      if (
        !matchBrand &&
        !matchAdv &&
        !matchTitle &&
        !matchDesc &&
        !matchHook &&
        !matchCurator &&
        !matchCat &&
        !matchSurface &&
        !matchTags &&
        !matchAsin &&
        !matchSearchTerm &&
        !matchMarketplace
      ) {
        return false;
      }
    }

    return true;
  });

  // Relevance Ranking: Exact brand/advertiser matches first, then partial brand matches, then other fields
  filtered.sort((a, b) => {
    if (normalizedQ) {
      const aBrandExact =
        a.brand_name.toLowerCase() === normalizedQ ||
        (a.advertiser_name || '').toLowerCase() === normalizedQ;
      const bBrandExact =
        b.brand_name.toLowerCase() === normalizedQ ||
        (b.advertiser_name || '').toLowerCase() === normalizedQ;

      if (aBrandExact && !bBrandExact) return -1;
      if (!aBrandExact && bBrandExact) return 1;

      const aBrandPartial =
        a.brand_name.toLowerCase().includes(normalizedQ) ||
        (a.advertiser_name || '').toLowerCase().includes(normalizedQ);
      const bBrandPartial =
        b.brand_name.toLowerCase().includes(normalizedQ) ||
        (b.advertiser_name || '').toLowerCase().includes(normalizedQ);

      if (aBrandPartial && !bBrandPartial) return -1;
      if (!aBrandPartial && bBrandPartial) return 1;
    }

    if (sort === 'featured') {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      return new Date(b.last_reviewed_at).getTime() - new Date(a.last_reviewed_at).getTime();
    }
    if (sort === 'added') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    // Default: 'reviewed'
    return new Date(b.last_reviewed_at).getTime() - new Date(a.last_reviewed_at).getTime();
  });

  const total = filtered.length;
  const paged = filtered.slice(offset, offset + limit);

  return {
    items: paged,
    total,
  };
}
