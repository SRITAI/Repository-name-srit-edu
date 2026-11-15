import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SEED_SCRIPT_REFERENCES, SEED_SCRIPT_CATEGORIES } from "@/lib/data/script-library-seed";
import { ScriptReference } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

let localReferences: ScriptReference[] = [...SEED_SCRIPT_REFERENCES];

async function verifyAdminAuth() {
  const supabase = await createClient();
  if (!supabase) {
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
      error: "Access denied: Administrator privileges required to manage script references.",
    };
  }

  return { authorized: true, user, supabase, isLocalPreview: false };
}

/**
 * GET /api/admin/script-library/references
 * Returns all references with category metadata (admin-only, includes prompt_guidance)
 */
export async function GET(request: NextRequest) {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("category_id");
  const status = searchParams.get("status");
  const query = searchParams.get("q")?.toLowerCase();

  const adminClient = createAdminClient();
  if (adminClient && !auth.isLocalPreview) {
    let q = adminClient
      .from("script_references")
      .select("*, category:script_categories(*)")
      .order("priority", { ascending: false });

    if (categoryId && categoryId !== "all") {
      q = q.eq("category_id", categoryId);
    }
    if (status && status !== "all") {
      q = q.eq("status", status);
    }

    const { data, error } = await q;

    if (!error && data && data.length > 0) {
      let filtered = data;
      if (query) {
        filtered = filtered.filter(
          (r: any) =>
            r.title.toLowerCase().includes(query) ||
            r.description.toLowerCase().includes(query) ||
            (r.style_tags || []).some((t: string) => t.toLowerCase().includes(query))
        );
      }
      return NextResponse.json({ references: filtered });
    }
  }

  // Fallback to local in-memory
  let filtered = [...localReferences];
  if (categoryId && categoryId !== "all") {
    filtered = filtered.filter((r) => r.category_id === categoryId);
  }
  if (status && status !== "all") {
    filtered = filtered.filter((r) => r.status === status);
  }
  if (query) {
    filtered = filtered.filter(
      (r) =>
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.style_tags.some((t) => t.toLowerCase().includes(query))
    );
  }

  // Attach category object
  const withCategory = filtered.map((r) => ({
    ...r,
    category: SEED_SCRIPT_CATEGORIES.find((c) => c.id === r.category_id),
  }));

  withCategory.sort((a, b) => b.priority - a.priority);

  return NextResponse.json({ references: withCategory, isLocalFallback: true });
}

/**
 * POST /api/admin/script-library/references
 * Create new script reference
 */
export async function POST(request: NextRequest) {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const {
      title,
      category_id,
      description,
      prompt_guidance,
      example_script = null,
      suitable_platforms = ["Instagram Reels", "TikTok", "Meta Ads"],
      suitable_tones = ["Bold", "Relatable"],
      suitable_durations = [30],
      style_tags = ["UGC"],
      priority = 0,
      sort_order = 0,
      is_active = true,
      status = "active",
    } = body;

    if (!title?.trim() || !category_id || !prompt_guidance?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: "Title, category, description, and prompt guidance are required" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();
    if (adminClient && !auth.isLocalPreview) {
      const { data, error } = await adminClient
        .from("script_references")
        .insert({
          title: title.trim(),
          category_id,
          description: description.trim(),
          prompt_guidance: prompt_guidance.trim(),
          example_script: example_script?.trim() || null,
          suitable_platforms,
          suitable_tones,
          suitable_durations,
          style_tags,
          priority: Number(priority) || 0,
          sort_order: Number(sort_order) || 0,
          is_active: Boolean(is_active),
          status,
          created_by: auth.user?.id || null,
          updated_by: auth.user?.id || null,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ reference: data, success: true });
    }

    // Local in-memory creation
    const newRef: ScriptReference = {
      id: "ref-" + Date.now(),
      title: title.trim(),
      category_id,
      description: description.trim(),
      prompt_guidance: prompt_guidance.trim(),
      example_script: example_script?.trim() || null,
      suitable_platforms,
      suitable_tones,
      suitable_durations,
      style_tags,
      priority: Number(priority) || 0,
      sort_order: Number(sort_order) || 0,
      is_active: Boolean(is_active),
      status,
      created_by: auth.user?.id || null,
      updated_by: auth.user?.id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localReferences.push(newRef);
    return NextResponse.json({ reference: newRef, success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create reference" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/script-library/references
 * Update an existing reference
 */
export async function PUT(request: NextRequest) {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Reference ID is required" }, { status: 400 });
    }

    const adminClient = createAdminClient();
    if (adminClient && !auth.isLocalPreview) {
      const payload: any = { ...updates, updated_at: new Date().toISOString() };
      if (auth.user?.id) payload.updated_by = auth.user.id;

      const { data, error } = await adminClient
        .from("script_references")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ reference: data, success: true });
    }

    // Local in-memory update
    const idx = localReferences.findIndex((r) => r.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Reference not found" }, { status: 404 });
    }

    localReferences[idx] = {
      ...localReferences[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({ reference: localReferences[idx], success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update reference" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/script-library/references
 * Archive reference (soft delete)
 */
export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Reference ID is required" }, { status: 400 });
  }

  const adminClient = createAdminClient();
  if (adminClient && !auth.isLocalPreview) {
    const { error } = await adminClient
      .from("script_references")
      .update({ is_active: false, status: "archived", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, archivedId: id });
  }

  localReferences = localReferences.map((r) =>
    r.id === id ? { ...r, is_active: false, status: "archived", updated_at: new Date().toISOString() } : r
  );

  return NextResponse.json({ success: true, archivedId: id });
}
