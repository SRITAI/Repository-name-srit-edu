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
} from "lucide-react";

import CommandPalette from "@/components/CommandPalette";
import InstagramEmbedModal from "@/components/InstagramEmbedModal";
import AgeGateModal from "@/components/AgeGateModal";
import CookieConsent from "@/components/CookieConsent";

import {
  SEED_CATEGORIES,
  SEED_REELS,
  SEED_ADS,
  searchSeedData,
  getMetaAdLibraryLink,
} from "@/lib/data/seed-data";
import { Category, TrendingReel, FamousAd, SearchResults } from "@/lib/supabase/types";

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQ = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "all";
  const initialPlatform = searchParams.get("platform") || "all";
  const initialFormat = searchParams.get("format") || "all";
  const initialSort = searchParams.get("sort") || "trending";

  const [query, setQuery] = useState(initialQ);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPlatform, setSelectedPlatform] = useState(initialPlatform);
  const [selectedFormat, setSelectedFormat] = useState(initialFormat);
  const [selectedSort, setSelectedSort] = useState(initialSort);

  const [results, setResults] = useState<SearchResults>({
    categories: SEED_CATEGORIES,
    reels: SEED_REELS,
    ads: SEED_ADS,
  });

  const [selectedReel, setSelectedReel] = useState<TrendingReel | null>(null);
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [isAgeGateOpen, setIsAgeGateOpen] = useState(false);
  const [pendingAdultCat, setPendingAdultCat] = useState<string | null>(null);
  const [isAdultVerified, setIsAdultVerified] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem("infimindss_adult_verified") === "true";
    setIsAdultVerified(verified);
  }, []);

  // Update URL parameters
  const updateUrl = (newQ: string, newCat: string, newPlat: string, newFmt: string, newSort: string) => {
    const params = new URLSearchParams();
    if (newQ) params.set("q", newQ);
    if (newCat !== "all") params.set("category", newCat);
    if (newPlat !== "all") params.set("platform", newPlat);
    if (newFmt !== "all") params.set("format", newFmt);
    if (newSort !== "trending") params.set("sort", newSort);
    router.replace(`/explore?${params.toString()}`);
  };

  // Perform search / filtering
  useEffect(() => {
    const catSlug = selectedCategory === "all" ? null : selectedCategory;
    const res = searchSeedData(query, catSlug, isAdultVerified, 50);

    let filteredReels = res.reels;
    let filteredAds = res.ads;

    // Platform filter
    if (selectedPlatform !== "all") {
      filteredAds = filteredAds.filter((a) =>
        a.platform?.toLowerCase().includes(selectedPlatform.toLowerCase())
      );
    }

    // Format filter
    if (selectedFormat !== "all") {
      filteredAds = filteredAds.filter((a) =>
        a.format?.toLowerCase().includes(selectedFormat.toLowerCase())
      );
    }

    // Sort
    if (selectedSort === "newest") {
      filteredReels = [...filteredReels].reverse();
      filteredAds = [...filteredAds].reverse();
    }

    setResults({
      categories: res.categories,
      reels: filteredReels,
      ads: filteredAds,
    });
  }, [query, selectedCategory, selectedPlatform, selectedFormat, selectedSort, isAdultVerified]);

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
      updateUrl(query, pendingAdultCat, selectedPlatform, selectedFormat, selectedSort);
      setPendingAdultCat(null);
    }
  };

  return (
    <div className="presentation-wrapper" style={{ minHeight: "100vh", padding: "20px" }}>
      <div className="window-frame" style={{ maxWidth: "1280px", margin: "0 auto", padding: "28px" }}>
        {/* Navigation Bar */}
        <header className="header" style={{ marginBottom: "32px" }}>
          <Link href="/" className="brand-logo" aria-label="infimindss Home">
            infimindss<span className="logo-degree">°</span>
          </Link>

          <nav className="nav-pill" aria-label="Main Navigation">
            <Link href="/" className="nav-item">Home</Link>
            <Link href="/explore" className="nav-item active">Explore</Link>
            <Link href="/studio" className="nav-item">Studio</Link>
            <Link href="/studio/projects" className="nav-item">My Projects</Link>
          </nav>

          <div className="header-right" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              type="button"
              className="btn-search-trigger"
              onClick={() => setIsCmdOpen(true)}
              title="Search (⌘K)"
            >
              <Search size={15} />
              <span className="search-kbd-hint">⌘K</span>
            </button>
            <Link href="/studio" className="btn-get-app">
              <span>Start a project</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </header>

        {/* Explore Hub Header */}
        <div style={{ marginBottom: "36px" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.82rem",
              color: "#71717A",
              textDecoration: "none",
              marginBottom: "16px",
            }}
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <h1 className="section-title">
            Creative Intelligence <em>Exploration Hub.</em>
          </h1>
          <p className="section-desc">
            Search viral hooks, inspect benchmark formats, and reverse-engineer what drives ROAS before starting your project.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "20px", border: "1px solid rgba(0,0,0,0.06)", marginBottom: "32px" }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "18px" }}>
            <div style={{ flex: "1 1 320px", position: "relative" }}>
              <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#A1A1AA" }} />
              <input
                type="text"
                className="category-search-input"
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 44px",
                  borderRadius: "9999px",
                  border: "1px solid rgba(0,0,0,0.1)",
                  background: "#FAF9F6",
                }}
                placeholder="Search captions, creators, hooks or brands..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  updateUrl(e.target.value, selectedCategory, selectedPlatform, selectedFormat, selectedSort);
                }}
              />
            </div>

            {/* Platform Select */}
            <select
              style={{
                borderRadius: "9999px",
                border: "1px solid rgba(0,0,0,0.1)",
                padding: "10px 16px",
                background: "#FAF9F6",
                fontSize: "0.85rem",
                fontWeight: 600,
                outline: "none",
              }}
              value={selectedPlatform}
              onChange={(e) => {
                setSelectedPlatform(e.target.value);
                updateUrl(query, selectedCategory, e.target.value, selectedFormat, selectedSort);
              }}
            >
              <option value="all">All Platforms</option>
              <option value="Instagram">Instagram Reels</option>
              <option value="Meta">Meta Ads</option>
              <option value="YouTube">YouTube Shorts</option>
              <option value="TikTok">TikTok</option>
            </select>

            {/* Format Select */}
            <select
              style={{
                borderRadius: "9999px",
                border: "1px solid rgba(0,0,0,0.1)",
                padding: "10px 16px",
                background: "#FAF9F6",
                fontSize: "0.85rem",
                fontWeight: 600,
                outline: "none",
              }}
              value={selectedFormat}
              onChange={(e) => {
                setSelectedFormat(e.target.value);
                updateUrl(query, selectedCategory, selectedPlatform, e.target.value, selectedSort);
              }}
            >
              <option value="all">All Formats</option>
              <option value="9:16">Reel 9:16 Vertical</option>
              <option value="4:5">Feed 4:5 Vertical</option>
              <option value="1:1">Square 1:1</option>
            </select>

            {/* Sort Select */}
            <select
              style={{
                borderRadius: "9999px",
                border: "1px solid rgba(0,0,0,0.1)",
                padding: "10px 16px",
                background: "#FAF9F6",
                fontSize: "0.85rem",
                fontWeight: 600,
                outline: "none",
              }}
              value={selectedSort}
              onChange={(e) => {
                setSelectedSort(e.target.value);
                updateUrl(query, selectedCategory, selectedPlatform, selectedFormat, e.target.value);
              }}
            >
              <option value="trending">Sort: Trending First</option>
              <option value="newest">Sort: Newest First</option>
            </select>
          </div>

          {/* Categories Pills */}
          <div className="category-chips-row">
            <button
              type="button"
              className={`category-pill-btn ${selectedCategory === "all" ? "active" : ""}`}
              onClick={() => handleCategorySelect("all")}
            >
              All Categories
            </button>
            {SEED_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`category-pill-btn ${selectedCategory === c.slug ? "active" : ""}`}
                onClick={() => handleCategorySelect(c.slug)}
              >
                <span className="category-pill-dot" style={{ backgroundColor: c.accent_color || "#111" }} />
                <span>{c.name}</span>
                {c.is_adult && (
                  <span style={{ fontSize: "0.65rem", color: "#F43F5E", fontWeight: 700 }}>18+</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Section A: Trending Instagram Reels */}
        <section style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
              <Instagram size={18} color="#E1306C" />
              <span>Trending Reels ({results.reels.length})</span>
            </h2>
            <span style={{ fontSize: "0.8rem", color: "#71717A" }}>Click any card to inspect hook breakdown</span>
          </div>

          {results.reels.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" }}>
              {results.reels.map((reel) => (
                <div
                  key={reel.id}
                  className="reel-card-916"
                  style={{ width: "100%", flex: "none" }}
                  onClick={() => setSelectedReel(reel)}
                >
                  {reel.is_seed && <span className="sample-badge">Sample</span>}
                  <img src={reel.thumbnail_url || ""} alt="" className="reel-thumb-img" />
                  <div className="reel-card-overlay">
                    <div className="reel-top-meta">
                      <span className="ig-badge-pill">
                        <Instagram size={11} /> Reel
                      </span>
                      <span className="reel-views-tag">{reel.views_label}</span>
                    </div>
                    <div className="reel-bottom-info">
                      <span className="reel-creator-handle">{reel.creator_handle}</span>
                      <p className="reel-caption-text">{reel.caption}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "40px", textAlign: "center", background: "#FFFFFF", borderRadius: "18px" }}>
              <p style={{ color: "#71717A" }}>No reels matching your filter criteria.</p>
            </div>
          )}
        </section>

        {/* Section B: Famous Ads Benchmark Library */}
        <section style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
              <Film size={18} color="#0081FB" />
              <span>Famous Benchmark Ads ({results.ads.length})</span>
            </h2>
            {query && (
              <a
                href={getMetaAdLibraryLink(query)}
                target="_blank"
                rel="noopener noreferrer"
                className="ad-source-link"
              >
                <span>Live ads for &ldquo;{query}&rdquo; on Meta Ad Library</span>
                <ArrowUpRight size={13} />
              </a>
            )}
          </div>

          {results.ads.length > 0 ? (
            <div className="ads-grid" style={{ marginTop: 0 }}>
              {results.ads.map((ad) => (
                <div key={ad.id} className="ad-card">
                  <div className="ad-card-media">
                    {ad.is_seed && <span className="sample-badge">Sample</span>}
                    <img src={ad.thumbnail_url || ""} alt={ad.title} />
                    <span className="ad-format-chip">{ad.format}</span>
                  </div>
                  <div className="ad-card-body">
                    <div className="ad-brand-title">
                      <span className="ad-brand-name">{ad.brand_name}</span>
                      <span style={{ fontSize: "0.72rem", color: "#A1A1AA" }}>Region: {ad.region}</span>
                    </div>
                    <h3 className="ad-title-heading">{ad.title}</h3>
                    <div className="ad-hook-chip">
                      <Zap size={12} color="#F59E0B" /> Hook: {ad.hook_type}
                    </div>
                    <ul className="ad-why-bullets">
                      {ad.why_it_works.map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>
                    <div className="ad-actions-row">
                      <a
                        href={ad.source_url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ad-source-link"
                      >
                        <span>View source</span>
                        <ExternalLink size={12} />
                      </a>
                      <Link
                        href={`/studio?ref=${encodeURIComponent(ad.id)}&title=${encodeURIComponent(ad.title)}`}
                        className="ad-make-btn"
                      >
                        <span>Make similar ↗</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "40px", textAlign: "center", background: "#FFFFFF", borderRadius: "18px" }}>
              <p style={{ color: "#71717A" }}>
                We&apos;re curating this category — start a project and our team will build your creative concept from scratch!
              </p>
              <Link
                href="/studio"
                className="btn-primary-cta"
                style={{ display: "inline-flex", marginTop: "14px" }}
              >
                <span>Start a project in this category ↗</span>
              </Link>
            </div>
          )}
        </section>
      </div>

      {/* Modals */}
      <InstagramEmbedModal
        reel={selectedReel}
        onClose={() => setSelectedReel(null)}
      />

      <CommandPalette
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        isAdultVerified={isAdultVerified}
      />

      <AgeGateModal
        isOpen={isAgeGateOpen}
        onConfirm={handleAgeConfirm}
        onCancel={() => {
          setIsAgeGateOpen(false);
          setPendingAdultCat(null);
        }}
      />

      <CookieConsent />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading Creative Intelligence Hub...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
