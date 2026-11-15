-- ============================================================================
-- SUPABASE MIGRATION: 20261115153000_script_reference_library.sql
-- Infimindss Script Reference Library: Private Admin-Managed Creative Intelligence
-- Categories, Reference Blueprints, Strict RLS & Sanitized Customer View
-- ============================================================================

-- 1. SCRIPT CATEGORIES TABLE
create table if not exists public.script_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  icon text default 'Sparkles',
  sort_order int not null default 0,
  is_active boolean not null default true,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Idempotent updated_at trigger for script_categories
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'script_categories_touch') then
    create trigger script_categories_touch before update on public.script_categories
    for each row execute function public.touch_updated_at();
  end if;
end $$;

-- 2. SCRIPT REFERENCES TABLE (STRICTLY PRIVATE ADMIN REPOSITORY)
create table if not exists public.script_references (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.script_categories(id) on delete cascade,
  title text not null,
  description text not null, -- Short customer-facing description of when to use it
  prompt_guidance text not null, -- Internal writing instructions / prompt guidance (strictly private)
  example_script text, -- Optional team-provided example script
  suitable_platforms text[] not null default '{"Instagram Reels", "TikTok", "YouTube Shorts", "Meta Ads"}',
  suitable_tones text[] not null default '{"Bold", "Relatable", "Conversational"}',
  suitable_durations int[] not null default '{15, 30, 45, 60}',
  style_tags text[] not null default '{"UGC"}',
  is_active boolean not null default true,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  priority int not null default 0, -- Higher priority selected first during auto-selection
  sort_order int not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Idempotent updated_at trigger for script_references
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'script_references_touch') then
    create trigger script_references_touch before update on public.script_references
    for each row execute function public.touch_updated_at();
  end if;
end $$;

-- 3. INDEXES FOR PERFORMANCE
create index if not exists idx_script_categories_sort on public.script_categories (status, is_active, sort_order asc);
create index if not exists idx_script_references_cat on public.script_references (category_id, is_active, priority desc);
create index if not exists idx_script_references_status on public.script_references (status, is_active);
create index if not exists idx_script_references_tags on public.script_references using gin (style_tags);

-- 4. ROW LEVEL SECURITY (RLS)
alter table public.script_categories enable row level security;
alter table public.script_references enable row level security;

-- Script Categories Policies:
-- Public & clients can view active categories
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'script_categories' and policyname = 'Public can view active script categories'
  ) then
    create policy "Public can view active script categories"
      on public.script_categories for select
      using ((is_active = true and status = 'active') or public.is_admin());
  end if;

  -- Admins have full access to script categories
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'script_categories' and policyname = 'Admins have full access to script categories'
  ) then
    create policy "Admins have full access to script categories"
      on public.script_categories for all
      using (public.is_admin())
      with check (public.is_admin());
  end if;
end $$;

-- Script References Policies:
-- Strictly private table! Only administrators have direct table access.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'script_references' and policyname = 'Admins have full access to script references'
  ) then
    create policy "Admins have full access to script references"
      on public.script_references for all
      using (public.is_admin())
      with check (public.is_admin());
  end if;
end $$;

-- 5. SECURE SANITIZED VIEW FOR CUSTOMER INTERFACE
-- Exposes friendly titles, descriptions, and tags. Never exposes raw prompt guidance or internal notes.
create or replace view public.script_reference_options
with (security_invoker = false)
as
select
  id,
  category_id,
  title,
  description,
  suitable_platforms,
  suitable_tones,
  suitable_durations,
  style_tags,
  priority,
  sort_order
from public.script_references
where is_active = true and status = 'active';

grant select on public.script_reference_options to anon, authenticated;

-- 6. INITIAL SEED DATA
insert into public.script_categories (id, slug, name, description, icon, sort_order, is_active, status)
values
  ('11111111-1111-1111-1111-111111111101', 'product-ad', 'Product Ad & Commercial', 'Direct-response product showcases, problem/solution stress tests, and benefit-led visual reveals.', 'Sparkles', 1, true, 'active'),
  ('11111111-1111-1111-1111-111111111102', 'ugc-creator', 'UGC & Creator First', 'Authentic user-generated style, candid selfie testimonials, unboxings, and real-life wear tests.', 'Smartphone', 2, true, 'active'),
  ('11111111-1111-1111-1111-111111111103', 'product-launch', 'Product Launch & Drop', 'High-hype unveilings, countdown teasers, limited-batch releases, and exclusive waitlist hooks.', 'Rocket', 3, true, 'active'),
  ('11111111-1111-1111-1111-111111111104', 'brand-storytelling', 'Founder & Brand Storytelling', 'Behind-the-scenes origin stories, workshop craft, founder mission, and why-we-started narratives.', 'BookOpen', 4, true, 'active'),
  ('11111111-1111-1111-1111-111111111105', 'educational-reel', 'Educational & Value Reel', 'Myth-busting, how-to tutorials, ingredient spotlights, and 3-mistake breakdowns that build trust.', 'Layers', 5, true, 'active')
on conflict (slug) do nothing;

insert into public.script_references (
  id,
  category_id,
  title,
  description,
  prompt_guidance,
  example_script,
  suitable_platforms,
  suitable_tones,
  suitable_durations,
  style_tags,
  is_active,
  status,
  priority,
  sort_order
)
values
  (
    '22222222-2222-2222-2222-222222222201',
    '11111111-1111-1111-1111-111111111101',
    'The Friction-to-Relief Stress Test',
    'Best for physical products with an obvious visual contrast or immediate tactile advantage.',
    'STRUCTURE INSTRUCTIONS:\n- Hook (0-3s): Open with physical frustration, mess, or standard product failure. Visually show the pain point in extreme close-up.\n- Pivot (3-8s): Rapid cut to creator introducing the product. No corporate monologue — just raw practical discovery.\n- Stress Test (8-22s): Hands-on demonstration under demanding conditions. Show macroscopic details, texture, and immediate functional relief.\n- CTA (22-30s): Clear single directive with risk-reversal guarantee.\n\nPACING & RULES:\n- Cut pace: 1 cut every 1.8 seconds.\n- Natural speech cadence, contractions, direct eye contact with camera lens.\n- Never invent clinical metrics or certified claims.',
    '[HOOK - 0 to 3s]:\nVisual: Creator struggling with clunky traditional bottle that spills on counter.\nSpoken: "If you are still putting up with this mess every morning, stop doing this to yourself."\n\n[BODY - 3 to 22s]:\nVisual: Quick cut to creator holding product. Hands apply formula effortlessly in one clean click.\nSpoken: "Switched to this last week. Look at this mechanism: one press, zero drips, exactly one measured dose. It took 3 seconds and my skin absorbed it instantly."\n\n[CTA - 22 to 30s]:\nVisual: Creator smiling, tapping on-screen link pill.\nSpoken: "Get yours while the introductory restock is still live at the link below."',
    '{"Instagram Reels", "TikTok", "Meta Ads", "YouTube Shorts"}',
    '{"Bold", "Punchy", "High Energy"}',
    '{15, 30, 45}',
    '{"product demo", "problem-solution", "stress test"}',
    true,
    'active',
    10,
    1
  ),
  (
    '22222222-2222-2222-2222-222222222202',
    '11111111-1111-1111-1111-111111111102',
    'The Unfiltered 7-Day Reality Check',
    'Best for skincare, wellness, apparel fit, or daily consumables where authentic creator proof converts best.',
    'STRUCTURE INSTRUCTIONS:\n- Hook (0-3s): Subversive selfie hook. "Do NOT buy this if you expect overnight magic — but watch this 7-day diary."\n- Routine Progression (3-18s): Rapid timeline cuts: Day 1 (candid morning mirror), Day 3 (honest midpoint observation), Day 7 (side-by-side visible result).\n- Authentic Nuance (18-24s): Mention one honest practical nuance (e.g. "a tiny bit goes a long way" or "it smells earthy because there is zero synthetic fragrance").\n- CTA (24-30s): Call to action directed at viewers with the exact same pain point.\n\nPACING & RULES:\n- Handheld camera motion, natural window lighting, zero over-glamorized studio backdrops.',
    '[HOOK - 0 to 3s]:\nVisual: Creator speaking directly to selfie camera without studio filters.\nSpoken: "Do not buy this serum before you watch my honest 7-day wear test."\n\n[BODY - 3 to 22s]:\nVisual: Match cuts of Day 1, Day 3, and Day 7 in identical natural morning light.\nSpoken: "Day one, I was skeptical. Day three, texture started calming down. And by day seven, my morning redness was noticeably subdued. It has an earthy scent because they left out artificial perfume, which I actually respect."\n\n[CTA - 22 to 30s]:\nVisual: Creator holding bottle up to lens, text overlay highlighting guarantee.\nSpoken: "If you have stubborn sensitivity, tap the link below to check out their batch guarantee."',
    '{"Instagram Reels", "TikTok", "YouTube Shorts"}',
    '{"Relatable", "Conversational", "Honest"}',
    '{30, 45, 60}',
    '{"UGC", "testimonial", "wear test"}',
    true,
    'active',
    9,
    2
  ),
  (
    '22222222-2222-2222-2222-222222222203',
    '11111111-1111-1111-1111-111111111104',
    'The 3 AM Workshop Origin Tale',
    'Best for craft brands, direct-to-consumer founders, and innovative products with a distinct origin story.',
    'STRUCTURE INSTRUCTIONS:\n- Hook (0-3s): Open inside the actual workspace or workshop. Founder or creator holding raw prototype.\n- The Frustration Spark (3-12s): Explain the exact moment of dissatisfaction with existing industry monopolies or cheap materials.\n- The Breakthrough (12-22s): Show the physical materials, craftsmanship, and why every millimeter was obsessively calibrated.\n- Community Call (22-30s): Invite viewers to join the small-batch community rather than hard-selling.\n\nPACING & RULES:\n- Documentary-style sound design, intimate tone, cinematic macro b-roll interspersed with speaking.',
    '[HOOK - 0 to 3s]:\nVisual: Hands working on workbench, cuts to founder looking up.\nSpoken: "Two years ago, I threw away 14 prototypes because none of them met this standard."\n\n[BODY - 3 to 22s]:\nVisual: Macro cuts of materials, precision stitching, custom hardware.\nSpoken: "Mass brands cut corners on materials to protect margins. We did the exact opposite: custom-milled textiles, reinforced stress points, and zero plastic packaging. You can literally feel the difference the moment you hold it."\n\n[CTA - 22 to 30s]:\nVisual: Finished item boxed carefully on craft paper.\nSpoken: "We just finished our newest production run. Tap below to see our story and reserve yours."',
    '{"Instagram Reels", "Meta Ads", "TikTok"}',
    '{"Founder Story", "Inspiring", "Craft"}',
    '{30, 45, 60}',
    '{"founder story", "craft", "authenticity"}',
    true,
    'active',
    8,
    3
  ),
  (
    '22222222-2222-2222-2222-222222222204',
    '11111111-1111-1111-1111-111111111105',
    'The 3 Costly Mistakes Breakdown',
    'Best for educational reels, complex technical products, supplements, and routines that need value-first teaching.',
    'STRUCTURE INSTRUCTIONS:\n- Hook (0-3s): "3 mistakes 90% of people make with [category] that destroy their results."\n- Mistake 1 (3-10s): High commonality mistake + immediate corrective principle.\n- Mistake 2 (10-18s): Deeper technical or timing mistake.\n- Mistake 3 & Solution (18-25s): The foundational mistake which the brand product directly solves.\n- Actionable Takeaway (25-30s): Bookmark call to action + link offer.\n\nPACING & RULES:\n- Fast on-screen kinetic bullet points, high authority tone, educational value upfront.',
    '[HOOK - 0 to 3s]:\nVisual: Creator holding up 3 fingers with rapid zoom-in.\nSpoken: "Three huge mistakes almost everyone makes with their daily routine."\n\n[BODY - 3 to 22s]:\nVisual: Kinetic text callouts matching creator gestures.\nSpoken: "Number one: applying on dry skin instead of damp. Number two: layering conflicting actives at the same time. And number three: ignoring barrier repair. That is exactly why we formulated this single all-in-one step."\n\n[CTA - 22 to 30s]:\nVisual: Creator pointing to caption and save icon.\nSpoken: "Save this reel for your next routine, and tap the link below to get the full protocol."',
    '{"Instagram Reels", "YouTube Shorts", "TikTok"}',
    '{"Educational", "Authority", "Punchy"}',
    '{30, 45, 60}',
    '{"educational", "myth busting", "tutorial"}',
    true,
    'active',
    7,
    4
  ),
  (
    '22222222-2222-2222-2222-222222222205',
    '11111111-1111-1111-1111-111111111103',
    'The Secret Vault Limited Drop',
    'Best for new product launches, seasonal collections, limited collaborations, and pre-orders.',
    'STRUCTURE INSTRUCTIONS:\n- Hook (0-3s): Urgency and exclusivity hook. "We were not supposed to reveal this until Friday, but the first batch just arrived."\n- Unboxing Reveal (3-15s): Slow-motion peel, unboxing, or first-look reveal of the new drop with crisp ASMR audio.\n- Core Innovation (15-22s): What makes this specific drop different from anything previously available.\n- Waitlist / Drop CTA (22-30s): Clear limited-quantity warning.\n\nPACING & RULES:\n- High aesthetic appeal, crisp sound effects, urgent but premium tone.',
    '[HOOK - 0 to 3s]:\nVisual: Hand cutting open branded security seal on unreleased package.\nSpoken: "We were not supposed to show this until Friday, but the first 200 units just landed."\n\n[BODY - 3 to 22s]:\nVisual: ASMR unboxing reveal showing pristine design and special drop colorway.\nSpoken: "This is our completely redesigned edition. New matte finish, reinforced build, and available in this limited colorway for this batch only."\n\n[CTA - 22 to 30s]:\nVisual: Screen showing countdown timer overlay.\nSpoken: "Early access is open right now at the link below. Once this batch is gone, restocks won not arrive for 6 weeks."',
    '{"Instagram Reels", "TikTok", "Meta Ads"}',
    '{"Launch", "High Energy", "Hype"}',
    '{15, 30, 45}',
    '{"launch", "unboxing", "scarcity", "hype"}',
    true,
    'active',
    8,
    5
  )
on conflict do nothing;
