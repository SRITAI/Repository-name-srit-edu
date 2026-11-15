import {
  ScriptCategory,
  ScriptReference,
  ScriptReferenceOption,
} from "@/lib/supabase/types";

export const SEED_SCRIPT_CATEGORIES: ScriptCategory[] = [
  {
    id: "11111111-1111-1111-1111-111111111101",
    slug: "product-ad",
    name: "Product Ad & Commercial",
    description: "Direct-response product showcases, problem/solution stress tests, and benefit-led visual reveals.",
    icon: "Sparkles",
    sort_order: 1,
    is_active: true,
    status: "active",
    created_at: "2026-11-15T12:00:00Z",
    updated_at: "2026-11-15T12:00:00Z",
  },
  {
    id: "11111111-1111-1111-1111-111111111102",
    slug: "ugc-creator",
    name: "UGC & Creator First",
    description: "Authentic user-generated style, candid selfie testimonials, unboxings, and real-life wear tests.",
    icon: "Smartphone",
    sort_order: 2,
    is_active: true,
    status: "active",
    created_at: "2026-11-15T12:00:00Z",
    updated_at: "2026-11-15T12:00:00Z",
  },
  {
    id: "11111111-1111-1111-1111-111111111103",
    slug: "product-launch",
    name: "Product Launch & Drop",
    description: "High-hype unveilings, countdown teasers, limited-batch releases, and exclusive waitlist hooks.",
    icon: "Rocket",
    sort_order: 3,
    is_active: true,
    status: "active",
    created_at: "2026-11-15T12:00:00Z",
    updated_at: "2026-11-15T12:00:00Z",
  },
  {
    id: "11111111-1111-1111-1111-111111111104",
    slug: "brand-storytelling",
    name: "Founder & Brand Storytelling",
    description: "Behind-the-scenes origin stories, workshop craft, founder mission, and why-we-started narratives.",
    icon: "BookOpen",
    sort_order: 4,
    is_active: true,
    status: "active",
    created_at: "2026-11-15T12:00:00Z",
    updated_at: "2026-11-15T12:00:00Z",
  },
  {
    id: "11111111-1111-1111-1111-111111111105",
    slug: "educational-reel",
    name: "Educational & Value Reel",
    description: "Myth-busting, how-to tutorials, ingredient spotlights, and 3-mistake breakdowns that build trust.",
    icon: "Layers",
    sort_order: 5,
    is_active: true,
    status: "active",
    created_at: "2026-11-15T12:00:00Z",
    updated_at: "2026-11-15T12:00:00Z",
  },
];

export const SEED_SCRIPT_REFERENCES: ScriptReference[] = [
  {
    id: "22222222-2222-2222-2222-222222222201",
    category_id: "11111111-1111-1111-1111-111111111101",
    title: "The Friction-to-Relief Stress Test",
    description: "Best for physical products with an obvious visual contrast or immediate functional advantage.",
    prompt_guidance: `STRUCTURE INSTRUCTIONS:
- Hook (0-3s): Open with physical frustration, mess, or standard product failure. Visually show the pain point in extreme close-up.
- Pivot (3-8s): Rapid cut to creator introducing the product. No corporate monologue — just raw practical discovery.
- Stress Test (8-22s): Hands-on demonstration under demanding conditions. Show macroscopic details, texture, and immediate functional relief.
- CTA (22-30s): Clear single directive with risk-reversal guarantee.

PACING & RULES:
- Cut pace: 1 cut every 1.8 seconds.
- Natural speech cadence, contractions, direct eye contact with camera lens.
- Never invent clinical metrics or certified claims.
- If an exact technical claim is not provided in customer brief, insert [confirm this detail].`,
    example_script: `[HOOK - 0 to 3s]:
Visual: Creator struggling with clunky traditional bottle that spills on counter.
Voiceover: "If you are still putting up with this mess every morning, stop doing this to yourself."
On-Screen Text: "STOP doing this ❌"

[BODY - 3 to 22s]:
Visual: Quick cut to creator holding product. Hands apply formula effortlessly in one clean click.
Voiceover: "Switched to this last week. Look at this mechanism: one press, zero drips, exactly one measured dose. It took 3 seconds and my skin absorbed it instantly."
On-Screen Text: "1 Press • 0 Drips • Instant Absorption"

[CTA - 22 to 30s]:
Visual: Creator smiling, tapping on-screen link pill.
Voiceover: "Get yours while the introductory restock is still live at the link below."
On-Screen Text: "Tap link below ↘ Restock live"`,
    suitable_platforms: ["Instagram Reels", "TikTok", "Meta Ads", "YouTube Shorts"],
    suitable_tones: ["Bold", "Punchy", "High Energy"],
    suitable_durations: [15, 30, 45],
    style_tags: ["product demo", "problem-solution", "stress test"],
    is_active: true,
    status: "active",
    priority: 10,
    sort_order: 1,
    created_at: "2026-11-15T12:00:00Z",
    updated_at: "2026-11-15T12:00:00Z",
  },
  {
    id: "22222222-2222-2222-2222-222222222202",
    category_id: "11111111-1111-1111-1111-111111111102",
    title: "The Unfiltered 7-Day Reality Check",
    description: "Best for skincare, wellness, apparel fit, or daily consumables where authentic creator proof converts best.",
    prompt_guidance: `STRUCTURE INSTRUCTIONS:
- Hook (0-3s): Subversive selfie hook. "Do NOT buy this if you expect overnight magic — but watch this 7-day diary."
- Routine Progression (3-18s): Rapid timeline cuts: Day 1 (candid morning mirror), Day 3 (honest midpoint observation), Day 7 (side-by-side visible result).
- Authentic Nuance (18-24s): Mention one honest practical nuance (e.g. "a tiny bit goes a long way" or "it smells earthy because there is zero synthetic fragrance").
- CTA (24-30s): Call to action directed at viewers with the exact same pain point.

PACING & RULES:
- Handheld camera motion, natural window lighting, zero over-glamorized studio backdrops.
- Keep tone conversational and personal.
- Never invent product ingredients or fake guarantees.`,
    example_script: `[HOOK - 0 to 3s]:
Visual: Creator speaking directly to selfie camera without studio filters.
Voiceover: "Do not buy this serum before you watch my honest 7-day wear test."
On-Screen Text: "Honest 7-Day Wear Test 🧪"

[BODY - 3 to 22s]:
Visual: Match cuts of Day 1, Day 3, and Day 7 in identical natural morning light.
Voiceover: "Day one, I was skeptical. Day three, texture started calming down. And by day seven, my morning redness was noticeably subdued. It has an earthy scent because they left out artificial perfume, which I actually respect."
On-Screen Text: "Day 1 ➔ Day 3 ➔ Day 7 visible difference"

[CTA - 22 to 30s]:
Visual: Creator holding bottle up to lens, text overlay highlighting guarantee.
Voiceover: "If you have stubborn sensitivity, tap the link below to check out their batch guarantee."
On-Screen Text: "Check batch availability 👇"`,
    suitable_platforms: ["Instagram Reels", "TikTok", "YouTube Shorts"],
    suitable_tones: ["Relatable", "Conversational", "Honest"],
    suitable_durations: [30, 45, 60],
    style_tags: ["UGC", "testimonial", "wear test"],
    is_active: true,
    status: "active",
    priority: 9,
    sort_order: 2,
    created_at: "2026-11-15T12:00:00Z",
    updated_at: "2026-11-15T12:00:00Z",
  },
  {
    id: "22222222-2222-2222-2222-222222222203",
    category_id: "11111111-1111-1111-1111-111111111104",
    title: "The 3 AM Workshop Origin Tale",
    description: "Best for craft brands, direct-to-consumer founders, and innovative products with a distinct origin story.",
    prompt_guidance: `STRUCTURE INSTRUCTIONS:
- Hook (0-3s): Open inside the actual workspace or workshop. Founder or creator holding raw prototype.
- The Frustration Spark (3-12s): Explain the exact moment of dissatisfaction with existing industry monopolies or cheap materials.
- The Breakthrough (12-22s): Show the physical materials, craftsmanship, and why every millimeter was obsessively calibrated.
- Community Call (22-30s): Invite viewers to join the small-batch community rather than hard-selling.

PACING & RULES:
- Documentary-style sound design, intimate tone, cinematic macro b-roll interspersed with speaking.
- Maintain founder humility and conviction.`,
    example_script: `[HOOK - 0 to 3s]:
Visual: Hands working on workbench, cuts to founder looking up.
Voiceover: "Two years ago, I threw away 14 prototypes because none of them met this standard."
On-Screen Text: "14 failed prototypes later..."

[BODY - 3 to 22s]:
Visual: Macro cuts of materials, precision stitching, custom hardware.
Voiceover: "Mass brands cut corners on materials to protect margins. We did the exact opposite: custom-milled textiles, reinforced stress points, and zero plastic packaging. You can literally feel the difference the moment you hold it."
On-Screen Text: "Custom textiles • Zero corners cut"

[CTA - 22 to 30s]:
Visual: Finished item boxed carefully on craft paper.
Voiceover: "We just finished our newest production run. Tap below to see our story and reserve yours."
On-Screen Text: "Reserve from Batch 04 ↗"`,
    suitable_platforms: ["Instagram Reels", "Meta Ads", "TikTok"],
    suitable_tones: ["Founder Story", "Inspiring", "Craft"],
    suitable_durations: [30, 45, 60],
    style_tags: ["founder story", "craft", "authenticity"],
    is_active: true,
    status: "active",
    priority: 8,
    sort_order: 3,
    created_at: "2026-11-15T12:00:00Z",
    updated_at: "2026-11-15T12:00:00Z",
  },
  {
    id: "22222222-2222-2222-2222-222222222204",
    category_id: "11111111-1111-1111-1111-111111111105",
    title: "The 3 Costly Mistakes Breakdown",
    description: "Best for educational reels, complex technical products, supplements, and routines that need value-first teaching.",
    prompt_guidance: `STRUCTURE INSTRUCTIONS:
- Hook (0-3s): "3 mistakes 90% of people make with [category] that destroy their results."
- Mistake 1 (3-10s): High commonality mistake + immediate corrective principle.
- Mistake 2 (10-18s): Deeper technical or timing mistake.
- Mistake 3 & Solution (18-25s): The foundational mistake which the brand product directly solves.
- Actionable Takeaway (25-30s): Bookmark call to action + link offer.

PACING & RULES:
- Fast on-screen kinetic bullet points, high authority tone, educational value upfront.
- Verify that every claim accurately represents confirmed product capabilities.`,
    example_script: `[HOOK - 0 to 3s]:
Visual: Creator holding up 3 fingers with rapid zoom-in.
Voiceover: "Three huge mistakes almost everyone makes with their daily routine."
On-Screen Text: "3 Mistakes You Are Making 🛑"

[BODY - 3 to 22s]:
Visual: Kinetic text callouts matching creator gestures.
Voiceover: "Number one: applying on dry skin instead of damp. Number two: layering conflicting actives at the same time. And number three: ignoring barrier repair. That is exactly why we formulated this single all-in-one step."
On-Screen Text: "1. Dry Application\n2. Overloading Actives\n3. Missing Barrier Defense"

[CTA - 22 to 30s]:
Visual: Creator pointing to caption and save icon.
Voiceover: "Save this reel for your next routine, and tap the link below to get the full protocol."
On-Screen Text: "Save this reel • Full guide below ↗"`,
    suitable_platforms: ["Instagram Reels", "YouTube Shorts", "TikTok"],
    suitable_tones: ["Educational", "Authority", "Punchy"],
    suitable_durations: [30, 45, 60],
    style_tags: ["educational", "myth busting", "tutorial"],
    is_active: true,
    status: "active",
    priority: 7,
    sort_order: 4,
    created_at: "2026-11-15T12:00:00Z",
    updated_at: "2026-11-15T12:00:00Z",
  },
  {
    id: "22222222-2222-2222-2222-222222222205",
    category_id: "11111111-1111-1111-1111-111111111103",
    title: "The Secret Vault Limited Drop",
    description: "Best for new product launches, seasonal collections, limited collaborations, and pre-orders.",
    prompt_guidance: `STRUCTURE INSTRUCTIONS:
- Hook (0-3s): Urgency and exclusivity hook. "We were not supposed to reveal this until Friday, but the first batch just arrived."
- Unboxing Reveal (3-15s): Slow-motion peel, unboxing, or first-look reveal of the new drop with crisp ASMR audio.
- Core Innovation (15-22s): What makes this specific drop different from anything previously available.
- Waitlist / Drop CTA (22-30s): Clear limited-quantity warning.

PACING & RULES:
- High aesthetic appeal, crisp sound effects, urgent but premium tone.`,
    example_script: `[HOOK - 0 to 3s]:
Visual: Hand cutting open branded security seal on unreleased package.
Voiceover: "We were not supposed to show this until Friday, but the first 200 units just landed."
On-Screen Text: "Unreleased Drop Alert 🚨"

[BODY - 3 to 22s]:
Visual: ASMR unboxing reveal showing pristine design and special drop colorway.
Voiceover: "This is our completely redesigned edition. New matte finish, reinforced build, and available in this limited colorway for this batch only."
On-Screen Text: "Limited Edition Colorway • Batch 01"

[CTA - 22 to 30s]:
Visual: Screen showing countdown timer overlay.
Voiceover: "Early access is open right now at the link below. Once this batch is gone, restocks won not arrive for 6 weeks."
On-Screen Text: "Claim early access drop ⏱️"`,
    suitable_platforms: ["Instagram Reels", "TikTok", "Meta Ads"],
    suitable_tones: ["Launch", "High Energy", "Hype"],
    suitable_durations: [15, 30, 45],
    style_tags: ["launch", "unboxing", "scarcity", "hype"],
    is_active: true,
    status: "active",
    priority: 8,
    sort_order: 5,
    created_at: "2026-11-15T12:00:00Z",
    updated_at: "2026-11-15T12:00:00Z",
  },
];

/**
 * Returns customer-safe sanitized reference options.
 * Prompt guidance and team notes are strictly omitted.
 */
export function getSanitizedReferenceOptions(
  categoryIdOrSlug?: string
): ScriptReferenceOption[] {
  let matchedCategoryId: string | undefined;

  if (categoryIdOrSlug) {
    const foundCat = SEED_SCRIPT_CATEGORIES.find(
      (c) => c.id === categoryIdOrSlug || c.slug === categoryIdOrSlug
    );
    if (foundCat) matchedCategoryId = foundCat.id;
  }

  const filtered = matchedCategoryId
    ? SEED_SCRIPT_REFERENCES.filter(
        (r) => r.category_id === matchedCategoryId && r.is_active && r.status === "active"
      )
    : SEED_SCRIPT_REFERENCES.filter((r) => r.is_active && r.status === "active");

  return filtered.map((r) => {
    const cat = SEED_SCRIPT_CATEGORIES.find((c) => c.id === r.category_id);
    return {
      id: r.id,
      category_id: r.category_id,
      category_slug: cat?.slug,
      category_name: cat?.name,
      title: r.title,
      description: r.description,
      suitable_platforms: r.suitable_platforms,
      suitable_tones: r.suitable_tones,
      suitable_durations: r.suitable_durations,
      style_tags: r.style_tags,
      priority: r.priority,
      sort_order: r.sort_order,
    };
  });
}

/**
 * Server-only helper to find reference by id (internal prompt guidance preserved)
 */
export function findReferenceById(id: string): ScriptReference | undefined {
  return SEED_SCRIPT_REFERENCES.find((r) => r.id === id);
}

/**
 * Server-only auto-matching engine based on category, platform, tone, and duration.
 */
export function findBestMatchingReference(criteria: {
  categorySlugOrId?: string;
  platform?: string;
  tone?: string;
  duration?: number;
}): ScriptReference | null {
  const activeRefs = SEED_SCRIPT_REFERENCES.filter(
    (r) => r.is_active && r.status === "active"
  );
  if (activeRefs.length === 0) return null;

  let candidates = activeRefs;

  // Filter by category if matched
  if (criteria.categorySlugOrId) {
    const cat = SEED_SCRIPT_CATEGORIES.find(
      (c) => c.id === criteria.categorySlugOrId || c.slug === criteria.categorySlugOrId
    );
    if (cat) {
      const catMatches = candidates.filter((r) => r.category_id === cat.id);
      if (catMatches.length > 0) {
        candidates = catMatches;
      }
    }
  }

  // Score each candidate
  const scored = candidates.map((ref) => {
    let score = ref.priority;

    if (criteria.platform) {
      const normPlatform = criteria.platform.toLowerCase();
      if (ref.suitable_platforms.some((p) => normPlatform.includes(p.toLowerCase()) || p.toLowerCase().includes(normPlatform))) {
        score += 3;
      }
    }

    if (criteria.tone) {
      const normTone = criteria.tone.toLowerCase();
      if (ref.suitable_tones.some((t) => normTone.includes(t.toLowerCase()) || t.toLowerCase().includes(normTone))) {
        score += 2;
      }
    }

    if (criteria.duration && ref.suitable_durations.includes(criteria.duration)) {
      score += 2;
    }

    return { ref, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.ref || null;
}
