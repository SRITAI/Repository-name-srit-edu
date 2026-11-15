import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SEED_SCRIPT_CATEGORIES } from "@/lib/data/script-library-seed";
import { ScriptCategory } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

// In-memory store for local preview / offline database fallback
let localCategories: ScriptCategory[] = [...SEED_SCRIPT_CATEGORIES];

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
      error: "Access denied: Administrator privileges required to manage script categories.",
    };
  }

  return { authorized: true, user, supabase, isLocalPreview: false };
}

/**
 * GET /api/admin/script-library/categories
 * Returns all script categories ordered by sort_order
 */
export async function GET(request: NextRequest) {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const adminClient = createAdminClient();
  if (adminClient && !auth.isLocalPreview) {
    const { data, error } = await adminClient
      .from("script_categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (!error && data && data.length > 0) {
      return NextResponse.json({ categories: data });
    }
  }

  // Return local in-memory fallback
  const sorted = [...localCategories].sort((a, b) => a.sort_order - b.sort_order);
  return NextResponse.json({ categories: sorted, isLocalFallback: true });
}

/**
 * POST /api/admin/script-library/categories
 * Create a new script category
 */
export async function POST(request: NextRequest) {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { name, slug, description, icon = "Sparkles", sort_order = 0, is_active = true } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Category name and slug are required" },
        { status: 400 }
      );
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9_-]/g, "-");

    const adminClient = createAdminClient();
    if (adminClient && !auth.isLocalPreview) {
      const { data, error } = await adminClient
        .from("script_categories")
        .insert({
          name: name.trim(),
          slug: cleanSlug,
          description: description?.trim() || null,
          icon: icon || "Sparkles",
          sort_order: Number(sort_order) || 0,
          is_active: Boolean(is_active),
          status: is_active ? "active" : "archived",
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ category: data, success: true });
    }

    // Local in-memory creation
    const newCategory: ScriptCategory = {
      id: "cat-" + Date.now(),
      name: name.trim(),
      slug: cleanSlug,
      description: description?.trim() || null,
      icon: icon || "Sparkles",
      sort_order: Number(sort_order) || localCategories.length + 1,
      is_active: Boolean(is_active),
      status: is_active ? "active" : "archived",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localCategories.push(newCategory);
    return NextResponse.json({ category: newCategory, success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create category" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/script-library/categories
 * Update an existing script category or reorder
 */
export async function PUT(request: NextRequest) {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { id, name, slug, description, icon, sort_order, is_active, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const adminClient = createAdminClient();
    if (adminClient && !auth.isLocalPreview) {
      const updates: any = {};
      if (name !== undefined) updates.name = name.trim();
      if (slug !== undefined) updates.slug = slug.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
      if (description !== undefined) updates.description = description;
      if (icon !== undefined) updates.icon = icon;
      if (sort_order !== undefined) updates.sort_order = Number(sort_order);
      if (is_active !== undefined) updates.is_active = Boolean(is_active);
      if (status !== undefined) updates.status = status;
      updates.updated_at = new Date().toISOString();

      const { data, error } = await adminClient
        .from("script_categories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ category: data, success: true });
    }

    // Local in-memory update
    const idx = localCategories.findIndex((c) => c.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    localCategories[idx] = {
      ...localCategories[idx],
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(slug !== undefined ? { slug: slug.toLowerCase() } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(icon !== undefined ? { icon } : {}),
      ...(sort_order !== undefined ? { sort_order: Number(sort_order) } : {}),
      ...(is_active !== undefined ? { is_active: Boolean(is_active) } : {}),
      ...(status !== undefined ? { status } : {}),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({ category: localCategories[idx], success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update category" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/script-library/categories
 * Archive category (soft-archive)
 */
export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
  }

  const adminClient = createAdminClient();
  if (adminClient && !auth.isLocalPreview) {
    const { error } = await adminClient
      .from("script_categories")
      .update({ is_active: false, status: "archived", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, archivedId: id });
  }

  localCategories = localCategories.map((c) =>
    c.id === id ? { ...c, is_active: false, status: "archived", updated_at: new Date().toISOString() } : c
  );

  return NextResponse.json({ success: true, archivedId: id });
}
