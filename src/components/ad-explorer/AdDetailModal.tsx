"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  X,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  Info,
  CheckCircle2,
  Share2,
  Wand2,
  Film,
  Video,
  ArrowRight,
} from "lucide-react";
import { AdListing } from "@/lib/supabase/types";
import { PLATFORMS_CONFIG } from "@/lib/data/ad-explorer-seed";
import { PlatformIcon } from "./PlatformIcon";
import { SafeVideoPlayer } from "./SafeVideoPlayer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface AdDetailModalProps {
  ad: AdListing | null;
  onClose: () => void;
}

export function AdDetailModal({ ad, onClose }: AdDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (ad) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [ad, onClose]);

  if (!ad) return null;

  const platformConfig = PLATFORMS_CONFIG[ad.platform];
  const formattedDate = new Date(ad.last_reviewed_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ad-modal-title"
    >
      <div
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-surface border border-border-strong shadow-[0_20px_60px_rgba(0,0,0,0.85)] text-text p-6 sm:p-8 space-y-6 scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-surface-2 text-text-muted hover:text-white hover:bg-surface-3 transition-colors border border-border"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 pr-12">
          {/* Platform Badge */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
            style={{
              backgroundColor: platformConfig.badgeBg,
              color: platformConfig.badgeText,
              borderColor: `${platformConfig.accentColor}33`,
            }}
          >
            <PlatformIcon platform={ad.platform} size={14} />
            <span>{platformConfig.name}</span>
            {ad.platform_surface && (
              <span className="opacity-75">· {ad.platform_surface}</span>
            )}
          </div>

          <Badge variant="outline" className="text-xs">
            {ad.category.toUpperCase()}
          </Badge>

          <Badge variant="outline" className="text-xs">
            {ad.country_code}
          </Badge>

          <Badge variant="lime" className="text-xs">
            {ad.creative_format.toUpperCase()}
          </Badge>

          {ad.is_featured && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#C8FF00]/15 text-[#C8FF00] border border-[#C8FF00]/30">
              ★ EDITOR&rsquo;S PICK
            </span>
          )}
        </div>

        {/* Main Title & Brand */}
        <div className="space-y-1">
          <div className="text-xs font-mono text-text-muted">
            Brand / Advertiser: <span className="text-white font-medium">{ad.advertiser_name || ad.brand_name}</span>
          </div>
          <h2 id="ad-modal-title" className="text-2xl sm:text-3xl font-bold font-sans text-white tracking-tight">
            {ad.title}
          </h2>
          {ad.short_description && (
            <p className="text-sm text-text-muted pt-1 leading-relaxed">
              {ad.short_description}
            </p>
          )}
        </div>

        {/* Link-Based Safe Video Player or Official Reference Preview */}
        <div>
          <SafeVideoPlayer
            mediaItems={ad.media_items}
            mediaUrl={ad.media_url}
            sourceUrl={ad.source_url}
            platform={ad.platform}
            brandName={ad.brand_name}
            title={ad.title}
            previewImagePath={ad.preview_image_path}
            aspectRatio={ad.platform_surface?.toLowerCase().includes("reel") || ad.platform_surface?.toLowerCase().includes("short") ? "reel" : "video"}
          />
        </div>

        {/* MAKE SAME VIDEO WITH US - Veyra AI Video Studio Feature Showcase */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#17191C] via-[#1F2327] to-[#17191C] border border-[#C8FF00]/40 p-5 sm:p-6 shadow-[0_0_40px_rgba(200,255,0,0.08)]">
          {/* Subtle animated ambient glow */}
          <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-[#C8FF00]/10 blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[#38bdf8]/10 blur-3xl pointer-events-none animate-pulse" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-2.5 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8FF00]/15 text-[#C8FF00] border border-[#C8FF00]/30 text-xs font-mono font-bold tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>MAKE SAME VIDEO WITH US · VEYRA AI STUDIO</span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold font-sans text-white tracking-tight leading-snug">
                Want to recreate this winning video ad for your brand?
              </h3>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Take the proven hook, pacing, and visual style of this <span className="text-[#C8FF00] font-semibold">{ad.brand_name}</span> ad. Our Human + AI Video Studio produces custom-scripted variants, AI voiceovers, and high-converting 9:16 reels in minutes.
              </p>

              {/* Feature Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-neutral-300">
                <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  <Wand2 className="w-3 h-3 text-[#C8FF00]" />
                  <span>Script &amp; Hook Generator</span>
                </span>
                <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  <Film className="w-3 h-3 text-[#C8FF00]" />
                  <span>9:16 Vertical &amp; 16:9 Landscape</span>
                </span>
                <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  <Zap className="w-3 h-3 text-[#C8FF00]" />
                  <span>Ready in 1-Click</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto flex-shrink-0">
              <Link
                href={`/studio?category=${ad.category}&ref=${ad.id}&brand=${encodeURIComponent(
                  ad.brand_name
                )}&title=${encodeURIComponent(ad.title)}`}
                className="w-full"
              >
                <button
                  type="button"
                  className="w-full px-5 py-3 rounded-xl bg-[#C8FF00] hover:bg-[#d8ff3d] text-black font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#C8FF00]/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-black" />
                  <span>Make Same Video With Us ↗</span>
                </button>
              </Link>

              <Link
                href={`/studio/projects?create=true&ref=${ad.id}`}
                className="text-center text-[11px] font-mono text-neutral-400 hover:text-white transition-colors"
              >
                Or open Studio workspace &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Hook & Psychological Formulation */}
          <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-accent font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Hook Psychology</span>
            </div>
            <p className="text-sm text-white italic font-medium leading-relaxed">
              &ldquo;{ad.hook_summary || "Direct value proposition delivered in initial 3 seconds."}&rdquo;
            </p>
          </div>

          {/* Call to Action */}
          <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-accent-2 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Call to Action &amp; Offer</span>
            </div>
            <div className="text-sm font-semibold text-white">
              {ad.call_to_action || "Learn More ↗"}
            </div>
            <div className="text-xs text-text-muted">
              Designed for direct-response engagement and immediate click-through conversion.
            </div>
          </div>
        </div>

        {/* Amazon Marketplace Research Box */}
        {(ad.asin || ad.amazon_ad_type || ad.search_term || ad.product_url) && (
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2.5 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold uppercase tracking-wider">
              <PlatformIcon platform="amazon" size={14} />
              <span>Amazon Marketplace Research Intelligence</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-neutral-300">
              {ad.asin && (
                <div>
                  <span className="text-neutral-500 block text-[10px]">ASIN:</span>
                  <span className="text-white font-bold">{ad.asin}</span>
                </div>
              )}
              {ad.amazon_ad_type && (
                <div>
                  <span className="text-neutral-500 block text-[10px]">Ad Placement:</span>
                  <span className="text-amber-300">{ad.amazon_ad_type}</span>
                </div>
              )}
              {ad.marketplace && (
                <div>
                  <span className="text-neutral-500 block text-[10px]">Marketplace:</span>
                  <span className="text-white">{ad.marketplace}</span>
                </div>
              )}
              {ad.search_term && (
                <div className="col-span-2">
                  <span className="text-neutral-500 block text-[10px]">Observed Keyword:</span>
                  <span className="text-white italic">&ldquo;{ad.search_term}&rdquo;</span>
                </div>
              )}
            </div>
            {ad.product_url && (
              <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between">
                <span className="text-neutral-400 text-[11px]">Direct Product Listing:</span>
                <a
                  href={ad.product_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors font-sans font-medium"
                >
                  <span>View Product on Amazon</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Curator Observation Notes */}
        {ad.curator_note && (
          <div className="p-4 rounded-2xl bg-surface-2/60 border border-border space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-text-muted">
              <Info className="w-3.5 h-3.5 text-accent" />
              <span>Curator Analysis</span>
            </div>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              {ad.curator_note}
            </p>
          </div>
        )}

        {/* Signals and Performance Evidence Note */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-text-muted mr-1">Curator Signals:</span>
            {ad.signal_labels.map((sig) => (
              <span
                key={sig}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-accent/15 text-accent border border-accent/30"
              >
                ✦ {sig}
              </span>
            ))}
          </div>

          {ad.performance_evidence_note && (
            <div className="p-3.5 rounded-xl bg-surface-3/50 border border-border text-xs text-text-muted flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Verification Evidence: </span>
                <span>{ad.performance_evidence_note}</span>
                <span className="block text-[11px] text-text-faint mt-1">
                  * Note: Evidence reflects observed runtime and active variants in public transparency libraries, not self-reported revenue or ROAS.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Meta Row & Action */}
        <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-text-muted">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-accent" />
              <span>Verified: <strong className="text-white">{formattedDate}</strong></span>
            </div>
            {ad.first_seen_at && (
              <div className="text-text-faint">
                · First Seen: <span className="text-neutral-300">{new Date(ad.first_seen_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="md"
              onClick={onClose}
              className="flex-1 sm:flex-none"
            >
              Close
            </Button>

            <Link
              href={`/studio?category=${ad.category}&ref=${ad.id}&title=${encodeURIComponent(
                ad.brand_name
              )}`}
              className="flex-1 sm:flex-none"
            >
              <Button variant="primary" size="md" className="w-full">
                Make Similar Ad in Studio ↗
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
