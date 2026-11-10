import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AdListingSchema } from "@/lib/validation/ad-listing";
import { parseVideoMediaUrl } from "@/lib/media/video-embed";
import { SEED_AD_LISTINGS } from "@/lib/data/ad-explorer-seed";
import { AdListing } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

/**
 * Server-side helper to verify user session and admin database role
 */
async function verifyAdminAuth() {
  const supabase = await createClient();
  if (!supabase) {
    // Local dev mode without Supabase credentials configured
    return { authorized: true, user: null, supabase: null, isLocalPreview: true };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      authorized: false,
      status: 401,
      error: "Authentication required. Please sign in to an administrator account.",
    };
  }

  // Check database profile role
  const { data: profile, error: profError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profError || !profile || profile.role !== "admin") {
    return {
      authorized: false,
      status: 403,
      error: "Access denied: Administrator privileges required to manage curated ad listings.",
    };
  }

  return { authorized: true, user, supabase, isLocalPreview: false };
}

/**
 * GET /api/admin/ad-explorer
 * List all ads (including drafts, review, and archived) for admin management
 */
export async function GET(request: NextRequest) {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const platform = searchParams.get("platform");
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const country = searchParams.get("country");

  if (auth.isLocalPreview || !auth.supabase) {
    // Local mock data filtering
    let results = [...SEED_AD_LISTINGS];
    if (platform && platform !== "all") {
      results = results.filter((a) => a.platform === platform);
    }
    if (status && status !== "all") {
      results = results.filter((a) => a.status === status);
    }
    if (category && category !== "all") {
      results = results.filter((a) => a.category === category);
    }
    if (country && country !== "all") {
      results = results.filter((a) => a.country_code === country);
    }
    if (q) {
      results = results.filter(
        (a) =>
          a.brand_name.toLowerCase().includes(q) ||
          a.title.toLowerCase().includes(q) ||
          (a.advertiser_name || "").toLowerCase().includes(q) ||
          (a.curator_note || "").toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }
    return NextResponse.json({ items: results, total: results.length, isLocalPreview: true });
  }

  // Query Supabase
  let query = auth.supabase.from("ad_listings").select("*", { count: "exact" });

  if (platform && platform !== "all") {
    query = query.eq("platform", platform);
  }
  if (status && status !== "all") {
    query = query.eq("status", status);
  }
  if (category && category !== "all") {
    query = query.eq("category", category);
  }
  if (country && country !== "all") {
    query = query.eq("country_code", country);
  }
  if (q) {
    query = query.or(
      `brand_name.ilike.%${q}%,advertiser_name.ilike.%${q}%,title.ilike.%${q}%,short_description.ilike.%${q}%,hook_summary.ilike.%${q}%,curator_note.ilike.%${q}%`
    );
  }

  query = query.order("created_at", { ascending: false });

  const { data, count, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data || [], total: count || 0 });
}

/**
 * POST /api/admin/ad-explorer
 * Create a new curated ad listing
 */
export async function POST(request: NextRequest) {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const json = await request.json();
    const parseResult = AdListingSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const validData = parseResult.data;

    // Detect media provider from media_url if supplied
    const mediaParsed = parseVideoMediaUrl(validData.media_url);
    const mediaProvider = validData.media_url ? mediaParsed.provider : null;

    const payload: Partial<AdListing> = {
      platform: validData.platform,
      platform_surface: validData.platform_surface || null,
      brand_name: validData.brand_name,
      advertiser_name: validData.advertiser_name || validData.brand_name,
      title: validData.title,
      short_description: validData.short_description || null,
      hook_summary: validData.hook_summary || null,
      call_to_action: validData.call_to_action || null,
      category: validData.category,
      country_code: validData.country_code,
      creative_format: validData.creative_format,
      source_url: validData.source_url,
      source_ad_id: validData.source_ad_id || null,
      media_url: validData.media_url || null,
      media_provider: mediaProvider,
      preview_image_path: validData.preview_image_path || null,
      product_url: validData.product_url || null,
      landing_page_url: validData.landing_page_url || null,
      asin: validData.asin || null,
      amazon_ad_type: validData.amazon_ad_type || null,
      search_term: validData.search_term || null,
      marketplace: validData.marketplace || null,
      media_rights_status: validData.media_rights_status,
      first_seen_at: validData.first_seen_at ? new Date(validData.first_seen_at).toISOString() : null,
      last_reviewed_at: new Date().toISOString(),
      status: validData.status,
      curator_note: validData.curator_note || null,
      signal_labels: validData.signal_labels,
      is_featured: validData.is_featured,
      performance_evidence_note: validData.performance_evidence_note || null,
      created_by: auth.user ? auth.user.id : null,
      updated_by: auth.user ? auth.user.id : null,
    };

    if (auth.isLocalPreview || !auth.supabase) {
      const mockCreated = {
        ...payload,
        id: `ad_local_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return NextResponse.json({ item: mockCreated, success: true, isLocalPreview: true });
    }

    const { data, error } = await auth.supabase
      .from("ad_listings")
      .insert(payload)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create ad listing" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/ad-explorer
 * Update an existing ad listing
 */
export async function PUT(request: NextRequest) {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const json = await request.json();
    const id = json.id;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing listing id." }, { status: 400 });
    }

    const parseResult = AdListingSchema.safeParse(json);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const validData = parseResult.data;
    const mediaParsed = parseVideoMediaUrl(validData.media_url);
    const mediaProvider = validData.media_url ? mediaParsed.provider : null;

    const updates: Record<string, any> = {
      platform: validData.platform,
      platform_surface: validData.platform_surface || null,
      brand_name: validData.brand_name,
      advertiser_name: validData.advertiser_name || validData.brand_name,
      title: validData.title,
      short_description: validData.short_description || null,
      hook_summary: validData.hook_summary || null,
      call_to_action: validData.call_to_action || null,
      category: validData.category,
      country_code: validData.country_code,
      creative_format: validData.creative_format,
      source_url: validData.source_url,
      source_ad_id: validData.source_ad_id || null,
      media_url: validData.media_url || null,
      media_provider: mediaProvider,
      preview_image_path: validData.preview_image_path || null,
      product_url: validData.product_url || null,
      landing_page_url: validData.landing_page_url || null,
      asin: validData.asin || null,
      amazon_ad_type: validData.amazon_ad_type || null,
      search_term: validData.search_term || null,
      marketplace: validData.marketplace || null,
      media_rights_status: validData.media_rights_status,
      status: validData.status,
      curator_note: validData.curator_note || null,
      signal_labels: validData.signal_labels,
      is_featured: validData.is_featured,
      performance_evidence_note: validData.performance_evidence_note || null,
      updated_by: auth.user ? auth.user.id : null,
    };

    if (validData.first_seen_at) {
      updates.first_seen_at = new Date(validData.first_seen_at).toISOString();
    }

    // Only update last_reviewed_at if the editor intentionally reviewed/verified it
    if (validData.mark_reviewed === true) {
      updates.last_reviewed_at = new Date().toISOString();
    }

    if (auth.isLocalPreview || !auth.supabase) {
      return NextResponse.json({
        item: { ...updates, id, updated_at: new Date().toISOString() },
        success: true,
        isLocalPreview: true,
      });
    }

    const { data, error } = await auth.supabase
      .from("ad_listings")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update ad listing" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/ad-explorer?id=...&permanent=true|false
 * Default: archives the listing.
 * If permanent=true: permanently removes record with admin authorization.
 */
export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const permanent = searchParams.get("permanent") === "true";

  if (!id) {
    return NextResponse.json({ error: "Listing id is required." }, { status: 400 });
  }

  if (auth.isLocalPreview || !auth.supabase) {
    return NextResponse.json({ success: true, archived: !permanent, permanent, isLocalPreview: true });
  }

  if (permanent) {
    const { error } = await auth.supabase.from("ad_listings").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, permanent: true });
  } else {
    // Prefer archiving over deletion
    const { error } = await auth.supabase
      .from("ad_listings")
      .update({ status: "archived", updated_by: auth.user ? auth.user.id : null })
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, archived: true });
  }
}
