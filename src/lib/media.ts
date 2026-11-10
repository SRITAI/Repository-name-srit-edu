export interface MediaItem {
  id: string;
  title: string;
  category: string;
  categorySlug: string;
  handle: string;
  views: string;
  duration?: string;
  aspectRatio: "9:16" | "4:5" | "1:1";
  videoSrc?: string;
  posterSrc: string;
  isSeed?: boolean;
  platform?: "instagram" | "meta" | "tiktok";
}

// Polished placeholder posters using cinematic dark gradients + geometric film accents
export const MEDIA_ITEMS: MediaItem[] = [
  {
    id: "media-1",
    title: "Zero-White Cast Sunscreen Wear Test under Natural UV Light",
    category: "Skincare",
    categorySlug: "skincare",
    handle: "@dermadiaries",
    views: "3.1M",
    duration: "15s",
    aspectRatio: "9:16",
    videoSrc: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    posterSrc: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=720&q=80",
    isSeed: true,
    platform: "instagram",
  },
  {
    id: "media-2",
    title: "Oversized Linen Blazer: 4 Styling Transitions on the Beat",
    category: "Clothing & Fashion",
    categorySlug: "clothing-fashion",
    handle: "@tarastyle_official",
    views: "2.8M",
    duration: "30s",
    aspectRatio: "9:16",
    videoSrc: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    posterSrc: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=720&q=80",
    isSeed: true,
    platform: "instagram",
  },
  {
    id: "media-3",
    title: "12-Hour Transfer-Proof Velvet Lipstick Smudge Challenge",
    category: "Makeup & Beauty",
    categorySlug: "makeup-beauty",
    handle: "@ananya.glam",
    views: "4.2M",
    duration: "15s",
    aspectRatio: "9:16",
    videoSrc: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    posterSrc: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=720&q=80",
    isSeed: true,
    platform: "instagram",
  },
  {
    id: "media-4",
    title: "Tasteful Intimate Body Oil Routine: Hydration & Texture",
    category: "Sexual Wellness",
    categorySlug: "sexual-wellness",
    handle: "@lumiere.intimate",
    views: "1.7M",
    duration: "30s",
    aspectRatio: "9:16",
    videoSrc: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    posterSrc: "https://images.unsplash.com/photo-1512290900672-1f55a120539c?auto=format&fit=crop&w=720&q=80",
    isSeed: true,
    platform: "instagram",
  },
  {
    id: "media-5",
    title: "Plant Protein vs Whey Shake Blindfolded Taste Test",
    category: "Health Supplements",
    categorySlug: "health-supplements",
    handle: "@fitnesswithsid",
    views: "1.9M",
    duration: "30s",
    aspectRatio: "9:16",
    videoSrc: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    posterSrc: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=720&q=80",
    isSeed: true,
    platform: "instagram",
  },
  {
    id: "media-6",
    title: "Waterproof Solid Gold Minimalist Ring 30-Day Shower Test",
    category: "Jewellery & Accessories",
    categorySlug: "jewellery-accessories",
    handle: "@aurelia_gems",
    views: "1.3M",
    duration: "15s",
    aspectRatio: "9:16",
    videoSrc: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    posterSrc: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=720&q=80",
    isSeed: true,
    platform: "instagram",
  },
];
