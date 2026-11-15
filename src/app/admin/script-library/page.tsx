"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  Layers,
  ArrowUp,
  ArrowDown,
  Shield,
  Clock,
  Smartphone,
  Tag,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sliders,
  FileText,
  Lock,
  Archive,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import {
  ScriptCategory,
  ScriptReference,
  ScriptReferenceStatus,
} from "@/lib/supabase/types";

const ALL_STYLE_TAGS = [
  "UGC",
  "product demo",
  "problem-solution",
  "stress test",
  "founder story",
  "launch",
  "testimonial",
  "trend-inspired",
  "wear test",
  "educational",
  "myth busting",
  "unboxing",
];

const PLATFORM_OPTIONS = [
  "Instagram Reels",
  "TikTok",
  "YouTube Shorts",
  "Meta Ads",
];

const TONE_OPTIONS = [
  "Bold",
  "Punchy",
  "High Energy",
  "Relatable",
  "Conversational",
  "Honest",
  "Founder Story",
  "Educational",
  "Authority",
  "Luxury",
];

const DURATION_OPTIONS = [15, 30, 45, 60];

export default function AdminScriptLibraryPage() {
  const [categories, setCategories] = useState<ScriptCategory[]>([]);
  const [references, setReferences] = useState<ScriptReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Active view tab: "references" or "categories"
  const [activeTab, setActiveTab] = useState<"references" | "categories">("references");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>("all");

  // Reference Modals
  const [isRefModalOpen, setIsRefModalOpen] = useState(false);
  const [editingRef, setEditingRef] = useState<ScriptReference | null>(null);
  const [previewRef, setPreviewRef] = useState<ScriptReference | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Reference Form Fields
  const [refTitle, setRefTitle] = useState("");
  const [refCategoryId, setRefCategoryId] = useState("");
  const [refDescription, setRefDescription] = useState("");
  const [refPromptGuidance, setRefPromptGuidance] = useState("");
  const [refExampleScript, setRefExampleScript] = useState("");
  const [refPlatforms, setRefPlatforms] = useState<string[]>(["Instagram Reels", "TikTok"]);
  const [refTones, setRefTones] = useState<string[]>(["Bold", "Relatable"]);
  const [refDurations, setRefDurations] = useState<number[]>([30]);
  const [refTags, setRefTags] = useState<string[]>(["UGC"]);
  const [refPriority, setRefPriority] = useState<number>(5);
  const [refIsActive, setRefIsActive] = useState<boolean>(true);
  const [refFormError, setRefFormError] = useState<string | null>(null);

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<ScriptCategory | null>(null);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catIcon, setCatIcon] = useState("Sparkles");
  const [catSortOrder, setCatSortOrder] = useState<number>(1);
  const [catIsActive, setCatIsActive] = useState<boolean>(true);
  const [catFormError, setCatFormError] = useState<string | null>(null);

  // Load Categories & References
  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, refRes] = await Promise.all([
        fetch("/api/admin/script-library/categories"),
        fetch("/api/admin/script-library/references"),
      ]);

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      }
      if (refRes.ok) {
        const refData = await refRes.json();
        setReferences(refData.references || []);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to load library data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // =========================================================================
  // REFERENCE ACTIONS
  // =========================================================================
  const openAddRefModal = () => {
    setEditingRef(null);
    setRefTitle("");
    setRefCategoryId(categories[0]?.id || "");
    setRefDescription("");
    setRefPromptGuidance("");
    setRefExampleScript("");
    setRefPlatforms(["Instagram Reels", "TikTok", "Meta Ads"]);
    setRefTones(["Bold", "Relatable"]);
    setRefDurations([30]);
    setRefTags(["UGC"]);
    setRefPriority(5);
    setRefIsActive(true);
    setRefFormError(null);
    setIsRefModalOpen(true);
  };

  const openEditRefModal = (ref: ScriptReference) => {
    setEditingRef(ref);
    setRefTitle(ref.title);
    setRefCategoryId(ref.category_id);
    setRefDescription(ref.description);
    setRefPromptGuidance(ref.prompt_guidance);
    setRefExampleScript(ref.example_script || "");
    setRefPlatforms(ref.suitable_platforms || ["Instagram Reels"]);
    setRefTones(ref.suitable_tones || ["Bold"]);
    setRefDurations(ref.suitable_durations || [30]);
    setRefTags(ref.style_tags || ["UGC"]);
    setRefPriority(ref.priority || 0);
    setRefIsActive(ref.is_active);
    setRefFormError(null);
    setIsRefModalOpen(true);
  };

  const handleSaveReference = async () => {
    if (!refTitle.trim() || !refCategoryId || !refDescription.trim() || !refPromptGuidance.trim()) {
      setRefFormError("Title, Category, When to Use Description, and Prompt Guidance are required.");
      return;
    }

    setIsSaving(true);
    setRefFormError(null);

    const payload = {
      title: refTitle.trim(),
      category_id: refCategoryId,
      description: refDescription.trim(),
      prompt_guidance: refPromptGuidance.trim(),
      example_script: refExampleScript.trim() || null,
      suitable_platforms: refPlatforms,
      suitable_tones: refTones,
      suitable_durations: refDurations,
      style_tags: refTags,
      priority: Number(refPriority) || 0,
      is_active: refIsActive,
      status: refIsActive ? ("active" as ScriptReferenceStatus) : ("inactive" as ScriptReferenceStatus),
    };

    try {
      if (editingRef) {
        const res = await fetch("/api/admin/script-library/references", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingRef.id, ...payload }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update reference");

        setReferences((prev) =>
          prev.map((r) => (r.id === editingRef.id ? { ...r, ...data.reference } : r))
        );
        showToast("Reference updated successfully");
      } else {
        const res = await fetch("/api/admin/script-library/references", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create reference");

        setReferences((prev) => [data.reference, ...prev]);
        showToast("New reference added to library");
      }
      setIsRefModalOpen(false);
    } catch (err: any) {
      setRefFormError(err.message || "Failed to save reference");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleReferenceStatus = async (ref: ScriptReference) => {
    const nextActive = !ref.is_active;
    const nextStatus = nextActive ? "active" : "inactive";

    // Optimistic UI update
    setReferences((prev) =>
      prev.map((r) =>
        r.id === ref.id ? { ...r, is_active: nextActive, status: nextStatus as ScriptReferenceStatus } : r
      )
    );

    try {
      const res = await fetch("/api/admin/script-library/references", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: ref.id,
          is_active: nextActive,
          status: nextStatus,
        }),
      });
      if (!res.ok) throw new Error("Status update failed");
      showToast(`Reference ${nextActive ? "activated" : "disabled"}`);
    } catch {
      showToast("Failed to toggle status", "error");
      fetchData();
    }
  };

  const handleArchiveReference = async (id: string) => {
    if (!confirm("Are you sure you want to archive this reference? Customers will no longer be able to use it.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/script-library/references?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Archive failed");
      setReferences((prev) => prev.filter((r) => r.id !== id));
      showToast("Reference archived");
    } catch (err: any) {
      showToast(err.message || "Failed to archive reference", "error");
    }
  };

  // Preview helper
  const openPreview = (ref: ScriptReference) => {
    setPreviewRef(ref);
    setIsPreviewModalOpen(true);
  };

  const openFormPreview = () => {
    const previewObj: ScriptReference = {
      id: editingRef?.id || "preview-id",
      category_id: refCategoryId,
      title: refTitle || "Untitled Concept",
      description: refDescription || "No description provided yet.",
      prompt_guidance: refPromptGuidance || "No prompt guidance provided.",
      example_script: refExampleScript || null,
      suitable_platforms: refPlatforms,
      suitable_tones: refTones,
      suitable_durations: refDurations,
      style_tags: refTags,
      priority: Number(refPriority) || 0,
      sort_order: 0,
      is_active: refIsActive,
      status: refIsActive ? "active" : "inactive",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setPreviewRef(previewObj);
    setIsPreviewModalOpen(true);
  };

  // =========================================================================
  // CATEGORY ACTIONS
  // =========================================================================
  const openAddCatModal = () => {
    setEditingCat(null);
    setCatName("");
    setCatSlug("");
    setCatDesc("");
    setCatIcon("Sparkles");
    setCatSortOrder(categories.length + 1);
    setCatIsActive(true);
    setCatFormError(null);
    setIsCatModalOpen(true);
  };

  const openEditCatModal = (cat: ScriptCategory) => {
    setEditingCat(cat);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatDesc(cat.description || "");
    setCatIcon(cat.icon || "Sparkles");
    setCatSortOrder(cat.sort_order);
    setCatIsActive(cat.is_active);
    setCatFormError(null);
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!catName.trim() || !catSlug.trim()) {
      setCatFormError("Name and slug are required.");
      return;
    }

    setIsSaving(true);
    setCatFormError(null);

    const payload = {
      name: catName.trim(),
      slug: catSlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-"),
      description: catDesc.trim() || null,
      icon: catIcon.trim() || "Sparkles",
      sort_order: Number(catSortOrder) || 0,
      is_active: catIsActive,
      status: catIsActive ? "active" : "archived",
    };

    try {
      if (editingCat) {
        const res = await fetch("/api/admin/script-library/categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingCat.id, ...payload }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update category");

        setCategories((prev) =>
          prev.map((c) => (c.id === editingCat.id ? { ...c, ...data.category } : c))
        );
        showToast("Category updated");
      } else {
        const res = await fetch("/api/admin/script-library/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create category");

        setCategories((prev) => [...prev, data.category]);
        showToast("Category created");
      }
      setIsCatModalOpen(false);
    } catch (err: any) {
      setCatFormError(err.message || "Failed to save category");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReorderCategory = async (cat: ScriptCategory, direction: "up" | "down") => {
    const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order);
    const index = sorted.findIndex((c) => c.id === cat.id);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === sorted.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const tempOrder = sorted[index].sort_order;
    sorted[index].sort_order = sorted[targetIndex].sort_order;
    sorted[targetIndex].sort_order = tempOrder;

    setCategories([...sorted]);

    try {
      await Promise.all([
        fetch("/api/admin/script-library/categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: sorted[index].id, sort_order: sorted[index].sort_order }),
        }),
        fetch("/api/admin/script-library/categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: sorted[targetIndex].id, sort_order: sorted[targetIndex].sort_order }),
        }),
      ]);
      showToast("Category reordered");
    } catch {
      showToast("Failed to save reorder", "error");
      fetchData();
    }
  };

  const handleArchiveCategory = async (id: string) => {
    if (!confirm("Archive this category? References inside will remain in the library but will be de-linked.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/script-library/categories?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Archive failed");
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToast("Category archived");
    } catch (err: any) {
      showToast(err.message || "Failed to archive category", "error");
    }
  };

  // Filtered References
  const filteredReferences = useMemo(() => {
    return references.filter((r) => {
      if (selectedCategoryFilter !== "all" && r.category_id !== selectedCategoryFilter) {
        return false;
      }
      if (selectedStatusFilter === "active" && !r.is_active) return false;
      if (selectedStatusFilter === "inactive" && r.is_active) return false;
      if (selectedStatusFilter === "archived" && r.status !== "archived") return false;

      if (selectedTagFilter !== "all" && !(r.style_tags || []).includes(selectedTagFilter)) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesDesc = r.description.toLowerCase().includes(q);
        const matchesPrompt = r.prompt_guidance.toLowerCase().includes(q);
        const matchesTags = (r.style_tags || []).some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesPrompt && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [references, selectedCategoryFilter, selectedStatusFilter, selectedTagFilter, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-paper-lg border text-xs font-mono flex items-center gap-2.5 transition-all animate-in fade-in slide-in-from-bottom-2 ${
            toastMsg.type === "error"
              ? "bg-red-50 border-red-300 text-red-800"
              : "bg-[#FFFCF5] border-emerald-300 text-emerald-800"
          }`}
        >
          {toastMsg.type === "error" ? (
            <AlertCircle className="w-4 h-4 text-red-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Top Header & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#302E29]/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#C86446] mb-1 font-mono">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Infimindss Creative Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#302E29]">
            Script Reference Library
          </h1>
          <p className="text-xs text-[#716C63] mt-1 max-w-2xl leading-relaxed">
            Private, admin-curated prompt blueprints, hook structures, and pacing rules.
            Used server-side to guide AI and human scriptwriters without exposing raw prompts to customers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={fetchData}
            className="p-2.5 rounded-full bg-[#EEE5D6] hover:bg-[#E2D7C4] text-[#302E29] transition-colors"
            title="Refresh library data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          {activeTab === "references" ? (
            <button
              type="button"
              onClick={openAddRefModal}
              className="px-4 py-2.5 rounded-full bg-[#C86446] hover:bg-[#B55539] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Reference</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={openAddCatModal}
              className="px-4 py-2.5 rounded-full bg-[#C86446] hover:bg-[#B55539] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          )}
        </div>
      </div>

      {/* Security Banner Notice */}
      <div className="p-3.5 rounded-2xl bg-[#EEE5D6]/80 border border-[#302E29]/10 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-[#302E29]">
          <div className="w-7 h-7 rounded-lg bg-[#C86446]/10 flex items-center justify-center text-[#C86446] shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold">Private Admin Repository:</span>{" "}
            <span className="text-[#716C63]">
              Customers only see friendly titles &amp; descriptions. Writing instructions and team notes stay strictly server-side.
            </span>
          </div>
        </div>

        <Link
          href="/studio"
          target="_blank"
          className="text-[11px] font-mono text-[#C86446] hover:underline shrink-0 flex items-center gap-1"
        >
          <span>Test in Studio</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#302E29]/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("references")}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-colors flex items-center gap-2 ${
            activeTab === "references"
              ? "bg-[#302E29] text-white"
              : "text-[#716C63] hover:text-[#302E29] hover:bg-[#EEE5D6]"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Script References ({references.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-colors flex items-center gap-2 ${
            activeTab === "categories"
              ? "bg-[#302E29] text-white"
              : "text-[#716C63] hover:text-[#302E29] hover:bg-[#EEE5D6]"
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Categories ({categories.length})</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: SCRIPT REFERENCES */}
      {/* =================================================================== */}
      {activeTab === "references" && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="bg-[#FFFCF5] p-4 rounded-3xl border border-[#302E29]/10 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 text-[#716C63] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search references by title, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F6F1E7] border border-[#302E29]/12 text-xs text-[#302E29] placeholder-[#716C63]/60 focus:outline-none focus:ring-1 focus:ring-[#C86446]"
                />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F6F1E7] border border-[#302E29]/12 text-xs text-[#302E29] focus:outline-none focus:ring-1 focus:ring-[#C86446]"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F6F1E7] border border-[#302E29]/12 text-xs text-[#302E29] focus:outline-none focus:ring-1 focus:ring-[#C86446]"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Quick Tag Pills */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[#302E29]/10 text-xs font-mono">
              <span className="text-[#716C63] mr-1 text-[11px]">Filter by Tag:</span>
              <button
                type="button"
                onClick={() => setSelectedTagFilter("all")}
                className={`px-2.5 py-1 rounded-full text-[11px] transition-colors ${
                  selectedTagFilter === "all"
                    ? "bg-[#C86446] text-white"
                    : "bg-[#EEE5D6] text-[#716C63] hover:text-[#302E29]"
                }`}
              >
                All
              </button>
              {ALL_STYLE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTagFilter(tag === selectedTagFilter ? "all" : tag)}
                  className={`px-2.5 py-1 rounded-full text-[11px] transition-colors ${
                    selectedTagFilter === tag
                      ? "bg-[#C86446] text-white"
                      : "bg-[#EEE5D6] text-[#716C63] hover:text-[#302E29]"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Reference Cards Grid */}
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#C86446]" />
              <p className="text-xs font-mono text-[#716C63]">Loading script references...</p>
            </div>
          ) : filteredReferences.length === 0 ? (
            <div className="bg-[#FFFCF5] p-12 rounded-3xl border border-[#302E29]/10 text-center space-y-3">
              <BookOpen className="w-8 h-8 mx-auto text-[#716C63]/40" />
              <h3 className="font-serif text-lg text-[#302E29]">No references match your filters</h3>
              <p className="text-xs text-[#716C63] max-w-sm mx-auto">
                Try clearing your search or category filters, or create a new reference blueprint.
              </p>
              <button
                type="button"
                onClick={openAddRefModal}
                className="mt-2 px-4 py-2 rounded-full bg-[#302E29] text-white text-xs font-semibold hover:bg-black transition-colors"
              >
                + Add Reference
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredReferences.map((ref) => {
                const cat = categories.find((c) => c.id === ref.category_id);
                return (
                  <div
                    key={ref.id}
                    className={`bg-[#FFFCF5] rounded-3xl border transition-all p-5 flex flex-col justify-between shadow-sm hover:shadow-md ${
                      ref.is_active ? "border-[#302E29]/10" : "border-amber-300/80 bg-amber-50/20 opacity-80"
                    }`}
                  >
                    <div>
                      {/* Top Bar: Category badge & Status / Priority */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#EEE5D6] text-[#716C63] text-[10px] font-mono font-semibold">
                          {cat?.name || "General Category"}
                        </span>

                        <div className="flex items-center gap-1.5 text-[10px] font-mono">
                          <span
                            className="px-2 py-0.5 rounded-full border"
                            style={{
                              backgroundColor: ref.is_active ? "#ECFDF5" : "#FEF3C7",
                              borderColor: ref.is_active ? "#10B98133" : "#F59E0B33",
                              color: ref.is_active ? "#065F46" : "#92400E",
                            }}
                          >
                            {ref.is_active ? "Active" : "Disabled"}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[#302E29]/5 text-[#716C63]">
                            P:{ref.priority}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-serif text-base font-semibold text-[#302E29] mb-1.5 leading-snug">
                        {ref.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-[#716C63] line-clamp-2 mb-3 leading-relaxed">
                        {ref.description}
                      </p>

                      {/* Suitable Platforms & Durations */}
                      <div className="space-y-1.5 mb-4 text-[11px] font-mono text-[#716C63]">
                        <div className="flex items-center gap-1.5">
                          <Smartphone className="w-3 h-3 text-[#C86446]" />
                          <span className="truncate">
                            {(ref.suitable_platforms || []).join(", ") || "All Platforms"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-[#C86446]" />
                          <span>
                            {(ref.suitable_durations || []).map((d) => `${d}s`).join(" • ") || "30s"}
                          </span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex items-center gap-1 flex-wrap mb-4">
                        {(ref.style_tags || []).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md bg-[#EEE5D6] text-[#302E29] text-[10px] font-mono"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="pt-3 border-t border-[#302E29]/10 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => openPreview(ref)}
                        className="px-3 py-1.5 rounded-xl bg-[#EEE5D6] hover:bg-[#E2D7C4] text-[#302E29] text-xs font-semibold transition-colors flex items-center gap-1"
                        title="Preview reference prompt & customer view"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#C86446]" />
                        <span>Preview</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleReferenceStatus(ref)}
                          className={`p-1.5 rounded-lg text-xs font-mono transition-colors ${
                            ref.is_active
                              ? "text-amber-800 hover:bg-amber-100"
                              : "text-emerald-800 hover:bg-emerald-100"
                          }`}
                          title={ref.is_active ? "Disable reference" : "Enable reference"}
                        >
                          {ref.is_active ? "Disable" : "Enable"}
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditRefModal(ref)}
                          className="p-1.5 rounded-lg text-[#302E29] hover:bg-[#EEE5D6] transition-colors"
                          title="Edit reference"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleArchiveReference(ref.id)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="Archive reference"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: CATEGORIES & TAXONOMY */}
      {/* =================================================================== */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg text-[#302E29]">Script Categories &amp; Ordering</h2>
              <p className="text-xs text-[#716C63]">
                Manage client-facing categories and arrange their presentation order in the Studio Writer.
              </p>
            </div>
            <button
              type="button"
              onClick={openAddCatModal}
              className="px-4 py-2 rounded-full bg-[#C86446] hover:bg-[#B55539] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="bg-[#FFFCF5] rounded-3xl border border-[#302E29]/10 divide-y divide-[#302E29]/10 shadow-sm overflow-hidden">
            {categories.map((cat, idx) => {
              const count = references.filter((r) => r.category_id === cat.id).length;
              return (
                <div
                  key={cat.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF6EE] transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#C86446]/10 border border-[#C86446]/20 flex items-center justify-center text-[#C86446] font-mono text-xs font-bold shrink-0">
                      {idx + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif text-sm font-semibold text-[#302E29]">
                          {cat.name}
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EEE5D6] text-[#716C63]">
                          slug: {cat.slug}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#302E29]/5 text-[#716C63]">
                          {count} references
                        </span>
                      </div>
                      {cat.description && (
                        <p className="text-xs text-[#716C63] mt-1">{cat.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleReorderCategory(cat, "up")}
                      className="p-2 rounded-lg bg-[#EEE5D6] hover:bg-[#E2D7C4] text-[#302E29] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === categories.length - 1}
                      onClick={() => handleReorderCategory(cat, "down")}
                      className="p-2 rounded-lg bg-[#EEE5D6] hover:bg-[#E2D7C4] text-[#302E29] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditCatModal(cat)}
                      className="p-2 rounded-lg bg-[#EEE5D6] hover:bg-[#E2D7C4] text-[#302E29] transition-colors"
                      title="Edit category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleArchiveCategory(cat.id)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      title="Archive category"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: ADD / EDIT REFERENCE MODAL */}
      {/* =================================================================== */}
      {isRefModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFCF5] border border-[#302E29]/15 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-paper-lg space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#302E29]/10">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#C86446]" />
                <h3 className="font-serif text-lg text-[#302E29]">
                  {editingRef ? "Edit Script Reference" : "Add Script Reference"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRefModalOpen(false)}
                className="p-1 rounded-full text-[#716C63] hover:text-[#302E29]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {refFormError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{refFormError}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Row 1: Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#716C63] mb-1">
                    Reference Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. The Friction-to-Relief Stress Test"
                    value={refTitle}
                    onChange={(e) => setRefTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F1E7] border border-[#302E29]/15 text-xs text-[#302E29] focus:outline-none focus:ring-1 focus:ring-[#C86446]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#716C63] mb-1">
                    Category *
                  </label>
                  <select
                    value={refCategoryId}
                    onChange={(e) => setRefCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F1E7] border border-[#302E29]/15 text-xs text-[#302E29] focus:outline-none focus:ring-1 focus:ring-[#C86446]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Customer-Facing Description */}
              <div>
                <label className="block text-xs font-mono uppercase text-[#716C63] mb-1">
                  When to Use (Customer-Facing Description) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Best for physical products with obvious visual contrast or instant tactile advantage."
                  value={refDescription}
                  onChange={(e) => setRefDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F1E7] border border-[#302E29]/15 text-xs text-[#302E29] focus:outline-none focus:ring-1 focus:ring-[#C86446]"
                />
                <p className="text-[11px] text-[#716C63] mt-1">
                  Shown to customers in the Studio script writer to help them select this reference style.
                </p>
              </div>

              {/* Row 3: Internal Writing Instructions / Prompt Guidance */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono uppercase text-[#716C63] flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-[#C86446]" />
                    <span>Writing Instructions &amp; Prompt Guidance (Private) *</span>
                  </label>
                  <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Server-side only · Never shown to clients
                  </span>
                </div>
                <textarea
                  rows={6}
                  placeholder={`STRUCTURE INSTRUCTIONS:
- Hook (0-3s): Open with physical frustration, mess, or failure in extreme close-up.
- Pivot (3-8s): Rapid cut to creator introducing product. No corporate monologue.
- Stress Test (8-22s): Hands-on demonstration under demanding conditions.
- CTA (22-30s): Clear single directive with risk-reversal guarantee.`}
                  value={refPromptGuidance}
                  onChange={(e) => setRefPromptGuidance(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#F6F1E7] border border-[#302E29]/15 text-xs font-mono text-[#302E29] focus:outline-none focus:ring-1 focus:ring-[#C86446]"
                />
              </div>

              {/* Row 4: Team Example Script */}
              <div>
                <label className="block text-xs font-mono uppercase text-[#716C63] mb-1">
                  Team Example Script (Optional Reference Material)
                </label>
                <textarea
                  rows={4}
                  placeholder={`[HOOK - 0 to 3s]:
Visual: Creator struggling with traditional messy bottle.
Voiceover: "If you are still putting up with this mess, stop."

[BODY - 3 to 22s]:
Visual: Quick cut showing clean 1-click mechanism.
Voiceover: "Switched to this last week. 1 press, 0 drips."

[CTA - 22 to 30s]:
Visual: Creator smiling, tapping link pill.
Voiceover: "Get yours while the batch is live below."`}
                  value={refExampleScript}
                  onChange={(e) => setRefExampleScript(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#F6F1E7] border border-[#302E29]/15 text-xs font-mono text-[#302E29] focus:outline-none focus:ring-1 focus:ring-[#C86446]"
                />
              </div>

              {/* Row 5: Multi-Selects (Platforms, Tones, Durations) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#716C63] mb-1.5">
                    Suitable Platforms
                  </label>
                  <div className="space-y-1">
                    {PLATFORM_OPTIONS.map((p) => (
                      <label key={p} className="flex items-center gap-2 text-xs text-[#302E29] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={refPlatforms.includes(p)}
                          onChange={() => {
                            setRefPlatforms((prev) =>
                              prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
                            );
                          }}
                          className="rounded text-[#C86446] focus:ring-[#C86446]"
                        />
                        <span>{p}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#716C63] mb-1.5">
                    Suitable Durations
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {DURATION_OPTIONS.map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => {
                          setRefDurations((prev) =>
                            prev.includes(dur) ? prev.filter((x) => x !== dur) : [...prev, dur]
                          );
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                          refDurations.includes(dur)
                            ? "bg-[#302E29] text-white"
                            : "bg-[#EEE5D6] text-[#716C63]"
                        }`}
                      >
                        {dur}s
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#716C63] mb-1.5">
                    Priority Score (0 - 100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={refPriority}
                    onChange={(e) => setRefPriority(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#F6F1E7] border border-[#302E29]/15 text-xs text-[#302E29]"
                  />
                  <p className="text-[10px] text-[#716C63] mt-1">
                    Higher priority references are selected first during auto-matching.
                  </p>
                </div>
              </div>

              {/* Row 6: Style Tags */}
              <div className="pt-2">
                <label className="block text-xs font-mono uppercase text-[#716C63] mb-1.5">
                  Style Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_STYLE_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setRefTags((prev) =>
                          prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                        );
                      }}
                      className={`px-2.5 py-1 rounded-full text-xs font-mono transition-colors ${
                        refTags.includes(tag)
                          ? "bg-[#C86446] text-white"
                          : "bg-[#EEE5D6] text-[#716C63] hover:text-[#302E29]"
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-[#302E29]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={openFormPreview}
                className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-[#EEE5D6] hover:bg-[#E2D7C4] text-[#302E29] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-[#C86446]" />
                <span>Preview Before Saving</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsRefModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-[#EEE5D6] text-[#716C63] hover:text-[#302E29] text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveReference}
                  disabled={isSaving}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#C86446] hover:bg-[#B55539] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingRef ? "Save Changes" : "Create Reference"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: PREVIEW REFERENCE MODAL */}
      {/* =================================================================== */}
      {isPreviewModalOpen && previewRef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFCF5] border border-[#302E29]/15 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-paper-lg space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#302E29]/10">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#C86446]" />
                <div>
                  <h3 className="font-serif text-lg text-[#302E29]">Reference Preview</h3>
                  <p className="text-[11px] font-mono text-[#716C63]">
                    Side-by-side verification of customer view vs. server-side prompt injection
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1 rounded-full text-[#716C63] hover:text-[#302E29]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Part 1: Customer View Card */}
              <div className="p-4 rounded-2xl bg-[#F6F1E7] border border-[#302E29]/12 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full font-semibold">
                    ✦ What Customers See in Studio
                  </span>
                  <span className="text-[10px] font-mono text-[#716C63]">
                    {(previewRef.suitable_durations || []).map((d) => `${d}s`).join(" • ")}
                  </span>
                </div>
                <h4 className="font-serif text-base font-semibold text-[#302E29]">
                  {previewRef.title}
                </h4>
                <p className="text-xs text-[#716C63] leading-relaxed">
                  {previewRef.description}
                </p>
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {(previewRef.style_tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-[#EEE5D6] text-[#302E29] text-[10px] font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Part 2: Private Server Instructions */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-amber-900">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Private Prompt Guidance (Injected on Server)</span>
                </div>
                <pre className="p-3 rounded-xl bg-[#302E29] text-[#EEE5D6] text-[11px] font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48">
                  {previewRef.prompt_guidance}
                </pre>
              </div>

              {/* Part 3: Example Script */}
              {previewRef.example_script && (
                <div className="p-4 rounded-2xl bg-[#EEE5D6]/60 border border-[#302E29]/10 space-y-2">
                  <span className="text-xs font-mono font-semibold text-[#302E29]">
                    Team Example Script
                  </span>
                  <pre className="p-3 rounded-xl bg-[#FFFCF5] border border-[#302E29]/10 text-[#302E29] text-[11px] font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48">
                    {previewRef.example_script}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#302E29]/10 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-5 py-2 rounded-full bg-[#302E29] text-white text-xs font-semibold hover:bg-black transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: ADD / EDIT CATEGORY MODAL */}
      {/* =================================================================== */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFCF5] border border-[#302E29]/15 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-paper-lg space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#302E29]/10">
              <h3 className="font-serif text-lg text-[#302E29]">
                {editingCat ? "Edit Category" : "Add Script Category"}
              </h3>
              <button
                type="button"
                onClick={() => setIsCatModalOpen(false)}
                className="p-1 rounded-full text-[#716C63] hover:text-[#302E29]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {catFormError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{catFormError}</span>
              </div>
            )}

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono uppercase text-[#716C63] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Product Ad & Commercial"
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value);
                    if (!editingCat) {
                      setCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "-"));
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F1E7] border border-[#302E29]/15 text-xs text-[#302E29] focus:outline-none focus:ring-1 focus:ring-[#C86446]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#716C63] mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  placeholder="e.g. product-ad"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F1E7] border border-[#302E29]/15 text-xs font-mono text-[#302E29] focus:outline-none focus:ring-1 focus:ring-[#C86446]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#716C63] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short description of this script category..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#F6F1E7] border border-[#302E29]/15 text-xs text-[#302E29] focus:outline-none focus:ring-1 focus:ring-[#C86446]"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-mono uppercase text-[#716C63] mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={catSortOrder}
                    onChange={(e) => setCatSortOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F6F1E7] border border-[#302E29]/15 text-xs text-[#302E29]"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="catIsActive"
                    checked={catIsActive}
                    onChange={(e) => setCatIsActive(e.target.checked)}
                    className="rounded text-[#C86446] focus:ring-[#C86446]"
                  />
                  <label htmlFor="catIsActive" className="text-xs text-[#302E29] cursor-pointer">
                    Active
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#302E29]/10 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCatModalOpen(false)}
                className="px-4 py-2 rounded-full bg-[#EEE5D6] text-[#716C63] hover:text-[#302E29] text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCategory}
                disabled={isSaving}
                className="px-5 py-2 rounded-full bg-[#C86446] hover:bg-[#B55539] text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{editingCat ? "Save Category" : "Create Category"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
