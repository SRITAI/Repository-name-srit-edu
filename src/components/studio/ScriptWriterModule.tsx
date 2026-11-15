"use client";

import React, { useState, useEffect } from "react";
import {
  Wand2,
  Sparkles,
  BookOpen,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Tag,
  Loader2,
  FileText,
  ShieldCheck,
  ArrowRight,
  Info,
} from "lucide-react";
import {
  GeneratedScriptResult,
  ScriptReferenceOption,
  ScriptScene,
} from "@/lib/supabase/types";

interface ScriptWriterModuleProps {
  brandName: string;
  category: string;
  platform: string;
  duration: number;
  goal: string;
  initialProductName?: string;
  initialUsp?: string;
  initialDraft?: string;
  onApplyScript: (scriptData: {
    fullScript: string;
    hook: string;
    cta: string;
    rawResult: GeneratedScriptResult;
  }) => void;
}

const DEFAULT_SCRIPT_CATEGORIES = [
  { id: "product-ad", slug: "product-ad", name: "Product Ad & Commercial", icon: "✨" },
  { id: "ugc-creator", slug: "ugc-creator", name: "UGC & Creator First", icon: "📱" },
  { id: "product-launch", slug: "product-launch", name: "Product Launch & Drop", icon: "🚀" },
  { id: "brand-storytelling", slug: "brand-storytelling", name: "Founder & Storytelling", icon: "📖" },
  { id: "educational-reel", slug: "educational-reel", name: "Educational & Value Reel", icon: "💡" },
];

export default function ScriptWriterModule({
  brandName,
  category,
  platform,
  duration,
  goal,
  initialProductName = "",
  initialUsp = "",
  initialDraft = "",
  onApplyScript,
}: ScriptWriterModuleProps) {
  // Script Categories & Reference Options
  const [categories, setCategories] = useState(DEFAULT_SCRIPT_CATEGORIES);
  const [referenceOptions, setReferenceOptions] = useState<ScriptReferenceOption[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(false);

  // Form inputs
  const [selectedCategory, setSelectedCategory] = useState<string>("product-ad");
  const [selectedReferenceId, setSelectedReferenceId] = useState<string>("auto");
  const [productName, setProductName] = useState(initialProductName || brandName || "");
  const [productUsp, setProductUsp] = useState(initialUsp || "");
  const [productBenefits, setProductBenefits] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [tone, setTone] = useState("Bold & Punchy");
  const [keyOffer, setKeyOffer] = useState("");
  const [customerDraft, setCustomerDraft] = useState(initialDraft || "");

  // UI States
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedScript, setGeneratedScript] = useState<GeneratedScriptResult | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [showAllRefs, setShowAllRefs] = useState(false);

  // Sync initial props if changed
  useEffect(() => {
    if (initialProductName && !productName) setProductName(initialProductName);
    if (initialUsp && !productUsp) setProductUsp(initialUsp);
    if (initialDraft && !customerDraft) setCustomerDraft(initialDraft);
  }, [initialProductName, initialUsp, initialDraft]);

  // Load Categories & Sanitized Reference Options from Server
  useEffect(() => {
    async function fetchReferences() {
      setLoadingRefs(true);
      try {
        const res = await fetch("/api/studio/script-references");
        if (res.ok) {
          const data = await res.json();
          if (data.categories && data.categories.length > 0) {
            setCategories(data.categories);
          }
          if (data.references && data.references.length > 0) {
            setReferenceOptions(data.references);
          }
        }
      } catch (err) {
        console.warn("Using fallback script reference catalog", err);
      } finally {
        setLoadingRefs(false);
      }
    }
    fetchReferences();
  }, []);

  // Filter references matching selected category
  const matchingReferences = referenceOptions.filter((r) => {
    const cat = categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory);
    return !cat || r.category_id === cat.id || r.category_slug === cat.slug;
  });

  const displayedReferences = showAllRefs ? matchingReferences : matchingReferences.slice(0, 3);

  // Handle Generate Script Action
  const handleGenerateScript = async () => {
    const finalProd = productName.trim() || brandName.trim();
    if (!finalProd && !customerDraft.trim()) {
      setErrorMsg("Please provide at least a Product Name or paste a Draft / Talking Points.");
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setAppliedSuccess(false);

    try {
      const payload = {
        brandName: brandName || finalProd,
        productName: finalProd,
        productUsp: productUsp.trim(),
        productBenefits: productBenefits
          ? productBenefits.split(",").map((b) => b.trim()).filter(Boolean)
          : [],
        targetAudience: targetAudience.trim() || "Target social consumers",
        tone: tone || "Bold & Punchy",
        platform: platform || "Instagram Reels & Meta Ads",
        duration: duration || 30,
        category: selectedCategory,
        referenceId: selectedReferenceId,
        customerDraft: customerDraft.trim(),
        keyOfferCta: keyOffer.trim(),
      };

      const res = await fetch("/api/studio/draft-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate script");
      }

      if (data.script) {
        setGeneratedScript(data.script);
      } else {
        throw new Error("No script returned from generator");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Script generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (!generatedScript) return;
    onApplyScript({
      fullScript: generatedScript.fullScript,
      hook: generatedScript.hook,
      cta: generatedScript.cta,
      rawResult: generatedScript,
    });
    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 3000);
  };

  return (
    <div className="bg-[#FFFCF5] rounded-3xl border border-[#302E29]/12 p-5 sm:p-7 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#302E29]/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#C86446]">
            <Wand2 className="w-3.5 h-3.5" />
            <span>AI Script Writer &amp; Story Architect</span>
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#302E29]">
            Craft a High-Retention Video Script
          </h3>
          <p className="text-xs text-[#716C63] leading-relaxed max-w-xl">
            Choose a script category and reference style. Our server retrieves admin-curated
            direct-response blueprints to structure your brief for real creators on camera.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="px-3 py-1 rounded-full bg-[#EEE5D6] text-[#716C63] text-xs font-mono">
            {duration}s • {platform.split(" ")[0]}
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SECTION 1: SCRIPT CATEGORY */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono text-[#716C63]">
          <span className="uppercase tracking-wider font-semibold text-[#302E29]">
            1 / Choose Script Category
          </span>
          <span>{categories.length} Categories</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug || selectedCategory === cat.id;
            return (
              <button
                key={cat.id || cat.slug}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.slug || cat.id);
                  setSelectedReferenceId("auto");
                }}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#302E29] border-[#302E29] text-white shadow-sm"
                    : "bg-[#F6F1E7] border-[#302E29]/10 text-[#302E29] hover:border-[#C86446]/40"
                }`}
              >
                <div className="text-xl mb-1.5">{cat.icon || "✨"}</div>
                <div className="text-xs font-semibold leading-tight">{cat.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: BRAND BRIEF & CONFIRMED PRODUCT DETAILS */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs font-mono text-[#716C63]">
          <span className="uppercase tracking-wider font-semibold text-[#302E29]">
            2 / Brand Brief &amp; Verified Product Details
          </span>
          <span className="text-[11px] text-[#C86446]">Factual claims strictly preserved</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[11px] font-mono uppercase text-[#716C63] mb-1">
              Product / Brand Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Lumina Clarifying Serum"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F1E7] border border-[#302E29]/12 text-xs text-[#302E29] placeholder-[#716C63]/60 focus:outline-none focus:ring-1 focus:ring-[#C86446]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-[#716C63] mb-1">
              Core Problem Solved / USP
            </label>
            <input
              type="text"
              placeholder="e.g. Clears breakouts in 7 days without drying skin"
              value={productUsp}
              onChange={(e) => setProductUsp(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F1E7] border border-[#302E29]/12 text-xs text-[#302E29] placeholder-[#716C63]/60 focus:outline-none focus:ring-1 focus:ring-[#C86446]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-[#716C63] mb-1">
              Key Confirmed Benefits
            </label>
            <input
              type="text"
              placeholder="e.g. 100% vegan, fragrance-free, absorbing in 3 seconds"
              value={productBenefits}
              onChange={(e) => setProductBenefits(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F1E7] border border-[#302E29]/12 text-xs text-[#302E29] placeholder-[#716C63]/60 focus:outline-none focus:ring-1 focus:ring-[#C86446]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-[#716C63] mb-1">
              Key Offer / Call to Action
            </label>
            <input
              type="text"
              placeholder="e.g. 20% off first order with code WELCOME"
              value={keyOffer}
              onChange={(e) => setKeyOffer(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F1E7] border border-[#302E29]/12 text-xs text-[#302E29] placeholder-[#716C63]/60 focus:outline-none focus:ring-1 focus:ring-[#C86446]"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: OPTIONAL HUMAN-WRITTEN DRAFT */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-xs font-mono text-[#716C63]">
          <span className="uppercase tracking-wider font-semibold text-[#302E29] flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#C86446]" />
            <span>3 / Human-Written Draft or Raw Ideas (Optional)</span>
          </span>
          <span className="text-[11px] text-[#716C63]">We keep your facts intact</span>
        </div>

        <textarea
          rows={3}
          placeholder="Already have bullet points, talking points, or a rough script draft? Paste it here. Our script director will restructure it for high hook velocity and visual pacing without altering your verified facts."
          value={customerDraft}
          onChange={(e) => setCustomerDraft(e.target.value)}
          className="w-full p-3 rounded-xl bg-[#F6F1E7] border border-[#302E29]/12 text-xs text-[#302E29] placeholder-[#716C63]/60 focus:outline-none focus:ring-1 focus:ring-[#C86446] leading-relaxed"
        />
        <div className="flex items-center gap-1.5 text-[11px] text-[#716C63] font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Zero hallucinations: Unverified claims are flagged as [confirm this detail].</span>
        </div>
      </div>

      {/* SECTION 4: REFERENCE STYLE CHOICE */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs font-mono text-[#716C63]">
          <span className="uppercase tracking-wider font-semibold text-[#302E29] flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#C86446]" />
            <span>4 / Creative Reference Style</span>
          </span>
          <span className="text-[11px] text-[#716C63]">Friendly styles • Private blueprints</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Auto-Select Option */}
          <button
            type="button"
            onClick={() => setSelectedReferenceId("auto")}
            className={`p-4 rounded-2xl border text-left transition-all space-y-2 ${
              selectedReferenceId === "auto"
                ? "bg-[#302E29] border-[#302E29] text-white shadow-sm"
                : "bg-[#F6F1E7] border-[#302E29]/10 text-[#302E29] hover:border-[#C86446]/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                selectedReferenceId === "auto" ? "bg-[#C86446] text-white" : "bg-[#EEE5D6] text-[#C86446]"
              }`}>
                ✦ RECOMMENDED
              </span>
              <Sparkles className="w-4 h-4 text-[#C86446]" />
            </div>
            <div className="font-serif text-sm font-semibold">
              Auto-Select Best Reference Style
            </div>
            <p className={`text-xs leading-relaxed ${
              selectedReferenceId === "auto" ? "text-white/80" : "text-[#716C63]"
            }`}>
              Automatically scores and matches the highest-converting active reference for {platform.split(" ")[0]} at {duration}s.
            </p>
          </button>

          {/* Curated Reference Options */}
          {displayedReferences.map((ref) => {
            const isSelected = selectedReferenceId === ref.id;
            return (
              <button
                key={ref.id}
                type="button"
                onClick={() => setSelectedReferenceId(ref.id)}
                className={`p-4 rounded-2xl border text-left transition-all space-y-2 ${
                  isSelected
                    ? "bg-[#302E29] border-[#302E29] text-white shadow-sm"
                    : "bg-[#F6F1E7] border-[#302E29]/10 text-[#302E29] hover:border-[#C86446]/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isSelected ? "bg-white/10 text-white" : "bg-[#EEE5D6] text-[#716C63]"
                  }`}>
                    {(ref.suitable_durations || []).map((d) => `${d}s`).join(" • ")}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-[#C86446]" />}
                </div>

                <div className="font-serif text-sm font-semibold leading-snug">
                  {ref.title}
                </div>

                <p className={`text-xs line-clamp-2 leading-relaxed ${
                  isSelected ? "text-white/80" : "text-[#716C63]"
                }`}>
                  {ref.description}
                </p>

                <div className="flex items-center gap-1 flex-wrap pt-1">
                  {(ref.style_tags || []).slice(0, 2).map((t) => (
                    <span
                      key={t}
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        isSelected ? "bg-white/10 text-white/90" : "bg-[#EEE5D6] text-[#716C63]"
                      }`}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {matchingReferences.length > 3 && (
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => setShowAllRefs(!showAllRefs)}
              className="text-xs font-mono text-[#C86446] hover:underline inline-flex items-center gap-1"
            >
              <span>{showAllRefs ? "Show Fewer Styles" : `View ${matchingReferences.length - 3} More Styles`}</span>
              {showAllRefs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* GENERATE BUTTON */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleGenerateScript}
          disabled={isGenerating}
          className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#C86446] hover:bg-[#B55539] text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 active:scale-98"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Retrieving Reference &amp; Structuring Scenes...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span>Generate High-Converting Script</span>
            </>
          )}
        </button>
      </div>

      {/* GENERATED SCRIPT RESULT DISPLAY */}
      {generatedScript && (
        <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-[#F6F1E7] border border-[#302E29]/15 space-y-5 animate-in fade-in slide-in-from-top-2">
          {/* Top Concept Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#302E29]/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase bg-[#C86446] text-white px-2 py-0.5 rounded-full font-bold">
                  ✦ {generatedScript.targetDurationSeconds}s SCRIPT CONCEPT
                </span>
                {generatedScript.referenceUsed && (
                  <span className="text-[10px] font-mono bg-[#EEE5D6] text-[#716C63] px-2 py-0.5 rounded-full">
                    Style: {generatedScript.referenceUsed.title}
                  </span>
                )}
              </div>
              <h4 className="font-serif text-lg font-semibold text-[#302E29]">
                {generatedScript.title}
              </h4>
            </div>

            <button
              type="button"
              onClick={handleApply}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 ${
                appliedSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-[#302E29] hover:bg-black text-white"
              }`}
            >
              {appliedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Applied to Project!</span>
                </>
              ) : (
                <>
                  <span>Apply Script to Project</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Hook Highlight */}
          <div className="p-3.5 rounded-xl bg-[#FFFCF5] border border-[#C86446]/30 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#C86446] font-bold">
              0 - 3s Pattern Interrupt Hook
            </span>
            <p className="font-serif text-sm font-semibold text-[#302E29]">
              &ldquo;{generatedScript.hook}&rdquo;
            </p>
          </div>

          {/* Scene-by-Scene Breakdown */}
          {generatedScript.scenes && generatedScript.scenes.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#716C63] font-semibold">
                Scene-by-Scene Director Timing
              </span>
              <div className="space-y-2.5">
                {generatedScript.scenes.map((scene: ScriptScene) => (
                  <div
                    key={scene.sceneNumber}
                    className="p-3.5 rounded-xl bg-[#FFFCF5] border border-[#302E29]/10 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-semibold text-[#C86446]">
                        Scene {scene.sceneNumber}
                      </span>
                      <span className="text-[#716C63] bg-[#EEE5D6] px-2 py-0.5 rounded-full">
                        {scene.timeRange}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase text-[#716C63]">
                          Visual Direction (On-Camera Action)
                        </span>
                        <p className="text-[#302E29] leading-relaxed">
                          {scene.visualDirection}
                        </p>
                      </div>

                      <div className="space-y-1 md:col-span-1">
                        <span className="text-[10px] font-mono uppercase text-[#716C63]">
                          Spoken Voiceover
                        </span>
                        <p className="text-[#302E29] font-medium leading-relaxed italic">
                          &ldquo;{scene.voiceover}&rdquo;
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase text-[#716C63]">
                          On-Screen Text
                        </span>
                        <p className="text-[#C86446] font-mono text-[11px] font-semibold">
                          {scene.onScreenText}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA & Caption */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#FFFCF5] border border-[#302E29]/10 space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#716C63]">
                Closing Call to Action
              </span>
              <p className="font-semibold text-[#302E29]">{generatedScript.cta}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FFFCF5] border border-[#302E29]/10 space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#716C63]">
                Suggested Feed Caption
              </span>
              <p className="text-[#716C63] text-[11px] line-clamp-2">
                {generatedScript.suggestedCaption}
              </p>
            </div>
          </div>

          {/* Editorial Notes & What Changed from Draft */}
          {generatedScript.editorialNotes && (
            <div className="p-3.5 rounded-xl bg-[#EEE5D6]/80 border border-[#302E29]/10 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-[#302E29]">
                <Info className="w-3.5 h-3.5 text-[#C86446]" />
                <span>Editorial Notes &amp; Draft Evolution</span>
              </div>
              {generatedScript.editorialNotes.whatChangedFromDraft && (
                <p className="text-[#716C63] leading-relaxed">
                  <strong>Changes applied:</strong>{" "}
                  {generatedScript.editorialNotes.whatChangedFromDraft}
                </p>
              )}
              {generatedScript.editorialNotes.unconfirmedDetails &&
                generatedScript.editorialNotes.unconfirmedDetails.length > 0 && (
                  <div className="pt-1 text-amber-800 space-y-1">
                    <span className="font-semibold text-[11px]">
                      ⚠️ Items marked for client verification:
                    </span>
                    <ul className="list-disc list-inside text-[11px] space-y-0.5">
                      {generatedScript.editorialNotes.unconfirmedDetails.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          )}

          {/* Bottom Apply Action */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleApply}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm ${
                appliedSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-[#C86446] hover:bg-[#B55539] text-white"
              }`}
            >
              {appliedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Applied to Project Script</span>
                </>
              ) : (
                <>
                  <span>Apply Script to Project</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
