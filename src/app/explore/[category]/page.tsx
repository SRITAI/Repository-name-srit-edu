"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Sparkles,
  Instagram,
  Film,
  Zap,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

import InstagramEmbedModal from "@/components/InstagramEmbedModal";
import AgeGateModal from "@/components/AgeGateModal";
import CookieConsent from "@/components/CookieConsent";
import CommandPalette from "@/components/CommandPalette";
import Navbar from "@/components/Navbar";
import {
  Button,
  Badge,
  VideoTile,
} from "@/components/ui";

import {
  SEED_CATEGORIES,
  SEED_REELS,
  SEED_ADS,
  getMetaAdLibraryLink,
} from "@/lib/data/seed-data";
import { Category, TrendingReel, FamousAd } from "@/lib/supabase/types";

interface PageProps {
  params: Promise<{ category: string }>;
}

export default function CategoryDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const categorySlug = resolvedParams.category;
  const router = useRouter();

  const category = SEED_CATEGORIES.find((c) => c.slug === categorySlug);
  if (!category) {
    notFound();
  }

  const [selectedReel, setSelectedReel] = useState<TrendingReel | null>(null);
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [isAgeGateOpen, setIsAgeGateOpen] = useState(false);
  const [isAdultVerified, setIsAdultVerified] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem("infimindss_adult_verified") === "true";
    setIsAdultVerified(verified);

    if (category.is_adult && !verified) {
      setIsAgeGateOpen(true);
    }
  }, [category.is_adult]);

  const handleAgeConfirm = () => {
    localStorage.setItem("infimindss_adult_verified", "true");
    setIsAdultVerified(true);
    setIsAgeGateOpen(false);
  };

  const handleAgeCancel = () => {
    setIsAgeGateOpen(false);
    router.push("/explore");
  };

  const reels = SEED_REELS.filter((r) => r.category_id === category.id);
  const ads = SEED_ADS.filter((a) => a.category_id === category.id);
  const metaLink = getMetaAdLibraryLink(category.keywords[0] || category.name);

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-accent selection:text-accent-ink pb-28">
      {/* Navbar */}
      <Navbar activeRoute="explore" onOpenSearch={() => setIsCmdOpen(true)} />

      {/* Main Container */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 space-y-12">
        {/* Breadcrumb */}
        <div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-text-muted hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO ALL CATEGORIES</span>
          </Link>
        </div>

        {/* Category Hero Banner with Unique Accent Glow */}
        <div className="relative p-8 sm:p-14 rounded-[36px] bg-surface/80 border border-border backdrop-blur-xl overflow-hidden shadow-2xl">
          {/* Ambient Glow using Category Accent */}
          <div
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-25"
            style={{ backgroundColor: category.accent_color || "#D7FF3D" }}
          />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="lime">
                {category.keywords?.[0]?.toUpperCase() || "BENCHMARK CATEGORY"}
              </Badge>
              {category.is_adult && (
                <Badge variant="danger">
                  18+ AGE RESTRICTED
                </Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-sans">
              {category.name}{" "}
              <span className="font-serif italic text-accent font-normal block sm:inline">
                Intelligence.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-text-muted">
              {category.description || "Top-performing real-human video formats, hook psychology, and Meta Ad Library benchmarks for scaling this category."}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push(`/studio?category=${category.slug}`)}
              >
                Start a {category.name} Project ↗
              </Button>
              <a
                href={metaLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" size="lg">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Meta Ad Library ↗
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Section 1: Trending Reels in Category */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Instagram className="w-5 h-5 text-pink-500" />
              <h2 className="text-xl sm:text-2xl font-bold text-white font-sans">
                Trending {category.name} Reels
              </h2>
            </div>
            <span className="text-xs font-mono text-text-muted">
              {reels.length} verified reels
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {reels.map((reel) => (
              <div
                key={reel.id}
                onClick={() => setSelectedReel(reel)}
                className="cursor-pointer"
              >
                <VideoTile
                  title={reel.caption || "Viral Hook"}
                  category={reel.creator_handle}
                  views={reel.views_label}
                  poster={reel.thumbnail_url || undefined}
                  aspectRatio="9:16"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Famous Ads in Category */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-accent" />
              <h2 className="text-xl sm:text-2xl font-bold text-white font-sans">
                Proven Ads &amp; Psychology
              </h2>
            </div>
            <span className="text-xs font-mono text-text-muted">
              {ads.length} ads cataloged
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad) => {
              const brandMetaLink = getMetaAdLibraryLink(ad.brand_name);
              return (
                <div
                  key={ad.id}
                  className="p-6 rounded-3xl bg-surface/80 border border-border hover:border-accent/40 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white">{ad.brand_name}</h3>
                        <span className="text-xs font-mono text-text-muted">{ad.platform} · {ad.format}</span>
                      </div>
                      <Badge variant="lime">
                        {ad.hook_type || "High Retention"}
                      </Badge>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface-2 border border-border">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-accent mb-1">
                        Hook Strategy
                      </div>
                      <p className="text-sm font-medium text-white italic">
                        &ldquo;{ad.title}&rdquo;
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-mono uppercase tracking-wider text-text-muted">
                        Key Success Factors
                      </div>
                      <ul className="space-y-1.5 text-xs text-text-muted">
                        {ad.why_it_works?.map((bullet: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-accent font-bold mt-0.5">✦</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                    <a
                      href={brandMetaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-text-muted hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Meta Library</span>
                    </a>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() =>
                        router.push(
                          `/studio?category=${category.slug}&ref=${ad.id}&title=${encodeURIComponent(
                            ad.brand_name
                          )}`
                        )
                      }
                    >
                      Make Similar Ad ↗
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Instagram Embed Modal */}
      {selectedReel && (
        <InstagramEmbedModal
          reel={selectedReel}
          onClose={() => setSelectedReel(null)}
        />
      )}

      {/* Command Palette */}
      <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} />

      {/* Age Gate Modal */}
      <AgeGateModal
        isOpen={isAgeGateOpen}
        onConfirm={handleAgeConfirm}
        onCancel={handleAgeCancel}
      />

      {/* Cookie Consent */}
      <CookieConsent />
    </div>
  );
}
