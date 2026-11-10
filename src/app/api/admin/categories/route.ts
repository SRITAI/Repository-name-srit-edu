import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CategorySchema } from "@/lib/validation/ad-listing";
import { INITIAL_AD_CATEGORIES } from "@/lib/data/ad-explorer-seed";
import { SEED_CATEGORIES } from "@/lib/data/seed-data";
import { Category } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

/**
 * Server-side helper to verify user session and admin database role
 */
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
      error: "Access denied: Administrator privileges required to manage categories.",
    };
  }

  return { authorized: true, user, supabase, isLocalPreview: false };
}

// In-memory mock store for local preview
let localCategories: Category[] = [
  {
    id: "cat-ayurvedic-01",
    slug: "health-ayurvedic",
    name: "Health & Ayurvedic Products",
    description: "Ayurvedic supplements, herbal wellness, digestion & immunity brands (e.g. Kapiva)",
    icon: "Leaf",
    accent_color: "#10B981",
    keywords: ["ayurveda", "kapiva", "shilajit", "herbal", "wellness", "immunity"],
    insights_md: null,
    is_adult: false,
    is_active: true,
    sort_order: 1,
  },
  {
    id: "cat-makeup-02",
    slug: "makeup-skincare-reels",
    name: "Makeup & Skincare Reels",
    description: "Cosmetics, lip shades, skincare routines, sunscreen tests & beauty unboxings",
    icon: "Sparkles",
    accent_color: "#EC4899",
    keywords: ["makeup", "skincare", "beauty", "lipstick", "sunscreen", "glow"],
    insights_md: null,
    is_adult: false,
    is_active: true,
    sort_order: 2,
  },
  {
    id: "cat-clothing-03",
    slug: "clothing-fashion",
    name: "Clothing & Fashion",
    description: "Streetwear, ethnic apparel, candid try-on hauls & lifestyle fashion videos",
    icon: "Shirt",
    accent_color: "#F97316",
    keywords: ["clothing", "fashion", "streetwear", "apparel", "tryon", "haul"],
    insights_md: null,
    is_adult: false,
    is_active: true,
    sort_order: 3,
  },
  ...SEED_CATEGORIES.filter(
    (c) => !["clothing-fashion", "health-ayurvedic", "makeup-skincare-reels"].includes(c.slug)
  ),
];

/**
 * GET /api/admin/categories
 * Returns all categories (active and inactive) ordered by sort_order
 */
export async function GET(request: NextRequest) {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (auth.isLocalPreview || !auth.supabase) {
    return NextResponse.json({
      categories: localCategories.sort((a, b) => a.sort_order - b.sort_order),
      isLocalPreview: true,
    });
  }

  // Query isolated ad_categories table first, fallback to categories
  let { data, error } = await auth.supabase
    .from("ad_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    const fallbackRes = await auth.supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    data = fallbackRes.data;
    error = fallbackRes.error;
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ categories: data || [] });
}

/**
 * POST /api/admin/categories
 * Add a new category
 */
export async function POST(request: NextRequest) {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const json = await request.json();
    const validation = CategorySchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, slug, description, icon, sort_order, is_active, is_adult } = validation.data;

    if (auth.isLocalPreview || !auth.supabase) {
      const newCat: Category = {
        id: `cat_local_${Date.now()}`,
        name,
        slug,
        description: description || null,
        icon: icon || "Tag",
        accent_color: "#C8FF00",
        keywords: [slug, name.toLowerCase()],
        insights_md: null,
        sort_order: sort_order || localCategories.length + 1,
        is_active: is_active ?? true,
        is_adult: is_adult ?? false,
      };
      localCategories.push(newCat);
      return NextResponse.json({ category: newCat, success: true, isLocalPreview: true });
    }

    let { data, error } = await auth.supabase
      .from("ad_categories")
      .insert({
        name,
        slug,
        description: description || null,
        icon: icon || "Tag",
        sort_order: sort_order || 0,
        is_active: is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      const fallbackRes = await auth.supabase
        .from("categories")
        .insert({
          name,
          slug,
          description: description || null,
          icon: icon || "Tag",
          sort_order: sort_order || 0,
          is_active: is_active ?? true,
          is_adult: is_adult ?? false,
        })
        .select()
        .single();
      data = fallbackRes.data;
      error = fallbackRes.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ category: data, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create category" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/categories
 * Update, rename, reorder, or toggle active/inactive status
 */
export async function PUT(request: NextRequest) {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const json = await request.json();
    const { id, name, slug, description, icon, sort_order, is_active, is_adult } = json;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug;
    if (description !== undefined) updates.description = description;
    if (icon !== undefined) updates.icon = icon;
    if (sort_order !== undefined) updates.sort_order = Number(sort_order);
    if (is_active !== undefined) updates.is_active = Boolean(is_active);
    if (is_adult !== undefined) updates.is_adult = Boolean(is_adult);

    if (auth.isLocalPreview || !auth.supabase) {
      localCategories = localCategories.map((c) => (c.id === id ? { ...c, ...updates } : c));
      return NextResponse.json({ success: true, isLocalPreview: true });
    }

    let { data, error } = await auth.supabase
      .from("ad_categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      const fallbackRes = await auth.supabase
        .from("categories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      data = fallbackRes.data;
      error = fallbackRes.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ category: data, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update category" }, { status: 500 });
  }
}
