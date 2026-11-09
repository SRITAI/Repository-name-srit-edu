"use client";

import React, { useState } from "react";
import Image from "next/image";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { SEED_REELS } from "@/lib/data/seed-data";
import { Instagram, Plus, ExternalLink, Check, Sparkles, Loader2, Trash2 } from "lucide-react";
import type { TrendingReel } from "@/lib/supabase/types";

export default function AdminReelsPage() {
  const [reels, setReels] = useState<TrendingReel[]>(SEED_REELS);
  const [url, setUrl] = useState("");
  const [categorySlug, setCategorySlug] = useState("skincare");
  const [hookType, setHookType] = useState("Before / After Transformation");
  const [creatorHandle, setCreatorHandle] = useState("");
  const [caption, setCaption] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleFetchOembed = async () => {
    if (!url.includes("instagram.com")) return;
    setFetching(true);
    try {
      const res = await fetch(`/api/admin/oembed?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.author_name) setCreatorHandle(data.author_name);
      if (data.title) setCaption(data.title.slice(0, 100));
      if (data.thumbnail_url) setThumbnailUrl(data.thumbnail_url);
    } catch (err) {
      console.warn("oEmbed fetch failed", err);
    } finally {
      setFetching(false);
    }
  };

  const handleAddReel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const newReel: TrendingReel = {
      id: `reel_${Date.now()}`,
      category_id: categorySlug,
      instagram_url: url,
      shortcode: url.split("/").filter(Boolean).pop() || "reel",
      thumbnail_url:
        thumbnailUrl ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      caption: caption || "Viral reel breakdown",
      creator_handle: creatorHandle || "@creator",
      views_label: "850K",
      is_featured: false,
      is_published: true,
      is_seed: false,
      sort_order: 1,
      created_at: new Date().toISOString(),
    };

    setReels([newReel, ...reels]);

    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.from("trending_reels").insert(newReel);
    }

    setUrl("");
    setCreatorHandle("");
    setCaption("");
    setThumbnailUrl("");
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setReels(reels.filter((r) => r.id !== id));
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.from("trending_reels").delete().eq("id", id);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 mb-1">
          <Instagram className="w-3.5 h-3.5" />
          <span>Curate Inspiration Hub</span>
        </div>
        <h1 className="text-2xl font-serif text-[#111111]">Trending Instagram Reels</h1>
        <p className="text-xs text-[#6B6B6B] mt-0.5">
          Curate organic viral reels by category to inspire brands and demonstrate our benchmark quality.
        </p>
      </div>

      {/* Add Reel Form */}
      <div className="bg-white p-6 rounded-3xl border border-black/[0.06] shadow-sm">
        <h2 className="text-sm font-semibold text-[#111111] mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Add Trending Reel</span>
        </h2>

        <form onSubmit={handleAddReel} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-[#111111] mb-1">
                Instagram Reel URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.instagram.com/reel/C3abcXYZ/"
                  className="w-full px-3.5 py-2 rounded-xl border border-black/10 focus:outline-none focus:border-black text-xs bg-neutral-50"
                />
                <button
                  type="button"
                  onClick={handleFetchOembed}
                  disabled={fetching || !url}
                  className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#111111] text-xs font-medium disabled:opacity-50 whitespace-nowrap"
                >
                  {fetching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Fetch oEmbed"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#111111] mb-1">
                Category
              </label>
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-black/10 focus:outline-none focus:border-black text-xs bg-neutral-50"
              >
                <option value="clothing-fashion">Clothing & Fashion</option>
                <option value="makeup-beauty">Makeup & Beauty</option>
                <option value="skincare">Skincare</option>
                <option value="sexual-wellness">Sexual Wellness (18+)</option>
                <option value="jewellery-accessories">Jewellery & Accessories</option>
                <option value="health-supplements">Health Supplements</option>
                <option value="food-beverage">Food & Beverage</option>
                <option value="fitness-activewear">Fitness & Activewear</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#111111] mb-1">
                Creator Handle
              </label>
              <input
                type="text"
                value={creatorHandle}
                onChange={(e) => setCreatorHandle(e.target.value)}
                placeholder="@handle"
                className="w-full px-3.5 py-2 rounded-xl border border-black/10 focus:outline-none focus:border-black text-xs bg-neutral-50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#111111] mb-1">
                Hook Type
              </label>
              <input
                type="text"
                value={hookType}
                onChange={(e) => setHookType(e.target.value)}
                placeholder="e.g. Visual Disruption / Question Hook"
                className="w-full px-3.5 py-2 rounded-xl border border-black/10 focus:outline-none focus:border-black text-xs bg-neutral-50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#111111] mb-1">
                Thumbnail Image URL
              </label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2 rounded-xl border border-black/10 focus:outline-none focus:border-black text-xs bg-neutral-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#111111] mb-1">
              Short Description / Caption Note
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Why this reel went viral..."
              className="w-full px-3.5 py-2 rounded-xl border border-black/10 focus:outline-none focus:border-black text-xs bg-neutral-50"
            />
          </div>

          <button
            type="submit"
            disabled={saving || !url}
            className="px-6 py-2.5 rounded-full bg-[#111111] text-white text-xs font-medium hover:bg-neutral-800 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving Reel..." : "Publish to Inspiration Hub"}
          </button>
        </form>
      </div>

      {/* Existing Reels List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {reels.map((reel) => (
          <div
            key={reel.id}
            className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden shadow-sm flex flex-col justify-between"
          >
            <div className="relative aspect-[9/16] bg-neutral-100 overflow-hidden">
              <img
                src={reel.thumbnail_url}
                alt={reel.caption}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-white">
                <Instagram className="w-3 h-3 text-pink-400" />
                <span>{reel.views_label || "Viral"}</span>
              </div>
              {reel.is_seed && (
                <div className="absolute top-2 right-2 bg-amber-500/90 text-white px-2 py-0.5 rounded-full text-[9px] font-semibold">
                  Sample
                </div>
              )}
            </div>

            <div className="p-3">
              <div className="text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wider">
                {(reel.category?.name || reel.category_id || "Trending").replace("-", " ")}
              </div>
              <div className="font-semibold text-xs text-[#111111] truncate mt-0.5">
                {reel.creator_handle}
              </div>
              <div className="text-[11px] text-[#6B6B6B] line-clamp-2 mt-1">
                {reel.caption}
              </div>

              <div className="mt-3 pt-2 border-t border-black/[0.04] flex items-center justify-between text-[11px]">
                <a
                  href={reel.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-neutral-600 hover:text-[#111111] flex items-center gap-1"
                >
                  <span>View</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={() => handleDelete(reel.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Remove reel"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
