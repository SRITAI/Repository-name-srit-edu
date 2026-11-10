import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { INITIAL_AD_CATEGORIES } from "@/lib/data/ad-explorer-seed";
import { SEED_CATEGORIES } from "@/lib/data/seed-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    if (supabase) {
      let { data, error } = await supabase
        .from("ad_categories")
        .select("id, slug, name, description, icon, sort_order, is_active")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error || !data || data.length === 0) {
        const fallbackRes = await supabase
          .from("categories")
          .select("id, slug, name, description, icon, sort_order, is_active, is_adult")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });
        data = fallbackRes.data;
        error = fallbackRes.error;
      }

      if (!error && data && data.length > 0) {
        return NextResponse.json({ categories: data });
      }
    }
  } catch {}

  // Fallback to initial database categories
  const fallback = [
    {
      id: "cat-ayurvedic-01",
      slug: "health-ayurvedic",
      name: "Health & Ayurvedic Products",
      description: "Ayurvedic supplements, herbal wellness, digestion & immunity brands (e.g. Kapiva)",
      sort_order: 1,
      is_active: true,
      is_adult: false,
    },
    {
      id: "cat-makeup-02",
      slug: "makeup-skincare-reels",
      name: "Makeup & Skincare Reels",
      description: "Cosmetics, lip shades, skincare routines, sunscreen tests & beauty unboxings",
      sort_order: 2,
      is_active: true,
      is_adult: false,
    },
    {
      id: "cat-clothing-03",
      slug: "clothing-fashion",
      name: "Clothing & Fashion",
      description: "Streetwear, ethnic apparel, candid try-on hauls & lifestyle fashion videos",
      sort_order: 3,
      is_active: true,
      is_adult: false,
    },
    ...SEED_CATEGORIES.filter(
      (c) => !["clothing-fashion", "health-ayurvedic", "makeup-skincare-reels"].includes(c.slug)
    ).map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      sort_order: c.sort_order,
      is_active: c.is_active,
      is_adult: c.is_adult,
    })),
  ];

  return NextResponse.json({ categories: fallback });
}
