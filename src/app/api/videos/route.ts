import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SEED_HOMEPAGE_VIDEOS } from "@/lib/data/homepage-videos-seed";
import { HomepageVideo } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

/**
 * Public endpoint to fetch published homepage and showcase videos.
 * Supports filtering by placement (hero_drift_top, hero_drift_bottom, trending_rail, curated_feature).
 * Falls back to curated seed videos if database table is unavailable.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get("placement");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

    const supabase = await createClient();

    if (supabase) {
      let query = supabase
        .from("homepage_videos")
        .select("*")
        .eq("status", "published")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(limit);

      if (placement) {
        query = query.eq("placement", placement);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return NextResponse.json(
          {
            videos: data as HomepageVideo[],
            source: "database",
            total: data.length,
          },
          {
            headers: {
              "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
            },
          }
        );
      }
    }

    // Fallback to seed data
    let fallback = SEED_HOMEPAGE_VIDEOS.filter((v) => v.status === "published");
    if (placement) {
      fallback = fallback.filter((v) => v.placement === placement);
    }
    fallback.sort((a, b) => a.display_order - b.display_order);

    return NextResponse.json(
      {
        videos: fallback.slice(0, limit),
        source: "seed",
        total: fallback.length,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      }
    );
  } catch (err: any) {
    console.error("Error in GET /api/videos:", err);
    return NextResponse.json(
      {
        videos: SEED_HOMEPAGE_VIDEOS.filter((v) => v.status === "published"),
        source: "fallback",
        error: err?.message,
      },
      { status: 200 }
    );
  }
}
