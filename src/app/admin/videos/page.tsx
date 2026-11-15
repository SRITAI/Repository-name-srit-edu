"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Film,
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  Upload,
  Check,
  X,
  Edit3,
  Trash2,
  RefreshCw,
  ExternalLink,
  Eye,
  Sliders,
  ArrowUp,
  ArrowDown,
  Layers,
  Sparkles,
  AlertCircle,
  FileVideo,
  Image as ImageIcon,
  Clock,
  Scissors,
  CheckCircle2,
  XCircle,
  Loader2,
  RotateCcw,
} from "lucide-react";
import {
  HomepageVideo,
  VideoPlacement,
  VideoStatus,
} from "@/lib/supabase/types";
import {
  startResumableUpload,
  validateMediaFile,
  formatBytes,
  UploadProgress,
  ActiveUploadHandle,
  MAX_FILE_SIZE_BYTES,
} from "@/lib/storage/resumable-upload";
import { SEED_HOMEPAGE_VIDEOS } from "@/lib/data/homepage-videos-seed";

const PLACEMENT_LABELS: Record<VideoPlacement, { label: string; desc: string }> = {
  hero_drift_top: {
    label: "Hero Drift Top (Left Drift)",
    desc: "First moving video layer drifting slowly left behind and beside hero text",
  },
  hero_drift_bottom: {
    label: "Hero Drift Bottom (Right Drift)",
    desc: "Second moving video layer drifting in gentle opposite motion",
  },
  trending_rail: {
    label: "Trending Reels Rail",
    desc: "Horizontal scrollable feed in trending creators section",
  },
  curated_feature: {
    label: "Curated Showcase",
    desc: "Large featured video player in patterns and pipeline sections",
  },
};

export default function AdminVideoLibraryPage() {
  const [videos, setVideos] = useState<HomepageVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlacement, setSelectedPlacement] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<HomepageVideo | null>(null);

  // Modal Form State
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [altText, setAltText] = useState("");
  const [category, setCategory] = useState("Fashion & Apparel");
  const [placement, setPlacement] = useState<VideoPlacement>("hero_drift_top");
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9">("9:16");
  const [status, setStatus] = useState<VideoStatus>("published");
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [trimStart, setTrimStart] = useState<string>("");
  const [trimEnd, setTrimEnd] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState("");
  const [storagePath, setStoragePath] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Video Upload State (TUS byte-based resumable)
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const uploadHandleRef = useRef<ActiveUploadHandle | null>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const posterFileInputRef = useRef<HTMLInputElement>(null);

  // Preview Modal
  const [previewingVideo, setPreviewingVideo] = useState<HomepageVideo | null>(null);

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState<HomepageVideo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load videos
  const fetchVideos = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/videos");
      if (res.status === 401) {
        window.location.href = "/login?next=/admin/videos";
        return;
      }
      if (res.status === 403) {
        setErrorMsg("Access denied: You must be signed in with an administrator account to manage videos.");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        throw new Error(`Failed to load videos (HTTP ${res.status})`);
      }
      const data = await res.json();
      if (data.videos) {
        setVideos(data.videos);
      } else {
        setVideos(SEED_HOMEPAGE_VIDEOS);
      }
    } catch (err: any) {
      console.warn("Failed fetching admin videos, using fallback seed:", err);
      setVideos(SEED_HOMEPAGE_VIDEOS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingVideo(null);
    setTitle("");
    setCaption("");
    setAltText("");
    setCategory("Fashion & Apparel");
    setPlacement("hero_drift_top");
    setAspectRatio("9:16");
    setStatus("published");
    setDisplayOrder(videos.length + 1);
    setTrimStart("");
    setTrimEnd("");
    setVideoUrl("");
    setStoragePath("");
    setPosterUrl("");
    setFormError(null);
    setUploadProgress(null);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (video: HomepageVideo) => {
    setEditingVideo(video);
    setTitle(video.title);
    setCaption(video.caption || "");
    setAltText(video.alt_text || "");
    setCategory(video.category || "Creative");
    setPlacement(video.placement);
    setAspectRatio(video.aspect_ratio || "9:16");
    setStatus(video.status);
    setDisplayOrder(video.display_order || 1);
    setTrimStart(video.trim_start_seconds !== null && video.trim_start_seconds !== undefined ? String(video.trim_start_seconds) : "");
    setTrimEnd(video.trim_end_seconds !== null && video.trim_end_seconds !== undefined ? String(video.trim_end_seconds) : "");
    setVideoUrl(video.video_url);
    setStoragePath(video.storage_path || "");
    setPosterUrl(video.poster_url || "");
    setFormError(null);
    setUploadProgress(null);
    setIsModalOpen(true);
  };

  // Handle Video File Upload via TUS
  const handleVideoFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateMediaFile(file);
    if (!validation.valid) {
      setFormError(validation.error || "Invalid file format or size.");
      return;
    }

    setFormError(null);
    setIsUploading(true);
    setUploadProgress({
      bytesUploaded: 0,
      bytesTotal: file.size,
      percentage: 0,
      formattedUploaded: "0 B",
      formattedTotal: formatBytes(file.size),
    });

    try {
      const handle = await startResumableUpload({
        file,
        onProgress: (p) => setUploadProgress(p),
        onSuccess: (publicUrl, path) => {
          setVideoUrl(publicUrl);
          setStoragePath(path);
          setIsUploading(false);
          setUploadProgress(null);
          showToast("Video uploaded successfully to ad-previews storage!");
        },
        onError: (err) => {
          setIsUploading(false);
          setUploadProgress(null);
          setFormError(`Upload failed: ${err.message}`);
        },
      });
      uploadHandleRef.current = handle;
    } catch (err: any) {
      setIsUploading(false);
      setUploadProgress(null);
      setFormError(`Upload error: ${err.message}`);
    }
  };

  // Handle Poster File Upload via TUS
  const handlePosterFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateMediaFile(file);
    if (!validation.valid) {
      setFormError(validation.error || "Invalid image file.");
      return;
    }

    try {
      await startResumableUpload({
        file,
        onProgress: () => {},
        onSuccess: (publicUrl) => {
          setPosterUrl(publicUrl);
          showToast("Poster thumbnail uploaded successfully!");
        },
        onError: (err) => {
          setFormError(`Poster upload error: ${err.message}`);
        },
      });
    } catch (err: any) {
      setFormError(`Poster upload error: ${err.message}`);
    }
  };

  // Save Video (Create or Update)
  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (!videoUrl.trim()) {
      setFormError("Video URL or an uploaded video file is required.");
      return;
    }

    if (trimStart && trimEnd && Number(trimStart) >= Number(trimEnd)) {
      setFormError("Trim start time must be less than end time.");
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const payload = {
      title: title.trim(),
      caption: caption.trim() || null,
      alt_text: altText.trim() || null,
      category: category.trim() || "Creative",
      placement,
      aspect_ratio: aspectRatio,
      status,
      display_order: Number(displayOrder) || 1,
      trim_start_seconds: trimStart ? Number(trimStart) : null,
      trim_end_seconds: trimEnd ? Number(trimEnd) : null,
      video_url: videoUrl.trim(),
      storage_path: storagePath.trim() || null,
      poster_url: posterUrl.trim() || null,
    };

    try {
      if (editingVideo) {
        // Update existing
        const res = await fetch(`/api/admin/videos/${editingVideo.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Update failed");

        setVideos((prev) =>
          prev.map((v) => (v.id === editingVideo.id ? { ...v, ...payload } : v))
        );
        showToast(`Updated "${title}" successfully.`);
      } else {
        // Create new
        const res = await fetch("/api/admin/videos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Create failed");

        const newVideo: HomepageVideo = data.video || {
          id: `hp-vid-${Date.now()}`,
          ...payload,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setVideos((prev) => [newVideo, ...prev]);
        showToast(`Added "${title}" to the Video Library.`);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to save video.");
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Toggle Status (Publish / Draft / Archive)
  const handleToggleStatus = async (video: HomepageVideo, newStatus: VideoStatus) => {
    try {
      const res = await fetch(`/api/admin/videos/${video.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setVideos((prev) =>
          prev.map((v) => (v.id === video.id ? { ...v, status: newStatus } : v))
        );
        showToast(`Video status set to ${newStatus}.`);
      }
    } catch (err: any) {
      setErrorMsg(`Failed updating status: ${err.message}`);
    }
  };

  // Quick Adjust Order
  const handleAdjustOrder = async (video: HomepageVideo, delta: number) => {
    const newOrder = Math.max(1, (video.display_order || 1) + delta);
    try {
      const res = await fetch(`/api/admin/videos/${video.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_order: newOrder }),
      });
      if (res.ok) {
        setVideos((prev) =>
          prev.map((v) => (v.id === video.id ? { ...v, display_order: newOrder } : v))
        );
        showToast(`Order updated to ${newOrder}.`);
      }
    } catch (err: any) {
      console.warn("Error updating order:", err);
    }
  };

  // Delete Video
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/videos/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      setVideos((prev) => prev.filter((v) => v.id !== deleteTarget.id));
      showToast(`Deleted "${deleteTarget.title}".`);
      setDeleteTarget(null);
    } catch (err: any) {
      setErrorMsg(`Delete failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered List
  const filteredVideos = videos.filter((v) => {
    if (selectedPlacement !== "all" && v.placement !== selectedPlacement) return false;
    if (selectedStatus !== "all" && v.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = v.title.toLowerCase().includes(q);
      const matchCaption = v.caption?.toLowerCase().includes(q);
      const matchCategory = v.category?.toLowerCase().includes(q);
      if (!matchTitle && !matchCaption && !matchCategory) return false;
    }
    return true;
  });

  // Placement counts
  const heroTopCount = videos.filter((v) => v.placement === "hero_drift_top").length;
  const heroBottomCount = videos.filter((v) => v.placement === "hero_drift_bottom").length;
  const publishedCount = videos.filter((v) => v.status === "published").length;
  const draftCount = videos.filter((v) => v.status === "draft").length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-[#302E29] text-[#FFFCF5] text-xs font-mono shadow-paper-lg flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header & Stats Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#302E29]/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#C86446] font-semibold mb-1">
            <Film className="w-3.5 h-3.5" />
            <span>Art-Studio Media Management</span>
          </div>
          <h1 className="text-3xl font-serif text-[#302E29] tracking-tight">Video Library</h1>
          <p className="text-xs text-[#716C63] mt-1 max-w-2xl leading-relaxed">
            Curate, order, and publish slow cinematic video cards for the homepage Google Flow-inspired drift,
            trending rails, and editorial showcases. All videos stream natively in warm creamy paper mats.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchVideos}
            disabled={loading}
            className="px-3.5 py-2 rounded-full bg-[#EEE5D6] hover:bg-[#E2D7C4] text-[#302E29] text-xs font-mono flex items-center gap-1.5 transition-colors border border-[#302E29]/10"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 rounded-full bg-[#C86446] hover:bg-[#B55539] text-white text-xs font-semibold shadow-paper flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Video</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#FFFCF5] border border-[#302E29]/10 shadow-paper-sm">
          <span className="text-[11px] font-mono text-[#716C63] uppercase">Published Active</span>
          <div className="text-2xl font-serif text-[#302E29] font-bold mt-0.5">{publishedCount}</div>
          <span className="text-[10px] text-emerald-700 font-mono">Live on public site</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#FFFCF5] border border-[#302E29]/10 shadow-paper-sm">
          <span className="text-[11px] font-mono text-[#716C63] uppercase">Hero Top Drift</span>
          <div className="text-2xl font-serif text-[#302E29] font-bold mt-0.5">{heroTopCount}</div>
          <span className="text-[10px] text-[#716C63] font-mono">Gentle drift left</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#FFFCF5] border border-[#302E29]/10 shadow-paper-sm">
          <span className="text-[11px] font-mono text-[#716C63] uppercase">Hero Bottom Drift</span>
          <div className="text-2xl font-serif text-[#302E29] font-bold mt-0.5">{heroBottomCount}</div>
          <span className="text-[10px] text-[#716C63] font-mono">Opposite drift right</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#FFFCF5] border border-[#302E29]/10 shadow-paper-sm">
          <span className="text-[11px] font-mono text-[#716C63] uppercase">Drafts & Review</span>
          <div className="text-2xl font-serif text-[#302E29] font-bold mt-0.5">{draftCount}</div>
          <span className="text-[10px] text-amber-700 font-mono">Hidden from visitors</span>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="p-4 rounded-2xl bg-[#FFFCF5] border border-[#302E29]/10 shadow-paper-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-[#716C63] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, caption, or category…"
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#EEE5D6]/50 border border-[#302E29]/10 text-xs text-[#302E29] placeholder-[#716C63] focus:outline-none focus:ring-2 focus:ring-[#C86446]/40 transition-all font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#716C63] hover:text-[#302E29]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Placement Filter */}
          <select
            value={selectedPlacement}
            onChange={(e) => setSelectedPlacement(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#EEE5D6]/70 border border-[#302E29]/10 text-xs font-mono text-[#302E29] focus:outline-none focus:ring-2 focus:ring-[#C86446]/40"
          >
            <option value="all">All Placements</option>
            <option value="hero_drift_top">Hero Drift Top (Left)</option>
            <option value="hero_drift_bottom">Hero Drift Bottom (Right)</option>
            <option value="trending_rail">Trending Reels Rail</option>
            <option value="curated_feature">Curated Feature Showcase</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#EEE5D6]/70 border border-[#302E29]/10 text-xs font-mono text-[#302E29] focus:outline-none focus:ring-2 focus:ring-[#C86446]/40"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
            <option value="archived">Archived Only</option>
          </select>
        </div>
      </div>

      {/* Main Video List / Grid */}
      {loading ? (
        <div className="p-16 rounded-3xl bg-[#FFFCF5] border border-[#302E29]/10 shadow-paper text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#C86446] mx-auto" />
          <p className="text-xs font-mono text-[#716C63]">Loading video library catalog…</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="p-16 rounded-3xl bg-[#FFFCF5] border border-[#302E29]/10 shadow-paper text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#EEE5D6] flex items-center justify-center mx-auto text-[#716C63]">
            <Film className="w-8 h-8 opacity-60" />
          </div>
          <div>
            <h3 className="text-lg font-serif text-[#302E29]">No Videos Found</h3>
            <p className="text-xs text-[#716C63] mt-1">
              {searchQuery || selectedPlacement !== "all" || selectedStatus !== "all"
                ? "Try clearing filters or search terms to see available videos."
                : "Your video library is currently empty. Add your first video to bring motion to the homepage."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 rounded-full bg-[#C86446] hover:bg-[#B55539] text-white text-xs font-semibold shadow-paper inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Video</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => {
            const isDraft = video.status === "draft";
            const isArchived = video.status === "archived";
            const isPublished = video.status === "published";

            return (
              <div
                key={video.id}
                className="group relative rounded-3xl bg-[#FFFCF5] border border-[#302E29]/10 shadow-paper-sm hover:shadow-paper-lg transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Poster / Playable Preview Area */}
                <div
                  className="relative aspect-video w-full bg-[#1C1B18] overflow-hidden cursor-pointer"
                  onClick={() => setPreviewingVideo(video)}
                >
                  {video.poster_url ? (
                    <img
                      src={video.poster_url}
                      alt={video.alt_text || video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-[#2D2A26] to-[#1C1B18]">
                      <FileVideo className="w-8 h-8 text-[#C86446] mb-1 opacity-70" />
                      <span className="text-[11px] font-mono text-[#EEE5D6] line-clamp-1">
                        {video.title}
                      </span>
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                    <div className="w-11 h-11 rounded-full bg-[#FFFCF5]/90 backdrop-blur-md text-[#302E29] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5 text-[#C86446]" />
                    </div>
                  </div>

                  {/* Badges on Video Preview */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider backdrop-blur-md border ${
                        isPublished
                          ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/30"
                          : isDraft
                          ? "bg-amber-950/80 text-amber-300 border-amber-500/30"
                          : "bg-stone-900/80 text-stone-400 border-stone-600/30"
                      }`}
                    >
                      {video.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/60 text-white/90 backdrop-blur-md border border-white/15">
                      {video.aspect_ratio || "9:16"}
                    </span>
                  </div>

                  {/* Non-destructive trim info */}
                  {(video.trim_start_seconds !== null || video.trim_end_seconds !== null) && (
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono text-[#FFFCF5] flex items-center gap-1 border border-white/10">
                      <Scissors className="w-3 h-3 text-[#C86446]" />
                      <span>
                        {video.trim_start_seconds || 0}s – {video.trim_end_seconds || "end"}s
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-[#C86446] font-semibold uppercase">
                        {video.category || "Creative"}
                      </span>
                      <span className="text-[10px] font-mono text-[#716C63]">
                        Order: <strong>#{video.display_order}</strong>
                      </span>
                    </div>

                    <h3 className="text-base font-serif font-bold text-[#302E29] line-clamp-1 leading-snug">
                      {video.title}
                    </h3>

                    {video.caption && (
                      <p className="text-xs text-[#716C63] line-clamp-2 leading-relaxed">
                        {video.caption}
                      </p>
                    )}

                    <div className="pt-1 flex items-center gap-1.5 text-[11px] font-mono text-[#716C63]">
                      <span className="px-2 py-0.5 rounded bg-[#EEE5D6] text-[#302E29]">
                        {PLACEMENT_LABELS[video.placement]?.label || video.placement}
                      </span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-[#302E29]/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {/* Order Controls */}
                      <button
                        type="button"
                        onClick={() => handleAdjustOrder(video, -1)}
                        className="p-1.5 rounded-lg bg-[#EEE5D6] hover:bg-[#E2D7C4] text-[#302E29] transition-colors"
                        title="Move Up in order"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustOrder(video, 1)}
                        className="p-1.5 rounded-lg bg-[#EEE5D6] hover:bg-[#E2D7C4] text-[#302E29] transition-colors"
                        title="Move Down in order"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Status quick toggle */}
                      {isPublished ? (
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(video, "draft")}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 text-[11px] font-mono font-medium transition-colors"
                        >
                          Unpublish
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(video, "published")}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 text-[11px] font-mono font-medium transition-colors"
                        >
                          Publish
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(video)}
                        className="p-2 rounded-xl text-[#716C63] hover:text-[#302E29] hover:bg-[#EEE5D6] transition-colors"
                        title="Edit video metadata or file"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(video)}
                        className="p-2 rounded-xl text-rose-600/70 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                        title="Delete video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ====================================================================
          MODAL: Add / Edit Video
          ==================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-[#FFFCF5] border border-[#302E29]/15 rounded-3xl p-6 sm:p-8 shadow-paper-lg my-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#302E29]/10">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#C86446]/10 text-[#C86446] flex items-center justify-center">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-bold text-[#302E29]">
                    {editingVideo ? "Edit Video" : "Add Video to Library"}
                  </h2>
                  <p className="text-xs text-[#716C63]">
                    Configure media file, placement, trim timestamps, and publication status.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-[#EEE5D6] text-[#716C63] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveVideo} className="space-y-5">
              {/* SECTION 1: Video File & Upload */}
              <div className="p-4 rounded-2xl bg-[#EEE5D6]/40 border border-[#302E29]/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-semibold text-[#302E29] flex items-center gap-1.5">
                    <FileVideo className="w-3.5 h-3.5 text-[#C86446]" />
                    <span>Video Media (MP4 / WebM / MOV, Max 50 MB) *</span>
                  </label>
                  {storagePath && (
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Stored in ad-previews
                    </span>
                  )}
                </div>

                {/* Upload Button & Dropzone */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="file"
                    ref={videoFileInputRef}
                    onChange={handleVideoFileSelected}
                    accept="video/mp4,video/webm,video/quicktime"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => videoFileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-4 py-2.5 rounded-xl bg-[#302E29] text-[#FFFCF5] hover:bg-black text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-all shadow-paper-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{editingVideo ? "Replace Video File" : "Upload Video to Storage"}</span>
                  </button>

                  <span className="text-[11px] font-mono text-[#716C63] text-center sm:text-left">
                    or enter direct stream URL below
                  </span>
                </div>

                {/* TUS Resumable Upload Progress Bar */}
                {isUploading && uploadProgress && (
                  <div className="p-3 rounded-xl bg-white border border-[#C86446]/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#302E29] font-semibold flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C86446]" />
                        <span>Uploading byte-by-byte: {uploadProgress.percentage}%</span>
                      </span>
                      <span className="text-[#716C63]">
                        {uploadProgress.formattedUploaded} / {uploadProgress.formattedTotal}
                      </span>
                    </div>

                    <div
                      className="w-full h-2 rounded-full bg-[#EEE5D6] overflow-hidden"
                      role="progressbar"
                      aria-valuenow={uploadProgress.percentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="h-full bg-[#C86446] transition-all duration-200 rounded-full"
                        style={{ width: `${uploadProgress.percentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* URL Input Field */}
                <div>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://.../video.mp4"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#302E29]/15 text-xs font-mono text-[#302E29] focus:outline-none focus:ring-2 focus:ring-[#C86446]/40"
                  />
                </div>
              </div>

              {/* SECTION 2: Poster Image */}
              <div className="p-4 rounded-2xl bg-[#EEE5D6]/40 border border-[#302E29]/10 space-y-3">
                <label className="text-xs font-mono font-semibold text-[#302E29] flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#C86446]" />
                  <span>Poster Thumbnail Image (JPEG / PNG / WebP)</span>
                </label>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="file"
                    ref={posterFileInputRef}
                    onChange={handlePosterFileSelected}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => posterFileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-[#EEE5D6] text-[#302E29] hover:bg-[#E2D7C4] text-xs font-mono font-semibold flex items-center justify-center gap-2 border border-[#302E29]/10 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Thumbnail</span>
                  </button>

                  <input
                    type="url"
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or storage URL"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-[#302E29]/15 text-xs font-mono text-[#302E29] focus:outline-none focus:ring-2 focus:ring-[#C86446]/40"
                  />
                </div>
              </div>

              {/* SECTION 3: Title & Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-mono font-semibold text-[#302E29]">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Linen Studio Tailoring Cut"
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#302E29]/15 text-xs text-[#302E29] focus:outline-none focus:ring-2 focus:ring-[#C86446]/40"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-mono font-semibold text-[#302E29]">
                    Caption / Subtitle
                  </label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={2}
                    placeholder="Brief description of the creative or product highlight…"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#302E29]/15 text-xs text-[#302E29] focus:outline-none focus:ring-2 focus:ring-[#C86446]/40 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-semibold text-[#302E29]">
                    Category / Genre
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Fashion, Skincare, Ceramics"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#302E29]/15 text-xs text-[#302E29] focus:outline-none focus:ring-2 focus:ring-[#C86446]/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-semibold text-[#302E29]">
                    Accessibility Alt Text
                  </label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Description for screen readers…"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#302E29]/15 text-xs text-[#302E29] focus:outline-none focus:ring-2 focus:ring-[#C86446]/40"
                  />
                </div>
              </div>

              {/* SECTION 4: Placement, Aspect Ratio, Order & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#EEE5D6]/30 border border-[#302E29]/10">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-semibold text-[#302E29]">
                    Public Placement *
                  </label>
                  <select
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value as VideoPlacement)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#302E29]/15 text-xs font-mono text-[#302E29] focus:outline-none focus:ring-2 focus:ring-[#C86446]/40"
                  >
                    <option value="hero_drift_top">Hero Drift Top (Left Drift)</option>
                    <option value="hero_drift_bottom">Hero Drift Bottom (Right Drift)</option>
                    <option value="trending_rail">Trending Reels Rail</option>
                    <option value="curated_feature">Curated Feature Showcase</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-semibold text-[#302E29]">
                    Aspect Ratio *
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as "9:16" | "16:9")}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#302E29]/15 text-xs font-mono text-[#302E29] focus:outline-none focus:ring-2 focus:ring-[#C86446]/40"
                  >
                    <option value="9:16">9:16 (Vertical Reel / Mobile)</option>
                    <option value="16:9">16:9 (Cinematic Widescreen)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-semibold text-[#302E29]">
                    Display Order (1 = First)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#302E29]/15 text-xs font-mono text-[#302E29] focus:outline-none focus:ring-2 focus:ring-[#C86446]/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-semibold text-[#302E29]">
                    Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as VideoStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#302E29]/15 text-xs font-mono text-[#302E29] focus:outline-none focus:ring-2 focus:ring-[#C86446]/40"
                  >
                    <option value="published">Published (Visible Publicly)</option>
                    <option value="draft">Draft (Admin Only)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* SECTION 5: Non-destructive Trim (Optional) */}
              <div className="p-4 rounded-2xl bg-[#EEE5D6]/30 border border-[#302E29]/10 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#302E29]">
                  <Scissors className="w-3.5 h-3.5 text-[#C86446]" />
                  <span>Non-Destructive Trimming (Seconds)</span>
                </div>
                <p className="text-[11px] text-[#716C63]">
                  Original uploaded video file is untouched. The player will loop precisely within this playback window.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-mono text-[#716C63]">Start Time (seconds)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={trimStart}
                      onChange={(e) => setTrimStart(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#302E29]/15 text-xs font-mono text-[#302E29]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-[#716C63]">End Time (seconds)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={trimEnd}
                      onChange={(e) => setTrimEnd(e.target.value)}
                      placeholder="e.g. 8"
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#302E29]/15 text-xs font-mono text-[#302E29]"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#302E29]/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-[#EEE5D6] hover:bg-[#E2D7C4] text-[#302E29] text-xs font-mono font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="px-6 py-2.5 rounded-full bg-[#C86446] hover:bg-[#B55539] text-white text-xs font-semibold shadow-paper flex items-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving…</span>
                    </>
                  ) : (
                    <span>{editingVideo ? "Update Video" : "Save Video"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: Video Playback Preview
          ==================================================================== */}
      {previewingVideo && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-[#FFFCF5] border border-[#302E29]/20 rounded-3xl p-6 shadow-paper-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#C86446] font-semibold">
                  {previewingVideo.category} · {previewingVideo.aspect_ratio}
                </span>
                <h3 className="text-lg font-serif font-bold text-[#302E29]">
                  {previewingVideo.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewingVideo(null)}
                className="p-1.5 rounded-full hover:bg-[#EEE5D6] text-[#716C63]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative rounded-2xl bg-black overflow-hidden aspect-video flex items-center justify-center border border-[#302E29]/20 shadow-inner">
              <video
                src={previewingVideo.video_url}
                poster={previewingVideo.poster_url || undefined}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              >
                Your browser does not support HTML5 video preview.
              </video>
            </div>

            {previewingVideo.caption && (
              <p className="text-xs text-[#716C63] leading-relaxed">
                {previewingVideo.caption}
              </p>
            )}

            <div className="flex items-center justify-between text-[11px] font-mono text-[#716C63] pt-2 border-t border-[#302E29]/10">
              <span>Placement: <strong>{previewingVideo.placement}</strong></span>
              <a
                href={previewingVideo.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C86446] hover:underline flex items-center gap-1"
              >
                <span>Direct stream URL</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: Delete Confirmation
          ==================================================================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#FFFCF5] border border-rose-300 rounded-3xl p-6 shadow-paper-lg space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-serif font-bold text-[#302E29]">Delete Video</h3>
              <p className="text-xs text-[#716C63]">
                Are you sure you want to permanently delete &ldquo;
                <strong className="text-[#302E29]">{deleteTarget.title}</strong>
                &rdquo; from the Video Library? If stored in Supabase Storage, the file will be cleaned up.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-5 py-2 rounded-full bg-[#EEE5D6] hover:bg-[#E2D7C4] text-[#302E29] text-xs font-mono transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-paper transition-all"
              >
                {isDeleting ? "Deleting…" : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
