import { z } from "zod";

/**
 * Detects whether a URL points to the Meta Ad Library transparency portal
 * instead of an embeddable/playable video file.
 */
export function isMetaAdLibraryUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const trimmed = url.trim();
    if (!trimmed.startsWith("https://") && !trimmed.startsWith("http://")) return false;
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    const isMetaHost =
      host === "facebook.com" ||
      host === "www.facebook.com" ||
      host === "fb.com" ||
      host === "www.fb.com" ||
      host === "web.facebook.com";
    return isMetaHost && parsed.pathname.toLowerCase().includes("/ads/library");
  } catch {
    return false;
  }
}

export const AdMediaItemSchema = z.object({
  id: z.string().optional(),
  ad_listing_id: z.string().optional(),
  media_type: z.enum(["embed", "hosted_video", "image", "source_link"], {
    error: "Media type must be embed, hosted_video, image, or source_link.",
  }),
  media_url: z
    .string({ error: "Media URL is required." })
    .trim()
    .min(1, "Media URL cannot be empty.")
    .url("Media URL must be a valid URL.")
    .refine((val) => val.startsWith("https://"), {
      message: "Media URL must use secure HTTPS protocol.",
    }),
  thumbnail_url: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((val) => !val || val === "" || (val.startsWith("https://") && z.string().url().safeParse(val).success), {
      message: "Thumbnail URL must be a valid HTTPS URL.",
    }),
  caption: z.string().trim().max(300).optional().nullable(),
  display_order: z.number().int().default(0),
  metadata: z.record(z.string(), z.any()).optional().default({}),
});

export type AdMediaItemFormData = z.infer<typeof AdMediaItemSchema>;

export const AdListingSchema = z.object({
  platform: z.enum(["meta", "google", "linkedin", "tiktok", "x", "amazon"], {
    error: "Platform must be one of Meta, Google, LinkedIn, TikTok, X, or Amazon.",
  }),
  platform_surface: z.string().trim().max(100).optional().nullable(),
  brand_name: z
    .string({ error: "Brand name is required." })
    .trim()
    .min(1, "Brand name cannot be empty.")
    .max(120, "Brand name too long (max 120 chars)."),
  advertiser_name: z.string().trim().max(150).optional().nullable(),
  title: z
    .string({ error: "Headline/Title is required." })
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(255, "Title too long (max 255 chars)."),
  short_description: z.string().trim().max(2000).optional().nullable(),
  hook_summary: z.string().trim().max(500).optional().nullable(),
  call_to_action: z.string().trim().max(100).optional().nullable(),
  category: z
    .string({ error: "Category is required." })
    .trim()
    .min(1, "Please select a category."),
  country_code: z
    .string({ error: "Target market/country is required." })
    .trim()
    .min(2, "Country code must be at least 2 characters.")
    .max(10)
    .toUpperCase(),
  creative_format: z.enum(["video", "image", "carousel", "text", "other"], {
    error: "Creative format must be video, image, carousel, text, or other.",
  }),
  source_url: z
    .string({ error: "Official source / ad library URL is required." })
    .trim()
    .url("Source URL must be a valid URL.")
    .refine((val) => val.startsWith("https://"), {
      message: "Source URL must use secure HTTPS protocol.",
    }),
  media_url: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((val) => !val || val === "" || (val.startsWith("https://") && z.string().url().safeParse(val).success), {
      message: "Media URL must be a valid secure HTTPS URL (e.g. YouTube, Vimeo, MP4).",
    }),
  source_ad_id: z.string().trim().max(100).optional().nullable(),
  preview_image_path: z.string().trim().optional().nullable(),
  product_url: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((val) => !val || val === "" || (val.startsWith("https://") && z.string().url().safeParse(val).success), {
      message: "Product URL must be a valid secure HTTPS URL.",
    }),
  landing_page_url: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((val) => !val || val === "" || (val.startsWith("https://") && z.string().url().safeParse(val).success), {
      message: "Landing page / Storefront URL must be a valid secure HTTPS URL.",
    }),
  asin: z.string().trim().max(20).optional().nullable(),
  amazon_ad_type: z.string().trim().max(100).optional().nullable(),
  search_term: z.string().trim().max(200).optional().nullable(),
  marketplace: z.string().trim().max(100).optional().nullable(),
  media_rights_status: z.enum(
    ["platform_link_only", "licensed", "fair_use_editorial", "client_authorized"],
    {
      error: "Media rights status must be a valid classification.",
    }
  ),
  status: z.enum(["draft", "review", "published", "archived"], {
    error: "Status must be draft, review, published, or archived.",
  }),
  is_featured: z.boolean().default(false),
  curator_note: z.string().trim().max(2000).optional().nullable(),
  signal_labels: z.array(z.string()).default([]),
  performance_evidence_note: z.string().trim().max(1000).optional().nullable(),
  first_seen_at: z.string().trim().optional().nullable(),
  mark_reviewed: z.boolean().optional(),
  media_items: z.array(AdMediaItemSchema).optional().default([]),
});

export type AdListingFormData = z.infer<typeof AdListingSchema>;

export const CategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Category name must be at least 2 characters.").max(100),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters.")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase alphanumeric characters and hyphens."),
  description: z.string().trim().max(500).optional().nullable(),
  icon: z.string().trim().max(50).optional().nullable(),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
  is_adult: z.boolean().default(false),
});

export type CategoryFormData = z.infer<typeof CategorySchema>;
