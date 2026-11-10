"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  ArrowUpRight,
  Sparkles,
  Instagram,
  Filter,
  Film,
  Zap,
  ExternalLink,
  ShieldAlert,
  ArrowLeft,
  SlidersHorizontal,
} from "lucide-react";

import CommandPalette from "@/components/CommandPalette";
import InstagramEmbedModal from "@/components/InstagramEmbedModal";
import AgeGateModal from "@/components/AgeGateModal";
import CookieConsent from "@/components/CookieConsent";
import Navbar from "@/components/Navbar";
import {
  Button,
  Badge,
  Input,
  Select,
  Chip,
  VideoTile,
} from "@/components/ui";

import {
  SEED_CATEGORIES,
  SEED_REELS,
  SEED_ADS,
  searchSeedData,
  getMetaAdLibraryLink,
} from "@/lib/data/seed-data";
import { SearchResults, TrendingReel, FamousAd } from "@/lib/supabase/types";

const PLATFORM_OPTIONS = [
  { value: "all", label: "All Platforms" },
  { value: "Instagram", label: "Instagram Reels & Meta" },
  { value: "TikTok", label: "TikTok Ads & Spark" },
  { value: "YouTube", label: "YouTube Shorts" },
];

const FORMAT_OPTIONS = [
  { value: "all", label: "All Formats" },
  { value: "9:16", label: "9:16 Vertical" },
  { value: "4:5", label: "4:5 In-Feed" },
  { value: "1:1", label: "1:1 Square" },
];

const SORT_OPTIONS = [
  { value: "curated", label: "Curated / Trending" },
  { value: "newest", label: "Newest First" },
];

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQ = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "all";
  const initialPlatform = searchParams.get("platform") || "all";
  const initialFormat = searchParams.get("format") || "all";
  const initialSort = searchParams.get("sort") || "curated";

  const [query, setQuery] = useState(initialQ);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPlatform, setSelectedPlatform] = useState(initialPlatform);
  const [selectedFormat, setSelectedFormat] = useState(initialFormat);
  const [selectedSort, setSelectedSort] = useState(initialSort);

  const [results, setResults] = useState<SearchResults>({
    categories: [],
    reels: [],
    ads: [],
  });

  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [selectedReel, setSelectedReel] = useState<TrendingReel | null>(null);
  const [isAgeGateOpen, setIsAgeGateOpen] = useState(false);
  const [pendingAdultCat, setPendingAdultCat] = useState<string | null>(null);
  const [isAdultVerified, setIsAdultVerified] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem("infimindss_adult_verified") === "true";
    setIsAdultVerified(verified);
  }, []);

  const updateUrl = (
    q: string,
    cat: string,
    plat: string,
    fmt: string,
    srt: string
  ) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cat && cat !== "all") params.set("category", cat);
    if (plat && plat !== "all") params.set("platform", plat);
    if (fmt && fmt !== "all") params.set("format", fmt);
    if (srt && srt !== "curated") params.set("sort", srt);
    router.replace(`/explore?${params.toString()}`);
  };

  useEffect(() => {
    const catSlug = selectedCategory === "all" ? undefined : selectedCategory;
    const res = searchSeedData(query, catSlug, isAdultVerified, 50);

    let filteredReels = res.reels;
    let filteredAds = res.ads;

    if (selectedPlatform !== "all") {
      filteredAds = filteredAds.filter((a) =>
        a.platform?.toLowerCase().includes(selectedPlatform.toLowerCase())
      );
    }

    if (selectedFormat !== "all") {
      filteredAds = filteredAds.filter((a) =>
        a.format?.toLowerCase().includes(selectedFormat.toLowerCase())
      );
    }

    if (selectedSort === "newest") {
      filteredReels = [...filteredReels].reverse();
      filteredAds = [...filteredAds].reverse();
    }

    setResults({
      categories: res.categories,
      reels: filteredReels,
      ads: filteredAds,
    });
  }, [
    query,
    selectedCategory,
    selectedPlatform,
    selectedFormat,
    selectedSort,
    isAdultVerified,
  ]);

  const handleCategorySelect = (slug: string) => {
    if (slug === "sexual-wellness" && !isAdultVerified) {
      setPendingAdultCat(slug);
      setIsAgeGateOpen(true);
      return;
    }
    setSelectedCategory(slug);
    updateUrl(query, slug, selectedPlatform, selectedFormat, selectedSort);
  };

  const handleAgeConfirm = () => {
    localStorage.setItem("infimindss_adult_verified", "true");
    setIsAdultVerified(true);
    setIsAgeGateOpen(false);
    if (pendingAdultCat) {
      setSelectedCategory(pendingAdultCat);
      updateUrl(
        query,
        pendingAdultCat,
        selectedPlatform,
        selectedFormat,
        selectedSort
      );
      setPendingAdultCat(null);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-accent selection:text-accent-ink pb-28">
      {/* Navbar */}
      <Navbar activeRoute="explore" onOpenSearch={() => setIsCmdOpen(true)} />

      {/* Main Container */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 space-y-10">
        {/* Header Breadcrumb & Title */}
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-text-muted hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO HOME</span>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="lime">CREATIVE INTELLIGENCE</Badge>
                <Badge variant="outline">Meta &amp; TikTok Benchmarks</Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-sans">
                Exploration{" "}
                <span className="font-serif italic text-accent font-normal">
                  Hub.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-text-muted mt-2 max-w-2xl">
                Search viral hooks, inspect benchmark formats, and reverse-engineer what drives ROAS before starting your project.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => router.push("/studio")}
            >
              Start a Project ↗
            </Button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-6 rounded-3xl bg-surface/80 border border-border backdrop-blur-xl space-y-6">
          {/* Top Search Input */}
          <div className="relative">
            <Input
              placeholder="Search hooks, creators, brands, problem/solution angles..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                updateUrl(
                  e.target.value,
                  selectedCategory,
                  selectedPlatform,
                  selectedFormat,
                  selectedSort
                );
              }}
              leftIcon={<Search className="w-5 h-5 text-accent" />}
              className="h-14 text-base pl-12"
            />
          </div>

          {/* Sticky Category Chips */}
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-text-muted">
              Filter by Category
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <Chip
                selected={selectedCategory === "all"}
                onClick={() => handleCategorySelect("all")}
              >
                All Categories
              </Chip>
              {SEED_CATEGORIES.map((cat) => (
                <Chip
                  key={cat.id}
                  selected={selectedCategory === cat.slug}
                  badge={cat.is_adult ? "18+" : undefined}
                  badgeVariant={cat.is_adult ? "danger" : "default"}
                  onClick={() => handleCategorySelect(cat.slug)}
                >
                  {cat.name}
                </Chip>
              ))}
            </div>
          </div>

          {/* Sub Filters: Platform, Format, Sort */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
            <Select
              label="Platform"
              value={selectedPlatform}
              onChange={(val) => {
                setSelectedPlatform(val);
                updateUrl(query, selectedCategory, val, selectedFormat, selectedSort);
              }}
              options={PLATFORM_OPTIONS}
            />
            <Select
              label="Aspect Ratio"
              value={selectedFormat}
              onChange={(val) => {
                setSelectedFormat(val);
                updateUrl(query, selectedCategory, selectedPlatform, val, selectedSort);
              }}
              options={FORMAT_OPTIONS}
            />
            <Select
              label="Sort Order"
              value={selectedSort}
              onChange={(val) => {
                setSelectedSort(val);
                updateUrl(query, selectedCategory, selectedPlatform, selectedFormat, val);
              }}
              options={SORT_OPTIONS}
            />
          </div>
        </div>

        {/* Section 1: Trending Reels (9:16 VideoTiles) */}
        {results.reels.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Instagram className="w-5 h-5 text-pink-500" />
                <h2 className="text-xl sm:text-2xl font-bold text-white font-sans">
                  Trending on <span className="font-serif italic text-accent">Instagram.</span>
                </h2>
              </div>
              <span className="text-xs font-mono text-text-muted">
                {results.reels.length} verified reels
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {results.reels.map((reel) => (
                <div
                  key={reel.id}
                  onClick={() => setSelectedReel(reel)}
                  className="cursor-pointer"
                >
                  <VideoTile
                    title={reel.caption || "Viral Hook Reel"}
                    category={reel.creator_handle}
                    views={reel.views_label}
                    poster={reel.thumbnail_url || undefined}
                    aspectRatio="9:16"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Famous Ads Intelligence Cards */}
        {results.ads.length > 0 && (
          <div className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-accent" />
                <h2 className="text-xl sm:text-2xl font-bold text-white font-sans">
                  Famous Brand Ads <span className="font-serif italic text-accent">&amp; Breakdowns.</span>
                </h2>
              </div>
              <span className="text-xs font-mono text-text-muted">
                {results.ads.length} ads analyzed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.ads.map((ad) => {
                const metaLink = getMetaAdLibraryLink(ad.brand_name);
                return (
                  <div
                    key={ad.id}
                    className="p-6 rounded-3xl bg-surface/80 border border-border hover:border-accent/40 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-4">
                      {/* Brand Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-white">{ad.brand_name}</h3>
                          <span className="text-xs font-mono text-text-muted">{ad.platform} · {ad.format}</span>
                        </div>
                        <Badge variant="lime">
                          {ad.hook_type || "Direct UGC"}
                        </Badge>
                      </div>

                      {/* Hook Quote Box */}
                      <div className="p-4 rounded-2xl bg-surface-2 border border-border">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-accent mb-1">
                          Hook Formulation
                        </div>
                        <p className="text-sm font-medium text-white italic">
                          &ldquo;{ad.title}&rdquo;
                        </p>
                      </div>

                      {/* Why it works bullet points */}
                      <div className="space-y-2">
                        <div className="text-xs font-mono uppercase tracking-wider text-text-muted">
                          Why This Works
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

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                      <a
                        href={metaLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-text-muted hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Meta Ad Library</span>
                      </a>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() =>
                          router.push(
                            `/studio?category=${ad.category_id}&ref=${ad.id}&title=${encodeURIComponent(
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
        )}

        {/* Empty state */}
        {results.reels.length === 0 && results.ads.length === 0 && (
          <div className="p-16 rounded-3xl bg-surface/50 border border-border text-center space-y-4 max-w-lg mx-auto">
            <Search className="w-12 h-12 text-text-muted mx-auto" />
            <h3 className="text-lg font-bold text-white">No matching assets found</h3>
            <p className="text-xs text-text-muted">
              Try adjusting your search query, selecting another category, or clearing the platform filters.
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setQuery("");
                setSelectedCategory("all");
                setSelectedPlatform("all");
                setSelectedFormat("all");
              }}
            >
              Reset All Filters
            </Button>
          </div>
        )}
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
        onCancel={() => {
          setIsAgeGateOpen(false);
          setPendingAdultCat(null);
        }}
      />

      {/* Cookie Consent */}
      <CookieConsent />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg flex items-center justify-center text-text-muted">
          Loading...
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
