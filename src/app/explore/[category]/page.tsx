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
  Search,
} from "lucide-react";

import InstagramEmbedModal from "@/components/InstagramEmbedModal";
import AgeGateModal from "@/components/AgeGateModal";
import CookieConsent from "@/components/CookieConsent";
import CommandPalette from "@/components/CommandPalette";

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

    // If it's an adult category and not verified, trigger age gate
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

  // Filter reels & ads for this category
  const reels = SEED_REELS.filter((r) => r.category_id === category.id);
  const ads = SEED_ADS.filter((a) => a.category_id === category.id);

  // Meta Ad Library Deep Link
  const metaLink = getMetaAdLibraryLink(category.keywords[0] || category.name);

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
            <Link href={`/studio?category=${category.slug}`} className="btn-get-app">
              <span>Start in this category</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </header>

        {/* Breadcrumb & Header */}
        <div style={{ marginBottom: "36px" }}>
          <Link
            href="/explore"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.82rem",
              color: "#71717A",
              textDecoration: "none",
              marginBottom: "14px",
            }}
          >
            <ArrowLeft size={14} /> Back to all categories
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: category.accent_color || "#111",
              }}
            />
            <span style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#71717A" }}>
              Category Creative Intelligence
            </span>
            {category.is_adult && (
              <span className="cmd-adult-tag">
                <ShieldAlert size={11} /> 18+ Age-Restricted
              </span>
            )}
          </div>

          <h1 className="section-title">
            {category.name} <br />
            <em>Benchmark Ads & Viral Formats.</em>
          </h1>
          <p className="section-desc">{category.description}</p>
        </div>

        {/* Patterns We See in This Category (Insights Markdown) */}
        {category.insights_md && (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "20px",
              padding: "28px 32px",
              border: "1px solid rgba(0,0,0,0.06)",
              marginBottom: "40px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", color: "#111111", fontWeight: 700, fontSize: "0.95rem" }}>
              <Sparkles size={16} color="#F59E0B" />
              <span>Patterns we see scaling in {category.name}</span>
            </div>
            <div
              style={{
                fontSize: "0.88rem",
                color: "#52525B",
                lineHeight: 1.6,
                whiteSpace: "pre-line",
              }}
            >
              {category.insights_md}
            </div>

            <div style={{ display: "flex", gap: "14px", marginTop: "24px", flexWrap: "wrap", alignItems: "center" }}>
              <a
                href={metaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-video-cta"
                style={{ fontSize: "0.82rem" }}
              >
                <span>See live ads on Meta Ad Library</span>
                <ArrowUpRight size={13} />
              </a>
              <Link
                href={`/studio?category=${category.slug}`}
                className="btn-primary-cta"
                style={{ fontSize: "0.82rem", padding: "8px 20px" }}
              >
                <span>Start a project in {category.name} ↗</span>
              </Link>
            </div>
          </div>
        )}

        {/* Category Trending Reels */}
        <section style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
              <Instagram size={18} color="#E1306C" />
              <span>Trending Reels in {category.name}</span>
            </h2>
            <span style={{ fontSize: "0.8rem", color: "#71717A" }}>Curated real creator videos</span>
          </div>

          {reels.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" }}>
              {reels.map((reel) => (
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
            <div style={{ padding: "36px", textAlign: "center", background: "#FFFFFF", borderRadius: "18px" }}>
              <p style={{ color: "#71717A" }}>
                We are actively curating trending reels for this category. Start your project now and our team will tailor bespoke viral angles!
              </p>
            </div>
          )}
        </section>

        {/* Category Famous Ads */}
        <section style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
              <Film size={18} color="#0081FB" />
              <span>Famous Benchmark Ads in {category.name}</span>
            </h2>
          </div>

          {ads.length > 0 ? (
            <div className="ads-grid" style={{ marginTop: 0 }}>
              {ads.map((ad) => (
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
                        href={`/studio?ref=${encodeURIComponent(ad.id)}&title=${encodeURIComponent(ad.title)}&category=${category.slug}`}
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
              <p style={{ color: "#71717A", marginBottom: "14px" }}>
                We are curating benchmark ads for this vertical. Start a project and our team will build your custom creative playbook from scratch!
              </p>
              <Link
                href={`/studio?category=${category.slug}`}
                className="btn-primary-cta"
                style={{ display: "inline-flex" }}
              >
                <span>Start a project in {category.name} ↗</span>
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
        onCancel={handleAgeCancel}
      />

      <CookieConsent />
    </div>
  );
}
