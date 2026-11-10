"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Zap,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpRight,
  Info,
  Play,
} from "lucide-react";
import { AdListing } from "@/lib/supabase/types";
import { PLATFORMS_CONFIG } from "@/lib/data/ad-explorer-seed";
import { PlatformIcon } from "./PlatformIcon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface AdCardProps {
  ad: AdListing;
  onInspect: (ad: AdListing) => void;
}

export function AdCard({ ad, onInspect }: AdCardProps) {
  const [imageError, setImageError] = useState(false);
  const platformConfig = PLATFORMS_CONFIG[ad.platform];

  const formattedDate = new Date(ad.last_reviewed_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="group relative rounded-3xl bg-surface border border-border hover:border-accent/40 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
      <div>
        {/* Top Media / Thumbnail Preview */}
        <div
          className="relative aspect-video w-full bg-surface-2 overflow-hidden cursor-pointer"
          onClick={() => onInspect(ad)}
        >
          {ad.preview_image_path && !imageError ? (
            <img
              src={ad.preview_image_path}
              alt={ad.title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-surface-2 to-surface-3">
              <PlatformIcon platform={ad.platform} size={32} className="opacity-40 mb-2" />
              <span className="text-xs font-mono text-text-muted">{ad.brand_name}</span>
              <span className="text-[11px] text-text-faint">{ad.platform_surface || platformConfig.name}</span>
            </div>
          )}

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-black/40 pointer-events-none" />

          {/* Floating Platform Badge (Top Left) */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md border shadow-sm"
              style={{
                backgroundColor: platformConfig.badgeBg,
                color: platformConfig.badgeText,
                borderColor: `${platformConfig.accentColor}40`,
              }}
            >
              <PlatformIcon platform={ad.platform} size={12} />
              <span>{platformConfig.shortName}</span>
              {ad.platform_surface && (
                <span className="opacity-75 font-normal text-[10px]">· {ad.platform_surface}</span>
              )}
            </div>
          </div>

          {/* Format and Market Badges (Top Right) */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
            {ad.media_url && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-accent/90 text-accent-ink font-bold flex items-center gap-1 shadow-sm">
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>VIDEO</span>
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-black/60 backdrop-blur-md border border-white/10 text-white/90">
              {ad.creative_format}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/60 backdrop-blur-md border border-white/10 text-text-muted">
              {ad.country_code}
            </span>
          </div>

          {/* Quick Hover Inspect Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="px-3.5 py-1.5 rounded-full bg-accent text-accent-ink text-xs font-bold shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
              <span>Inspect Breakdown</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Brand & Category Row */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-text-faint">
                {ad.category}
              </span>
              <h3 className="text-base font-bold text-white group-hover:text-accent transition-colors leading-snug">
                {ad.brand_name}
              </h3>
            </div>
            {ad.is_featured && (
              <Badge variant="lime" className="text-[10px] flex-shrink-0">
                ✦ FEATURED
              </Badge>
            )}
          </div>

          {/* Headline Title */}
          <p className="text-xs sm:text-sm font-medium text-white/90 line-clamp-2">
            {ad.title}
          </p>

          {/* Hook Formulation Box */}
          {ad.hook_summary && (
            <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-1">
              <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-accent">
                <Zap className="w-3 h-3" />
                <span>Hook Strategy</span>
              </div>
              <p className="text-xs text-text-muted italic line-clamp-2">
                &ldquo;{ad.hook_summary}&rdquo;
              </p>
            </div>
          )}

          {/* Curator Signals Row */}
          {ad.signal_labels.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {ad.signal_labels.map((sig) => (
                <span
                  key={sig}
                  className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-surface-2 text-text-muted border border-border"
                >
                  {sig}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-border flex items-center justify-between gap-2">
        {/* Date Last Reviewed */}
        <div className="text-[11px] font-mono text-text-faint flex items-center gap-1">
          <Calendar className="w-3 h-3 text-accent" />
          <span>Reviewed: {formattedDate}</span>
        </div>

        {/* Direct Link to Official Library */}
        <a
          href={ad.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-mono text-text-muted hover:text-white transition-colors"
          title={`View on official ${platformConfig.libraryName}`}
        >
          <span>View on {platformConfig.shortName}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
