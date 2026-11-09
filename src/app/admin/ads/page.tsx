"use client";

import React, { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { SEED_ADS } from "@/lib/data/seed-data";
import { Film, Plus, ExternalLink, Check, Trash2, Sparkles } from "lucide-react";
import type { FamousAd } from "@/lib/supabase/types";

export default function AdminAdsPage() {
  const [ads, setAds] = useState<FamousAd[]>(SEED_ADS);
  const [brandName, setBrandName] = useState("");
  const [title, setTitle] = useState("");
  const [categorySlug, setCategorySlug] = useState("skincare");
  const [format, setFormat] = useState("9:16");
  const [metaAdUrl, setMetaAdUrl] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [whyItWorksText, setWhyItWorksText] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAddAd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const bullets = whyItWorksText
      ? whyItWorksText.split("\n").filter((b) => b.trim().length > 0)
      : ["Strong 2-second visual disruption", "Real person testimonial", "Clear offer before second 15"];

    const newAd: FamousAd = {
      id: `ad_${Date.now()}`,
      brand_name: brandName,
      title: title || `${brandName} Ad Benchmark`,
      category_id: categorySlug,
      platform: "Meta Ads / Instagram Reels",
      format,
      source_url:
        metaAdUrl ||
        `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&q=${encodeURIComponent(
          brandName
        )}`,
      thumbnail_url:
        posterUrl ||
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
      hook_type: "Problem-Agitate",
      why_it_works: bullets,
      cta_style: "Shop Now ↗",
      region: "Global",
      is_published: true,
      is_seed: false,
      sort_order: 1,
      created_at: new Date().toISOString(),
    };

    setAds([newAd, ...ads]);

    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.from("famous_ads").insert(newAd);
    }

    setBrandName("");
    setTitle("");
    setMetaAdUrl("");
    setPosterUrl("");
    setWhyItWorksText("");
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setAds(ads.filter((a) => a.id !== id));
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.from("famous_ads").delete().eq("id", id);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
          <Film className="w-3.5 h-3.5" />
          <span>Meta Benchmark Ads</span>
        </div>
        <h1 className="text-2xl font-serif text-[#111111]">Curate Famous Ads</h1>
        <p className="text-xs text-[#6B6B6B] mt-0.5">
          Benchmark ads demonstrate high-converting creative patterns and link out to the Meta Ad Library.
        </p>
      </div>

      {/* Add Form */}
      <div className="bg-white p-6 rounded-3xl border border-black/[0.06] shadow-sm">
        <h2 className="text-sm font-semibold text-[#111111] mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Add Benchmark Ad</span>
        </h2>

        <form onSubmit={handleAddAd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#111111] mb-1">
                Brand Name
              </label>
              <input
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Glossier"
                className="w-full px-3.5 py-2 rounded-xl border border-black/10 focus:outline-none focus:border-black text-xs bg-neutral-50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#111111] mb-1">
                Ad Title / Angle
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 3-step morning glow routine"
                className="w-full px-3.5 py-2 rounded-xl border border-black/10 focus:outline-none focus:border-black text-xs bg-neutral-50"
              />
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
                <option value="skincare">Skincare</option>
                <option value="clothing-fashion">Clothing & Fashion</option>
                <option value="makeup-beauty">Makeup & Beauty</option>
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
                Meta Ad Library Link
              </label>
              <input
                type="url"
                value={metaAdUrl}
                onChange={(e) => setMetaAdUrl(e.target.value)}
                placeholder="https://www.facebook.com/ads/library/?..."
                className="w-full px-3.5 py-2 rounded-xl border border-black/10 focus:outline-none focus:border-black text-xs bg-neutral-50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#111111] mb-1">
                Poster Image URL
              </label>
              <input
                type="url"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2 rounded-xl border border-black/10 focus:outline-none focus:border-black text-xs bg-neutral-50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#111111] mb-1">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-black/10 focus:outline-none focus:border-black text-xs bg-neutral-50"
              >
                <option value="9:16">Vertical 9:16 (Reels/Stories)</option>
                <option value="4:5">Feed 4:5 (In-feed)</option>
                <option value="1:1">Square 1:1</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#111111] mb-1">
              "Why it works" Bullet Points (One per line)
            </label>
            <textarea
              rows={3}
              value={whyItWorksText}
              onChange={(e) => setWhyItWorksText(e.target.value)}
              placeholder="First 3 seconds hook without intro&#10;Macro texture shot builds tactile craving&#10;Direct contrast against competitor products"
              className="w-full px-3.5 py-2 rounded-xl border border-black/10 focus:outline-none focus:border-black text-xs bg-neutral-50"
            />
          </div>

          <button
            type="submit"
            disabled={saving || !brandName}
            className="px-6 py-2.5 rounded-full bg-[#111111] text-white text-xs font-medium hover:bg-neutral-800 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving Ad..." : "Save Benchmark Ad"}
          </button>
        </form>
      </div>

      {/* Grid of Ads */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ads.map((ad) => (
          <div
            key={ad.id}
            className="bg-white rounded-3xl border border-black/[0.06] p-5 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-xs text-[#111111]">{ad.brand_name}</span>
                <span className="text-[10px] uppercase font-semibold text-[#6B6B6B] bg-neutral-100 px-2 py-0.5 rounded-full">
                  {ad.format}
                </span>
              </div>

              <div className="aspect-[4/3] rounded-2xl bg-neutral-100 overflow-hidden mb-3">
                <img
                  src={ad.thumbnail_url || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80"}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="font-serif text-sm text-[#111111] mb-2">{ad.title}</h3>

              <div className="space-y-1.5 mb-4">
                <div className="text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wider">
                  Why it works:
                </div>
                {(ad.why_it_works || []).map((pt, i) => (
                  <div key={i} className="text-xs text-[#111111] flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-black/[0.06] flex items-center justify-between text-xs">
              <a
                href={ad.source_url || `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&q=${encodeURIComponent(ad.brand_name || "")}`}
                target="_blank"
                rel="noreferrer"
                className="text-neutral-600 hover:text-[#111111] font-medium flex items-center gap-1"
              >
                <span>Meta Ad Library</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => handleDelete(ad.id)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
