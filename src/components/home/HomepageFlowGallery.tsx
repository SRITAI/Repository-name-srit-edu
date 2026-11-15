"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  Sparkles,
  ExternalLink,
  Film,
  VolumeX,
  Volume2,
  Maximize2,
  Scissors,
  Layers,
} from "lucide-react";
import { HomepageVideo } from "@/lib/supabase/types";
import { SEED_HOMEPAGE_VIDEOS } from "@/lib/data/homepage-videos-seed";

interface HomepageFlowGalleryProps {
  className?: string;
  initialVideos?: HomepageVideo[];
}

export function HomepageFlowGallery({
  className = "",
  initialVideos,
}: HomepageFlowGalleryProps) {
  const [videos, setVideos] = useState<HomepageVideo[]>(
    initialVideos && initialVideos.length > 0
      ? initialVideos
      : SEED_HOMEPAGE_VIDEOS.filter((v) => v.status === "published")
  );
  const [isMotionPaused, setIsMotionPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [activeExpandedVideo, setActiveExpandedVideo] = useState<HomepageVideo | null>(null);
  const userManuallyPausedRef = useRef(false);

  // Fetch latest persistent video library data on mount
  useEffect(() => {
    let isMounted = true;
    async function loadVideos() {
      try {
        const res = await fetch("/api/videos");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.videos && data.videos.length > 0) {
            setVideos(data.videos);
          }
        }
      } catch (err) {
        // Fall back gracefully to seed
        console.warn("Using default seed video gallery:", err);
      }
    }
    loadVideos();
    return () => {
      isMounted = false;
    };
  }, []);

  // Check user prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, []);

  // Handle visibility change (pause when tab is hidden to conserve resources)
  useEffect(() => {
    if (typeof document === "undefined") return;
    const handleVisibility = () => {
      if (document.hidden) {
        setIsMotionPaused(true);
      } else if (!userManuallyPausedRef.current) {
        setIsMotionPaused(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const handleToggleMotion = () => {
    setIsMotionPaused((prev) => {
      const next = !prev;
      userManuallyPausedRef.current = next;
      return next;
    });
  };

  // Separate videos by placement
  const topRowVideos = videos.filter(
    (v) => v.placement === "hero_drift_top" || v.placement === "curated_feature"
  );
  const bottomRowVideos = videos.filter(
    (v) => v.placement === "hero_drift_bottom" || v.placement === "trending_rail"
  );

  // Fallback defaults if placements have few items
  const displayTop = topRowVideos.length >= 2 ? topRowVideos : SEED_HOMEPAGE_VIDEOS.slice(0, 4);
  const displayBottom = bottomRowVideos.length >= 2 ? bottomRowVideos : SEED_HOMEPAGE_VIDEOS.slice(4, 8);

  const shouldPause = isMotionPaused || prefersReducedMotion;

  return (
    <div
      className={`flow-gallery-root relative w-full overflow-hidden py-10 select-none ${className}`}
      aria-label="Cinematic video showcase with calm continuous motion"
    >
      {/* Subtle painterly studio background wash */}
      <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#EEE5D6] via-transparent to-transparent" />

      {/* Top Header & Motion Control Pill */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#C86446] animate-pulse" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#716C63]">
            Cinematic Creator Reel Stream · Real Humans
          </span>
        </div>

        {/* Accessible Pause / Resume Motion Pill */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleMotion}
            aria-pressed={isMotionPaused}
            aria-label={isMotionPaused ? "Resume video motion drift" : "Pause video motion drift"}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold transition-all flex items-center gap-2 shadow-paper-sm border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C86446] ${
              shouldPause
                ? "bg-[#302E29] text-[#FFFCF5] border-[#302E29]"
                : "bg-[#FFFCF5] text-[#302E29] border-[#302E29]/15 hover:bg-[#EEE5D6]"
            }`}
          >
            {shouldPause ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-[#E29578]" />
                <span>Resume Motion</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 fill-current text-[#C86446]" />
                <span>Pause Motion</span>
              </>
            )}
          </button>

          <Link
            href="/ad-explorer"
            className="text-xs font-mono text-[#716C63] hover:text-[#302E29] hover:underline flex items-center gap-1"
          >
            <span>Explore all ads</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ====================================================================
          ROW 1: Top Cinematic Drift (Drifts Left)
          ==================================================================== */}
      <div className="flow-track-wrapper relative w-full overflow-hidden py-3">
        {/* Soft edge fade masks for seamless horizontal blending */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 z-10 bg-gradient-to-r from-[#F6F1E7] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 z-10 bg-gradient-to-l from-[#F6F1E7] to-transparent" />

        <div
          className={`flow-track flow-drift-left flex items-center gap-6 sm:gap-8 w-max ${
            shouldPause ? "animation-paused" : ""
          }`}
        >
          {/* Render two duplicated sets for seamless loop */}
          {[...displayTop, ...displayTop].map((vid, idx) => (
            <FlowVideoCard
              key={`top-${vid.id}-${idx}`}
              video={vid}
              isPaused={shouldPause}
              onExpand={() => setActiveExpandedVideo(vid)}
            />
          ))}
        </div>
      </div>

      {/* ====================================================================
          ROW 2: Bottom Cinematic Drift (Gentle Opposite Drift Right)
          ==================================================================== */}
      <div className="flow-track-wrapper relative w-full overflow-hidden py-3 mt-2 sm:mt-4">
        {/* Soft edge fade masks */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 z-10 bg-gradient-to-r from-[#F6F1E7] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 z-10 bg-gradient-to-l from-[#F6F1E7] to-transparent" />

        <div
          className={`flow-track flow-drift-right flex items-center gap-6 sm:gap-8 w-max ${
            shouldPause ? "animation-paused" : ""
          }`}
        >
          {/* Render two duplicated sets for seamless loop */}
          {[...displayBottom, ...displayBottom].map((vid, idx) => (
            <FlowVideoCard
              key={`bottom-${vid.id}-${idx}`}
              video={vid}
              isPaused={shouldPause}
              onExpand={() => setActiveExpandedVideo(vid)}
            />
          ))}
        </div>
      </div>

      {/* ====================================================================
          MODAL: Expanded Video Inspector
          ==================================================================== */}
      {activeExpandedVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveExpandedVideo(null)}
        >
          <div
            className="max-w-2xl w-full bg-[#FFFCF5] border border-[#302E29]/20 rounded-3xl p-6 sm:p-8 shadow-paper-lg space-y-4 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#C86446] font-semibold">
                  {activeExpandedVideo.category}
                </span>
                <h3 className="text-xl font-serif font-bold text-[#302E29]">
                  {activeExpandedVideo.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveExpandedVideo(null)}
                className="px-3 py-1.5 rounded-full bg-[#EEE5D6] hover:bg-[#E2D7C4] text-xs font-mono text-[#302E29]"
              >
                Close
              </button>
            </div>

            <div className="relative rounded-2xl bg-[#1C1B18] overflow-hidden aspect-video flex items-center justify-center shadow-inner">
              <video
                src={activeExpandedVideo.video_url}
                poster={activeExpandedVideo.poster_url || undefined}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              >
                Your browser does not support HTML5 video preview.
              </video>
            </div>

            {activeExpandedVideo.caption && (
              <p className="text-xs text-[#716C63] leading-relaxed">
                {activeExpandedVideo.caption}
              </p>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-[#302E29]/10">
              <span className="text-[11px] font-mono text-[#716C63]">
                Format: <strong>{activeExpandedVideo.aspect_ratio}</strong> · Real Creator Shot
              </span>
              <Link
                href="/studio"
                className="px-4 py-2 rounded-full bg-[#C86446] hover:bg-[#B55539] text-white text-xs font-semibold shadow-paper flex items-center gap-1.5 transition-all"
              >
                <span>Make a Similar Creative</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Individual Art-Studio Framed Video Card
 */
function FlowVideoCard({
  video,
  isPaused,
  onExpand,
}: {
  video: HomepageVideo;
  isPaused: boolean;
  onExpand: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const isVertical = video.aspect_ratio === "9:16";
  const cardWidth = isVertical ? "w-[220px] sm:w-[250px]" : "w-[300px] sm:w-[350px]";
  const mediaAspect = isVertical ? "aspect-[9/16]" : "aspect-[16/9]";

  // Non-destructive trimming bounds
  const trimStart = video.trim_start_seconds ?? 0;
  const trimEnd = video.trim_end_seconds;

  // Handle trim loop
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const handleTimeUpdate = () => {
      if (trimEnd && trimEnd > 0 && vid.currentTime >= trimEnd) {
        vid.currentTime = trimStart;
      }
    };

    const handleLoadedMetadata = () => {
      if (trimStart > 0 && vid.currentTime < trimStart) {
        vid.currentTime = trimStart;
      }
    };

    vid.addEventListener("timeupdate", handleTimeUpdate);
    vid.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () => {
      vid.removeEventListener("timeupdate", handleTimeUpdate);
      vid.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [trimStart, trimEnd]);

  // Handle play / pause sync
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    if (isPaused) {
      vid.pause();
      setIsPlaying(false);
    } else {
      vid
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay was prevented by browser policy (e.g. low power mode)
          setIsPlaying(false);
        });
    }
  }, [isPaused]);

  return (
    <div
      className={`flow-video-card flex-shrink-0 ${cardWidth} group rounded-3xl bg-[#FFFCF5] border border-[#302E29]/15 p-2 sm:p-2.5 shadow-paper-sm hover:shadow-paper-lg transition-all duration-300 transform hover:-translate-y-1`}
    >
      {/* Matte paper frame container */}
      <div
        className={`relative ${mediaAspect} w-full rounded-2xl overflow-hidden bg-[#1C1B18] cursor-pointer shadow-inner`}
        onClick={onExpand}
      >
        {/* Video Element */}
        {!loadError ? (
          <video
            ref={videoRef}
            src={video.video_url}
            poster={video.poster_url || undefined}
            muted
            playsInline
            loop
            preload="metadata"
            aria-label={video.alt_text || video.title}
            onError={() => setLoadError(true)}
            onPlaying={() => setIsPlaying(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          /* Graceful poster fallback if video fails */
          video.poster_url ? (
            <img
              src={video.poster_url}
              alt={video.alt_text || video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-[#282521] text-center">
              <Film className="w-8 h-8 text-[#C86446] mb-2 opacity-60" />
              <span className="text-xs font-mono text-[#EEE5D6]">{video.title}</span>
            </div>
          )
        )}

        {/* Ambient paper vignette overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold uppercase tracking-wider bg-black/60 backdrop-blur-md text-[#FFFCF5] border border-white/10">
            {video.category || "Creative"}
          </span>

          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/60 backdrop-blur-md text-white/80 border border-white/10">
            {video.aspect_ratio}
          </span>
        </div>

        {/* Play / Expand Indicator Icon on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-[#FFFCF5]/90 backdrop-blur-md text-[#302E29] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <Maximize2 className="w-4 h-4 text-[#C86446]" />
          </div>
        </div>

        {/* Trim Badge if applied */}
        {(video.trim_start_seconds !== null || video.trim_end_seconds !== null) && (
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[9px] font-mono text-white/90 flex items-center gap-1 border border-white/10">
            <Scissors className="w-2.5 h-2.5 text-[#C86446]" />
            <span>Loop Cut</span>
          </div>
        )}
      </div>

      {/* Art-Studio Caption Strip */}
      <div className="p-2 sm:p-2.5 space-y-1">
        <h4 className="text-xs font-serif font-bold text-[#302E29] line-clamp-1 group-hover:text-[#C86446] transition-colors">
          {video.title}
        </h4>
        {video.caption && (
          <p className="text-[11px] text-[#716C63] line-clamp-1 leading-snug">
            {video.caption}
          </p>
        )}
      </div>
    </div>
  );
}
