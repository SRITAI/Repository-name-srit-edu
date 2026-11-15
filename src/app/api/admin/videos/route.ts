import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SEED_HOMEPAGE_VIDEOS } from "@/lib/data/homepage-videos-seed";
import { HomepageVideo, VideoPlacement, VideoStatus } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

/**
 * Server-side helper to verify user session and admin database role.
 * Strictly denies admin access in production if Supabase credentials or services are unavailable.
 */
async function verifyAdminAuth(allowDevPreview = false) {
  const isDev = process.env.NODE_ENV === "development";
  const supabase = await createClient();

  if (!supabase) {
    if (!isDev || !allowDevPreview) {
      return {
        authorized: false,
        status: 503,
        error: "Supabase service configuration unavailable. Admin access denied in production.",
      };
    }
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
      error: "Access denied: Administrator privileges required to manage video library.",
    };
  }

  return { authorized: true, user, supabase, isLocalPreview: false };
}

/**
 * GET /api/admin/videos
 * Returns all video records for administrative management (including drafts & archived).
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(true);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const placement = searchParams.get("placement");
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.toLowerCase().trim();

    if (auth.supabase) {
      let query = auth.supabase
        .from("homepage_videos")
        .select("*")
        .order("placement", { ascending: true })
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (placement && placement !== "all") {
        query = query.eq("placement", placement);
      }
      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (!error && data) {
        let results = data as HomepageVideo[];
        if (search) {
          results = results.filter(
            (v) =>
              v.title.toLowerCase().includes(search) ||
              v.caption?.toLowerCase().includes(search) ||
              v.category?.toLowerCase().includes(search)
          );
        }
        return NextResponse.json({ videos: results, isLocalPreview: false });
      }
    }

    // Local / development fallback (only reached in dev if Supabase table is not yet migrated)
    let results = [...SEED_HOMEPAGE_VIDEOS];
    if (placement && placement !== "all") {
      results = results.filter((v) => v.placement === placement);
    }
    if (status && status !== "all") {
      results = results.filter((v) => v.status === status);
    }
    if (search) {
      results = results.filter(
        (v) =>
          v.title.toLowerCase().includes(search) ||
          v.caption?.toLowerCase().includes(search) ||
          v.category?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      videos: results,
      isLocalPreview: true,
      notice: "Showing preview videos (Supabase table offline or empty)",
    });
  } catch (err: any) {
    console.error("Error in GET /api/admin/videos:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/admin/videos
 * Creates a new video record with server-side validation.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(false);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();

    // Validation
    const title = (body.title || "").trim();
    const video_url = (body.video_url || "").trim();
    const placement = body.placement as VideoPlacement;
    const aspect_ratio = body.aspect_ratio === "16:9" ? "16:9" : "9:16";
    const status = (body.status || "published") as VideoStatus;
    const caption = body.caption?.trim() || null;
    const alt_text = body.alt_text?.trim() || null;
    const category = body.category?.trim() || "Creative";
    const storage_path = body.storage_path?.trim() || null;
    const poster_url = body.poster_url?.trim() || null;
    const trim_start_seconds =
      typeof body.trim_start_seconds === "number" ? body.trim_start_seconds : null;
    const trim_end_seconds =
      typeof body.trim_end_seconds === "number" ? body.trim_end_seconds : null;
    const display_order = typeof body.display_order === "number" ? body.display_order : 1;

    if (!title) {
      return NextResponse.json({ error: "Video title is required." }, { status: 400 });
    }
    if (!video_url) {
      return NextResponse.json({ error: "Video URL or an uploaded storage file is required." }, { status: 400 });
    }

    const validPlacements: VideoPlacement[] = [
      "hero_drift_top",
      "hero_drift_bottom",
      "trending_rail",
      "curated_feature",
    ];
    if (!validPlacements.includes(placement)) {
      return NextResponse.json(
        { error: `Invalid placement. Must be one of: ${validPlacements.join(", ")}` },
        { status: 400 }
      );
    }

    const validStatuses: VideoStatus[] = ["draft", "published", "archived"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    if (
      trim_start_seconds !== null &&
      trim_end_seconds !== null &&
      trim_start_seconds >= trim_end_seconds
    ) {
      return NextResponse.json(
        { error: "Playback start time must be less than end time." },
        { status: 400 }
      );
    }

    const newVideoRecord: Partial<HomepageVideo> = {
      title,
      caption,
      alt_text,
      category,
      video_url,
      storage_path,
      poster_url,
      placement,
      aspect_ratio,
      trim_start_seconds,
      trim_end_seconds,
      display_order,
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (auth.supabase) {
      const { data, error } = await auth.supabase
        .from("homepage_videos")
        .insert(newVideoRecord)
        .select()
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ video: data, success: true });
    }

    // Local development fallback
    const mockCreated: HomepageVideo = {
      id: `hp-vid-${Date.now()}`,
      ...(newVideoRecord as any),
    };

    return NextResponse.json({ video: mockCreated, success: true, isLocalPreview: true });
  } catch (err: any) {
    console.error("Error in POST /api/admin/videos:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
