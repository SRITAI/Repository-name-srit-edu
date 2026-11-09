"use client";

import React, { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { SEED_CATEGORIES } from "@/lib/data/seed-data";
import { Tag, ShieldAlert, Sparkles, Check, Edit2, Save } from "lucide-react";
import type { Category } from "@/lib/supabase/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(SEED_CATEGORIES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [insightsText, setInsightsText] = useState("");
  const [saving, setSaving] = useState(false);

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setInsightsText(cat.insights_md || "");
  };

  const handleSaveInsights = async (cat: Category) => {
    setSaving(true);
    const updated = categories.map((c) =>
      c.id === cat.id ? { ...c, insights_md: insightsText } : c
    );
    setCategories(updated);

    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase
        .from("categories")
        .update({ insights_md: insightsText })
        .eq("id", cat.id);
    }

    setSaving(false);
    setEditingId(null);
  };

  const toggleAdult = async (cat: Category) => {
    const updated = categories.map((c) =>
      c.id === cat.id ? { ...c, is_adult: !c.is_adult } : c
    );
    setCategories(updated);

    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase
        .from("categories")
        .update({ is_adult: !cat.is_adult })
        .eq("id", cat.id);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1">
          <Tag className="w-3.5 h-3.5" />
          <span>Taxonomy & Meta Ad Guidelines</span>
        </div>
        <h1 className="text-2xl font-serif text-[#111111]">Category Architecture</h1>
        <p className="text-xs text-[#6B6B6B] mt-0.5">
          Configure categories, Meta Ad compliance rules, 18+ gates, and creative pattern insights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-3xl border border-black/[0.06] p-5 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{cat.icon}</span>
                  <span className="font-semibold text-xs text-[#111111]">{cat.name}</span>
                </div>

                {cat.is_adult ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-full">
                    <ShieldAlert className="w-3 h-3 text-rose-600" />
                    <span>18+ Gated</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-neutral-400">All Ages</span>
                )}
              </div>

              <p className="text-xs text-[#6B6B6B] mb-3">{cat.description}</p>

              <div className="space-y-2 mb-4">
                <div className="text-[10px] uppercase font-semibold text-[#6B6B6B] tracking-wider">
                  Keywords for Meta Ad Library Search:
                </div>
                <div className="flex flex-wrap gap-1">
                  {(cat.keywords || []).map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-neutral-100 text-[10px] text-[#111111]"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {editingId === cat.id ? (
                <div className="mt-3 space-y-2">
                  <label className="block text-[10px] uppercase font-semibold text-[#6B6B6B]">
                    Patterns & Insights (Markdown)
                  </label>
                  <textarea
                    rows={4}
                    value={insightsText}
                    onChange={(e) => setInsightsText(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-black/10 text-xs bg-neutral-50"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 rounded-full text-xs text-[#6B6B6B]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveInsights(cat)}
                      disabled={saving}
                      className="px-3 py-1 rounded-full bg-[#111111] text-white text-xs"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                cat.insights_md && (
                  <div className="p-3 rounded-2xl bg-neutral-50 border border-black/[0.04] text-[11px] text-[#6B6B6B] line-clamp-3">
                    <strong className="text-[#111111] block mb-0.5">Pattern Insights:</strong>
                    {cat.insights_md}
                  </div>
                )
              )}
            </div>

            <div className="pt-3 border-t border-black/[0.06] mt-4 flex items-center justify-between text-xs">
              <button
                onClick={() => toggleAdult(cat)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full transition-colors ${
                  cat.is_adult
                    ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                    : "text-neutral-500 hover:bg-neutral-100"
                }`}
              >
                {cat.is_adult ? "Remove 18+ Gate" : "Set 18+ Gate"}
              </button>

              <button
                onClick={() => startEdit(cat)}
                className="text-neutral-600 hover:text-[#111111] flex items-center gap-1 font-medium"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit Insights</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
