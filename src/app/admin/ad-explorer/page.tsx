"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  Search,
  Filter,
  Check,
  X,
  Edit3,
  Archive,
  Trash2,
  ExternalLink,
  Shield,
  Calendar,
  AlertCircle,
  Eye,
  CheckCircle2,
  Clock,
  Layers,
  Zap,
  Info,
  RefreshCw,
  Play,
  ArrowUpRight,
  ShieldAlert,
  Tag,
  ShoppingBag,
  ListFilter,
  SlidersHorizontal,
  ChevronDown,
  Globe,
  Database,
  ArrowDownUp,
} from "lucide-react";
import {
  SEED_AD_LISTINGS,
  PLATFORMS_CONFIG,
  AD_COUNTRIES,
  CREATIVE_FORMATS,
  CURATOR_SIGNALS,
  INITIAL_AD_CATEGORIES,
} from "@/lib/data/ad-explorer-seed";
import {
  AdListing,
  AdPlatform,
  CreativeFormat,
  MediaRightsStatus,
  AdListingStatus,
  Category,
} from "@/lib/supabase/types";
import { PlatformIcon } from "@/components/ad-explorer/PlatformIcon";
import { parseVideoMediaUrl } from "@/lib/media/video-embed";
import { SafeVideoPlayer } from "@/components/ad-explorer/SafeVideoPlayer";
import { AdListingSchema, CategorySchema } from "@/lib/validation/ad-listing";
import { AdDetailModal } from "@/components/ad-explorer/AdDetailModal";

const ALL_PLATFORMS: AdPlatform[] = ["meta", "google", "linkedin", "tiktok", "x", "amazon"];

type AdminTab =
  | "all"
  | "meta"
  | "google"
  | "linkedin"
  | "tiktok"
  | "x"
  | "amazon"
  | "review"
  | "categories";

export default function AdminAdExplorerPage() {
  const [ads, setAds] = useState<AdListing[]>(SEED_AD_LISTINGS);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<AdminTab>("all");
  const [loading, setLoading] = useState(true);
  const [isLocalPreview, setIsLocalPreview] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");

  // Form / Editor state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  // Core Ad Form Fields
  const [platform, setPlatform] = useState<AdPlatform>("meta");
  const [platformSurface, setPlatformSurface] = useState("Instagram Reels");
  const [brandName, setBrandName] = useState("");
  const [advertiserName, setAdvertiserName] = useState("");
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [hookSummary, setHookSummary] = useState("");
  const [callToAction, setCallToAction] = useState("Shop Now ↗");
  const [category, setCategory] = useState("health-ayurvedic");
  const [countryCode, setCountryCode] = useState("US");
  const [creativeFormat, setCreativeFormat] = useState<CreativeFormat>("video");
  const [sourceUrl, setSourceUrl] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [sourceAdId, setSourceAdId] = useState("");
  const [previewImagePath, setPreviewImagePath] = useState("");
  const [mediaRightsStatus, setMediaRightsStatus] = useState<MediaRightsStatus>("platform_link_only");
  const [curatorNote, setCuratorNote] = useState("");
  const [signalLabels, setSignalLabels] = useState<string[]>(["Editor's pick"]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [performanceEvidenceNote, setPerformanceEvidenceNote] = useState("");
  const [status, setStatus] = useState<AdListingStatus>("published");
  const [firstSeenAt, setFirstSeenAt] = useState("");
  const [lastReviewedAt, setLastReviewedAt] = useState(new Date().toISOString());
  const [markReviewedNow, setMarkReviewedNow] = useState(false);

  // Extended URLs & Amazon Specific Fields
  const [productUrl, setProductUrl] = useState("");
  const [landingPageUrl, setLandingPageUrl] = useState("");
  const [asin, setAsin] = useState("");
  const [amazonAdType, setAmazonAdType] = useState("Sponsored Brands");
  const [searchTerm, setSearchTerm] = useState("");
  const [marketplace, setMarketplace] = useState("Amazon US");

  // Category Manager State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catOrder, setCatOrder] = useState(0);
  const [catActive, setCatActive] = useState(true);
  const [categorySaving, setCategorySaving] = useState(false);

  // Visitor Preview Modal State
  const [previewAd, setPreviewAd] = useState<AdListing | null>(null);

  // Delete/Archive confirmation state
  const [deleteConfirmAd, setDeleteConfirmAd] = useState<{ ad: AdListing; permanent: boolean } | null>(null);

  // Fetch ads and dynamic categories
  const fetchData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Fetch Listings
      const adRes = await fetch("/api/admin/ad-explorer");
      if (adRes.ok) {
        const adData = await adRes.json();
        if (Array.isArray(adData.items)) {
          setAds(adData.items);
        }
        if (adData.isLocalPreview) {
          setIsLocalPreview(true);
        }
      }

      // 2. Fetch Categories
      const catRes = await fetch("/api/admin/categories");
      if (catRes.ok) {
        const catData = await catRes.json();
        if (Array.isArray(catData.categories)) {
          setCategories(catData.categories);
          if (catData.categories.length > 0 && !category) {
            setCategory(catData.categories[0].slug);
          }
        }
      }
    } catch (err: any) {
      console.warn("Using offline fallback data:", err.message);
      setAds(SEED_AD_LISTINGS);
      setIsLocalPreview(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter listings based on active tab & secondary filters
  const filteredAds = ads.filter((ad) => {
    // 1. Active Tab Filter
    if (activeTab === "review") {
      if (ad.status !== "review") return false;
    } else if (activeTab !== "all" && activeTab !== "categories") {
      if (ad.platform !== activeTab) return false;
    }

    // 2. Secondary Dropdown Filters
    if (statusFilter !== "all" && activeTab !== "review" && ad.status !== statusFilter) return false;
    if (categoryFilter !== "all" && ad.category !== categoryFilter) return false;
    if (countryFilter !== "all" && ad.country_code !== countryFilter) return false;

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches =
        ad.brand_name.toLowerCase().includes(q) ||
        (ad.advertiser_name || "").toLowerCase().includes(q) ||
        ad.title.toLowerCase().includes(q) ||
        (ad.short_description || "").toLowerCase().includes(q) ||
        (ad.curator_note || "").toLowerCase().includes(q) ||
        (ad.asin || "").toLowerCase().includes(q) ||
        (ad.search_term || "").toLowerCase().includes(q) ||
        ad.category.toLowerCase().includes(q);
      if (!matches) return false;
    }

    return true;
  });

  // Calculate review queue count
  const reviewCount = ads.filter((a) => a.status === "review").length;

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setPlatform("meta");
    setPlatformSurface("Instagram Reels");
    setBrandName("");
    setAdvertiserName("");
    setTitle("");
    setShortDescription("");
    setHookSummary("");
    setCallToAction("Shop Now ↗");
    setCategory(categories[0]?.slug || "health-ayurvedic");
    setCountryCode("US");
    setCreativeFormat("video");
    setSourceUrl("");
    setMediaUrl("");
    setSourceAdId("");
    setPreviewImagePath("");
    setProductUrl("");
    setLandingPageUrl("");
    setAsin("");
    setAmazonAdType("Sponsored Brands");
    setSearchTerm("");
    setMarketplace("Amazon US");
    setMediaRightsStatus("platform_link_only");
    setCuratorNote("");
    setSignalLabels(["Editor's pick"]);
    setIsFeatured(false);
    setPerformanceEvidenceNote("");
    setStatus("published");
    setFirstSeenAt("");
    setLastReviewedAt(new Date().toISOString());
    setMarkReviewedNow(false);
    setFormErrors({});
    setIsEditorOpen(false);
  };

  // Open Edit Form
  const handleEditClick = (ad: AdListing) => {
    setEditingId(ad.id);
    setPlatform(ad.platform);
    setPlatformSurface(ad.platform_surface || "");
    setBrandName(ad.brand_name);
    setAdvertiserName(ad.advertiser_name || "");
    setTitle(ad.title);
    setShortDescription(ad.short_description || "");
    setHookSummary(ad.hook_summary || "");
    setCallToAction(ad.call_to_action || "");
    setCategory(ad.category);
    setCountryCode(ad.country_code);
    setCreativeFormat(ad.creative_format);
    setSourceUrl(ad.source_url);
    setMediaUrl(ad.media_url || "");
    setSourceAdId(ad.source_ad_id || "");
    setPreviewImagePath(ad.preview_image_path || "");
    setProductUrl(ad.product_url || "");
    setLandingPageUrl(ad.landing_page_url || "");
    setAsin(ad.asin || "");
    setAmazonAdType(ad.amazon_ad_type || "Sponsored Brands");
    setSearchTerm(ad.search_term || "");
    setMarketplace(ad.marketplace || "Amazon US");
    setMediaRightsStatus(ad.media_rights_status);
    setCuratorNote(ad.curator_note || "");
    setSignalLabels(ad.signal_labels || []);
    setIsFeatured(ad.is_featured);
    setPerformanceEvidenceNote(ad.performance_evidence_note || "");
    setStatus(ad.status);
    setFirstSeenAt(ad.first_seen_at ? ad.first_seen_at.substring(0, 10) : "");
    setLastReviewedAt(ad.last_reviewed_at);
    setMarkReviewedNow(false);
    setFormErrors({});
    setIsEditorOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSignalToggle = (signal: string) => {
    if (signalLabels.includes(signal)) {
      setSignalLabels(signalLabels.filter((s) => s !== signal));
    } else {
      setSignalLabels([...signalLabels, signal]);
    }
  };

  // Save Ad Listing (Create or Update)
  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});

    const formData = {
      platform,
      platform_surface: platformSurface || null,
      brand_name: brandName,
      advertiser_name: advertiserName || null,
      title,
      short_description: shortDescription || null,
      hook_summary: hookSummary || null,
      call_to_action: callToAction || null,
      category,
      country_code: countryCode,
      creative_format: creativeFormat,
      source_url: sourceUrl,
      media_url: mediaUrl || null,
      source_ad_id: sourceAdId || null,
      preview_image_path: previewImagePath || null,
      product_url: productUrl || null,
      landing_page_url: landingPageUrl || null,
      asin: platform === "amazon" ? asin || null : null,
      amazon_ad_type: platform === "amazon" ? amazonAdType || null : null,
      search_term: platform === "amazon" ? searchTerm || null : null,
      marketplace: platform === "amazon" ? marketplace || null : null,
      media_rights_status: mediaRightsStatus,
      status,
      is_featured: isFeatured,
      curator_note: curatorNote || null,
      signal_labels: signalLabels,
      performance_evidence_note: performanceEvidenceNote || null,
      first_seen_at: firstSeenAt || null,
      mark_reviewed: markReviewedNow,
    };

    // Client-side Zod validation
    const validation = AdListingSchema.safeParse(formData);
    if (!validation.success) {
      setFormErrors(validation.error.flatten().fieldErrors);
      setSaving(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      const endpoint = "/api/admin/ad-explorer";
      const method = editingId ? "PUT" : "POST";
      const bodyPayload = editingId ? { ...formData, id: editingId } : formData;

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      const resData = await res.json();

      if (!res.ok) {
        if (resData.details) {
          setFormErrors(resData.details);
        } else {
          setErrorMsg(resData.error || "Save operation failed.");
        }
        setSaving(false);
        return;
      }

      if (resData.isLocalPreview) {
        setSuccessMsg(
          editingId
            ? "Session preview updated (Local Preview Mode: changes will not persist across server reloads)."
            : "Listing added to current session preview (Local Preview Mode: not saved to remote DB)."
        );
      } else {
        setSuccessMsg(editingId ? "Listing updated successfully." : "New curated ad created and saved.");
      }

      setTimeout(() => setSuccessMsg(null), 4000);
      await fetchData();
      resetForm();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  // Quick Status Transition
  const handleQuickStatusChange = async (ad: AdListing, newStatus: AdListingStatus) => {
    try {
      const res = await fetch("/api/admin/ad-explorer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...ad,
          status: newStatus,
          mark_reviewed: newStatus === "published",
        }),
      });

      if (res.ok) {
        setSuccessMsg(`Listing updated to ${newStatus.toUpperCase()}.`);
        setTimeout(() => setSuccessMsg(null), 3000);
        fetchData();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Status update failed.");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Archive / Delete execution
  const executeDeleteOrArchive = async () => {
    if (!deleteConfirmAd) return;
    const { ad, permanent } = deleteConfirmAd;
    try {
      const res = await fetch(
        `/api/admin/ad-explorer?id=${encodeURIComponent(ad.id)}&permanent=${permanent ? "true" : "false"}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setSuccessMsg(permanent ? "Listing permanently removed." : "Listing archived successfully.");
        setTimeout(() => setSuccessMsg(null), 3000);
        fetchData();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Action failed.");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setDeleteConfirmAd(null);
    }
  };

  // Category Management Handlers
  const openNewCategoryModal = () => {
    setEditingCategory(null);
    setCatName("");
    setCatSlug("");
    setCatDesc("");
    setCatOrder(categories.length + 1);
    setCatActive(true);
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatDesc(cat.description || "");
    setCatOrder(cat.sort_order);
    setCatActive(cat.is_active);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategorySaving(true);
    try {
      const method = editingCategory ? "PUT" : "POST";
      const payload = {
        id: editingCategory?.id,
        name: catName,
        slug: catSlug.toLowerCase().trim().replace(/\s+/g, "-"),
        description: catDesc,
        sort_order: Number(catOrder),
        is_active: catActive,
      };

      const res = await fetch("/api/admin/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save category");
      }

      setSuccessMsg(editingCategory ? "Category updated." : "New category created.");
      setTimeout(() => setSuccessMsg(null), 3000);
      setIsCategoryModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setCategorySaving(false);
    }
  };

  const handleToggleCategoryActive = async (cat: Category) => {
    try {
      await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cat.id, is_active: !cat.is_active }),
      });
      fetchData();
    } catch {}
  };

  // Live media embed allowlist analysis
  const mediaEmbedAnalysis = parseVideoMediaUrl(mediaUrl);

  return (
    <div className="space-y-8 font-sans antialiased text-[#EDEDED]">
      {/* Top Banner for Local Dev if env vars missing */}
      {isLocalPreview && (
        <div className="p-4 rounded-2xl bg-amber-950/70 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div>
              <span className="font-bold text-amber-300">Local Admin Preview Mode:</span> Supabase credentials (
              <code className="text-white bg-black/40 px-1.5 py-0.5 rounded text-[11px]">NEXT_PUBLIC_SUPABASE_URL</code> &amp;{" "}
              <code className="text-white bg-black/40 px-1.5 py-0.5 rounded text-[11px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>) are not configured.
              <span className="block text-amber-200/80 text-[11px] mt-0.5">
                Listing and category edits are simulated in-session and will not persist across server reloads.
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30 whitespace-nowrap">
            Database Persistence Disabled
          </span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-[#131517] border border-white/10 shadow-2xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#C8FF00]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cross-Platform Intelligence Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-white tracking-tight">
            Ad Explorer Operations
          </h1>
          <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
            Manually research ads across Meta, Google, LinkedIn, TikTok, X, and Amazon Ads. Organize findings,
            configure categories, verify hooks, and publish curated listings for public visitors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (isEditorOpen) {
                resetForm();
              } else {
                resetForm();
                setIsEditorOpen(true);
              }
            }}
            className="px-5 py-2.5 rounded-full bg-[#C8FF00] text-black font-semibold text-xs hover:bg-[#b0e600] transition-colors flex items-center gap-2 shadow-lg"
          >
            {isEditorOpen ? (
              <>
                <X className="w-4 h-4" />
                <span>Close Editor</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add New Listing</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)}>
            <X className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)}>
            <X className="w-4 h-4 text-rose-400" />
          </button>
        </div>
      )}

      {/* Slide-over / Expandable Editor Drawer */}
      {isEditorOpen && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#141619] border border-[#C8FF00]/30 shadow-2xl space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C8FF00] animate-pulse" />
              <h2 className="text-xl font-serif text-white">
                {editingId ? "Edit Curated Listing" : "Scaffold New Ad Listing"}
              </h2>
            </div>
            <button
              onClick={resetForm}
              className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isLocalPreview && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>
                <strong>Notice:</strong> Local preview mode active. Saving this form updates your local browser session only and will not persist to a remote database.
              </span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSaveListing} className="space-y-6">
            {/* Section 1: Platform & Surface */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-4">
              <span className="text-xs font-mono font-semibold text-[#C8FF00] uppercase tracking-wider">
                1. Target Network &amp; Placement
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                    Platform <span className="text-[#C8FF00]">*</span>
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => {
                      const p = e.target.value as AdPlatform;
                      setPlatform(p);
                      setPlatformSurface(PLATFORMS_CONFIG[p].surfaces[0] || "");
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs font-mono focus:border-[#C8FF00] focus:outline-none"
                  >
                    {ALL_PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {PLATFORMS_CONFIG[p].name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                    Placement / Surface
                  </label>
                  <input
                    type="text"
                    value={platformSurface}
                    onChange={(e) => setPlatformSurface(e.target.value)}
                    placeholder={PLATFORMS_CONFIG[platform].surfaces[0] || "Placement description"}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs placeholder:text-neutral-600 focus:border-[#C8FF00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                    Creative Format <span className="text-[#C8FF00]">*</span>
                  </label>
                  <select
                    value={creativeFormat}
                    onChange={(e) => setCreativeFormat(e.target.value as CreativeFormat)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs font-mono focus:border-[#C8FF00] focus:outline-none"
                  >
                    <option value="video">Video (9:16 or 16:9)</option>
                    <option value="image">Single Image</option>
                    <option value="carousel">Carousel Deck</option>
                    <option value="text">Text / Search</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Amazon-Specific Research Box (Shown conditionally when Amazon is selected) */}
            {platform === "amazon" && (
              <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider">
                    <ShoppingBag className="w-4 h-4" />
                    <span>Amazon Ads Research Fields (Optional)</span>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400">
                    Manual curation · No third-party scraping
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                      ASIN (Amazon Standard ID)
                    </label>
                    <input
                      type="text"
                      value={asin}
                      onChange={(e) => setAsin(e.target.value.toUpperCase())}
                      placeholder="e.g. B08HSHILAJ"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs font-mono placeholder:text-neutral-600 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                      Amazon Ad Type
                    </label>
                    <select
                      value={amazonAdType}
                      onChange={(e) => setAmazonAdType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
                    >
                      <option value="Sponsored Products">Sponsored Products</option>
                      <option value="Sponsored Brands">Sponsored Brands (Headline Video)</option>
                      <option value="Sponsored Display">Sponsored Display</option>
                      <option value="Prime Video Placement">Prime Video Placement</option>
                      <option value="Amazon DSP">Amazon DSP / Video</option>
                      <option value="Storefront Spotlight">Storefront Spotlight</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                      Amazon Marketplace
                    </label>
                    <select
                      value={marketplace}
                      onChange={(e) => setMarketplace(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
                    >
                      <option value="Amazon US">Amazon US (amazon.com)</option>
                      <option value="Amazon IN">Amazon India (amazon.in)</option>
                      <option value="Amazon UK">Amazon UK (amazon.co.uk)</option>
                      <option value="Amazon DE">Amazon Germany (amazon.de)</option>
                      <option value="Amazon Global">Amazon Global / Multi-marketplace</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                      Target Search Term / Keyword Observed
                    </label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="e.g. shilajit pure resin, organic vitamin c"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs placeholder:text-neutral-600 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                      Amazon Product Page URL
                    </label>
                    <input
                      type="url"
                      value={productUrl}
                      onChange={(e) => setProductUrl(e.target.value)}
                      placeholder="https://www.amazon.com/dp/B08HSHILAJ"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs font-mono placeholder:text-neutral-600 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section 2: Core Identity & Copy */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-4">
              <span className="text-xs font-mono font-semibold text-[#C8FF00] uppercase tracking-wider">
                2. Brand, Headline &amp; Category
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                    Brand Name <span className="text-[#C8FF00]">*</span>
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Kapiva, Gymshark, Minimalist"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border ${
                      formErrors.brand_name ? "border-rose-500" : "border-white/10"
                    } text-white text-xs placeholder:text-neutral-600 focus:border-[#C8FF00] focus:outline-none`}
                  />
                  {formErrors.brand_name && (
                    <p className="text-[11px] text-rose-400 mt-1">{formErrors.brand_name[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                    Advertiser Entity / Seller Name
                  </label>
                  <input
                    type="text"
                    value={advertiserName}
                    onChange={(e) => setAdvertiserName(e.target.value)}
                    placeholder="e.g. Adret Retail Pvt Ltd"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs placeholder:text-neutral-600 focus:border-[#C8FF00] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                  Headline / Ad Title <span className="text-[#C8FF00]">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Pure Himalayan Shilajit Resin Authentic Lab-Tested Potency"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border ${
                    formErrors.title ? "border-rose-500" : "border-white/10"
                  } text-white text-xs placeholder:text-neutral-600 focus:border-[#C8FF00] focus:outline-none`}
                />
                {formErrors.title && (
                  <p className="text-[11px] text-rose-400 mt-1">{formErrors.title[0]}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                    Database-Driven Category <span className="text-[#C8FF00]">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs font-mono focus:border-[#C8FF00] focus:outline-none"
                  >
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.slug}>
                          {cat.name} {!cat.is_active && "(Inactive)"}
                        </option>
                      ))
                    ) : (
                      INITIAL_AD_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.label}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                    Country / Market <span className="text-[#C8FF00]">*</span>
                  </label>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs font-mono focus:border-[#C8FF00] focus:outline-none"
                  >
                    {AD_COUNTRIES.filter((c) => c.id !== "all").map((cnt) => (
                      <option key={cnt.id} value={cnt.id}>
                        {cnt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                  Ad Copy Excerpt / Description
                </label>
                <textarea
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  rows={2}
                  placeholder="Primary ad copy transcript or brief overview..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs placeholder:text-neutral-600 focus:border-[#C8FF00] focus:outline-none"
                />
              </div>
            </div>

            {/* Section 3: Links & Media */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-4">
              <span className="text-xs font-mono font-semibold text-[#C8FF00] uppercase tracking-wider">
                3. URLs &amp; Playable Media (HTTPS Only)
              </span>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                    Official Source / Ad Library URL <span className="text-[#C8FF00]">*</span>
                  </label>
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://www.facebook.com/ads/library/?id=... or https://www.amazon.com/dp/..."
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border ${
                      formErrors.source_url ? "border-rose-500" : "border-white/10"
                    } text-white text-xs font-mono placeholder:text-neutral-600 focus:border-[#C8FF00] focus:outline-none`}
                  />
                  {formErrors.source_url && (
                    <p className="text-[11px] text-rose-400 mt-1">{formErrors.source_url[0]}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                      Landing Page / Brand Store URL
                    </label>
                    <input
                      type="url"
                      value={landingPageUrl}
                      onChange={(e) => setLandingPageUrl(e.target.value)}
                      placeholder="https://brand.com/landing or https://amazon.com/stores/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs font-mono placeholder:text-neutral-600 focus:border-[#C8FF00] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                      Poster / Preview Image URL
                    </label>
                    <input
                      type="text"
                      value={previewImagePath}
                      onChange={(e) => setPreviewImagePath(e.target.value)}
                      placeholder="https://images.unsplash.com/... or preview URL"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs font-mono placeholder:text-neutral-600 focus:border-[#C8FF00] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                    Media URL (Video / Playable Embed)
                  </label>
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or direct https://.../video.mp4"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border ${
                      formErrors.media_url ? "border-rose-500" : "border-white/10"
                    } text-white text-xs font-mono placeholder:text-neutral-600 focus:border-[#C8FF00] focus:outline-none`}
                  />
                  {mediaUrl.trim() && (
                    <div className="mt-2 p-3 rounded-xl bg-[#17191C] border border-white/5 flex items-center gap-2 text-xs font-mono">
                      {mediaEmbedAnalysis.canEmbed ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-[#C8FF00]" />
                          <span className="text-white">
                            Verified Provider:{" "}
                            <strong className="text-[#C8FF00] uppercase">
                              {mediaEmbedAnalysis.provider}
                            </strong>{" "}
                            (Sandboxed inline playback enabled)
                          </span>
                        </>
                      ) : (
                        <>
                          <Info className="w-4 h-4 text-amber-400" />
                          <span className="text-neutral-300">
                            {mediaEmbedAnalysis.notice || "External library link reference (will open in verified portal)"}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 4: Creative Analysis & Signals */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-4">
              <span className="text-xs font-mono font-semibold text-[#C8FF00] uppercase tracking-wider">
                4. Psychological Breakdown &amp; Signals
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                    Hook Summary (Initial 3 Seconds)
                  </label>
                  <input
                    type="text"
                    value={hookSummary}
                    onChange={(e) => setHookSummary(e.target.value)}
                    placeholder="e.g. Dissolution test in warm milk: 3-second proof of purity."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs placeholder:text-neutral-600 focus:border-[#C8FF00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                    Call To Action
                  </label>
                  <input
                    type="text"
                    value={callToAction}
                    onChange={(e) => setCallToAction(e.target.value)}
                    placeholder="e.g. Shop on Amazon ↗"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs placeholder:text-neutral-600 focus:border-[#C8FF00] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                  Curator Note (Editorial commentary)
                </label>
                <textarea
                  value={curatorNote}
                  onChange={(e) => setCuratorNote(e.target.value)}
                  rows={2}
                  placeholder="Why this creative pattern works: pacing, retention hooks, authentic lighting..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs placeholder:text-neutral-600 focus:border-[#C8FF00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 mb-2">
                  Evidence-Based Signal Badges
                </label>
                <div className="flex flex-wrap gap-2">
                  {CURATOR_SIGNALS.filter((s) => s.id !== "all").map((sig) => {
                    const isSelected = signalLabels.includes(sig.id);
                    return (
                      <button
                        type="button"
                        key={sig.id}
                        onClick={() => handleSignalToggle(sig.id)}
                        className={`px-3 py-1 rounded-full text-xs font-mono transition-colors border ${
                          isSelected
                            ? "bg-[#C8FF00]/20 text-[#C8FF00] border-[#C8FF00]/50"
                            : "bg-[#1C1F23] text-neutral-400 border-white/5 hover:border-white/20"
                        }`}
                      >
                        {sig.label} {isSelected && "✓"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                  Observed Runtime Evidence Note (Do not invent metrics)
                </label>
                <input
                  type="text"
                  value={performanceEvidenceNote}
                  onChange={(e) => setPerformanceEvidenceNote(e.target.value)}
                  placeholder="e.g. Verified in Amazon search headline placement across Q3/Q4 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs placeholder:text-neutral-600 focus:border-[#C8FF00] focus:outline-none"
                />
              </div>
            </div>

            {/* Section 5: Review & Lifecycle State */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-4">
              <span className="text-xs font-mono font-semibold text-[#C8FF00] uppercase tracking-wider">
                5. Lifecycle &amp; Verification State
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                    Listing Status <span className="text-[#C8FF00]">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as AdListingStatus)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs font-mono focus:border-[#C8FF00] focus:outline-none"
                  >
                    <option value="draft">Draft (Private)</option>
                    <option value="review">Needs Review (Quality Check)</option>
                    <option value="published">Published (Visible to Public)</option>
                    <option value="archived">Archived (Hidden)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                    First Observed Date
                  </label>
                  <input
                    type="date"
                    value={firstSeenAt}
                    onChange={(e) => setFirstSeenAt(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs font-mono focus:border-[#C8FF00] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-5">
                  <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 text-[#C8FF00] focus:ring-[#C8FF00]"
                    />
                    <span className="text-white">Editor&rsquo;s Featured Pick</span>
                  </label>
                </div>
              </div>

              {/* Intentional Review Timestamp Control */}
              <div className="p-4 rounded-xl bg-[#181A1D] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-mono text-neutral-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Last Editorial Verification:</span>
                    <strong className="text-white ml-1">
                      {new Date(lastReviewedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </strong>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    `last_reviewed_at` is preserved on edits and refreshed only when intentionally verified.
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={markReviewedNow}
                    onChange={(e) => setMarkReviewedNow(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 text-[#C8FF00] focus:ring-[#C8FF00]"
                  />
                  <span className="font-mono text-neutral-200">
                    Verify &amp; mark reviewed today
                  </span>
                </label>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => {
                  const mockAd: AdListing = {
                    id: editingId || "preview_id",
                    platform,
                    platform_surface: platformSurface,
                    brand_name: brandName || "Preview Brand",
                    advertiser_name: advertiserName || brandName || "Preview Advertiser",
                    title: title || "Preview Title",
                    short_description: shortDescription,
                    hook_summary: hookSummary,
                    call_to_action: callToAction,
                    category,
                    country_code: countryCode,
                    creative_format: creativeFormat,
                    source_url: sourceUrl || "https://amazon.com",
                    media_url: mediaUrl || undefined,
                    media_provider: mediaEmbedAnalysis.provider,
                    preview_image_path: previewImagePath || undefined,
                    product_url: productUrl || undefined,
                    landing_page_url: landingPageUrl || undefined,
                    asin: asin || undefined,
                    amazon_ad_type: amazonAdType || undefined,
                    search_term: searchTerm || undefined,
                    marketplace: marketplace || undefined,
                    media_rights_status: mediaRightsStatus,
                    last_reviewed_at: lastReviewedAt,
                    status,
                    curator_note: curatorNote,
                    signal_labels: signalLabels,
                    is_featured: isFeatured,
                    performance_evidence_note: performanceEvidenceNote,
                    created_at: new Date().toISOString(),
                  };
                  setPreviewAd(mockAd);
                }}
                className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-mono border border-white/10 flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-[#C8FF00]" />
                <span>Preview as Visitor</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-full text-neutral-400 hover:text-white text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full bg-[#C8FF00] text-black text-xs font-bold font-mono hover:bg-[#b0e600] disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingId ? "Save Changes" : "Create Listing"}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Primary Section Tabs: All, Platforms, Amazon, Categories, Review Queue */}
      <div className="border-b border-white/10 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-mono">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "all"
                ? "bg-[#C8FF00] text-black font-bold shadow-md"
                : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5"
            }`}
          >
            <span>All Ads</span>
            <span className="opacity-75 text-[11px]">({ads.length})</span>
          </button>

          {ALL_PLATFORMS.map((p) => {
            const count = ads.filter((a) => a.platform === p).length;
            const cfg = PLATFORMS_CONFIG[p];
            return (
              <button
                key={p}
                onClick={() => setActiveTab(p as AdminTab)}
                className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === p
                    ? "bg-white text-black font-bold shadow-md"
                    : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                <PlatformIcon platform={p} size={13} />
                <span>{cfg.shortName}</span>
                <span className="opacity-60 text-[11px]">({count})</span>
              </button>
            );
          })}

          {/* Review Queue Tab */}
          <button
            onClick={() => setActiveTab("review")}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "review"
                ? "bg-amber-400 text-black font-bold shadow-md"
                : "bg-white/5 text-amber-300/80 hover:text-amber-300 hover:bg-white/10 border border-white/5"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Review Queue</span>
            {reviewCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-300 text-[10px] font-bold">
                {reviewCount}
              </span>
            )}
          </button>

          {/* Categories Manager Tab */}
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "categories"
                ? "bg-purple-400 text-black font-bold shadow-md"
                : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Categories</span>
            <span className="opacity-60 text-[11px]">({categories.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW A: CATEGORIES MANAGEMENT PANEL */}
      {activeTab === "categories" ? (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#131517] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-purple-400 uppercase tracking-wider mb-1">
                <Tag className="w-3.5 h-3.5" />
                <span>Dynamic Database Taxonomy</span>
              </div>
              <h3 className="text-xl font-serif text-white">Cross-Platform Category Management</h3>
              <p className="text-xs text-neutral-400 max-w-xl mt-1 leading-relaxed">
                Add, rename, reorder, or deactivate categories. Categories automatically sync with all ad platform filters and studio briefs.
              </p>
            </div>

            <button
              onClick={openNewCategoryModal}
              className="px-4 py-2 rounded-full bg-purple-400 text-black text-xs font-mono font-semibold hover:bg-purple-300 transition-colors flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="rounded-3xl bg-[#131517] border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-black/50 text-neutral-400 border-b border-white/10 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-5">Order</th>
                    <th className="py-3 px-5">Category Name</th>
                    <th className="py-3 px-5">Slug</th>
                    <th className="py-3 px-5">Description</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-neutral-300">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-5 font-bold text-white">#{cat.sort_order}</td>
                      <td className="py-3.5 px-5 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-purple-400" />
                          <span>{cat.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-neutral-400">{cat.slug}</td>
                      <td className="py-3.5 px-5 text-neutral-400 max-w-md truncate">
                        {cat.description || "—"}
                      </td>
                      <td className="py-3.5 px-5">
                        <button
                          onClick={() => handleToggleCategoryActive(cat)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                            cat.is_active
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                          }`}
                        >
                          {cat.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="py-3.5 px-5 text-right space-x-2">
                        <button
                          onClick={() => openEditCategoryModal(cat)}
                          className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW B: UNIFIED AD CATALOGUE */
        <div className="space-y-6">
          {/* Universal Search & Secondary Filters */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#131517] border border-white/10 space-y-4 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search brand, ASIN, headline, or keyword..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs placeholder:text-neutral-500 focus:border-[#C8FF00] focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs font-mono focus:border-[#C8FF00] focus:outline-none"
                >
                  <option value="all">All Lifecycle States</option>
                  <option value="published">Published (Live)</option>
                  <option value="review">Needs Review</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs font-mono focus:border-[#C8FF00] focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-neutral-500">Marketplace:</span>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-[#1C1F23] border border-white/10 text-neutral-300 text-xs focus:border-[#C8FF00] focus:outline-none"
                >
                  <option value="all">All Markets</option>
                  {AD_COUNTRIES.filter((c) => c.id !== "all").map((cnt) => (
                    <option key={cnt.id} value={cnt.id}>
                      {cnt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-neutral-400">
                Displaying <strong className="text-white">{filteredAds.length}</strong> of{" "}
                <strong>{ads.length}</strong> total records
              </div>
            </div>
          </div>

          {/* Listings Grid */}
          {loading ? (
            <div className="p-12 text-center text-xs font-mono text-neutral-400 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-5 h-5 text-[#C8FF00] animate-spin" />
              <span>Querying curated catalogue...</span>
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#131517] border border-white/10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-neutral-400">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-serif text-white">No ad listings found</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                No listings matched the active platform tab, search query, or lifecycle filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                  setCountryFilter("all");
                  setActiveTab("all");
                }}
                className="px-4 py-2 rounded-full bg-white/10 text-white text-xs font-mono hover:bg-white/15 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAds.map((ad) => {
                const platformConfig = PLATFORMS_CONFIG[ad.platform];
                const isLive = ad.status === "published";
                const isReview = ad.status === "review";
                const isDraft = ad.status === "draft";

                return (
                  <div
                    key={ad.id}
                    className="group rounded-3xl bg-[#131517] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between overflow-hidden shadow-xl"
                  >
                    <div>
                      {/* Top Preview Media */}
                      <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
                        {ad.preview_image_path ? (
                          <img
                            src={ad.preview_image_path}
                            alt={ad.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1C1F23] to-[#121316] p-4 text-center">
                            <PlatformIcon platform={ad.platform} size={30} className="opacity-40 mb-1" />
                            <span className="text-xs font-mono text-neutral-400">{ad.brand_name}</span>
                            <span className="text-[10px] text-neutral-600">
                              {ad.platform_surface || platformConfig.name}
                            </span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-[#131517] via-transparent to-black/60 pointer-events-none" />

                        {/* Platform Badge */}
                        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                          <div
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold backdrop-blur-md border shadow-sm"
                            style={{
                              backgroundColor: platformConfig.badgeBg,
                              color: platformConfig.badgeText,
                              borderColor: `${platformConfig.accentColor}40`,
                            }}
                          >
                            <PlatformIcon platform={ad.platform} size={11} />
                            <span>{platformConfig.shortName}</span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="absolute top-3 right-3 z-10">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase backdrop-blur-md border ${
                              isLive
                                ? "bg-[#C8FF00]/15 text-[#C8FF00] border-[#C8FF00]/30"
                                : isReview
                                ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                : isDraft
                                ? "bg-white/10 text-neutral-300 border-white/20"
                                : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                            }`}
                          >
                            {ad.status}
                          </span>
                        </div>

                        {/* Amazon ASIN / Placement badge if applicable */}
                        {ad.asin && (
                          <div className="absolute bottom-3 left-3 z-10">
                            <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-amber-500/30 text-[10px] font-mono text-amber-400 flex items-center gap-1">
                              <span>ASIN: {ad.asin}</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-neutral-400 font-semibold">{ad.brand_name}</span>
                          <span className="text-neutral-500 text-[11px] uppercase">
                            {ad.category} · {ad.country_code}
                          </span>
                        </div>

                        <h3 className="text-base font-serif font-medium text-white line-clamp-2">
                          {ad.title}
                        </h3>

                        {ad.hook_summary && (
                          <p className="text-xs text-neutral-400 italic line-clamp-2 border-l-2 border-[#C8FF00]/40 pl-2">
                            &ldquo;{ad.hook_summary}&rdquo;
                          </p>
                        )}

                        <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                          <span>
                            Verified:{" "}
                            <strong className="text-neutral-300">
                              {new Date(ad.last_reviewed_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </strong>
                          </span>
                          {ad.is_featured && (
                            <span className="text-[#C8FF00] font-semibold">★ Featured</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="p-4 bg-black/40 border-t border-white/5 space-y-2.5">
                      <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
                        <span className="text-neutral-500">Lifecycle:</span>
                        <div className="flex items-center gap-1">
                          {ad.status !== "published" && (
                            <button
                              onClick={() => handleQuickStatusChange(ad, "published")}
                              className="px-2 py-1 rounded-md bg-[#C8FF00]/10 hover:bg-[#C8FF00]/20 text-[#C8FF00] border border-[#C8FF00]/30 transition-colors"
                              title="Publish Listing"
                            >
                              Publish
                            </button>
                          )}
                          {ad.status !== "review" && (
                            <button
                              onClick={() => handleQuickStatusChange(ad, "review")}
                              className="px-2 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors"
                              title="Send to Review Queue"
                            >
                              Needs Review
                            </button>
                          )}
                          {ad.status !== "draft" && (
                            <button
                              onClick={() => handleQuickStatusChange(ad, "draft")}
                              className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 transition-colors"
                              title="Revert to Draft"
                            >
                              Draft
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setPreviewAd(ad)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
                            title="Preview Visitor View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <a
                            href={ad.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
                            title="Open Source Library URL"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(ad)}
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-semibold transition-colors flex items-center gap-1.5"
                          >
                            <Edit3 className="w-3 h-3 text-[#C8FF00]" />
                            <span>Edit</span>
                          </button>

                          {ad.status !== "archived" ? (
                            <button
                              onClick={() => setDeleteConfirmAd({ ad, permanent: false })}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors"
                              title="Archive Listing"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmAd({ ad, permanent: true })}
                              className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 transition-colors"
                              title="Permanently Delete Listing"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Category Editor / Add Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#141618] border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-serif text-white">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-neutral-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value);
                    if (!editingCategory) {
                      setCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                    }
                  }}
                  placeholder="e.g. Health & Ayurvedic Products"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#1C1F23] border border-white/10 text-white focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Slug (URL identifier) *</label>
                <input
                  type="text"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value.toLowerCase())}
                  placeholder="e.g. health-ayurvedic"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#1C1F23] border border-white/10 text-white focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Description</label>
                <textarea
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Overview of products and brands in this category..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-[#1C1F23] border border-white/10 text-white focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-neutral-300 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={catOrder}
                    onChange={(e) => setCatOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#1C1F23] border border-white/10 text-white focus:border-purple-400 focus:outline-none"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-white">
                    <input
                      type="checkbox"
                      checked={catActive}
                      onChange={(e) => setCatActive(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-400"
                    />
                    <span>Active Status</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-full text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={categorySaving}
                  className="px-5 py-2 rounded-full bg-purple-400 text-black font-bold hover:bg-purple-300 transition-colors"
                >
                  {categorySaving ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog: Archive or Permanent Deletion */}
      {deleteConfirmAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#141618] border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-serif text-white">
                  {deleteConfirmAd.permanent ? "Permanently Delete Listing?" : "Archive Ad Listing?"}
                </h3>
                <p className="text-xs text-neutral-400">
                  {deleteConfirmAd.ad.brand_name} · {deleteConfirmAd.ad.title}
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              {deleteConfirmAd.permanent
                ? "This will permanently remove the record from the database. This action cannot be undone."
                : "Archiving hides the listing from public visitors while preserving all curation notes, tags, and review history."}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmAd(null)}
                className="px-4 py-2 rounded-full text-neutral-400 hover:text-white text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={executeDeleteOrArchive}
                className="px-5 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold font-mono transition-colors shadow-lg"
              >
                {deleteConfirmAd.permanent ? "Confirm Delete" : "Confirm Archive"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visitor Preview Modal */}
      {previewAd && (
        <AdDetailModal ad={previewAd} onClose={() => setPreviewAd(null)} />
      )}
    </div>
  );
}
