import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { HomepageVideo } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

/**
 * Server-side helper to verify user session and admin database role.
 * Strictly denies admin access in production if Supabase credentials or services are unavailable.
 */
async function verifyAdminAuth() {
  const isDev = process.env.NODE_ENV === "development";
  const supabase = await createClient();

  if (!supabase) {
    if (!isDev) {
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

  const { data: profile, error: profError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profError || !profile || profile.role !== "admin") {
    return {
      authorized: false,
      status: 403,
      error: "Access denied: Administrator privileges required.",
    };
  }

  return { authorized: true, user, supabase, isLocalPreview: false };
}

/**
 * Helper to safely delete a storage file only if it is not referenced by any other record.
 */
async function safelyDeleteStorageFile(supabase: any, storagePath: string, excludeVideoId: string) {
  if (!storagePath) return;

  try {
    // 1. Check if any other homepage_video uses this storage_path
    const { data: otherVideos } = await supabase
      .from("homepage_videos")
      .select("id")
      .eq("storage_path", storagePath)
      .neq("id", excludeVideoId)
      .limit(1);

    if (otherVideos && otherVideos.length > 0) {
      // Still referenced by another video, do not delete
      return;
    }

    // 2. Check if any ad_media_item uses this storage_path in its metadata
    const { data: otherMedia } = await supabase
      .from("ad_media_items")
      .select("id")
      .contains("metadata", { storage_path: storagePath })
      .limit(1);

    if (otherMedia && otherMedia.length > 0) {
      // Still referenced by ad media library, do not delete
      return;
    }

    // Safe to delete from ad-previews bucket
    await supabase.storage.from("ad-previews").remove([storagePath]);
  } catch (err) {
    console.warn("Notice: safe storage file cleanup encountered an error:", err);
  }
}

/**
 * PATCH /api/admin/videos/[id]
 * Updates video metadata, placement, ordering, trim, status, or replaces video file safely.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing video id" }, { status: 400 });
    }

    const body = await request.json();
    const updateFields: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) updateFields.title = body.title.trim();
    if (body.caption !== undefined) updateFields.caption = body.caption?.trim() || null;
    if (body.alt_text !== undefined) updateFields.alt_text = body.alt_text?.trim() || null;
    if (body.category !== undefined) updateFields.category = body.category?.trim() || null;
    if (body.video_url !== undefined) updateFields.video_url = body.video_url.trim();
    if (body.storage_path !== undefined) updateFields.storage_path = body.storage_path || null;
    if (body.poster_url !== undefined) updateFields.poster_url = body.poster_url || null;
    if (body.placement !== undefined) updateFields.placement = body.placement;
    if (body.aspect_ratio !== undefined) updateFields.aspect_ratio = body.aspect_ratio;
    if (body.status !== undefined) updateFields.status = body.status;
    if (body.display_order !== undefined) updateFields.display_order = Number(body.display_order);
    if (body.trim_start_seconds !== undefined)
      updateFields.trim_start_seconds =
        body.trim_start_seconds === null ? null : Number(body.trim_start_seconds);
    if (body.trim_end_seconds !== undefined)
      updateFields.trim_end_seconds =
        body.trim_end_seconds === null ? null : Number(body.trim_end_seconds);

    // Validate trim range if both are present
    if (
      updateFields.trim_start_seconds !== undefined &&
      updateFields.trim_end_seconds !== undefined &&
      updateFields.trim_start_seconds !== null &&
      updateFields.trim_end_seconds !== null &&
      updateFields.trim_start_seconds >= updateFields.trim_end_seconds
    ) {
      return NextResponse.json(
        { error: "Playback start time must be less than end time." },
        { status: 400 }
      );
    }

    if (auth.supabase) {
      // If replacing the file, check if previous storage_path should be cleaned up
      let oldStoragePath: string | null = null;
      if (body.storage_path !== undefined) {
        const { data: existing } = await auth.supabase
          .from("homepage_videos")
          .select("storage_path")
          .eq("id", id)
          .single();
        oldStoragePath = existing?.storage_path || null;
      }

      const { data, error } = await auth.supabase
        .from("homepage_videos")
        .update(updateFields)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // If storage path changed, clean up the old file safely
      if (oldStoragePath && oldStoragePath !== updateFields.storage_path) {
        await safelyDeleteStorageFile(auth.supabase, oldStoragePath, id);
      }

      return NextResponse.json({ video: data, success: true });
    }

    // Local preview fallback
    return NextResponse.json({
      video: { id, ...updateFields },
      success: true,
      isLocalPreview: true,
    });
  } catch (err: any) {
    console.error("Error in PATCH /api/admin/videos/[id]:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/videos/[id]
 * Deletes a video record and cleans up stored file safely if not in use elsewhere.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing video id" }, { status: 400 });
    }

    if (auth.supabase) {
      // Fetch record to check storage_path before deletion
      const { data: existing } = await auth.supabase
        .from("homepage_videos")
        .select("storage_path")
        .eq("id", id)
        .single();

      const { error } = await auth.supabase.from("homepage_videos").delete().eq("id", id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // Safe cleanup of storage asset
      if (existing?.storage_path) {
        await safelyDeleteStorageFile(auth.supabase, existing.storage_path, id);
      }

      return NextResponse.json({ success: true, deletedId: id });
    }

    return NextResponse.json({ success: true, deletedId: id, isLocalPreview: true });
  } catch (err: any) {
    console.error("Error in DELETE /api/admin/videos/[id]:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
