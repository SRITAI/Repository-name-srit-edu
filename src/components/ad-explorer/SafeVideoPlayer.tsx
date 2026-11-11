"use client";

import React, { useState, useEffect } from "react";
import {
  ExternalLink,
  Play,
  Film,
  AlertCircle,
  ShieldCheck,
  Image as ImageIcon,
  Layers,
  ChevronRight,
  Maximize2,
  FileVideo,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { parseVideoMediaUrl, ParsedMediaEmbed } from "@/lib/media/video-embed";
import { isMetaAdLibraryUrl } from "@/lib/validation/ad-listing";
import { PlatformIcon } from "./PlatformIcon";
import { AdPlatform, AdMediaItem } from "@/lib/supabase/types";

interface SafeVideoPlayerProps {
  mediaUrl?: string | null;
  sourceUrl: string;
  platform: AdPlatform;
  brandName: string;
  title: string;
  previewImagePath?: string | null;
  aspectRatio?: "video" | "reel"; // 16:9 or 9:16
  className?: string;
  mediaItems?: AdMediaItem[];
}

export function SafeVideoPlayer({
  mediaUrl,
  sourceUrl,
  platform,
  brandName,
  title,
  previewImagePath,
  aspectRatio = "video",
  className = "",
  mediaItems,
}: SafeVideoPlayerProps) {
  // Normalize media items into an array
  const items: AdMediaItem[] = React.useMemo(() => {
    if (mediaItems && mediaItems.length > 0) {
      return mediaItems;
    }
    // Synthesize single item if no items passed
    if (mediaUrl) {
      const isDirect =
        mediaUrl.endsWith(".mp4") ||
        mediaUrl.endsWith(".webm") ||
        mediaUrl.endsWith(".mov");
      return [
        {
          media_type: isDirect ? "hosted_video" : "embed",
          media_url: mediaUrl,
          thumbnail_url: previewImagePath || null,
          caption: title,
          display_order: 0,
        },
      ];
    }
    if (previewImagePath) {
      return [
        {
          media_type: "image",
          media_url: previewImagePath,
          thumbnail_url: previewImagePath,
          caption: title,
          display_order: 0,
        },
      ];
    }
    return [
      {
        media_type: "source_link",
        media_url: sourceUrl,
        thumbnail_url: null,
        caption: `Official transparency listing on ${platform}`,
        display_order: 0,
      },
    ];
  }, [mediaItems, mediaUrl, previewImagePath, sourceUrl, title, platform]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isVideoBuffering, setIsVideoBuffering] = useState(false);

  // Reset play state and errors when switching items
  useEffect(() => {
    setIsPlaying(false);
    setImgError(false);
    setVideoError(null);
    setIsVideoBuffering(false);
  }, [activeIndex]);

  const activeItem = items[activeIndex] || items[0];
  const rawMediaUrl = activeItem?.media_url || "";
  const activeThumbnail = activeItem?.thumbnail_url || previewImagePath || undefined;

  // Intelligently resolve the true playable URL:
  // 1. If active item has metadata.storage_path and rawMediaUrl is a Meta link or not a direct file,
  //    reconstruct the direct Supabase Storage public URL.
  const storagePath = activeItem?.metadata?.storage_path;
  const isDirectFile =
    rawMediaUrl.endsWith(".mp4") ||
    rawMediaUrl.endsWith(".webm") ||
    rawMediaUrl.endsWith(".mov");
  const isRawMetaUrl = isMetaAdLibraryUrl(rawMediaUrl);

  let activeMediaUrl = rawMediaUrl;
  if (storagePath && (!isDirectFile || isRawMetaUrl)) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://phjtyfqmswarbeuuybnl.supabase.co";
    activeMediaUrl = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/ad-previews/${storagePath}`;
  } else if (isRawMetaUrl && mediaUrl && !isMetaAdLibraryUrl(mediaUrl)) {
    // If listing has a valid media_url, fallback to it
    activeMediaUrl = mediaUrl;
  }

  // Parse active item media URL using host allowlist
  const isMetaLib = isMetaAdLibraryUrl(activeMediaUrl);
  const embedInfo: ParsedMediaEmbed = parseVideoMediaUrl(isMetaLib ? null : activeMediaUrl || null);

  // Robust mutually-exclusive media mode resolution
  // Meta Ad Library pages can NEVER be embedded or streamed as direct video!
  const isEmbed = !isMetaLib && embedInfo.canEmbed && !embedInfo.isDirectVideo;
  const isHostedVideo =
    !isMetaLib &&
    !isEmbed &&
    (embedInfo.isDirectVideo ||
      activeMediaUrl.endsWith(".mp4") ||
      activeMediaUrl.endsWith(".webm") ||
      activeMediaUrl.endsWith(".mov") ||
      (activeItem.media_type === "hosted_video" &&
        !activeMediaUrl.match(/\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i) &&
        !isMetaLib));
  const isImage = !isEmbed && !isHostedVideo && (activeItem.media_type === "image" || Boolean(activeMediaUrl.match(/\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i)));
  const isSourceLink = !isEmbed && !isHostedVideo && !isImage;

  const isReelAspect =
    aspectRatio === "reel" ||
    (isHostedVideo && activeItem?.metadata?.is_vertical === true) ||
    embedInfo.provider === "instagram" ||
    embedInfo.provider === "tiktok";

  const containerAspect = isReelAspect
    ? "aspect-[9/16] max-w-xs mx-auto"
    : "aspect-video w-full";

  // Helper to get tab label
  const getItemLabel = (item: AdMediaItem, idx: number) => {
    if (item.caption && item.caption.length <= 20) return item.caption;
    switch (item.media_type) {
      case "hosted_video":
        return `Video ${idx + 1} (MP4)`;
      case "embed":
        return `Embed ${idx + 1}`;
      case "image":
        return `Image ${idx + 1}`;
      case "source_link":
        return `Source ${idx + 1}`;
      default:
        return `Media ${idx + 1}`;
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case "hosted_video":
        return <FileVideo className="w-3 h-3" />;
      case "embed":
        return <Play className="w-3 h-3" />;
      case "image":
        return <ImageIcon className="w-3 h-3" />;
      default:
        return <ExternalLink className="w-3 h-3" />;
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Multi-Media Switcher Tabs (when > 1 item) */}
      {items.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" role="tablist">
          <span className="text-[10px] font-mono text-text-muted flex items-center gap-1 uppercase mr-1">
            <Layers className="w-3 h-3 text-accent" />
            <span>Media ({items.length}):</span>
          </span>
          {items.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveIndex(idx)}
                className={`px-3 py-1 rounded-full text-xs font-mono flex items-center gap-1.5 transition-all flex-shrink-0 ${
                  isActive
                    ? "bg-accent text-accent-ink font-bold shadow-md"
                    : "bg-surface-2 text-text-muted hover:text-white hover:bg-surface-3 border border-border"
                }`}
              >
                {getItemIcon(item.media_type)}
                <span>{getItemLabel(item, idx)}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Playback / Preview Container */}
      <div className="relative overflow-hidden rounded-2xl bg-black border border-white/10 shadow-2xl">
        {/* CASE 1: Hosted HTML5 Video Player */}
        {isHostedVideo && (
          <div className={`relative w-full ${containerAspect} bg-black flex items-center justify-center overflow-hidden`}>
            {videoError ? (
              <div className="p-6 text-center space-y-3 max-w-md">
                <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-white">Video Playback Notice</h4>
                  <p className="text-xs text-text-muted">
                    {videoError}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <a
                    href={activeMediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-full bg-accent text-accent-ink text-xs font-bold hover:brightness-110 flex items-center gap-1.5 shadow"
                  >
                    <span>Open Direct Video Stream</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setVideoError(null)}
                    className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-mono flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Retry</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <video
                  key={activeMediaUrl}
                  src={embedInfo.embedUrl || activeMediaUrl}
                  controls
                  playsInline
                  preload="metadata"
                  poster={activeThumbnail}
                  aria-label={`${brandName} - ${title} ad video`}
                  onWaiting={() => setIsVideoBuffering(true)}
                  onPlaying={() => setIsVideoBuffering(false)}
                  onCanPlay={() => setIsVideoBuffering(false)}
                  onError={(e) => {
                    const err = e.currentTarget.error;
                    let msg = "The browser cannot stream this video file.";
                    if (err?.code === 4) {
                      msg = "Video format not supported or media file could not be loaded.";
                    } else if (err?.code === 2) {
                      msg = "Network interruption prevented video playback.";
                    }
                    setVideoError(msg);
                  }}
                  className="w-full h-full object-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Your browser does not support HTML5 video playback. Please view the original source.
                </video>

                {isVideoBuffering && (
                  <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-[10px] font-mono text-accent flex items-center gap-1.5 pointer-events-none">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Buffering...</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* CASE 2: Embeddable Video (YouTube, Vimeo, TikTok, Instagram) */}
        {isEmbed && (
          <div className={`relative w-full ${containerAspect} bg-black`}>
            {!isPlaying ? (
              <div
                className="relative w-full h-full group cursor-pointer"
                onClick={() => setIsPlaying(true)}
              >
                {activeThumbnail && !imgError ? (
                  <img
                    src={activeThumbnail}
                    alt={title}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-surface-2 to-surface-3 p-6 text-center">
                    <PlatformIcon platform={platform} size={36} className="opacity-50 mb-2" />
                    <span className="text-xs font-mono text-text-muted">{brandName}</span>
                    <span className="text-sm font-semibold text-white mt-1 max-w-md line-clamp-1">
                      {title}
                    </span>
                  </div>
                )}

                {/* Accessible Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                  <button
                    type="button"
                    aria-label={`Play ${embedInfo.provider} video for ${brandName}`}
                    className="w-14 h-14 rounded-full bg-accent text-accent-ink flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform focus-visible:ring-4 focus-visible:ring-accent"
                  >
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </button>
                </div>

                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono uppercase text-white/90">
                  {embedInfo.provider.toUpperCase()} PLAYER
                </div>
              </div>
            ) : (
              <iframe
                src={embedInfo.embedUrl}
                title={`${brandName} - ${title}`}
                sandbox="allow-scripts allow-same-origin allow-presentation"
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            )}
          </div>
        )}

        {/* CASE 3: Static Image Media Item */}
        {isImage && (
          <div className={`relative w-full ${containerAspect} bg-black flex items-center justify-center overflow-hidden`}>
            <img
              src={activeMediaUrl}
              alt={activeItem.caption || title}
              className="w-full h-full object-contain"
              loading="lazy"
            />
            {activeItem.caption && (
              <div className="absolute bottom-0 inset-x-0 bg-black/70 backdrop-blur-sm p-3 text-xs text-neutral-300 border-t border-white/10">
                {activeItem.caption}
              </div>
            )}
          </div>
        )}

        {/* CASE 4: Source Link / Platform Transparency Reference (Meta Ad Library, Google, etc.) */}
        {isSourceLink && (
          <div className={`relative w-full ${containerAspect} flex items-center justify-center overflow-hidden`}>
            {activeThumbnail && !imgError ? (
              <img
                src={activeThumbnail}
                alt={title}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover opacity-60 filter blur-[1px]"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-surface-2 via-surface-3 to-black" />
            )}

            <div className="absolute inset-0 bg-black/65 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="p-3.5 rounded-2xl bg-surface border border-white/10 shadow-xl">
                <PlatformIcon platform={platform} size={32} />
              </div>

              <div className="space-y-1 max-w-md">
                <div className="text-xs font-mono text-accent uppercase tracking-wider">
                  Official Platform Transparency Reference
                </div>
                <h4 className="text-sm sm:text-base font-semibold text-white line-clamp-1">{title}</h4>
                <p className="text-xs text-text-muted">
                  {embedInfo.notice ||
                    "Third-party platform policy requires viewing active campaign details directly on the official platform portal."}
                </p>
              </div>

              <a
                href={activeItem.media_url || sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-ink text-xs font-bold hover:brightness-110 shadow-lg transition-all focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span>View Original Ad on {platform.toUpperCase()}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Bottom Status / Source Info Bar */}
        <div className="p-3 bg-surface-2 border-t border-border flex items-center justify-between text-xs font-mono text-text-muted">
          <span className="flex items-center gap-1.5 text-accent">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>
              {isHostedVideo
                ? "Verified HTML5 Video (MP4/WebM)"
                : isEmbed
                ? `Sandboxed ${embedInfo.provider.toUpperCase()} Embed`
                : isImage
                ? "Verified Media Image"
                : "Curated Transparency Reference"}
            </span>
          </span>

          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-white hover:text-accent transition-colors"
          >
            <span>Original Source</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Caption for active item if provided */}
      {activeItem.caption && (
        <p className="text-xs text-text-muted italic px-1">
          {activeItem.caption}
        </p>
      )}
    </div>
  );
}
