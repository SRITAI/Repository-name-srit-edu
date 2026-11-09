-- ============================================================================
-- SUPABASE SEED DATA: seed.sql
-- Categories, Curated Trending Reels & Famous Benchmark Ads
-- All sample items explicitly flagged with is_seed = true
-- ============================================================================

-- 1. CATEGORIES
insert into public.categories (slug, name, icon, accent_color, description, keywords, insights_md, is_adult, sort_order)
values
(
  'clothing-fashion',
  'Clothing & Fashion',
  'Shirt',
  '#E05A47',
  'Streetwear, ethnic wear, luxury apparel, fast fashion & sustainable wardrobe videos.',
  array['clothing', 'fashion', 'outfit', 'apparel', 'streetwear', 'haul', 'lookbook', 'dresses'],
  '**Top Creative Patterns in Fashion:**
1. *Rapid 3-Second Fit Transition:* Match-cut outfits on the beat drop.
2. *Real-body candid movement:* Swirls, fabric stretch, and close-up stitch texture.
3. *Day-in-the-life context:* Coffee run, date night, office commute rather than white backdrop.',
  false,
  1
),
(
  'makeup-beauty',
  'Makeup & Beauty',
  'Sparkles',
  '#D946EF',
  'Cosmetics, lip shades, foundations, party glam, tutorial UGC & wear tests.',
  array['makeup', 'beauty', 'lipstick', 'foundation', 'eyeliner', 'glam', 'swatches', 'contour'],
  '**Top Creative Patterns in Makeup:**
1. *Extreme macro camera zoom:* Skin pore texture before & after coverage.
2. *Smear swatch hook:* Real human finger swatching shade on jawline in first 1.5 seconds.
3. *Transfer-proof napkin test:* Immediate physical proof of durability.',
  false,
  2
),
(
  'skincare',
  'Skincare & Derma',
  'Droplets',
  '#06B6D4',
  'Serums, sunscreens, moisturizers, acne solutions & clinical derma care.',
  array['skincare', 'serum', 'sunscreen', 'acne', 'moisturizer', 'glow', 'dermatology'],
  '**Top Creative Patterns in Skincare:**
1. *Zero white-cast verification:* Outdoor natural sunlight UV test.
2. *Microscopic hydration texture:* Dewy glow without sticky residue.
3. *Honest 14-day breakout journal:* Authentic emotional timeline.',
  false,
  3
),
(
  'sexual-wellness',
  'Sexual Wellness (18+)',
  'ShieldAlert',
  '#F43F5E',
  'Intimate wellness, pleasure products, body care & couples intimacy essentials.',
  array['wellness', 'intimate', 'lubricant', 'pleasure', 'wellness', 'couples', 'intimacy'],
  '**Meta Policy Compliance Note:**
Meta strictly prohibits explicit or overt sexual content. All creative executions focus on *wellness, body positivity, self-care routines, and tasteful lifestyle storytelling* to ensure complete ad account safety.',
  true,
  4
),
(
  'jewellery-accessories',
  'Jewellery & Accessories',
  'Gem',
  '#F59E0B',
  'Anti-tarnish silver, gold vermeil, watches, bags, sunglasses & daily minimalist pieces.',
  array['jewellery', 'jewelry', 'rings', 'necklace', 'watches', 'anti-tarnish', 'accessories'],
  '**Top Creative Patterns in Jewellery:**
1. *Submersion Water & Perfume Test:* Proof of anti-tarnish waterproof coating.
2. *Sunlight Prism Refraction:* Real gold shimmer against natural skin tone.
3. *Layering Stack Tutorial:* 3 rings, 2 necklaces styling formula.',
  false,
  5
),
(
  'health-supplements',
  'Health & Supplements',
  'HeartPulse',
  '#10B981',
  'Proteins, electrolytes, daily vitamins, sleep gummies, creatine & gut health.',
  array['supplements', 'protein', 'vitamins', 'creatine', 'gummies', 'gut-health', 'nutrition'],
  '**Top Creative Patterns in Supplements:**
1. *Dissolution & taste authenticity:* Real gulp reaction with honest flavor score.
2. *Morning Routine Stacking:* Supplement intake slotted into realistic wake-up habit.
3. *Third-party lab certificate peek:* Trust building in first 5 seconds.',
  false,
  6
),
(
  'food-beverage',
  'Food & Beverage',
  'Utensils',
  '#EA580C',
  'Artisan snacks, specialty coffee, gourmet sauces, healthy munchies & craft beverages.',
  array['food', 'beverage', 'snacks', 'coffee', 'gourmet', 'chocolates', 'healthy-eating'],
  '**Top Creative Patterns in Food & Beverage:**
1. *ASMR Sound Engineering:* Crisp crunch, soda hiss, sizzle captured with studio mics.
2. *Unboxing & dipping action:* Melted cheese pull, drizzle slow-motion.
3. *Guilt-free calorie breakdown:* Comparison with traditional junk food.',
  false,
  7
),
(
  'fitness-activewear',
  'Fitness & Activewear',
  'Activity',
  '#3B82F6',
  'Squat-proof leggings, gym wear, training gear, running shoes & athletic equipment.',
  array['fitness', 'activewear', 'gym', 'workout', 'leggings', 'running', 'athleisure'],
  '**Top Creative Patterns in Activewear:**
1. *Squat & stretch integrity test:* Studio lighting verifying opacity under tension.
2. *Sweat-wicking speed run:* High-intensity sprint clip with sweat bead evaporation.
3. *Studio-to-Street transition:* Showing gym leggings styled for evening dinner.',
  false,
  8
),
(
  'home-lifestyle',
  'Home & Lifestyle',
  'Home',
  '#8B5CF6',
  'Aesthetic decor, scented candles, smart lighting, bed linens & organizers.',
  array['home', 'decor', 'candles', 'lighting', 'organizer', 'bedding', 'aesthetic'],
  '**Top Creative Patterns in Home Decor:**
1. *Before/After Room Glow-up:* 10-second chaotic space transform into serene sanctuary.
2. *Unlit vs Lit Atmosphere:* Candle flame flicker or warm ambient smart lamp in twilight.
3. *Tactile linen weight:* Toss test on mattress showcasing softness.',
  false,
  9
),
(
  'electronics-gadgets',
  'Electronics & Gadgets',
  'Cpu',
  '#6366F1',
  'Audio gear, wireless chargers, desk accessories, creators tools & smart tech.',
  array['electronics', 'gadgets', 'tech', 'headphones', 'chargers', 'desk-setup', 'accessories'],
  '**Top Creative Patterns in Tech:**
1. *Satisfying magnetic snap:* MagSafe connection click sound.
2. *Desk makeover POV:* Top-down camera documenting 5-accessory wire elimination.
3. *Extreme drop/travel durability test:* Real-world backpack stress test.',
  false,
  10
),
(
  'kids-baby',
  'Kids & Baby',
  'Smile',
  '#EC4899',
  'Organic cotton babywear, educational toys, safe feeding gear & nursery essentials.',
  array['kids', 'baby', 'toddler', 'toys', 'cotton', 'parenting', 'nursery'],
  '**Top Creative Patterns in Baby Care:**
1. *Mother/Father candid testimonial:* Relatable tired-parent honesty.
2. *BPA-free non-toxic crush test:* Safe gentle material demonstration.
3. *Messy meal wipe-clean:* Baby sauce spill wiped clean in one swipe.',
  false,
  11
),
(
  'other',
  'Other / Services & D2C',
  'Compass',
  '#64748B',
  'Direct-to-consumer innovations, mobile applications, services & emerging brands.',
  array['d2c', 'apps', 'services', 'innovation', 'ecommerce', 'startup'],
  '**Top Creative Patterns in Emerging Brands:**
1. *Founder problem genesis:* "Why I quit my job to fix this one annoying thing."
2. *Side-by-side split screen:* Old frustrating method vs new instant flow.
3. *Customer WhatsApp screenshot reaction:* Unfiltered delight proof.',
  false,
  12
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  keywords = excluded.keywords,
  insights_md = excluded.insights_md,
  is_adult = excluded.is_adult,
  sort_order = excluded.sort_order;

-- 2. TRENDING INSTAGRAM REELS (Curated sample seeds)
insert into public.trending_reels (category_id, instagram_url, shortcode, thumbnail_url, caption, creator_handle, views_label, is_featured, is_published, is_seed, sort_order)
select
  c.id,
  'https://www.instagram.com/reel/Cz101_fashion_seed/',
  'Cz101_fashion_seed',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=720&q=80',
  'How to style one oversized linen blazer in 4 ways for summer workdays. Real fabric drape test ✨',
  '@tarastyle_official',
  '2.8M',
  true,
  true,
  true,
  1
from public.categories c where c.slug = 'clothing-fashion'
on conflict (instagram_url) do nothing;

insert into public.trending_reels (category_id, instagram_url, shortcode, thumbnail_url, caption, creator_handle, views_label, is_featured, is_published, is_seed, sort_order)
select
  c.id,
  'https://www.instagram.com/reel/Cz102_fashion_seed/',
  'Cz102_fashion_seed',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=720&q=80',
  'Monochrome tailoring transition on the beat. Zero cuts, pure motion.',
  '@arjun.streetwear',
  '1.4M',
  false,
  true,
  true,
  2
from public.categories c where c.slug = 'clothing-fashion'
on conflict (instagram_url) do nothing;

insert into public.trending_reels (category_id, instagram_url, shortcode, thumbnail_url, caption, creator_handle, views_label, is_featured, is_published, is_seed, sort_order)
select
  c.id,
  'https://www.instagram.com/reel/Cz103_makeup_seed/',
  'Cz103_makeup_seed',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=720&q=80',
  'Dewy glass skin in 90 seconds without heavy foundation layers. Extreme macro swatch test.',
  '@ananya.glam',
  '4.2M',
  true,
  true,
  true,
  3
from public.categories c where c.slug = 'makeup-beauty'
on conflict (instagram_url) do nothing;

insert into public.trending_reels (category_id, instagram_url, shortcode, thumbnail_url, caption, creator_handle, views_label, is_featured, is_published, is_seed, sort_order)
select
  c.id,
  'https://www.instagram.com/reel/Cz104_skincare_seed/',
  'Cz104_skincare_seed',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=720&q=80',
  'Under-UV camera sunscreen wear test. Watch where UV rays bounce off completely! ☀️',
  '@dermadiaries',
  '3.1M',
  true,
  true,
  true,
  4
from public.categories c where c.slug = 'skincare'
on conflict (instagram_url) do nothing;

insert into public.trending_reels (category_id, instagram_url, shortcode, thumbnail_url, caption, creator_handle, views_label, is_featured, is_published, is_seed, sort_order)
select
  c.id,
  'https://www.instagram.com/reel/Cz105_jewel_seed/',
  'Cz105_jewel_seed',
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=720&q=80',
  'Submerged in boiling soapy water for 24 hours: Does anti-tarnish gold vermeil actually hold up?',
  '@minimal.gems',
  '980K',
  false,
  true,
  true,
  5
from public.categories c where c.slug = 'jewellery-accessories'
on conflict (instagram_url) do nothing;

insert into public.trending_reels (category_id, instagram_url, shortcode, thumbnail_url, caption, creator_handle, views_label, is_featured, is_published, is_seed, sort_order)
select
  c.id,
  'https://www.instagram.com/reel/Cz106_health_seed/',
  'Cz106_health_seed',
  'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=720&q=80',
  'Plant protein vs Whey shake taste test blindfolded. The reaction at 0:18 is priceless!',
  '@fitnesswithsid',
  '1.9M',
  false,
  true,
  true,
  6
from public.categories c where c.slug = 'health-supplements'
on conflict (instagram_url) do nothing;

-- 3. FAMOUS BENCHMARK ADS (Curated sample seeds)
insert into public.famous_ads (category_id, title, brand_name, platform, format, source_url, thumbnail_url, hook_type, why_it_works, cta_style, region, is_published, is_seed, sort_order)
select
  c.id,
  'The Zero-Wrinkle Flight Test',
  'Kite & Linen',
  'Instagram Reels / Meta Ads',
  '9:16 Video',
  'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=IN&q=linen+clothing&search_type=keyword_unordered&media_type=video',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
  'Problem-Solution Stress Test',
  array[
    'Opens with creator crumpling the shirt into a tight ball on an airplane tray table',
    'Real human pulls shirt out 6 hours later: zero creasing, immediate disbelief reaction',
    'Clear 20% launch discount pill in bottom-third with high contrast'
  ],
  'Shop The Anti-Wrinkle Shirt ↗',
  'IN',
  true,
  true,
  1
from public.categories c where c.slug = 'clothing-fashion';

insert into public.famous_ads (category_id, title, brand_name, platform, format, source_url, thumbnail_url, hook_type, why_it_works, cta_style, region, is_published, is_seed, sort_order)
select
  c.id,
  '12-Hour Smudge Resistance Challenge',
  'Velvet Noir Cosmetics',
  'Instagram Reels / Meta Ads',
  '9:16 Video',
  'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=IN&q=matte+lipstick&search_type=keyword_unordered&media_type=video',
  'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
  'Before / After Wear Test',
  array[
    'First second shows creator wiping a white cotton pad across lips with zero stain residue',
    'Captures morning application, greasy pizza lunch, and evening gym workout proof points',
    'Shows real skin texture without synthetic AI blurring filters'
  ],
  'Claim Free Shade Sample ↗',
  'IN',
  true,
  true,
  2
from public.categories c where c.slug = 'makeup-beauty';

insert into public.famous_ads (category_id, title, brand_name, platform, format, source_url, thumbnail_url, hook_type, why_it_works, cta_style, region, is_published, is_seed, sort_order)
select
  c.id,
  'Why Every Sunscreen Failed Me (Until Now)',
  'Aura Derma Lab',
  'Instagram Reels / Meta Ads',
  '9:16 Video',
  'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=IN&q=sunscreen+spf&search_type=keyword_unordered&media_type=video',
  'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
  'Founder / Creator Story Hook',
  array[
    'Relatable creator venting about greasy grey casts on Indian skin tones',
    'Demonstrates water-light absorption in 4 quick seconds',
    'Derma lab report snippet shown on screen for instant authority'
  ],
  'Try The Dewy SPF 50 ↗',
  'IN',
  true,
  true,
  3
from public.categories c where c.slug = 'skincare';

insert into public.famous_ads (category_id, title, brand_name, platform, format, source_url, thumbnail_url, hook_type, why_it_works, cta_style, region, is_published, is_seed, sort_order)
select
  c.id,
  'The Conversation Couples Avoid',
  'Serene Intimate Wellness',
  'Meta Feed / Stories',
  '4:5 Video',
  'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=IN&q=wellness+self+care&search_type=keyword_unordered&media_type=video',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
  'Emotional & Empathic Dialogue',
  array[
    'Zero explicit or suggestive imagery — 100% compliant with strict Meta advertising policies',
    'Real couples talking about stress, communication, and emotional intimacy barriers',
    'Organic botanical formula highlighted with clinical gynecologist endorsement'
  ],
  'Explore Discreet Delivery ↗',
  'IN',
  true,
  true,
  4
from public.categories c where c.slug = 'sexual-wellness';

insert into public.famous_ads (category_id, title, brand_name, platform, format, source_url, thumbnail_url, hook_type, why_it_works, cta_style, region, is_published, is_seed, sort_order)
select
  c.id,
  'The Water-Drop Prism Refraction',
  'Aethel Silver',
  'Instagram Reels / Meta Ads',
  '9:16 Video',
  'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=IN&q=anti+tarnish+jewellery&search_type=keyword_unordered&media_type=video',
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
  'Unboxing & Sensory Macro',
  array[
    'Macro lens capturing dew drops rolling off pure 925 sterling silver chain',
    'Customer review quote popups animated over the video',
    'Lifetime tarnish replacement warranty highlighted in bold typography'
  ],
  'Shop 925 Anti-Tarnish ↗',
  'IN',
  true,
  true,
  5
from public.categories c where c.slug = 'jewellery-accessories';

insert into public.famous_ads (category_id, title, brand_name, platform, format, source_url, thumbnail_url, hook_type, why_it_works, cta_style, region, is_published, is_seed, sort_order)
select
  c.id,
  '3pm Fatigue vs 1 Scoop Green Energy',
  'Revive Nutrition Co.',
  'Instagram Reels / Meta Ads',
  '9:16 Video',
  'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=IN&q=protein+supplement&search_type=keyword_unordered&media_type=video',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  'Problem-Solution Routine',
  array[
    'Fast-paced cut of yawning at a work laptop followed by a crisp shaker bottle dissolve',
    'No artificial sugar spike claim backed by simple 5-ingredient breakdown',
    'Money-back taste guarantee card at end screen'
  ],
  'Get Starter Kit (Save 25%) ↗',
  'IN',
  true,
  true,
  6
from public.categories c where c.slug = 'health-supplements';
