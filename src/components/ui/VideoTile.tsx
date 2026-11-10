"use client";

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, Heart, Instagram, Sparkles, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "./Badge";

export interface VideoTileProps {
  id?: string;
  videoSrc?: string;
  posterSrc?: string;
  poster?: string;
  title: string;
  category: string;
  handle?: string;
  views?: string;
  aspectRatio?: "9:16" | "4:5" | "1:1";
  isSeed?: boolean;
  onOpenModal?: () => void;
  className?: string;
}

export function VideoTile({
  id,
  videoSrc,
  posterSrc,
  poster,
  title,
  category,
  handle,
  views,
  aspectRatio = "9:16",
  isSeed = true,
  onOpenModal,
  className,
}: VideoTileProps) {
  const actualPoster = posterSrc || poster;
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Autoplay on mobile when >= 60% in view
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !videoSrc) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            videoRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
          } else {
            videoRef.current?.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: [0, 0.6] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [videoSrc]);

  // Desktop hover play
  const handleMouseEnter = () => {
    if (videoSrc && videoRef.current) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoSrc && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const ratioClass = {
    "9:16": "aspect-[9/16]",
    "4:5": "aspect-[4/5]",
    "1:1": "aspect-square",
  }[aspectRatio];

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onOpenModal}
      className={cn(
        "group relative rounded-[20px] overflow-hidden bg-surface-2 border border-border cursor-pointer select-none",
        "transition-all duration-300 hover:scale-[1.02] hover:border-accent/50 hover:shadow-[0_0_30px_rgba(215,255,61,0.15)]",
        ratioClass,
        className
      )}
    >
      {/* Video Element (Muted loop) */}
      {videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={actualPoster}
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
        />
      ) : actualPoster ? (
        <img
          src={actualPoster}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface to-surface-2 text-text-muted">
          <Sparkles className="w-8 h-8 text-accent/40" />
        </div>
      )}

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent pointer-events-none" />

      {/* Top Bar Badges */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-auto">
        <div className="flex items-center gap-1.5">
          <span className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10">
            <Instagram size={13} className="text-pink-400" />
          </span>
          {isSeed && <Badge variant="sample">Sample</Badge>}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className={cn(
            "p-1.5 rounded-full backdrop-blur-md transition-all border",
            isLiked
              ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
              : "bg-black/60 text-white/80 border-white/10 hover:text-white"
          )}
          aria-label="Save reel"
        >
          <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Center play state indicator (visible when video paused on desktop hover) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="w-12 h-12 rounded-full bg-accent/90 text-accent-ink flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform">
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5 fill-current" />}
        </div>
      </div>

      {/* Bottom Content Card */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10 space-y-1.5 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold">
            {category}
          </span>
          {views && (
            <span className="text-[10px] font-mono text-text-muted">
              • {views} views
            </span>
          )}
        </div>

        <h4 className="text-xs font-semibold text-text line-clamp-2 leading-snug group-hover:text-white transition-colors">
          {title}
        </h4>

        {handle && (
          <div className="text-[11px] text-text-muted truncate">
            {handle}
          </div>
        )}
      </div>
    </div>
  );
}
