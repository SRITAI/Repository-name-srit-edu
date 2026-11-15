import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  SEED_SCRIPT_CATEGORIES,
  getSanitizedReferenceOptions,
} from "@/lib/data/script-library-seed";
import { ScriptReferenceOption } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/studio/script-references
 * Public/customer-facing endpoint that returns only sanitized reference styles and categories.
 * Strictly omits raw prompt guidance, example scripts, and internal admin notes.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlugOrId = searchParams.get("category");

    const supabase = await createClient();
    if (supabase) {
      // 1. Fetch active categories
      const { data: dbCategories } = await supabase
        .from("script_categories")
        .select("id, slug, name, description, icon, sort_order")
        .eq("is_active", true)
        .eq("status", "active")
        .order("sort_order", { ascending: true });

      // 2. Fetch sanitized reference options from the secure view
      let refQuery = supabase
        .from("script_reference_options")
        .select("id, category_id, title, description, suitable_platforms, suitable_tones, suitable_durations, style_tags, priority, sort_order")
        .order("priority", { ascending: false });

      if (categorySlugOrId && categorySlugOrId !== "all") {
        refQuery = refQuery.eq("category_id", categorySlugOrId);
      }

      const { data: dbRefs } = await refQuery;

      if (dbCategories && dbCategories.length > 0 && dbRefs && dbRefs.length > 0) {
        const enriched = dbRefs.map((r: any) => {
          const cat = dbCategories.find((c: any) => c.id === r.category_id);
          return {
            ...r,
            category_slug: cat?.slug,
            category_name: cat?.name,
          } as ScriptReferenceOption;
        });

        return NextResponse.json({
          categories: dbCategories,
          references: enriched,
        });
      }
    }

    // Fallback to built-in seed catalog (sanitized)
    const sanitizedRefs = getSanitizedReferenceOptions(categorySlugOrId || undefined);
    const activeCategories = SEED_SCRIPT_CATEGORIES.filter(
      (c) => c.is_active && c.status === "active"
    ).sort((a, b) => a.sort_order - b.sort_order);

    return NextResponse.json({
      categories: activeCategories.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description,
        icon: c.icon,
        sort_order: c.sort_order,
      })),
      references: sanitizedRefs,
      isLocalFallback: true,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load script references" },
      { status: 500 }
    );
  }
}
