import { Category, TrendingReel, FamousAd, SearchResults } from '../supabase/types';

export const SEED_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    slug: 'clothing-fashion',
    name: 'Clothing & Fashion',
    icon: 'Shirt',
    accent_color: '#E05A47',
    description: 'Streetwear, ethnic wear, luxury apparel, fast fashion & sustainable wardrobe videos.',
    keywords: ['clothing', 'fashion', 'outfit', 'apparel', 'streetwear', 'haul', 'lookbook', 'dresses'],
    insights_md: `**Top Creative Patterns in Fashion:**
1. *Rapid 3-Second Fit Transition:* Match-cut outfits on the beat drop.
2. *Real-body candid movement:* Swirls, fabric stretch, and close-up stitch texture.
3. *Day-in-the-life context:* Coffee run, date night, office commute rather than white backdrop.`,
    is_adult: false,
    is_active: true,
    sort_order: 1,
  },
  {
    id: 'cat-2',
    slug: 'makeup-beauty',
    name: 'Makeup & Beauty',
    icon: 'Sparkles',
    accent_color: '#D946EF',
    description: 'Cosmetics, lip shades, foundations, party glam, tutorial UGC & wear tests.',
    keywords: ['makeup', 'beauty', 'lipstick', 'foundation', 'eyeliner', 'glam', 'swatches', 'contour'],
    insights_md: `**Top Creative Patterns in Makeup:**
1. *Extreme macro camera zoom:* Skin pore texture before & after coverage.
2. *Smear swatch hook:* Real human finger swatching shade on jawline in first 1.5 seconds.
3. *Transfer-proof napkin test:* Immediate physical proof of durability.`,
    is_adult: false,
    is_active: true,
    sort_order: 2,
  },
  {
    id: 'cat-3',
    slug: 'skincare',
    name: 'Skincare & Derma',
    icon: 'Droplets',
    accent_color: '#06B6D4',
    description: 'Serums, sunscreens, moisturizers, acne solutions & clinical derma care.',
    keywords: ['skincare', 'serum', 'sunscreen', 'acne', 'moisturizer', 'glow', 'dermatology'],
    insights_md: `**Top Creative Patterns in Skincare:**
1. *Zero white-cast verification:* Outdoor natural sunlight UV test.
2. *Microscopic hydration texture:* Dewy glow without sticky residue.
3. *Honest 14-day breakout journal:* Authentic emotional timeline.`,
    is_adult: false,
    is_active: true,
    sort_order: 3,
  },
  {
    id: 'cat-4',
    slug: 'sexual-wellness',
    name: 'Sexual Wellness (18+)',
    icon: 'ShieldAlert',
    accent_color: '#F43F5E',
    description: 'Intimate wellness, pleasure products, body care & couples intimacy essentials.',
    keywords: ['wellness', 'intimate', 'lubricant', 'pleasure', 'wellness', 'couples', 'intimacy'],
    insights_md: `**Meta Policy Compliance Note:**
Meta strictly restricts explicit or overt sexual content. All creative executions focus on *wellness, body positivity, self-care routines, and tasteful lifestyle storytelling* to ensure complete ad account safety.`,
    is_adult: true,
    is_active: true,
    sort_order: 4,
  },
  {
    id: 'cat-5',
    slug: 'jewellery-accessories',
    name: 'Jewellery & Accessories',
    icon: 'Gem',
    accent_color: '#F59E0B',
    description: 'Anti-tarnish silver, gold vermeil, watches, bags, sunglasses & daily minimalist pieces.',
    keywords: ['jewellery', 'jewelry', 'rings', 'necklace', 'watches', 'anti-tarnish', 'accessories'],
    insights_md: `**Top Creative Patterns in Jewellery:**
1. *Submersion Water & Perfume Test:* Proof of anti-tarnish waterproof coating.
2. *Sunlight Prism Refraction:* Real gold shimmer against natural skin tone.
3. *Layering Stack Tutorial:* 3 rings, 2 necklaces styling formula.`,
    is_adult: false,
    is_active: true,
    sort_order: 5,
  },
  {
    id: 'cat-6',
    slug: 'health-supplements',
    name: 'Health & Supplements',
    icon: 'HeartPulse',
    accent_color: '#10B981',
    description: 'Proteins, electrolytes, daily vitamins, sleep gummies, creatine & gut health.',
    keywords: ['supplements', 'protein', 'vitamins', 'creatine', 'gummies', 'gut-health', 'nutrition'],
    insights_md: `**Top Creative Patterns in Supplements:**
1. *Dissolution & taste authenticity:* Real gulp reaction with honest flavor score.
2. *Morning Routine Stacking:* Supplement intake slotted into realistic wake-up habit.
3. *Third-party lab certificate peek:* Trust building in first 5 seconds.`,
    is_adult: false,
    is_active: true,
    sort_order: 6,
  },
  {
    id: 'cat-7',
    slug: 'food-beverage',
    name: 'Food & Beverage',
    icon: 'Utensils',
    accent_color: '#EA580C',
    description: 'Artisan snacks, specialty coffee, gourmet sauces, healthy munchies & craft beverages.',
    keywords: ['food', 'beverage', 'snacks', 'coffee', 'gourmet', 'chocolates', 'healthy-eating'],
    insights_md: `**Top Creative Patterns in Food & Beverage:**
1. *ASMR Sound Engineering:* Crisp crunch, soda hiss, sizzle captured with studio mics.
2. *Unboxing & dipping action:* Melted cheese pull, drizzle slow-motion.
3. *Guilt-free calorie breakdown:* Comparison with traditional junk food.`,
    is_adult: false,
    is_active: true,
    sort_order: 7,
  },
  {
    id: 'cat-8',
    slug: 'fitness-activewear',
    name: 'Fitness & Activewear',
    icon: 'Activity',
    accent_color: '#3B82F6',
    description: 'Squat-proof leggings, gym wear, training gear, running shoes & athletic equipment.',
    keywords: ['fitness', 'activewear', 'gym', 'workout', 'leggings', 'running', 'athleisure'],
    insights_md: `**Top Creative Patterns in Activewear:**
1. *Squat & stretch integrity test:* Studio lighting verifying opacity under tension.
2. *Sweat-wicking speed run:* High-intensity sprint clip with sweat bead evaporation.
3. *Studio-to-Street transition:* Showing gym leggings styled for evening dinner.`,
    is_adult: false,
    is_active: true,
    sort_order: 8,
  },
  {
    id: 'cat-9',
    slug: 'home-lifestyle',
    name: 'Home & Lifestyle',
    icon: 'Home',
    accent_color: '#8B5CF6',
    description: 'Aesthetic decor, scented candles, smart lighting, bed linens & organizers.',
    keywords: ['home', 'decor', 'candles', 'lighting', 'organizer', 'bedding', 'aesthetic'],
    insights_md: `**Top Creative Patterns in Home Decor:**
1. *Before/After Room Glow-up:* 10-second chaotic space transform into serene sanctuary.
2. *Unlit vs Lit Atmosphere:* Candle flame flicker or warm ambient smart lamp in twilight.
3. *Tactile linen weight:* Toss test on mattress showcasing softness.`,
    is_adult: false,
    is_active: true,
    sort_order: 9,
  },
  {
    id: 'cat-10',
    slug: 'electronics-gadgets',
    name: 'Electronics & Gadgets',
    icon: 'Cpu',
    accent_color: '#6366F1',
    description: 'Audio gear, wireless chargers, desk accessories, creators tools & smart tech.',
    keywords: ['electronics', 'gadgets', 'tech', 'headphones', 'chargers', 'desk-setup', 'accessories'],
    insights_md: `**Top Creative Patterns in Tech:**
1. *Satisfying magnetic snap:* MagSafe connection click sound.
2. *Desk makeover POV:* Top-down camera documenting 5-accessory wire elimination.
3. *Extreme drop/travel durability test:* Real-world backpack stress test.`,
    is_adult: false,
    is_active: true,
    sort_order: 10,
  },
  {
    id: 'cat-11',
    slug: 'kids-baby',
    name: 'Kids & Baby',
    icon: 'Smile',
    accent_color: '#EC4899',
    description: 'Organic cotton babywear, educational toys, safe feeding gear & nursery essentials.',
    keywords: ['kids', 'baby', 'toddler', 'toys', 'cotton', 'parenting', 'nursery'],
    insights_md: `**Top Creative Patterns in Baby Care:**
1. *Mother/Father candid testimonial:* Relatable tired-parent honesty.
2. *BPA-free non-toxic crush test:* Safe gentle material demonstration.
3. *Messy meal wipe-clean:* Baby sauce spill wiped clean in one swipe.`,
    is_adult: false,
    is_active: true,
    sort_order: 11,
  },
  {
    id: 'cat-12',
    slug: 'other',
    name: 'Other / Services & D2C',
    icon: 'Compass',
    accent_color: '#64748B',
    description: 'Direct-to-consumer innovations, mobile applications, services & emerging brands.',
    keywords: ['d2c', 'apps', 'services', 'innovation', 'ecommerce', 'startup'],
    insights_md: `**Top Creative Patterns in Emerging Brands:**
1. *Founder problem genesis:* "Why I quit my job to fix this one annoying thing."
2. *Side-by-side split screen:* Old frustrating method vs new instant flow.
3. *Customer WhatsApp screenshot reaction:* Unfiltered delight proof.`,
    is_adult: false,
    is_active: true,
    sort_order: 12,
  },
];

export const SEED_REELS: TrendingReel[] = [
  {
    id: 'reel-1',
    category_id: 'cat-1',
    instagram_url: 'https://www.instagram.com/reel/Cz101_fashion_seed/',
    shortcode: 'Cz101_fashion_seed',
    thumbnail_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=720&q=80',
    caption: 'How to style one oversized linen blazer in 4 ways for summer workdays. Real fabric drape test ✨',
    creator_handle: '@tarastyle_official',
    views_label: '2.8M',
    is_featured: true,
    is_published: true,
    is_seed: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'reel-2',
    category_id: 'cat-1',
    instagram_url: 'https://www.instagram.com/reel/Cz102_fashion_seed/',
    shortcode: 'Cz102_fashion_seed',
    thumbnail_url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=720&q=80',
    caption: 'Monochrome tailoring transition on the beat. Zero cuts, pure motion.',
    creator_handle: '@arjun.streetwear',
    views_label: '1.4M',
    is_featured: false,
    is_published: true,
    is_seed: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: 'reel-3',
    category_id: 'cat-2',
    instagram_url: 'https://www.instagram.com/reel/Cz103_makeup_seed/',
    shortcode: 'Cz103_makeup_seed',
    thumbnail_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=720&q=80',
    caption: 'Dewy glass skin in 90 seconds without heavy foundation layers. Extreme macro swatch test.',
    creator_handle: '@ananya.glam',
    views_label: '4.2M',
    is_featured: true,
    is_published: true,
    is_seed: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 'reel-4',
    category_id: 'cat-3',
    instagram_url: 'https://www.instagram.com/reel/Cz104_skincare_seed/',
    shortcode: 'Cz104_skincare_seed',
    thumbnail_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=720&q=80',
    caption: 'Under-UV camera sunscreen wear test. Watch where UV rays bounce off completely! ☀️',
    creator_handle: '@dermadiaries',
    views_label: '3.1M',
    is_featured: true,
    is_published: true,
    is_seed: true,
    sort_order: 4,
    created_at: new Date().toISOString(),
  },
  {
    id: 'reel-5',
    category_id: 'cat-5',
    instagram_url: 'https://www.instagram.com/reel/Cz105_jewel_seed/',
    shortcode: 'Cz105_jewel_seed',
    thumbnail_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=720&q=80',
    caption: 'Submerged in boiling soapy water for 24 hours: Does anti-tarnish gold vermeil actually hold up?',
    creator_handle: '@minimal.gems',
    views_label: '980K',
    is_featured: false,
    is_published: true,
    is_seed: true,
    sort_order: 5,
    created_at: new Date().toISOString(),
  },
  {
    id: 'reel-6',
    category_id: 'cat-6',
    instagram_url: 'https://www.instagram.com/reel/Cz106_health_seed/',
    shortcode: 'Cz106_health_seed',
    thumbnail_url: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=720&q=80',
    caption: 'Plant protein vs Whey shake taste test blindfolded. The reaction at 0:18 is priceless!',
    creator_handle: '@fitnesswithsid',
    views_label: '1.9M',
    is_featured: false,
    is_published: true,
    is_seed: true,
    sort_order: 6,
    created_at: new Date().toISOString(),
  },
];

export const SEED_ADS: FamousAd[] = [
  {
    id: 'ad-1',
    category_id: 'cat-1',
    title: 'The Zero-Wrinkle Flight Test',
    brand_name: 'Kite & Linen',
    platform: 'Instagram Reels / Meta Ads',
    format: '9:16 Video',
    source_url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=IN&q=linen+clothing&search_type=keyword_unordered&media_type=video',
    thumbnail_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    hook_type: 'Problem-Solution Stress Test',
    why_it_works: [
      'Opens with creator crumpling the shirt into a tight ball on an airplane tray table',
      'Real human pulls shirt out 6 hours later: zero creasing, immediate disbelief reaction',
      'Clear 20% launch discount pill in bottom-third with high contrast',
    ],
    cta_style: 'Shop The Anti-Wrinkle Shirt ↗',
    region: 'IN',
    is_published: true,
    is_seed: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ad-2',
    category_id: 'cat-2',
    title: '12-Hour Smudge Resistance Challenge',
    brand_name: 'Velvet Noir Cosmetics',
    platform: 'Instagram Reels / Meta Ads',
    format: '9:16 Video',
    source_url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=IN&q=matte+lipstick&search_type=keyword_unordered&media_type=video',
    thumbnail_url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
    hook_type: 'Before / After Wear Test',
    why_it_works: [
      'First second shows creator wiping a white cotton pad across lips with zero stain residue',
      'Captures morning application, greasy pizza lunch, and evening gym workout proof points',
      'Shows real skin texture without synthetic AI blurring filters',
    ],
    cta_style: 'Claim Free Shade Sample ↗',
    region: 'IN',
    is_published: true,
    is_seed: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ad-3',
    category_id: 'cat-3',
    title: 'Why Every Sunscreen Failed Me (Until Now)',
    brand_name: 'Aura Derma Lab',
    platform: 'Instagram Reels / Meta Ads',
    format: '9:16 Video',
    source_url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=IN&q=sunscreen+spf&search_type=keyword_unordered&media_type=video',
    thumbnail_url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
    hook_type: 'Founder / Creator Story Hook',
    why_it_works: [
      'Relatable creator venting about greasy grey casts on Indian skin tones',
      'Demonstrates water-light absorption in 4 quick seconds',
      'Derma lab report snippet shown on screen for instant authority',
    ],
    cta_style: 'Try The Dewy SPF 50 ↗',
    region: 'IN',
    is_published: true,
    is_seed: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ad-4',
    category_id: 'cat-4',
    title: 'The Conversation Couples Avoid',
    brand_name: 'Serene Intimate Wellness',
    platform: 'Meta Feed / Stories',
    format: '4:5 Video',
    source_url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=IN&q=wellness+self+care&search_type=keyword_unordered&media_type=video',
    thumbnail_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    hook_type: 'Emotional & Empathic Dialogue',
    why_it_works: [
      'Zero explicit or suggestive imagery — 100% compliant with strict Meta advertising policies',
      'Real couples talking about stress, communication, and emotional intimacy barriers',
      'Organic botanical formula highlighted with clinical gynecologist endorsement',
    ],
    cta_style: 'Explore Discreet Delivery ↗',
    region: 'IN',
    is_published: true,
    is_seed: true,
    sort_order: 4,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ad-5',
    category_id: 'cat-5',
    title: 'The Water-Drop Prism Refraction',
    brand_name: 'Aethel Silver',
    platform: 'Instagram Reels / Meta Ads',
    format: '9:16 Video',
    source_url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=IN&q=anti+tarnish+jewellery&search_type=keyword_unordered&media_type=video',
    thumbnail_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
    hook_type: 'Unboxing & Sensory Macro',
    why_it_works: [
      'Macro lens capturing dew drops rolling off pure 925 sterling silver chain',
      'Customer review quote popups animated over the video',
      'Lifetime tarnish replacement warranty highlighted in bold typography',
    ],
    cta_style: 'Shop 925 Anti-Tarnish ↗',
    region: 'IN',
    is_published: true,
    is_seed: true,
    sort_order: 5,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ad-6',
    category_id: 'cat-6',
    title: '3pm Fatigue vs 1 Scoop Green Energy',
    brand_name: 'Revive Nutrition Co.',
    platform: 'Instagram Reels / Meta Ads',
    format: '9:16 Video',
    source_url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=IN&q=protein+supplement&search_type=keyword_unordered&media_type=video',
    thumbnail_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    hook_type: 'Problem-Solution Routine',
    why_it_works: [
      'Fast-paced cut of yawning at a work laptop followed by a crisp shaker bottle dissolve',
      'No artificial sugar spike claim backed by simple 5-ingredient breakdown',
      'Money-back taste guarantee card at end screen',
    ],
    cta_style: 'Get Starter Kit (Save 25%) ↗',
    region: 'IN',
    is_published: true,
    is_seed: true,
    sort_order: 6,
    created_at: new Date().toISOString(),
  },
];

// Helper to perform client-side or fallback search
export function searchSeedData(
  query: string,
  categorySlug?: string | null,
  includeAdult = false,
  limit = 20
): SearchResults {
  const q = query.trim().toLowerCase();

  let categories = SEED_CATEGORIES.filter((c) => {
    if (!includeAdult && c.is_adult) return false;
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  let selectedCatId: string | null = null;
  if (categorySlug) {
    const found = SEED_CATEGORIES.find((c) => c.slug === categorySlug);
    if (found) selectedCatId = found.id;
  }

  let reels = SEED_REELS.filter((r) => {
    const cat = SEED_CATEGORIES.find((c) => c.id === r.category_id);
    if (!includeAdult && cat?.is_adult) return false;
    if (selectedCatId && r.category_id !== selectedCatId) return false;
    if (!q) return true;
    return (
      (r.caption && r.caption.toLowerCase().includes(q)) ||
      (r.creator_handle && r.creator_handle.toLowerCase().includes(q)) ||
      (cat && cat.name.toLowerCase().includes(q))
    );
  }).map((r) => {
    const cat = SEED_CATEGORIES.find((c) => c.id === r.category_id);
    return {
      ...r,
      category: cat,
      category_slug: cat?.slug,
      category_name: cat?.name,
    };
  });

  let ads = SEED_ADS.filter((a) => {
    const cat = SEED_CATEGORIES.find((c) => c.id === a.category_id);
    if (!includeAdult && cat?.is_adult) return false;
    if (selectedCatId && a.category_id !== selectedCatId) return false;
    if (!q) return true;
    return (
      a.title.toLowerCase().includes(q) ||
      (a.brand_name && a.brand_name.toLowerCase().includes(q)) ||
      (a.hook_type && a.hook_type.toLowerCase().includes(q)) ||
      (cat && cat.name.toLowerCase().includes(q))
    );
  }).map((a) => {
    const cat = SEED_CATEGORIES.find((c) => c.id === a.category_id);
    return {
      ...a,
      category: cat,
      category_slug: cat?.slug,
      category_name: cat?.name,
    };
  });

  return {
    categories: categories.slice(0, limit),
    reels: reels.slice(0, limit),
    ads: ads.slice(0, limit),
  };
}

export function getMetaAdLibraryLink(keyword: string, country = 'IN') {
  const encoded = encodeURIComponent(keyword.trim());
  return `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=${country}&q=${encoded}&search_type=keyword_unordered&media_type=video`;
}
