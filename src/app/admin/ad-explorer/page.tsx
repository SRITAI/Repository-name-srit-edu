"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Upload,
  ChevronUp,
  CheckSquare,
  Square,
  FileVideo,
  Image as ImageIcon,
  Loader2,
  UploadCloud,
  XCircle,
  RotateCcw,
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
  AdMediaItem,
  AdMediaType,
} from "@/lib/supabase/types";
import { PlatformIcon } from "@/components/ad-explorer/PlatformIcon";
import { parseVideoMediaUrl } from "@/lib/media/video-embed";
import { SafeVideoPlayer } from "@/components/ad-explorer/SafeVideoPlayer";
import { AdListingSchema, CategorySchema, isMetaAdLibraryUrl } from "@/lib/validation/ad-listing";
import { AdDetailModal } from "@/components/ad-explorer/AdDetailModal";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import {
  startResumableUpload,
  validateMediaFile,
  formatBytes,
  UploadProgress,
  ActiveUploadHandle,
  MAX_FILE_SIZE_BYTES,
} from "@/lib/storage/resumable-upload";

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
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  // Core Ad Form Fields (Step 1)
  const [platform, setPlatform] = useState<AdPlatform>("meta");
  const [platformSurface, setPlatformSurface] = useState("Instagram Reels");
  const [brandName, setBrandName] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("health-ayurvedic");
  const [countryCode, setCountryCode] = useState("US");
  const [creativeFormat, setCreativeFormat] = useState<CreativeFormat>("video");
  const [sourceUrl, setSourceUrl] = useState("");

  // Media & Assets (Step 2)
  const [mediaItems, setMediaItems] = useState<AdMediaItem[]>([]);
  const [mediaUrl, setMediaUrl] = useState("");
  const [previewImagePath, setPreviewImagePath] = useState("");
  const [rightsAcknowledged, setRightsAcknowledged] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Real Upload Progress State
  const [uploadState, setUploadState] = useState<{
    status: "idle" | "validating" | "uploading" | "complete" | "failed";
    progress: UploadProgress | null;
    fileName: string | null;
    fileSize: number | null;
    errorMessage: string | null;
    targetIndex: number | null;
  }>({
    status: "idle",
    progress: null,
    fileName: null,
    fileSize: null,
    errorMessage: null,
    targetIndex: null,
  });
  const activeUploadRef = useRef<ActiveUploadHandle | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Separate Saving State
  const [saveState, setSaveState] = useState<{
    status: "idle" | "saving" | "saved" | "failed";
    errorMessage: string | null;
  }>({
    status: "idle",
    errorMessage: null,
  });

  // Optional / Advanced Details Fields (Collapsed section)
  const [advertiserName, setAdvertiserName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [hookSummary, setHookSummary] = useState("");
  const [callToAction, setCallToAction] = useState("Shop Now ↗");
  const [landingPageUrl, setLandingPageUrl] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [sourceAdId, setSourceAdId] = useState("");
  const [mediaRightsStatus, setMediaRightsStatus] = useState<MediaRightsStatus>("platform_link_only");
  const [curatorNote, setCuratorNote] = useState("");
  const [signalLabels, setSignalLabels] = useState<string[]>(["Editor's pick"]);
  const [performanceEvidenceNote, setPerformanceEvidenceNote] = useState("");
  const [firstSeenAt, setFirstSeenAt] = useState("");

  // Amazon-specific metadata
  const [asin, setAsin] = useState("");
  const [amazonAdType, setAmazonAdType] = useState("Sponsored Brands");
  const [searchTerm, setSearchTerm] = useState("");
  const [marketplace, setMarketplace] = useState("Amazon US");

  // Lifecycle State (Step 3)
  const [status, setStatus] = useState<AdListingStatus>("published");
  const [isFeatured, setIsFeatured] = useState(false);
  const [lastReviewedAt, setLastReviewedAt] = useState(new Date().toISOString());
  const [markReviewedNow, setMarkReviewedNow] = useState(false);

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

  // Filter listings
  const filteredAds = ads.filter((ad) => {
    // 1. Tab filter
    if (activeTab === "review" && ad.status !== "review") return false;
    if (activeTab !== "all" && activeTab !== "review" && activeTab !== "categories" && ad.platform !== activeTab) {
      return false;
    }

    // 2. Status filter
    if (statusFilter !== "all" && ad.status !== statusFilter) return false;

    // 3. Category filter
    if (categoryFilter !== "all" && ad.category !== categoryFilter) return false;

    // 4. Country filter
    if (countryFilter !== "all" && ad.country_code !== countryFilter) return false;

    // 5. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchBrand = ad.brand_name.toLowerCase().includes(q);
      const matchAdvertiser = (ad.advertiser_name || "").toLowerCase().includes(q);
      const matchTitle = ad.title.toLowerCase().includes(q);
      const matchHook = (ad.hook_summary || "").toLowerCase().includes(q);
      const matchDesc = (ad.short_description || "").toLowerCase().includes(q);
      const matchNote = (ad.curator_note || "").toLowerCase().includes(q);
      const matchCat = ad.category.toLowerCase().includes(q);
      const matchAsin = (ad.asin || "").toLowerCase().includes(q);
      const matchSearch = (ad.search_term || "").toLowerCase().includes(q);
      if (
        !matchBrand &&
        !matchAdvertiser &&
        !matchTitle &&
        !matchHook &&
        !matchDesc &&
        !matchNote &&
        !matchCat &&
        !matchAsin &&
        !matchSearch
      ) {
        return false;
      }
    }

    return true;
  });

  // Reset Form
  const resetForm = () => {
    if (activeUploadRef.current) {
      activeUploadRef.current.abort();
      activeUploadRef.current = null;
    }
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
    setMediaItems([]);
    setRightsAcknowledged(false);
    setUploadState({
      status: "idle",
      progress: null,
      fileName: null,
      fileSize: null,
      errorMessage: null,
      targetIndex: null,
    });
    setPendingFile(null);
    setSaveState({
      status: "idle",
      errorMessage: null,
    });
    setFormErrors({});
    setIsAdvancedOpen(false);
    setIsEditorOpen(false);
  };

  // Open Edit Form
  const handleEditClick = (ad: AdListing) => {
    resetForm();
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

    // If ad has advanced fields populated, expand advanced section automatically
    if (
      ad.advertiser_name ||
      ad.short_description ||
      ad.hook_summary ||
      ad.curator_note ||
      ad.asin ||
      ad.search_term ||
      (ad.signal_labels && ad.signal_labels.length > 0)
    ) {
      setIsAdvancedOpen(true);
    }

    // Populate media items
    if (ad.media_items && ad.media_items.length > 0) {
      setMediaItems(ad.media_items);
    } else if (ad.media_url) {
      const isDirect =
        ad.media_url.endsWith(".mp4") ||
        ad.media_url.endsWith(".webm") ||
        ad.media_url.endsWith(".mov");
      setMediaItems([
        {
          media_type: isDirect ? "hosted_video" : "embed",
          media_url: ad.media_url,
          thumbnail_url: ad.preview_image_path || null,
          caption: ad.title,
          display_order: 0,
        },
      ]);
    } else if (ad.preview_image_path) {
      setMediaItems([
        {
          media_type: "image",
          media_url: ad.preview_image_path,
          thumbnail_url: ad.preview_image_path,
          caption: ad.title,
          display_order: 0,
        },
      ]);
    } else {
      setMediaItems([]);
    }

    setIsEditorOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Media items management helpers
  const handleAddMediaItem = (type: AdMediaType = "embed") => {
    setMediaItems((prev) => [
      ...prev,
      {
        media_type: type,
        media_url: "",
        thumbnail_url: "",
        caption: "",
        display_order: prev.length,
      },
    ]);
  };

  const handleUpdateMediaItem = (index: number, patch: Partial<AdMediaItem>) => {
    setMediaItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const handleRemoveMediaItem = (index: number) => {
    setMediaItems((prev) =>
      prev.filter((_, i) => i !== index).map((m, i) => ({ ...m, display_order: i }))
    );
  };

  const handleMoveMediaItem = (index: number, dir: "up" | "down") => {
    const targetIndex = dir === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= mediaItems.length) return;
    const next = [...mediaItems];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    setMediaItems(next.map((m, i) => ({ ...m, display_order: i })));
  };

  // Resumable Storage Upload with tus-js-client
  const handleStartUpload = async (file: File, targetIndex: number | null = null) => {
    if (!file) return;

    // 1. Rights confirmation check
    if (!rightsAcknowledged) {
      setUploadState({
        status: "failed",
        progress: null,
        fileName: file.name,
        fileSize: file.size,
        errorMessage:
          "Please check the authorization box below confirming you own or have permission to host this creative asset.",
        targetIndex,
      });
      return;
    }

    // 2. Pre-upload validation (file size <= 50MB, allowed extensions)
    setUploadState({
      status: "validating",
      progress: null,
      fileName: file.name,
      fileSize: file.size,
      errorMessage: null,
      targetIndex,
    });

    const validation = validateMediaFile(file);
    if (!validation.valid) {
      setUploadState({
        status: "failed",
        progress: null,
        fileName: file.name,
        fileSize: file.size,
        errorMessage: validation.error || "Invalid file format or size.",
        targetIndex,
      });
      return;
    }

    setPendingFile(file);

    // 3. Initiate byte-by-byte resumable TUS upload
    setUploadState({
      status: "uploading",
      progress: {
        bytesUploaded: 0,
        bytesTotal: file.size,
        percentage: 0,
        formattedUploaded: "0 B",
        formattedTotal: formatBytes(file.size),
      },
      fileName: file.name,
      fileSize: file.size,
      errorMessage: null,
      targetIndex,
    });

    try {
      const handle = await startResumableUpload({
        file,
        onProgress: (progress) => {
          setUploadState((prev) => ({
            ...prev,
            status: "uploading",
            progress,
          }));
        },
        onSuccess: (publicUrl, storagePath) => {
          setUploadState((prev) => ({
            ...prev,
            status: "complete",
            progress: {
              bytesUploaded: file.size,
              bytesTotal: file.size,
              percentage: 100,
              formattedUploaded: formatBytes(file.size),
              formattedTotal: formatBytes(file.size),
            },
          }));

          const isImg = validation.fileType === "image";

          if (targetIndex !== null && targetIndex >= 0 && targetIndex < mediaItems.length) {
            // Update targeted existing item
            handleUpdateMediaItem(targetIndex, {
              media_url: publicUrl,
              media_type: isImg ? "image" : "hosted_video",
              caption: mediaItems[targetIndex].caption || file.name,
              thumbnail_url: isImg ? publicUrl : (mediaItems[targetIndex].thumbnail_url || null),
              metadata: {
                original_filename: file.name,
                file_size_bytes: file.size,
                storage_path: storagePath,
              },
            });
          } else {
            // Append as new media item in collection
            const newItem: AdMediaItem = {
              id: `temp_${Date.now()}`,
              media_type: isImg ? "image" : "hosted_video",
              media_url: publicUrl,
              thumbnail_url: isImg ? publicUrl : (previewImagePath || null),
              caption: file.name,
              display_order: mediaItems.length,
              metadata: {
                original_filename: file.name,
                file_size_bytes: file.size,
                storage_path: storagePath,
              },
            };
            setMediaItems((prev) => [...prev, newItem]);
          }

          // Synchronize primary media URL and thumbnail for listing record
          if (!mediaUrl || mediaItems.length === 0) {
            setMediaUrl(publicUrl);
          }
          if (isImg && !previewImagePath) {
            setPreviewImagePath(publicUrl);
          }

          setSuccessMsg(`Asset "${file.name}" uploaded successfully!`);
          setTimeout(() => setSuccessMsg(null), 4000);
        },
        onError: (err) => {
          setUploadState((prev) => ({
            ...prev,
            status: "failed",
            errorMessage: err.message || "Upload interrupted. Please check connection and retry.",
          }));
        },
      });

      activeUploadRef.current = handle;
    } catch (err: any) {
      setUploadState({
        status: "failed",
        progress: null,
        fileName: file.name,
        fileSize: file.size,
        errorMessage: err.message || "Failed to initiate storage upload.",
        targetIndex,
      });
    }
  };

  const handleCancelUpload = () => {
    if (activeUploadRef.current) {
      activeUploadRef.current.abort();
      activeUploadRef.current = null;
    }
    setUploadState({
      status: "idle",
      progress: null,
      fileName: null,
      fileSize: null,
      errorMessage: null,
      targetIndex: null,
    });
    setPendingFile(null);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleStartUpload(file, null);
    }
  };

  // Move Meta Ad Library URL to Official Source Link
  const handleMoveMetaAdLibToSource = (metaUrl: string, itemIdx?: number) => {
    setSourceUrl(metaUrl);
    setMediaRightsStatus("platform_link_only");
    if (typeof itemIdx === "number") {
      handleRemoveMediaItem(itemIdx);
    } else {
      setMediaUrl("");
    }
    setSuccessMsg(
      "Transferred Meta Ad Library link to Official Source URL field. Meta Ad Library pages cannot be played inline due to Meta security policy."
    );
    setTimeout(() => setSuccessMsg(null), 5000);
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
    setSaveState({ status: "saving", errorMessage: null });
    setFormErrors({});

    // Mirror primary media if media items exist
    const firstPlayable = mediaItems.find((m) => m.media_url);
    const effectiveMediaUrl =
      mediaUrl ||
      (firstPlayable?.media_type !== "image" ? firstPlayable?.media_url : null) ||
      null;
    const effectivePreviewPath =
      previewImagePath ||
      mediaItems.find((m) => m.thumbnail_url)?.thumbnail_url ||
      null;

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
      media_url: effectiveMediaUrl,
      source_ad_id: sourceAdId || null,
      preview_image_path: effectivePreviewPath,
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
      media_items: mediaItems,
    };

    // Client-side Zod validation
    const validation = AdListingSchema.safeParse(formData);
    if (!validation.success) {
      setFormErrors(validation.error.flatten().fieldErrors);
      setSaveState({
        status: "failed",
        errorMessage: "Please complete all required fields highlighted in red.",
      });
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
        }
        setSaveState({
          status: "failed",
          errorMessage: resData.error || "Save operation failed on server.",
        });
        return;
      }

      setSaveState({ status: "saved", errorMessage: null });

      if (resData.isLocalPreview) {
        setSuccessMsg(
          editingId
            ? "Session preview updated (Local Preview Mode: changes will not persist across server reloads)."
            : "Listing added to current session preview (Local Preview Mode: not saved to remote DB)."
        );
      } else {
        setSuccessMsg(editingId ? "Listing updated successfully." : "New curated ad created and saved.");
      }

      setTimeout(() => {
        setSuccessMsg(null);
        setSaveState({ status: "idle", errorMessage: null });
      }, 4000);

      await fetchData();
      resetForm();
    } catch (err: any) {
      setSaveState({
        status: "failed",
        errorMessage: err.message || "An unexpected network error occurred while saving.",
      });
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
      const payload = {
        id: editingCategory?.id,
        name: catName,
        slug: catSlug.toLowerCase().trim().replace(/\s+/g, "-"),
        description: catDesc,
        sort_order: Number(catOrder),
        is_active: catActive,
      };

      const res = await fetch("/api/admin/categories", {
        method: editingCategory ? "PUT" : "POST",
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
  const mediaEmbedAnalysis = parseVideoMediaUrl(mediaUrl || (mediaItems[0]?.media_url ?? ""));

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

      {/* SIMPLIFIED 3-STEP AD EDITOR */}
      {isEditorOpen && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#141619] border border-[#C8FF00]/30 shadow-2xl space-y-6 motion-safe:animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C8FF00] animate-pulse" />
              <h2 className="text-xl font-serif text-white">
                {editingId ? "Edit Curated Listing" : "Add Curated Ad Listing"}
              </h2>
            </div>
            <button
              onClick={resetForm}
              className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isLocalPreview && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>
                <strong>Notice:</strong> Local preview mode active. Saving updates in-memory mock session only.
              </span>
            </div>
          )}

          <form onSubmit={handleSaveListing} className="space-y-6">
            {/* STEP 1: AD DETAILS */}
            <div className="p-5 sm:p-6 rounded-2xl bg-black/40 border border-white/5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#C8FF00] text-black text-[11px] font-mono font-bold flex items-center justify-center">
                    1
                  </span>
                  <h3 className="text-xs font-mono font-bold text-[#C8FF00] uppercase tracking-wider">
                    Ad Details
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-neutral-400">
                  <span className="text-[#C8FF00]">*</span> indicates required field
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Brand Name */}
                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                    Brand Name <span className="text-[#C8FF00]">*</span>
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Kapiva, Minimalist, Nike"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border ${
                      formErrors.brand_name ? "border-rose-500" : "border-white/10"
                    } text-white text-xs placeholder:text-neutral-600 focus:border-[#C8FF00] focus:outline-none`}
                  />
                  {formErrors.brand_name && (
                    <p className="text-[11px] text-rose-400 mt-1">{formErrors.brand_name[0]}</p>
                  )}
                </div>

                {/* Platform */}
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

                {/* Category */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono text-neutral-300">
                      Category <span className="text-[#C8FF00]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="text-[10px] font-mono text-[#C8FF00] hover:underline"
                    >
                      + Add Category
                    </button>
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border ${
                      formErrors.category ? "border-rose-500" : "border-white/10"
                    } text-white text-xs font-mono focus:border-[#C8FF00] focus:outline-none`}
                  >
                    {categories.length > 0 ? (
                      categories.map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.name}
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
                  {formErrors.category && (
                    <p className="text-[11px] text-rose-400 mt-1">{formErrors.category[0]}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Headline / Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                    Headline / Title <span className="text-[#C8FF00]">*</span>
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

                {/* Creative Format */}
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Official Source Link */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                    Official Source / Ad Library Link <span className="text-[#C8FF00]">*</span>
                  </label>
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://www.facebook.com/ads/library/?id=... or Google Ads Transparency URL"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border ${
                      formErrors.source_url ? "border-rose-500" : "border-white/10"
                    } text-white text-xs font-mono placeholder:text-neutral-600 focus:border-[#C8FF00] focus:outline-none`}
                  />
                  {formErrors.source_url && (
                    <p className="text-[11px] text-rose-400 mt-1">{formErrors.source_url[0]}</p>
                  )}
                </div>

                {/* Target Market / Country */}
                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                    Target Market / Country <span className="text-[#C8FF00]">*</span>
                  </label>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs font-mono focus:border-[#C8FF00] focus:outline-none"
                  >
                    {AD_COUNTRIES.filter((c) => c.id !== "all").map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* STEP 2: MEDIA (PLAYABLE VIDEO & MEDIA ITEMS) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-black/40 border border-white/5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#C8FF00] text-black text-[11px] font-mono font-bold flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-xs font-mono font-bold text-[#C8FF00] uppercase tracking-wider">
                    Media &amp; Playable Assets
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-neutral-400">
                  Multiple media items supported · 50 MB max per upload
                </span>
              </div>

              {/* Rights confirmation checkbox */}
              <div className="p-3.5 rounded-xl bg-[#17191C] border border-white/10 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="rights-check"
                  checked={rightsAcknowledged}
                  onChange={(e) => setRightsAcknowledged(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-white/20 text-[#C8FF00] focus:ring-[#C8FF00] accent-[#C8FF00]"
                />
                <label htmlFor="rights-check" className="text-xs font-mono text-neutral-300 cursor-pointer select-none leading-relaxed">
                  <strong>Rights Acknowledgment:</strong> I confirm our organization owns or has explicit permission from the rights holder to host and distribute this creative asset in Supabase Storage. (Max 50 MB)
                </label>
              </div>

              {/* Resumable Video & Asset Uploader Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? "border-[#C8FF00] bg-[#C8FF00]/10 scale-[1.01]"
                    : "border-white/15 bg-[#17191C]/60 hover:border-white/30"
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#C8FF00]">
                  <UploadCloud className="w-6 h-6" />
                </div>

                <div>
                  <p className="text-sm font-sans font-medium text-white">
                    Drag &amp; drop video or creative image here, or choose a file
                  </p>
                  <p className="text-xs font-mono text-neutral-400 mt-1">
                    MP4, WebM, MOV, JPEG, PNG, WebP · Max 50 MB · Chunked resumable TUS upload
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  <label className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                    uploadState.status === "uploading"
                      ? "bg-white/10 text-neutral-400 cursor-not-allowed"
                      : "bg-[#C8FF00] text-black hover:bg-[#b0e600]"
                  }`}>
                    <FileVideo className="w-4 h-4" />
                    <span>Choose Video File</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={uploadState.status === "uploading"}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleStartUpload(f, null);
                      }}
                    />
                  </label>

                  <span className="text-xs font-mono text-neutral-500">or</span>

                  <button
                    type="button"
                    onClick={() => handleAddMediaItem("embed")}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-mono border border-white/10 flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C8FF00]" />
                    <span>Add Embed Link</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddMediaItem("source_link")}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-mono border border-white/10 flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C8FF00]" />
                    <span>Add Source Link</span>
                  </button>
                </div>
              </div>

              {/* Real Byte-Based Upload Progress State */}
              {uploadState.status === "uploading" && (
                <div className="p-4 rounded-xl bg-[#1C1F23] border border-[#C8FF00]/40 space-y-3 motion-safe:animate-fade-in">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 text-white">
                      <Loader2 className="w-4 h-4 text-[#C8FF00] animate-spin" />
                      <span>
                        Uploading <strong>{uploadState.fileName}</strong> ({uploadState.progress?.formattedUploaded} / {uploadState.progress?.formattedTotal})
                      </span>
                    </div>
                    <span className="text-sm font-bold text-[#C8FF00] font-mono">
                      {uploadState.progress?.percentage}%
                    </span>
                  </div>

                  <div
                    role="progressbar"
                    aria-valuenow={uploadState.progress?.percentage ?? 0}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Upload progress"
                    className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden"
                  >
                    <div
                      className="h-full bg-[#C8FF00] transition-all duration-300 ease-out"
                      style={{ width: `${uploadState.progress?.percentage ?? 0}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    <span>Chunk size: 6 MiB · Resumable TUS transfer</span>
                    <button
                      type="button"
                      onClick={handleCancelUpload}
                      className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel Upload</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Upload Complete State */}
              {uploadState.status === "complete" && (
                <div className="p-3.5 rounded-xl bg-[#C8FF00]/10 border border-[#C8FF00]/30 flex items-center justify-between text-xs font-mono text-[#C8FF00] motion-safe:animate-fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      Upload complete: <strong>{uploadState.fileName}</strong> ({formatBytes(uploadState.fileSize || 0)})
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400">Attached to Media Collection below</span>
                </div>
              )}

              {/* Upload Failed State with Retry */}
              {uploadState.status === "failed" && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-rose-300 motion-safe:animate-fade-in">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-white">Upload Problem:</strong>
                      <span>{uploadState.errorMessage}</span>
                    </div>
                  </div>
                  {pendingFile && (
                    <button
                      type="button"
                      onClick={() => handleStartUpload(pendingFile, uploadState.targetIndex)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-white font-bold border border-rose-500/40 flex items-center gap-1.5 flex-shrink-0 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry Upload</span>
                    </button>
                  )}
                </div>
              )}

              {/* Attached Media Items List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#C8FF00]" />
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      Attached Media Items ({mediaItems.length})
                    </span>
                  </div>
                </div>

                {mediaItems.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#17191C]/60 border border-dashed border-white/10 text-center text-xs font-mono text-neutral-500">
                    No media items attached yet. Choose a video above or click &ldquo;Add Embed Link&rdquo; to attach playable media.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mediaItems.map((item, idx) => {
                      const isItemMeta = isMetaAdLibraryUrl(item.media_url);

                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-[#17191C] border border-white/10 space-y-3 relative group"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-white/5">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#C8FF00]/15 text-[#C8FF00]">
                                #{idx + 1}
                              </span>
                              <span className="text-xs font-mono uppercase text-neutral-300">
                                {item.media_type.replace("_", " ")}
                              </span>
                              {idx === 0 && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-neutral-300">
                                  Primary Preview
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveMediaItem(idx, "up")}
                                className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-30 transition-colors"
                                title="Move up"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === mediaItems.length - 1}
                                onClick={() => handleMoveMediaItem(idx, "down")}
                                className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-30 transition-colors"
                                title="Move down"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveMediaItem(idx)}
                                className="p-1 rounded text-rose-400 hover:text-rose-300 ml-1 transition-colors"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                                Media Type
                              </label>
                              <select
                                value={item.media_type}
                                onChange={(e) =>
                                  handleUpdateMediaItem(idx, {
                                    media_type: e.target.value as AdMediaType,
                                  })
                                }
                                className="w-full px-3 py-2 rounded-lg bg-[#1C1F23] border border-white/10 text-white text-xs font-mono focus:border-[#C8FF00] focus:outline-none"
                              >
                                <option value="hosted_video">Hosted Video (Direct MP4/WebM)</option>
                                <option value="embed">Embed (YouTube/TikTok/Vimeo/Reel)</option>
                                <option value="image">Image (Creative/Product)</option>
                                <option value="source_link">Source Link Only</option>
                              </select>
                            </div>

                            <div className="sm:col-span-2">
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-[11px] font-mono text-neutral-400">
                                  Media URL / Stream Link
                                </label>
                                {(item.media_type === "hosted_video" || item.media_type === "image") && (
                                  <label className="cursor-pointer text-[10px] font-mono text-[#C8FF00] hover:underline flex items-center gap-1">
                                    <Upload className="w-2.5 h-2.5" />
                                    <span>Upload New File</span>
                                    <input
                                      type="file"
                                      accept="video/mp4,video/webm,video/quicktime,image/jpeg,image/png,image/webp"
                                      className="hidden"
                                      disabled={uploadState.status === "uploading"}
                                      onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) handleStartUpload(f, idx);
                                      }}
                                    />
                                  </label>
                                )}
                              </div>
                              <input
                                type="url"
                                value={item.media_url}
                                onChange={(e) =>
                                  handleUpdateMediaItem(idx, { media_url: e.target.value })
                                }
                                placeholder="https://..."
                                className="w-full px-3 py-2 rounded-lg bg-[#1C1F23] border border-white/10 text-white text-xs font-mono placeholder:text-neutral-600 focus:border-[#C8FF00] focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Caption */}
                          <div>
                            <input
                              type="text"
                              value={item.caption || ""}
                              onChange={(e) =>
                                handleUpdateMediaItem(idx, { caption: e.target.value })
                              }
                              placeholder="Asset caption / variant description (optional)"
                              className="w-full px-3 py-1.5 rounded-lg bg-[#1C1F23] border border-white/5 text-neutral-300 text-xs placeholder:text-neutral-600 focus:border-[#C8FF00] focus:outline-none"
                            />
                          </div>

                          {/* Meta Ad Library Warning */}
                          {isItemMeta && (
                            <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 flex items-center justify-between gap-2 text-xs font-mono">
                              <span className="text-amber-200 text-[11px]">
                                Meta Ad Library URL: cannot be played inline due to Meta security policy.
                              </span>
                              <button
                                type="button"
                                onClick={() => handleMoveMetaAdLibToSource(item.media_url, idx)}
                                className="px-2.5 py-1 rounded bg-amber-400 text-black text-[11px] font-bold hover:bg-amber-300 transition-colors"
                              >
                                Move to Official Source
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* COLLAPSIBLE ADVANCED DETAILS ACCORDION */}
            <div className="rounded-2xl border border-white/10 bg-black/20 overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors select-none"
              >
                <div className="flex items-center gap-2.5">
                  <SlidersHorizontal className="w-4 h-4 text-[#C8FF00]" />
                  <div>
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider block">
                      Advanced Details (Optional)
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      Ad copy, hook notes, call-to-action, curator signals, runtime evidence, and Amazon metadata
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                  <span>{isAdvancedOpen ? "Collapse" : "Expand"}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isAdvancedOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {isAdvancedOpen && (
                <div className="p-5 sm:p-6 border-t border-white/10 space-y-5 bg-[#141618]/60 motion-safe:animate-fade-in">
                  {/* Placement & Advertiser Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                        Placement / Surface
                      </label>
                      <input
                        type="text"
                        value={platformSurface}
                        onChange={(e) => setPlatformSurface(e.target.value)}
                        placeholder={PLATFORMS_CONFIG[platform].surfaces[0] || "e.g. Instagram Reels"}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs placeholder:text-neutral-600 focus:border-[#C8FF00] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                        Advertiser Corporate Name
                      </label>
                      <input
                        type="text"
                        value={advertiserName}
                        onChange={(e) => setAdvertiserName(e.target.value)}
                        placeholder="e.g. Kapiva Ayurveda Inc."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs placeholder:text-neutral-600 focus:border-[#C8FF00] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                        Call To Action (CTA) Button
                      </label>
                      <input
                        type="text"
                        value={callToAction}
                        onChange={(e) => setCallToAction(e.target.value)}
                        placeholder="e.g. Shop Now ↗"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs placeholder:text-neutral-600 focus:border-[#C8FF00] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Ad Copy & Hook Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                        Ad Copy / Primary Text
                      </label>
                      <textarea
                        value={shortDescription}
                        onChange={(e) => setShortDescription(e.target.value)}
                        rows={3}
                        placeholder="Full ad text or caption as observed on platform..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs placeholder:text-neutral-600 focus:border-[#C8FF00] focus:outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                        Hook Summary (First 3 Seconds)
                      </label>
                      <textarea
                        value={hookSummary}
                        onChange={(e) => setHookSummary(e.target.value)}
                        rows={3}
                        placeholder="Visual, auditory, or narrative hook used to stop the scroll..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs placeholder:text-neutral-600 focus:border-[#C8FF00] focus:outline-none resize-none"
                      />
                    </div>
                  </div>

                  {/* Extended URLs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                        Landing Page / Store URL
                      </label>
                      <input
                        type="url"
                        value={landingPageUrl}
                        onChange={(e) => setLandingPageUrl(e.target.value)}
                        placeholder="https://brand.com/landing"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs font-mono placeholder:text-neutral-600 focus:border-[#C8FF00] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                        Product URL
                      </label>
                      <input
                        type="url"
                        value={productUrl}
                        onChange={(e) => setProductUrl(e.target.value)}
                        placeholder="https://brand.com/product/..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs font-mono placeholder:text-neutral-600 focus:border-[#C8FF00] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                        Custom Poster / Thumbnail URL
                      </label>
                      <input
                        type="text"
                        value={previewImagePath}
                        onChange={(e) => setPreviewImagePath(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs font-mono placeholder:text-neutral-600 focus:border-[#C8FF00] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Dates & Source ID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                    <div>
                      <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                        Source Ad ID (Platform Reference)
                      </label>
                      <input
                        type="text"
                        value={sourceAdId}
                        onChange={(e) => setSourceAdId(e.target.value)}
                        placeholder="e.g. 3559428117557795"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs font-mono placeholder:text-neutral-600 focus:border-[#C8FF00] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Strategic Curator Notes & Signal Labels */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                        Strategic Curator Note (Internal Intelligence)
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
                      <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                        Curator Signal Badges
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

                  {/* Amazon-Specific Research Box */}
                  {platform === "amazon" && (
                    <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider">
                          <ShoppingBag className="w-4 h-4" />
                          <span>Amazon Ads Research Metadata</span>
                        </div>
                        <span className="text-[11px] font-mono text-neutral-400">Manual curation</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                            ASIN (Amazon Standard ID)
                          </label>
                          <input
                            type="text"
                            value={asin}
                            onChange={(e) => setAsin(e.target.value.toUpperCase())}
                            placeholder="e.g. B08HSHILAJ"
                            className="w-full px-3 py-2 rounded-lg bg-[#1C1F23] border border-white/10 text-white text-xs font-mono placeholder:text-neutral-600 focus:border-amber-400 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                            Amazon Ad Type
                          </label>
                          <select
                            value={amazonAdType}
                            onChange={(e) => setAmazonAdType(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-[#1C1F23] border border-white/10 text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
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
                            Target Search Term
                          </label>
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="e.g. pure shilajit resin"
                            className="w-full px-3 py-2 rounded-lg bg-[#1C1F23] border border-white/10 text-white text-xs placeholder:text-neutral-600 focus:border-amber-400 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                            Amazon Marketplace
                          </label>
                          <select
                            value={marketplace}
                            onChange={(e) => setMarketplace(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-[#1C1F23] border border-white/10 text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
                          >
                            <option value="Amazon US">Amazon US (.com)</option>
                            <option value="Amazon IN">Amazon India (.in)</option>
                            <option value="Amazon UK">Amazon UK (.co.uk)</option>
                            <option value="Amazon DE">Amazon Germany (.de)</option>
                            <option value="Amazon CA">Amazon Canada (.ca)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* STEP 3: REVIEW & PUBLISH */}
            <div className="p-5 sm:p-6 rounded-2xl bg-black/40 border border-white/5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#C8FF00] text-black text-[11px] font-mono font-bold flex items-center justify-center">
                    3
                  </span>
                  <h3 className="text-xs font-mono font-bold text-[#C8FF00] uppercase tracking-wider">
                    Review &amp; Publish
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-neutral-400">
                  Choose visibility status and save
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                    Publication Status <span className="text-[#C8FF00]">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as AdListingStatus)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs font-mono focus:border-[#C8FF00] focus:outline-none"
                  >
                    <option value="draft">Draft (Private admin view only)</option>
                    <option value="review">Needs Review (Quality Check)</option>
                    <option value="published">Published (Visible to Public)</option>
                    <option value="archived">Archived (Hidden from catalog)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-5">
                  <label className="flex items-center gap-2 text-xs font-mono cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 text-[#C8FF00] focus:ring-[#C8FF00] accent-[#C8FF00]"
                    />
                    <span className="text-white">Editor&rsquo;s Featured Pick</span>
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-5">
                  <label className="flex items-center gap-2 text-xs font-mono cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={markReviewedNow}
                      onChange={(e) => setMarkReviewedNow(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 text-[#C8FF00] focus:ring-[#C8FF00] accent-[#C8FF00]"
                    />
                    <span className="text-neutral-300">Mark verified as of today</span>
                  </label>
                </div>
              </div>

              {/* Separate Saving States */}
              {saveState.status === "saving" && (
                <div className="p-3.5 rounded-xl bg-[#1C1F23] border border-[#C8FF00]/30 flex items-center gap-2.5 text-xs font-mono text-neutral-300 motion-safe:animate-pulse">
                  <Loader2 className="w-4 h-4 text-[#C8FF00] animate-spin flex-shrink-0" />
                  <span>Saving ad details to database...</span>
                </div>
              )}

              {saveState.status === "failed" && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs font-mono text-rose-300 space-y-2.5">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-white">Save Failed:</strong>
                      <span>{saveState.errorMessage}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Your uploaded media items and form inputs have been preserved. You do not need to re-upload your files. Please fix any errors above and retry.
                  </p>
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleSaveListing}
                      className="px-4 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-white font-bold border border-rose-500/40 flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry Save</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Form Actions Footer */}
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
                      media_url: mediaUrl || (mediaItems[0]?.media_url ?? undefined),
                      media_provider: mediaEmbedAnalysis.provider,
                      preview_image_path: previewImagePath || (mediaItems[0]?.thumbnail_url ?? undefined),
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
                      media_items: mediaItems,
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
                    className="px-5 py-2.5 rounded-full text-neutral-400 hover:text-white text-xs font-mono transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveState.status === "saving" || uploadState.status === "uploading"}
                    className="px-6 py-2.5 rounded-full bg-[#C8FF00] text-black text-xs font-bold font-mono hover:bg-[#b0e600] disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg"
                  >
                    {saveState.status === "saving" ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving Ad Details...</span>
                      </>
                    ) : (
                      <span>
                        {editingId
                          ? "Save Changes"
                          : status === "published"
                          ? "Publish Curated Ad"
                          : "Save Draft Listing"}
                      </span>
                    )}
                  </button>
                </div>
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

          <button
            onClick={() => setActiveTab("review")}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "review"
                ? "bg-amber-400 text-black font-bold shadow-md"
                : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Review Queue</span>
            <span className="opacity-75 text-[11px]">
              ({ads.filter((a) => a.status === "review").length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "categories"
                ? "bg-indigo-400 text-black font-bold shadow-md"
                : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Categories</span>
            <span className="opacity-75 text-[11px]">({categories.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW: CATEGORIES MANAGEMENT TAB */}
      {activeTab === "categories" ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-serif text-white">Ad Explorer Categories</h2>
              <p className="text-xs text-neutral-400">
                Isolated categories specifically for curated ad intelligence. Re-order, add, or toggle visibility.
              </p>
            </div>
            <button
              onClick={openNewCategoryModal}
              className="px-4 py-2 rounded-xl bg-[#C8FF00] text-black font-semibold text-xs hover:bg-[#b0e600] flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Create Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`p-5 rounded-2xl bg-[#141618] border transition-all space-y-3 ${
                  cat.is_active ? "border-white/10" : "border-white/5 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-neutral-500">
                        #{cat.sort_order}
                      </span>
                      <h3 className="font-serif text-white font-medium">{cat.name}</h3>
                    </div>
                    <code className="text-[10px] font-mono text-[#C8FF00] bg-black/40 px-1.5 py-0.5 rounded">
                      {cat.slug}
                    </code>
                  </div>
                  <button
                    onClick={() => handleToggleCategoryActive(cat)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      cat.is_active
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-neutral-800 text-neutral-400"
                    }`}
                  >
                    {cat.is_active ? "ACTIVE" : "HIDDEN"}
                  </button>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed min-h-[36px]">
                  {cat.description || "No description provided."}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs font-mono">
                  <span className="text-neutral-500 text-[11px]">
                    {ads.filter((a) => a.category === cat.slug).length} ad listings
                  </span>
                  <button
                    onClick={() => openEditCategoryModal(cat)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-300 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* VIEW: ADS CATALOGUE (TABLE / CARDS) */
        <div className="space-y-6">
          {/* Controls & Filter Bar */}
          <div className="p-4 rounded-2xl bg-[#131517] border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs font-mono">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by brand, title, hook, ASIN, or keywords..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white placeholder:text-neutral-500 focus:border-[#C8FF00] focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs font-mono focus:border-[#C8FF00] focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="review">Needs Review</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs font-mono focus:border-[#C8FF00] focus:outline-none max-w-[180px]"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white text-xs font-mono focus:border-[#C8FF00] focus:outline-none"
              >
                {AD_COUNTRIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Listings count and results summary */}
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400 px-1">
            <span>
              Showing <strong>{filteredAds.length}</strong> of <strong>{ads.length}</strong> listings
            </span>
            {filteredAds.length !== ads.length && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                  setCountryFilter("all");
                }}
                className="text-[#C8FF00] hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Listings Grid / Table */}
          {loading ? (
            <div className="p-16 rounded-3xl bg-[#131517] border border-white/5 text-center text-xs font-mono text-neutral-400 space-y-3">
              <RefreshCw className="w-6 h-6 text-[#C8FF00] animate-spin mx-auto" />
              <p>Loading curated catalogue...</p>
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="p-16 rounded-3xl bg-[#131517] border border-white/5 text-center space-y-4">
              <p className="text-sm font-serif text-white">No ad listings match your current filters.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                  setActiveTab("all");
                }}
                className="px-4 py-2 rounded-full bg-white/10 text-white text-xs font-mono hover:bg-white/20"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAds.map((ad) => {
                const cfg = PLATFORMS_CONFIG[ad.platform];
                const catObj = categories.find((c) => c.slug === ad.category);
                const hasMedia = Boolean(ad.media_url || (ad.media_items && ad.media_items.length > 0));

                return (
                  <div
                    key={ad.id}
                    className="p-5 rounded-2xl bg-[#131517] border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
                  >
                    {/* Media Thumbnail & Brand Details */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Thumbnail or Video Pill */}
                      <div className="w-16 h-20 rounded-xl bg-[#1C1F23] border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                        {ad.preview_image_path || (ad.media_items && ad.media_items[0]?.thumbnail_url) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={ad.preview_image_path || (ad.media_items && ad.media_items[0]?.thumbnail_url) || ""}
                            alt={ad.title}
                            className="w-full h-full object-cover"
                          />
                        ) : hasMedia ? (
                          <div className="flex flex-col items-center gap-1 text-neutral-400">
                            <Play className="w-5 h-5 text-[#C8FF00]" />
                            <span className="text-[9px] font-mono">STREAM</span>
                          </div>
                        ) : (
                          <PlatformIcon platform={ad.platform} size={22} />
                        )}
                        {ad.media_items && ad.media_items.length > 1 && (
                          <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-black/80 text-white border border-white/20">
                            +{ad.media_items.length}
                          </span>
                        )}
                      </div>

                      {/* Content Info */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Platform Badge */}
                          <span
                            className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-1.5"
                            style={{ backgroundColor: cfg.badgeBg, color: cfg.badgeText }}
                          >
                            <PlatformIcon platform={ad.platform} size={11} />
                            <span>{cfg.shortName}</span>
                          </span>

                          {/* Country */}
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 text-neutral-400 border border-white/5">
                            {ad.country_code}
                          </span>

                          {/* Category Badge */}
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-neutral-300">
                            {catObj ? catObj.name : ad.category}
                          </span>

                          {/* Format */}
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 text-neutral-400 uppercase">
                            {ad.creative_format}
                          </span>

                          {/* Amazon ASIN badge if present */}
                          {ad.asin && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              ASIN: {ad.asin}
                            </span>
                          )}

                          {ad.is_featured && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#C8FF00]/15 text-[#C8FF00] border border-[#C8FF00]/30 font-bold">
                              FEATURED
                            </span>
                          )}
                        </div>

                        <h3 className="font-serif text-white text-base truncate font-normal group-hover:text-[#C8FF00] transition-colors">
                          {ad.title}
                        </h3>

                        <p className="text-xs text-neutral-400 truncate">
                          <strong className="text-neutral-200">{ad.brand_name}</strong>
                          {ad.platform_surface ? ` · ${ad.platform_surface}` : ""}
                          {ad.hook_summary ? ` · Hook: "${ad.hook_summary}"` : ""}
                        </p>
                      </div>
                    </div>

                    {/* Actions and Status Controls */}
                    <div className="flex flex-wrap items-center gap-2.5 self-end md:self-center">
                      {/* Status Selector */}
                      <select
                        value={ad.status}
                        onChange={(e) => handleQuickStatusChange(ad, e.target.value as AdListingStatus)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                          ad.status === "published"
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                            : ad.status === "review"
                            ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                            : ad.status === "draft"
                            ? "bg-white/10 text-neutral-300 border-white/10"
                            : "bg-neutral-800 text-neutral-500 border-neutral-700"
                        }`}
                      >
                        <option value="published">Published</option>
                        <option value="review">Needs Review</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>

                      {/* Visitor Preview Button */}
                      <button
                        onClick={() => setPreviewAd(ad)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors border border-white/5"
                        title="Preview as Visitor"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleEditClick(ad)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-mono border border-white/10 flex items-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#C8FF00]" />
                        <span>Edit</span>
                      </button>

                      {/* Archive / Delete Button */}
                      <button
                        onClick={() => setDeleteConfirmAd({ ad, permanent: false })}
                        className="p-2 rounded-lg hover:bg-rose-500/10 text-neutral-400 hover:text-rose-400 transition-colors"
                        title="Archive or Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#141618] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-serif text-white">
                {editingCategory ? "Edit Category" : "Add Ad Explorer Category"}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-neutral-300 mb-1.5">Category Name *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value);
                    if (!editingCategory) {
                      setCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                    }
                  }}
                  placeholder="e.g. Health & Ayurvedic Products"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white font-sans focus:border-[#C8FF00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1.5">Slug (URL identifier) *</label>
                <input
                  type="text"
                  required
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  placeholder="e.g. health-ayurvedic"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white focus:border-[#C8FF00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1.5">Description</label>
                <textarea
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  rows={2}
                  placeholder="What products or brands belong here..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F23] border border-white/10 text-white font-sans focus:border-[#C8FF00] focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-neutral-300 mb-1.5">Sort Order</label>
                  <input
                    type="number"
                    value={catOrder}
                    onChange={(e) => setCatOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1C1F23] border border-white/10 text-white focus:border-[#C8FF00] focus:outline-none"
                  />
                </div>

                <div className="pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={catActive}
                      onChange={(e) => setCatActive(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 text-[#C8FF00] focus:ring-[#C8FF00]"
                    />
                    <span className="text-white">Active (Visible)</span>
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
                  className="px-5 py-2 rounded-full bg-[#C8FF00] text-black font-bold hover:bg-[#b0e600] disabled:opacity-50"
                >
                  {categorySaving ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VISITOR PREVIEW MODAL */}
      {previewAd && (
        <AdDetailModal ad={previewAd} onClose={() => setPreviewAd(null)} />
      )}

      {/* ARCHIVE / DELETE CONFIRMATION MODAL */}
      {deleteConfirmAd && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#141618] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4 animate-fade-in text-xs font-mono">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 flex-shrink-0">
                <Archive className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-serif text-white font-normal">
                  Archive or Remove Listing?
                </h3>
                <p className="text-neutral-400 leading-relaxed font-sans text-xs">
                  Choose whether to soft-archive &ldquo;{deleteConfirmAd.ad.title}&rdquo; (keeps intelligence records safe) or permanently delete it.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
              <button
                onClick={() => setDeleteConfirmAd(null)}
                className="px-4 py-2 rounded-full text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setDeleteConfirmAd({ ...deleteConfirmAd, permanent: false });
                  executeDeleteOrArchive();
                }}
                className="px-4 py-2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 font-bold"
              >
                Archive (Recommended)
              </button>
              <button
                onClick={() => {
                  setDeleteConfirmAd({ ...deleteConfirmAd, permanent: true });
                  executeDeleteOrArchive();
                }}
                className="px-4 py-2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 font-bold"
              >
                Permanent Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
