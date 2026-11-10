"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  Loader2,
  Check,
  AlertCircle,
  Film,
  ExternalLink,
  ChevronDown,
  Info,
  Copy,
  CheckCheck,
  Globe,
} from "lucide-react";

import { AdListing, AdPlatform, CreativeFormat } from "@/lib/supabase/types";
import {
  PLATFORMS_CONFIG,
  AD_CATEGORIES,
  AD_COUNTRIES,
  CREATIVE_FORMATS,
  CURATOR_SIGNALS,
} from "@/lib/data/ad-explorer-seed";
import { PlatformIcon } from "./PlatformIcon";
import { AdCard } from "./AdCard";
import { AdDetailModal } from "./AdDetailModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface AdExplorerModuleProps {
  mode?: "full" | "embedded";
  initialQuery?: string;
  initialPlatform?: string;
}

const ALL_PLATFORMS: AdPlatform[] = ["meta", "google", "linkedin", "tiktok", "x", "amazon"];

export function AdExplorerModule({
  mode = "full",
  initialQuery = "",
  initialPlatform = "all",
}: AdExplorerModuleProps) {
  const router = useRouter();

  // Search and Filter States
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [selectedPlatforms, setSelectedPlatforms] = useState<AdPlatform[]>(
    initialPlatform !== "all" && ALL_PLATFORMS.includes(initialPlatform as AdPlatform)
      ? [initialPlatform as AdPlatform]
      : []
  );
  const [category, setCategory] = useState("all");
  const [country, setCountry] = useState("all");
  const [format, setFormat] = useState<CreativeFormat | "all">("all");
  const [signal, setSignal] = useState("all");
  const [sort, setSort] = useState<"reviewed" | "added" | "featured">("reviewed");

  // Filter drawer toggle
  const [showFilters, setShowFilters] = useState(false);

  // Results & Loading
  const [items, setItems] = useState<AdListing[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [inspectedAd, setInspectedAd] = useState<AdListing | null>(null);
  const [availableCategories, setAvailableCategories] = useState<{ id: string; label: string }[]>(AD_CATEGORIES);

  // Fetch dynamic categories from API / database
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data?.categories?.length) {
          setAvailableCategories([
            { id: "all", label: "All Categories" },
            ...data.categories.map((c: any) => ({ id: c.slug, label: c.name })),
          ]);
        }
      })
      .catch(() => {});
  }, []);

  // Copy-to-clipboard state for external queries
  const [copiedTerm, setCopiedTerm] = useState(false);

  // Short debounce for typing so searching is smooth
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  // Keep query and filters in browser URL in full mode
  useEffect(() => {
    if (mode !== "full" || typeof window === "undefined") return;

    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (selectedPlatforms.length > 0) params.set("platforms", selectedPlatforms.join(","));
    if (category !== "all") params.set("category", category);
    if (country !== "all") params.set("country", country);
    if (format !== "all") params.set("format", format);
    if (signal !== "all") params.set("signal", signal);
    if (sort !== "reviewed") params.set("sort", sort);

    const queryString = params.toString();
    const newUrl = queryString ? `/ad-explorer?${queryString}` : "/ad-explorer";
    window.history.replaceState(null, "", newUrl);
  }, [debouncedQuery, selectedPlatforms, category, country, format, signal, sort, mode]);

  // Fetch results from API
  const fetchAds = useCallback(async (activeQ: string) => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      const params = new URLSearchParams();
      if (activeQ.trim()) params.set("q", activeQ.trim());
      if (selectedPlatforms.length > 0) {
        params.set("platforms", selectedPlatforms.join(","));
      }
      if (category !== "all") params.set("category", category);
      if (country !== "all") params.set("country", country);
      if (format !== "all") params.set("format", format);
      if (signal !== "all") params.set("signal", signal);
      params.set("sort", sort);
      params.set("limit", mode === "embedded" ? "6" : "24");

      const res = await fetch(`/api/ad-explorer/search?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load curated listings");

      const data = await res.json();
      setItems(data.items || []);
      setTotalCount(data.total || 0);
    } catch (err: any) {
      setErrorMsg(err?.message || "Error retrieving ads");
    } finally {
      setIsLoading(false);
    }
  }, [selectedPlatforms, category, country, format, signal, sort, mode]);

  // Load more pagination for full mode
  const handleLoadMore = async () => {
    if (isLoadingMore || items.length >= totalCount) return;
    setIsLoadingMore(true);

    try {
      const params = new URLSearchParams();
      if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
      if (selectedPlatforms.length > 0) {
        params.set("platforms", selectedPlatforms.join(","));
      }
      if (category !== "all") params.set("category", category);
      if (country !== "all") params.set("country", country);
      if (format !== "all") params.set("format", format);
      if (signal !== "all") params.set("signal", signal);
      params.set("sort", sort);
      params.set("limit", "24");
      params.set("offset", items.length.toString());

      const res = await fetch(`/api/ad-explorer/search?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load more listings");

      const data = await res.json();
      if (data.items && data.items.length > 0) {
        setItems((prev) => [...prev, ...data.items]);
      }
      if (typeof data.total === "number") {
        setTotalCount(data.total);
      }
    } catch (err: any) {
      console.error("Load more error:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchAds(debouncedQuery);
  }, [fetchAds, debouncedQuery]);

  // Immediate search on Enter or button click
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQ = query.trim();
    setDebouncedQuery(cleanQ);

    if (mode === "embedded") {
      const params = new URLSearchParams();
      if (cleanQ) params.set("q", cleanQ);
      if (selectedPlatforms.length > 0) params.set("platforms", selectedPlatforms.join(","));
      router.push(`/ad-explorer?${params.toString()}`);
    } else {
      fetchAds(cleanQ);
    }
  };

  // Toggle platform filter without losing typed query
  const handlePlatformClick = (plat: AdPlatform | "all") => {
    if (plat === "all") {
      setSelectedPlatforms([]);
    } else {
      if (selectedPlatforms.includes(plat)) {
        const next = selectedPlatforms.filter((p) => p !== plat);
        setSelectedPlatforms(next);
      } else {
        setSelectedPlatforms([...selectedPlatforms, plat]);
      }
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setQuery("");
    setDebouncedQuery("");
    setSelectedPlatforms([]);
    setCategory("all");
    setCountry("all");
    setFormat("all");
    setSignal("all");
    setSort("reviewed");
  };

  // Copy search term helper
  const handleCopyTerm = (term: string) => {
    if (!term) return;
    try {
      navigator.clipboard.writeText(term);
      setCopiedTerm(true);
      setTimeout(() => setCopiedTerm(false), 2200);
    } catch {}
  };

  const isAllPlatformsSelected = selectedPlatforms.length === 0 || selectedPlatforms.length === ALL_PLATFORMS.length;
  const hasActiveFilters =
    query.trim().length > 0 ||
    selectedPlatforms.length > 0 ||
    category !== "all" ||
    country !== "all" ||
    format !== "all" ||
    signal !== "all" ||
    sort !== "reviewed";

  const cleanQuery = debouncedQuery || query.trim();

  // Official Public Library Links configured for the active query
  const externalLibraries = [
    {
      name: "Meta Ad Library",
      platform: "meta" as AdPlatform,
      surface: "Instagram & Facebook",
      directUrl: cleanQuery
        ? `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${encodeURIComponent(
            cleanQuery
          )}&search_type=keyword_unordered&media_type=all`
        : "https://www.facebook.com/ads/library/",
      supportsDirectDeepLink: true,
      description: "Direct keyword search across active Instagram Reels and Facebook ads.",
    },
    {
      name: "Google Ads Transparency Center",
      platform: "google" as AdPlatform,
      surface: "Google Search & YouTube",
      directUrl: "https://adstransparency.google.com/?region=anywhere",
      supportsDirectDeepLink: false,
      description: "Search advertiser domains or names. Paste search term into Google's search bar.",
    },
    {
      name: "LinkedIn Ad Library",
      platform: "linkedin" as AdPlatform,
      surface: "Sponsored Content & InMail",
      directUrl: "https://www.linkedin.com/ad-library/",
      supportsDirectDeepLink: false,
      description: "Official transparency repository. Paste company or keyword into LinkedIn's search bar.",
    },
    {
      name: "TikTok Creative Center",
      platform: "tiktok" as AdPlatform,
      surface: "TikTok In-Feed & Spark Ads",
      directUrl: cleanQuery
        ? `https://ads.tiktok.com/business/creativecenter/inspiration/popular/pc/en?keyword=${encodeURIComponent(
            cleanQuery
          )}`
        : "https://ads.tiktok.com/business/creativecenter/inspiration/popular/pc/en",
      supportsDirectDeepLink: true,
      description: "Explore top-performing vertical video ads, CTR benchmarks, and viral audio tags.",
    },
    {
      name: "X (Twitter) Search",
      platform: "x" as AdPlatform,
      surface: "Promoted Posts & Video",
      directUrl: cleanQuery
        ? `https://x.com/search?q=${encodeURIComponent(cleanQuery)}&f=live`
        : "https://x.com/explore",
      supportsDirectDeepLink: true,
      description: "Live search for brand announcements, promoted tweets, and developer threads.",
    },
    {
      name: "Amazon Ads & Brand Stores",
      platform: "amazon" as AdPlatform,
      surface: "Sponsored Products & Brands",
      directUrl: cleanQuery
        ? `https://www.amazon.com/s?k=${encodeURIComponent(cleanQuery)}`
        : "https://www.amazon.com",
      supportsDirectDeepLink: true,
      description: "Search active product listings, Sponsored Brand video placements, and official Brand Stores.",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Search Header Banner */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="lime">CROSS-PLATFORM INTELLIGENCE</Badge>
          <Badge variant="outline">Meta · Google · LinkedIn · TikTok · X · Amazon</Badge>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-sans">
          Ad <span className="font-serif italic text-accent font-normal">Explorer.</span>
        </h2>

        <p className="text-sm sm:text-base text-text-muted max-w-3xl leading-relaxed">
          Search our human-curated catalogue of high-converting ads, psychological hooks, and video formats across Meta, Google, LinkedIn, TikTok, and X.
        </p>
      </div>

      {/* Main Search Bar & Platform Selector Box */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-surface/90 border border-border backdrop-blur-xl shadow-2xl space-y-6">
        {/* Prominent Search Input with Standard Placeholder */}
        <form onSubmit={handleSearchSubmit} className="relative flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any brand, product, company, or keyword…"
              className="w-full h-14 pl-12 pr-10 rounded-2xl bg-surface-2 border border-border text-white placeholder-text-muted text-sm sm:text-base focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all font-sans"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setDebouncedQuery("");
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-white"
                aria-label="Clear query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full sm:w-auto h-14 px-8 text-sm sm:text-base"
            >
              <span>Search</span>
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>

            {mode === "full" && (
              <Button
                type="button"
                variant={showFilters ? "secondary" : "ghost"}
                size="lg"
                onClick={() => setShowFilters(!showFilters)}
                className="h-14 px-4 hidden sm:flex items-center gap-2 border border-border"
                aria-label="Toggle secondary filters"
              >
                <SlidersHorizontal className="w-4 h-4 text-accent" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-accent" />
                )}
              </Button>
            )}
          </div>
        </form>

        {/* Platform Chips Row (All, Meta, Google, LinkedIn, TikTok, X) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-text-muted">
            <span>Filter by Platform</span>
            <span className="text-[11px] text-text-faint normal-case">
              {isAllPlatformsSelected ? "Combined multi-platform search" : `${selectedPlatforms.length} platform(s) selected`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* All Platforms Chip */}
            <button
              type="button"
              onClick={() => handlePlatformClick("all")}
              className={`h-10 px-4 rounded-full text-xs font-sans font-medium transition-all duration-200 flex items-center gap-2 border select-none ${
                isAllPlatformsSelected
                  ? "bg-accent text-accent-ink font-bold border-accent shadow-[0_0_16px_rgba(215,255,61,0.25)]"
                  : "bg-surface-2 text-text border-border hover:bg-surface-3 hover:border-border-strong"
              }`}
            >
              <span>All Platforms</span>
              {isAllPlatformsSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>

            {/* Platform Specific Chips */}
            {ALL_PLATFORMS.map((plat) => {
              const cfg = PLATFORMS_CONFIG[plat];
              const isSelected = selectedPlatforms.includes(plat);

              return (
                <button
                  key={plat}
                  type="button"
                  onClick={() => handlePlatformClick(plat)}
                  className={`h-10 px-4 rounded-full text-xs font-sans font-medium transition-all duration-200 flex items-center gap-2 border select-none ${
                    isSelected
                      ? "bg-accent/20 text-accent font-semibold border-accent shadow-[0_0_16px_rgba(215,255,61,0.18)]"
                      : "bg-surface-2 text-text border-border hover:bg-surface-3 hover:border-border-strong"
                  }`}
                  style={
                    isSelected
                      ? { borderColor: cfg.accentColor, color: cfg.accentColor }
                      : undefined
                  }
                >
                  <PlatformIcon platform={plat} size={14} />
                  <span>{cfg.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Filter Drawer (Category, Country, Format, Sort) */}
        {(showFilters || mode === "embedded") && (
          <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
            {/* Category */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-text-muted mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border text-white text-xs font-sans focus:outline-none focus:border-accent cursor-pointer"
              >
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-surface text-white">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Country / Market */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-text-muted mb-1.5">
                Market / Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border text-white text-xs font-sans focus:outline-none focus:border-accent cursor-pointer"
              >
                {AD_COUNTRIES.map((c) => (
                  <option key={c.id} value={c.id} className="bg-surface text-white">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Creative Format */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-text-muted mb-1.5">
                Creative Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border text-white text-xs font-sans focus:outline-none focus:border-accent cursor-pointer"
              >
                {CREATIVE_FORMATS.map((f) => (
                  <option key={f.id} value={f.id} className="bg-surface text-white">
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-text-muted mb-1.5">
                Sort By
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border text-white text-xs font-sans focus:outline-none focus:border-accent cursor-pointer"
              >
                <option value="reviewed" className="bg-surface text-white">Recently Reviewed</option>
                <option value="added" className="bg-surface text-white">Recently Added</option>
                <option value="featured" className="bg-surface text-white">Editor&apos;s Picks First</option>
              </select>
            </div>
          </div>
        )}

        {/* Clear Filters Row */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between text-xs pt-1 text-text-muted border-t border-border/40">
            <span>
              Showing {items.length} of {totalCount} curated listing(s)
            </span>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-accent hover:underline font-mono"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset all filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-accent" />
          <h3 className="text-xl sm:text-2xl font-bold text-white font-sans">
            Curated Listings{" "}
            <span className="text-text-muted font-normal text-sm sm:text-base font-mono">
              ({totalCount})
            </span>
          </h3>
        </div>

        {mode === "embedded" && (
          <Link
            href="/ad-explorer"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-accent hover:underline"
          >
            <span>Open Full Ad Explorer</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Loading Skeleton State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="rounded-3xl bg-surface/50 border border-border p-5 space-y-4 animate-pulse"
            >
              <div className="aspect-video w-full rounded-2xl bg-surface-2" />
              <div className="h-4 w-1/3 bg-surface-2 rounded" />
              <div className="h-6 w-3/4 bg-surface-2 rounded" />
              <div className="h-16 w-full bg-surface-2 rounded-xl" />
            </div>
          ))}
        </div>
      ) : errorMsg ? (
        /* Error State with Retry */
        <div className="p-12 rounded-3xl bg-surface/60 border border-danger/30 text-center space-y-4 max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-danger mx-auto" />
          <h4 className="text-lg font-bold text-white">Unable to Load Ads</h4>
          <p className="text-xs text-text-muted">{errorMsg}</p>
          <Button variant="secondary" size="md" onClick={() => fetchAds(debouncedQuery)}>
            Retry Search
          </Button>
        </div>
      ) : items.length === 0 ? (
        /* NO-RESULTS EXPERIENCE (e.g. for "Kapiva") */
        <div className="space-y-6">
          {/* Main No Results Banner */}
          <div className="p-8 sm:p-12 rounded-3xl bg-surface/80 border border-border backdrop-blur-xl text-center space-y-5 max-w-3xl mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-surface-2 border border-border text-text-muted flex items-center justify-center mx-auto">
              <Search className="w-7 h-7 text-accent" />
            </div>

            <div className="space-y-2">
              <h4 className="text-xl sm:text-2xl font-bold text-white font-sans">
                {cleanQuery ? (
                  <>
                    No curated ads found for{" "}
                    <span className="text-accent underline decoration-accent/40 decoration-2 underline-offset-4">
                      &ldquo;{cleanQuery}&rdquo;
                    </span>{" "}
                    yet.
                  </>
                ) : (
                  "No curated ads match these filters."
                )}
              </h4>
              <p className="text-xs sm:text-sm text-text-muted max-w-xl mx-auto leading-relaxed">
                Our creative team hasn&apos;t indexed and verified creative breakdowns for this brand in our studio catalogue yet. You can search the same brand or keyword directly across the official public ad transparency libraries below:
              </p>
            </div>

            {/* Copy Search Term Helper Box */}
            {cleanQuery && (
              <div className="inline-flex items-center gap-3 p-2 pl-4 rounded-xl bg-surface-2 border border-border text-xs text-text-muted font-mono">
                <span>
                  Query: <strong className="text-white">&ldquo;{cleanQuery}&rdquo;</strong>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyTerm(cleanQuery)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-3 text-white hover:bg-surface-3/80 border border-border transition-all text-xs font-sans font-medium"
                  title="Copy search term to clipboard"
                >
                  {copiedTerm ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5 text-accent" />
                      <span className="text-accent font-semibold">Copied! ✓</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy term</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                <span>Reset All Filters</span>
              </Button>

              {cleanQuery && (
                <Link
                  href={`/studio?category=clothing-fashion&ref=${encodeURIComponent(
                    cleanQuery
                  )}&title=${encodeURIComponent(cleanQuery)}`}
                >
                  <Button variant="primary" size="sm">
                    <span>Brief us on &ldquo;{cleanQuery}&rdquo; in Studio ↗</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* External Public Platform Libraries Cards Grid */}
          <div className="space-y-3 max-w-4xl mx-auto pt-2">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-text-muted px-1">
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-accent" />
                <span>Search in Official Public Ad Libraries</span>
              </span>
              <span className="text-[11px] text-text-faint normal-case">Opens in new tab</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {externalLibraries.map((lib) => {
                const cfg = PLATFORMS_CONFIG[lib.platform];

                return (
                  <div
                    key={lib.name}
                    className="p-5 rounded-2xl bg-surface/90 border border-border hover:border-accent/40 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: cfg.badgeBg,
                            color: cfg.badgeText,
                          }}
                        >
                          <PlatformIcon platform={lib.platform} size={14} />
                          <span>{cfg.shortName}</span>
                        </div>
                        {lib.supportsDirectDeepLink ? (
                          <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                            Direct Search
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-text-muted bg-surface-2 px-2 py-0.5 rounded border border-border">
                            Copy &amp; Paste
                          </span>
                        )}
                      </div>

                      <div>
                        <h5 className="text-sm font-bold text-white">{lib.name}</h5>
                        <p className="text-xs text-text-muted mt-1 leading-relaxed">
                          {lib.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                      {!lib.supportsDirectDeepLink && cleanQuery ? (
                        <button
                          type="button"
                          onClick={() => handleCopyTerm(cleanQuery)}
                          className="text-[11px] font-mono text-text-muted hover:text-white flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedTerm ? "Copied" : "Copy term"}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono text-text-faint">
                          {lib.surface}
                        </span>
                      )}

                      <a
                        href={lib.directUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 text-white text-xs font-medium border border-border transition-colors ml-auto"
                      >
                        <span>Open Library</span>
                        <ExternalLink className="w-3.5 h-3.5 text-accent" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-text-faint text-center pt-2 leading-relaxed">
              * External searches open the official public platform transparency archives in a new tab. Results are hosted and served directly by Meta, Google, LinkedIn, TikTok, and X.
            </p>
          </div>
        </div>
      ) : (
        /* Ads Grid */
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((ad) => (
              <AdCard
                key={ad.id}
                ad={ad}
                onInspect={(selected) => setInspectedAd(selected)}
              />
            ))}
          </div>

          {/* Full Mode: Pagination / Load More */}
          {mode === "full" && items.length < totalCount && (
            <div className="pt-2 text-center space-y-2">
              <Button
                variant="secondary"
                size="lg"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-8 border border-border hover:border-accent transition-colors"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2 text-accent" />
                    <span>Loading more ads…</span>
                  </>
                ) : (
                  <span>Load More Listings ({totalCount - items.length} remaining)</span>
                )}
              </Button>
              <p className="text-[11px] font-mono text-text-muted">
                Showing {items.length} of {totalCount} curated listings
              </p>
            </div>
          )}
        </div>
      )}

      {/* Embedded Mode Footer CTA */}
      {mode === "embedded" && items.length > 0 && (
        <div className="pt-4 text-center">
          <Link href={`/ad-explorer${cleanQuery ? `?q=${encodeURIComponent(cleanQuery)}` : ""}`}>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto px-10">
              <span>Explore All {totalCount}+ Curated Cross-Platform Ads ↗</span>
            </Button>
          </Link>
        </div>
      )}

      {/* Transparency Disclaimer Notice */}
      <div className="p-4 rounded-2xl bg-surface-2/40 border border-border text-xs text-text-muted space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-white/90">
          <Info className="w-3.5 h-3.5 text-accent" />
          <span>Curated Intelligence Disclaimer</span>
        </div>
        <p className="text-[11px] text-text-faint leading-relaxed">
          The Ad Explorer is a human-curated creative benchmark catalogue maintained by our production team. It does not scrape live user feeds or claim complete coverage of all commercial ad spend on Meta, Google, LinkedIn, TikTok, or X. Active run times and creative iterations represent observed advertiser investment, not verified financial success or third-party ROAS guarantees.
        </p>
      </div>

      {/* Detail Modal */}
      <AdDetailModal
        ad={inspectedAd}
        onClose={() => setInspectedAd(null)}
      />
    </div>
  );
}
