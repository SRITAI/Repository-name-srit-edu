"use client";

import React, { useState } from "react";
import { ExternalLink, Play, Film, AlertCircle, ShieldCheck } from "lucide-react";
import { parseVideoMediaUrl, ParsedMediaEmbed } from "@/lib/media/video-embed";
import { PlatformIcon } from "./PlatformIcon";
import { AdPlatform } from "@/lib/supabase/types";

interface SafeVideoPlayerProps {
  mediaUrl?: string | null;
  sourceUrl: string;
  platform: AdPlatform;
  brandName: string;
  title: string;
  previewImagePath?: string | null;
  aspectRatio?: "video" | "reel"; // 16:9 or 9:16
  className?: string;
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
}: SafeVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Parse and validate the media link using host allowlist
  const embedInfo: ParsedMediaEmbed = parseVideoMediaUrl(mediaUrl || null);

  const containerAspect =
    aspectRatio === "reel" ? "aspect-[9/16] max-w-xs mx-auto" : "aspect-video w-full";

  // CASE 1: Playable Embed (YouTube, Vimeo, TikTok, Instagram, Direct Video)
  if (embedInfo.canEmbed) {
    if (embedInfo.isDirectVideo) {
      return (
        <div className={`relative overflow-hidden rounded-2xl bg-black border border-white/10 ${className}`}>
          <div className={`relative w-full ${containerAspect}`}>
            <video
              src={embedInfo.embedUrl}
              controls
              playsInline
              preload="metadata"
              poster={previewImagePath || undefined}
              className="w-full h-full object-contain"
            >
              Your browser does not support HTML5 video playback.
            </video>
          </div>
          <div className="p-3 bg-surface-2 border-t border-border flex items-center justify-between text-xs font-mono text-text-muted">
            <span className="flex items-center gap-1.5 text-accent">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Link Playback (Direct MP4)</span>
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
      );
    }

    // Embeddable Iframe (YouTube, Vimeo, etc.)
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-black border border-white/10 ${className}`}>
        <div className={`relative w-full ${containerAspect}`}>
          {!isPlaying ? (
            <div className="relative w-full h-full group cursor-pointer" onClick={() => setIsPlaying(true)}>
              {previewImagePath && !imgError ? (
                <img
                  src={previewImagePath}
                  alt={title}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-surface-2 to-surface-3 p-6 text-center">
                  <PlatformIcon platform={platform} size={36} className="opacity-50 mb-2" />
                  <span className="text-xs font-mono text-text-muted">{brandName}</span>
                  <span className="text-sm font-semibold text-white mt-1 max-w-md line-clamp-1">{title}</span>
                </div>
              )}

              {/* Play Overlay */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                <button
                  type="button"
                  aria-label="Play video"
                  className="w-14 h-14 rounded-full bg-accent text-accent-ink flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform"
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

        {/* Footer info bar */}
        <div className="p-3 bg-surface-2 border-t border-border flex items-center justify-between text-xs font-mono text-text-muted">
          <span className="flex items-center gap-1.5 text-accent">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sandboxed {embedInfo.provider} Embed</span>
          </span>
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-white hover:text-accent transition-colors"
          >
            <span>Original Library / Source</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  // CASE 2: External Library / Unsupported Link / Platform Transparency Page
  // Shows a rich fallback preview card with verified link to original platform
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-black border border-white/10 ${className}`}>
      <div className={`relative w-full ${containerAspect} flex items-center justify-center overflow-hidden`}>
        {previewImagePath && !imgError ? (
          <img
            src={previewImagePath}
            alt={title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover opacity-60 filter blur-[1px]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-surface-2 via-surface-3 to-black" />
        )}

        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3">
          <div className="p-3.5 rounded-2xl bg-surface border border-white/10 shadow-xl">
            <PlatformIcon platform={platform} size={32} />
          </div>

          <div className="space-y-1 max-w-md">
            <div className="text-xs font-mono text-accent uppercase tracking-wider">
              Official Transparency / Ad Library Reference
            </div>
            <h4 className="text-sm sm:text-base font-semibold text-white line-clamp-1">{title}</h4>
            <p className="text-xs text-text-muted">
              {embedInfo.notice || "Third-party platform policy requires viewing active campaign details directly on the official host."}
            </p>
          </div>

          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-ink text-xs font-bold hover:brightness-110 shadow-lg transition-all"
          >
            <span>View Active Listing on {platform.toUpperCase()}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="p-3 bg-surface-2 border-t border-border flex items-center justify-between text-xs font-mono text-text-muted">
        <span className="flex items-center gap-1.5 text-text-muted">
          <Film className="w-3.5 h-3.5" />
          <span>Curated Platform Reference</span>
        </span>
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-accent hover:underline"
        >
          <span>Open External Library</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
