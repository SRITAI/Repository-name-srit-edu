"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Film,
  CheckCircle2,
  ChevronDown,
  Layers,
  Zap,
  Users,
  Instagram,
  ExternalLink,
} from "lucide-react";

import CommandPalette from "@/components/CommandPalette";
import InstagramEmbedModal from "@/components/InstagramEmbedModal";
import AgeGateModal from "@/components/AgeGateModal";
import CookieConsent from "@/components/CookieConsent";
import Navbar from "@/components/Navbar";
import { BrandLogo } from "@/components/BrandLogo";
import { AdExplorerModule } from "@/components/ad-explorer/AdExplorerModule";
import { PlatformIcon } from "@/components/ad-explorer/PlatformIcon";
import { HomepageFlowGallery } from "@/components/home/HomepageFlowGallery";
import { LivingIdeaNetwork, NetworkNodeItem } from "@/components/home/LivingIdeaNetwork";
import { AiAssistedProductionCard } from "@/components/home/AiAssistedProductionCard";
import { EditorialTrendXrayCard } from "@/components/home/EditorialTrendXrayCard";

import {
  SEED_CATEGORIES,
  SEED_REELS,
  SEED_ADS,
  getMetaAdLibraryLink,
} from "@/lib/data/seed-data";
import { Category, TrendingReel, FamousAd } from "@/lib/supabase/types";

interface OrbitItemData {
  id: string;
  type: "chip" | "image" | "panel";
  title?: string;
  desc?: string;
  icon?: string;
  iconClass?: string;
  imageSrc?: string;
  imageAlt?: string;
  badge?: string;
}

const ORBIT_ITEMS: OrbitItemData[] = [
  {
    id: "ideas",
    type: "chip",
    title: "Ideas",
    desc: "Capture everything",
    iconClass: "purple",
    icon: "spark",
  },
  {
    id: "plan",
    type: "chip",
    title: "Plan",
    desc: "Turn ideas into action",
    iconClass: "orange",
    icon: "calendar",
  },
  {
    id: "moon",
    type: "image",
    imageSrc: "/assets/moon_card.png",
    imageAlt: "Cosmos and crescent moon in deep space",
    badge: "Deep Orbit",
  },
  {
    id: "reflect",
    type: "chip",
    title: "Reflect",
    desc: "Evening review",
    iconClass: "rose",
    icon: "sun",
  },
  {
    id: "panel",
    type: "panel",
  },
  {
    id: "habits",
    type: "chip",
    title: "Habits",
    desc: "14-day flow streak",
    iconClass: "teal",
    icon: "flame",
  },
  {
    id: "mountain",
    type: "image",
    imageSrc: "/assets/mountain_card.png",
    imageAlt: "Dramatic black and white mountain ridge",
    badge: "Peak Focus",
  },
  {
    id: "focus",
    type: "chip",
    title: "Focus",
    desc: "Deep work, bigger results",
    iconClass: "lime",
    icon: "target",
  },
];

export default function MindlyPage() {
  const router = useRouter();

  // Modals & Popups State
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [selectedReel, setSelectedReel] = useState<TrendingReel | null>(null);
  const [isAgeGateOpen, setIsAgeGateOpen] = useState(false);
  const [pendingAdultCat, setPendingAdultCat] = useState<string | null>(null);
  const [isAdultVerified, setIsAdultVerified] = useState(false);

  // Toast feedback
  const [activeToast, setActiveToast] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Category Filtering for Famous Ads & Trending Reels
  const [activeAdCategory, setActiveAdCategory] = useState<string>("all");
  const [selectedReelCat, setSelectedReelCat] = useState<string>("all");

  // Filter trending reels based on active selection
  const filteredReels =
    selectedReelCat === "all"
      ? SEED_REELS
      : SEED_REELS.filter((r) => r.category_id === selectedReelCat);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Check adult verification on mount
  useEffect(() => {
    const verified = localStorage.getItem("infimindss_adult_verified") === "true";
    setIsAdultVerified(verified);
  }, []);

  // Global ⌘K / Ctrl+K and custom event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCmdOpen((prev) => !prev);
      } else if (e.key === "/" && !isInput && !isCmdOpen) {
        e.preventDefault();
        setIsCmdOpen(true);
      }
    };
    const handleOpenCmd = () => setIsCmdOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleOpenCmd);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleOpenCmd);
    };
  }, [isCmdOpen]);

  const triggerToast = (msg: string) => {
    setActiveToast(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setActiveToast(null);
    }, 2800);
  };

  const handleNetworkNodeSelect = (node: NetworkNodeItem) => {
    triggerToast(`${node.label}: ${node.desc}`);
    if (node.href) {
      router.push(node.href);
    }
  };

  const handleCardClick = (item: OrbitItemData) => {
    if (item.type === "chip") {
      triggerToast(`${item.title}: ${item.desc}`);
    } else if (item.type === "image") {
      triggerToast(`${item.badge} view activated`);
    } else {
      triggerToast("infimindss 3D Focus Orbit");
    }
  };

  const handleCategoryClick = (cat: Category) => {
    if (cat.is_adult && !isAdultVerified) {
      setPendingAdultCat(cat.slug);
      setIsAgeGateOpen(true);
      return;
    }
    router.push(`/explore/${cat.slug}`);
  };

  const handleAgeConfirm = () => {
    localStorage.setItem("infimindss_adult_verified", "true");
    setIsAdultVerified(true);
    setIsAgeGateOpen(false);
    if (pendingAdultCat) {
      router.push(`/explore/${pendingAdultCat}`);
      setPendingAdultCat(null);
    }
  };

  // Filter ads by active tab
  const filteredAds =
    activeAdCategory === "all"
      ? SEED_ADS
      : SEED_ADS.filter((a) => {
          const cat = SEED_CATEGORIES.find((c) => c.slug === activeAdCategory);
          return cat && a.category_id === cat.id;
        });

  return (
    <div className="presentation-wrapper">
      <div className="window-frame">
        {/* Header Navigation (Task B) */}
        <Navbar activeRoute="home" onOpenSearch={() => setIsCmdOpen(true)} />

        {/* Editorial Hero Stage */}
        <main className="hero-stage">
          {/* Subtle painterly gouache wash (abstract, non-human) */}
          <div className="hero-paint-wash" aria-hidden="true" />

          {/* Top Right Rotating Circular Stamp */}
          <div className="circular-stamp" aria-label="Real humans, AI production, short-form ads">
            <svg className="rotating-text-svg" viewBox="0 0 120 120" width="88" height="88">
              <defs>
                <path id="stampCircle" d="M 60,60 m -42,0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0" />
              </defs>
              <text className="stamp-text">
                <textPath href="#stampCircle" startOffset="0%">
                  REAL HUMANS • AI PRODUCTION • SHORT-FORM ADS •
                </textPath>
              </text>
            </svg>
            <div className="stamp-star-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 0 L14 9 L23 12 L14 15 L12 24 L10 15 L1 12 L10 9 Z"></path>
              </svg>
            </div>
          </div>

          <div className="hero-inner-container">
            {/* Hero Main Content */}
            <div className="hero-content">
              {/* Eyebrow */}
              <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#C86446]/10 border border-[#C86446]/25 text-[#C86446] text-xs font-mono font-semibold uppercase tracking-wider mb-4 text-center">
                <span>HUMAN CREATIVITY × AI PRODUCTION</span>
              </div>

              {/* Headline */}
              <h1 className="hero-headline">
                <span className="headline-regular">Your next ad starts</span>{" "}
                <span className="headline-italic">with a sharper story.</span>
              </h1>

              {/* Description */}
              <p className="hero-subheading">
                Trend research, AI-assisted scripts, human-led production, and polished graphics—brought together to help brands create compelling short-form video.
              </p>

              {/* CTA Group */}
              <div className="hero-cta-group">
                <Link href="/studio" className="btn-start-project btn-hero" aria-label="Start a video project">
                  <span className="btn-pulse-badge">
                    <span className="pulse-dot-green"></span>
                    <span>Studio</span>
                  </span>
                  <span>Start a video project</span>
                  <span className="btn-arrow-circle" aria-hidden="true">
                    <ArrowUpRight size={15} className="btn-arrow-icon primary" />
                    <ArrowUpRight size={15} className="btn-arrow-icon clone" />
                  </span>
                </Link>

                <a href="#trending-reels" className="btn-video-cta" aria-label="Explore trending reels">
                  <span className="video-play-disc" aria-hidden="true">
                    <Instagram size={13} />
                  </span>
                  <span>Explore trending reels</span>
                </a>
              </div>

              {/* Central Animated Node Network: infimindss verse with Brain & Hands */}
              <div className="hero-living-network-container mt-6 sm:mt-8 w-full" id="verse">
                <LivingIdeaNetwork onNodeSelect={handleNetworkNodeSelect} />
              </div>
            </div>

            {/* Flanking Supporting Cards */}
            <div className="hero-flanking-cards">
              {/* Left Floating Card */}
              <div className="floating-card left-card" tabIndex={0}>
                <div className="card-icon-box">
                  <div className="soundwave-icon" aria-hidden="true">
                    <span className="bar bar-1"></span>
                    <span className="bar bar-2"></span>
                    <span className="bar bar-3"></span>
                    <span className="bar bar-4"></span>
                    <span className="bar bar-5"></span>
                  </div>
                </div>
                <h3 className="card-title">Hook, script &amp;<br />visual rhythm.</h3>
                <p className="card-subtitle">Crafted to stop the scroll<br />on Instagram Reels.</p>
              </div>

              {/* Right Floating Card */}
              <div className="floating-card right-card" tabIndex={0}>
                <div className="card-avatar-stack" aria-label="Real creators">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="Creator" className="avatar-img" />
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80" alt="Creator" className="avatar-img" />
                  <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80" alt="Creator" className="avatar-img" />
                  <span className="avatar-plus-badge">+</span>
                </div>
                <h3 className="card-title">Real creators<br />on camera.</h3>
                <p className="card-subtitle">Authentic charisma<br />paired with AI speed.</p>
              </div>
            </div>
          </div>

          {/* Interactive Toast */}
          {activeToast && (
            <div className="orbit-toast show" role="status" aria-live="polite">
              <span className="toast-dot"></span>
              <span>{activeToast}</span>
            </div>
          )}

          {/* Hero Bottom Bar: Proof & Credo */}
          <div className="hero-bottom-bar">
            {/* Bottom Left Proof */}
            <div className="bottom-badge bottom-left-proof">
              <div className="proof-bar" aria-hidden="true"></div>
              <p className="proof-text">Trusted by 50+<br className="hidden sm:inline" /> scaling D2C brands.</p>
              <div className="proof-avatars" aria-label="Creator avatars">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="Creator" className="proof-avatar" />
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80" alt="Creator" className="proof-avatar" />
                <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80" alt="Creator" className="proof-avatar" />
                <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=80&q=80" alt="Creator" className="proof-avatar" />
                <span className="proof-avatar-plus">+</span>
              </div>
            </div>

            {/* Bottom Right Credo */}
            <div className="bottom-badge bottom-right-credo">
              <div className="credo-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 0 L14 9 L23 12 L14 15 L12 24 L10 15 L1 12 L10 9 Z"></path>
                </svg>
              </div>
              <div className="credo-line" aria-hidden="true"></div>
              <div className="credo-text">
                <span>Sharper stories.</span>
                <span>Higher converting reels.</span>
              </div>
            </div>
          </div>
        </main>

        {/* ====================================================================
            FEATURED: Cinematic Flow Video Collage (Google Flow-Inspired)
            Staggered drifting rows of real human creator footage in cream mats
            ==================================================================== */}
        <section className="flow-gallery-section relative w-full z-10 pt-10 sm:pt-14 pb-10" id="flow-gallery">
          <HomepageFlowGallery />
        </section>

        {/* ====================================================================
            FEATURED: Cross-Platform Ad Explorer Module
            ==================================================================== */}
        <section className="home-section" id="ad-explorer" style={{ paddingTop: "64px", paddingBottom: "48px" }}>
          <AdExplorerModule mode="embedded" />
        </section>

        {/* ====================================================================
            NEW SECTION 1: Category Search Section
            ==================================================================== */}
        <section className="home-section" id="features">
          <div className="section-header">
            <span className="section-eyebrow">
              <Sparkles size={14} /> Creative Exploration Hub
            </span>
            <h2 className="section-title">
              Search any category. <br />
              <em>See what&apos;s working.</em>
            </h2>
            <p className="section-desc">
              Browse top-performing real creator video ads and viral hooks across D2C, fashion, skincare, and emerging consumer brands.
            </p>
          </div>

          {/* Search Trigger Bar */}
          <div className="category-search-box" onClick={() => setIsCmdOpen(true)} style={{ cursor: "pointer" }}>
            <Search size={20} color="#71717A" />
            <input
              type="text"
              readOnly
              className="category-search-input"
              placeholder="Try: makeup, clothing, skincare, wellness, streetwear…"
            />
            <span className="search-kbd-hint">Press ⌘K</span>
          </div>

          {/* Category Chips Row */}
          <div className="category-chips-row">
            {SEED_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className="category-pill-btn"
                onClick={() => handleCategoryClick(cat)}
              >
                <span className="category-pill-dot" style={{ backgroundColor: cat.accent_color || "#111" }} />
                <span>{cat.name}</span>
                {cat.is_adult && (
                  <span style={{ fontSize: "0.65rem", color: "#F43F5E", fontWeight: 700 }}>18+</span>
                )}
              </button>
            ))}
            <Link href="/explore" className="category-pill-btn active">
              <span>Browse all categories</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </section>

        {/* ====================================================================
            FEATURED: Trending Reels (Short-Form Intelligence & Formats)
            ==================================================================== */}
        <section className="home-section" id="trending-reels">
          <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span className="section-eyebrow">
                <Instagram size={14} style={{ color: "#E1306C" }} /> Trending Reels
              </span>
              <h2 className="section-title">
                Trending on <em>Instagram.</em>
              </h2>
              <p className="section-desc">
                Browse timely short-form examples, creative formats, and verified benchmarks created by real human performers.
              </p>
            </div>
            <Link href="/explore" className="btn-video-cta" style={{ fontSize: "0.85rem" }}>
              <span>Explore all reels</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          {/* Simple Interactive Category Filter Chips */}
          <div className="category-chips-row" style={{ marginBottom: "20px" }}>
            <button
              type="button"
              className={`category-pill-btn ${selectedReelCat === "all" ? "active" : ""}`}
              onClick={() => setSelectedReelCat("all")}
            >
              <span>All Formats</span>
            </button>
            {SEED_CATEGORIES.slice(0, 5).map((cat) => (
              <button
                key={`reel-cat-${cat.id}`}
                type="button"
                className={`category-pill-btn ${selectedReelCat === cat.id ? "active" : ""}`}
                onClick={() => setSelectedReelCat(cat.id)}
              >
                <span className="category-pill-dot" style={{ backgroundColor: cat.accent_color || "#C86446" }} />
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          <div className="reels-scroll-row">
            {filteredReels.map((reel) => {
              const cat = SEED_CATEGORIES.find((c) => c.id === reel.category_id);
              return (
                <div
                  key={reel.id}
                  className="reel-card-916 group cursor-pointer"
                  onClick={() => setSelectedReel(reel)}
                >
                  {reel.is_seed && <span className="sample-badge">Sample</span>}
                  <img src={reel.thumbnail_url || ""} alt={reel.caption} className="reel-thumb-img transition-transform duration-500 group-hover:scale-105" />
                  <div className="reel-card-overlay">
                    <div className="reel-top-meta flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5">
                        <span className="ig-badge-pill">
                          <Instagram size={11} /> Reel
                        </span>
                        {cat && (
                          <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-black/40 text-white/90 backdrop-blur-sm border border-white/10">
                            {cat.name.split(" ")[0]}
                          </span>
                        )}
                      </div>
                      <span className="reel-views-tag">{reel.views_label} views</span>
                    </div>
                    <div className="reel-bottom-info">
                      <span className="reel-creator-handle">{reel.creator_handle}</span>
                      <p className="reel-caption-text line-clamp-2">{reel.caption}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ====================================================================
            FEATURED: Creative Capabilities & Intelligence (Image 1 & Image 2)
            ==================================================================== */}
        <section className="home-section" id="capabilities">
          <div className="section-header">
            <span className="section-eyebrow">
              <Sparkles size={14} className="text-[#C86446]" /> Creative Capabilities &amp; Intelligence
            </span>
            <h2 className="section-title">
              Trend research, neural scripting, <br />
              <em>and real human production.</em>
            </h2>
            <p className="section-desc">
              How we deconstruct short-form advertising down to the microsecond and pair deep data with authentic on-camera performance.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 mt-6 max-w-5xl mx-auto">
            {/* Reference Image 2: Editorial X-Ray Trend Intelligence Card */}
            <EditorialTrendXrayCard />

            {/* Reference Image 1: Polyghost Point-Cloud & Scanline AI-Assisted Production Suite */}
            <AiAssistedProductionCard />
          </div>
        </section>

        {/* ====================================================================
            NEW SECTION 3: Famous Ads by Category
            ==================================================================== */}
        <section className="home-section" id="famous-ads">
          <div className="section-header">
            <span className="section-eyebrow">
              <Film size={14} /> Ad Intelligence & Pattern Library
            </span>
            <h2 className="section-title">
              Famous ads <em>by category.</em>
            </h2>
            <p className="section-desc">
              Discover proven hook psychology, before/after wear tests, and storytelling structures driving ROAS.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="category-chips-row" style={{ marginBottom: "28px" }}>
            <button
              type="button"
              className={`category-pill-btn ${activeAdCategory === "all" ? "active" : ""}`}
              onClick={() => setActiveAdCategory("all")}
            >
              All Benchmark Ads
            </button>
            {SEED_CATEGORIES.slice(0, 6).map((c) => (
              <button
                key={c.id}
                type="button"
                className={`category-pill-btn ${activeAdCategory === c.slug ? "active" : ""}`}
                onClick={() => setActiveAdCategory(c.slug)}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Ads Grid */}
          <div className="ads-grid">
            {filteredAds.map((ad) => (
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
                    {ad.why_it_works.map((bullet, idx) => (
                      <li key={idx}>{bullet}</li>
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
                      <span>Make a similar ad</span>
                      <ArrowUpRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ====================================================================
            NEW SECTION 4: How It Works (Human + AI Pipeline)
            ==================================================================== */}
        <section className="home-section" id="how-it-works">
          <div className="section-header">
            <span className="section-eyebrow">
              <Layers size={14} /> Production Pipeline
            </span>
            <h2 className="section-title">
              Real humans. AI-fast. <br />
              <em>Zero robotic-looking videos.</em>
            </h2>
            <p className="section-desc">
              We combine real on-camera creators with custom AI audio and editing pipelines to deliver high-converting brand videos in 72 hours.
            </p>
          </div>

          {/* Connected Step Accents in Pipeline (Living Node Motif) */}
          <div className="hidden lg:flex items-center justify-between max-w-4xl mx-auto px-8 mb-6 relative z-10" aria-hidden="true">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C86446] ring-4 ring-[#C86446]/20" />
              <span className="text-[11px] font-mono text-[#302E29] font-semibold">1. Brief</span>
            </div>
            <div className="flex-1 h-[1.5px] bg-gradient-to-r from-[#C86446]/50 via-[#302E29]/20 to-[#C86446]/50 mx-4 border-t border-dashed border-[#C86446]/40" />
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#302E29]/50 ring-4 ring-[#302E29]/10" />
              <span className="text-[11px] font-mono text-[#302E29] font-semibold">2. Shoot</span>
            </div>
            <div className="flex-1 h-[1.5px] bg-gradient-to-r from-[#302E29]/20 via-[#C86446]/50 to-[#302E29]/20 mx-4 border-t border-dashed border-[#C86446]/40" />
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#302E29]/50 ring-4 ring-[#302E29]/10" />
              <span className="text-[11px] font-mono text-[#302E29] font-semibold">3. Enhance</span>
            </div>
            <div className="flex-1 h-[1.5px] bg-gradient-to-r from-[#302E29]/20 via-[#C86446]/50 to-[#C86446]/80 mx-4 border-t border-dashed border-[#C86446]/40" />
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C86446] ring-4 ring-[#C86446]/20" />
              <span className="text-[11px] font-mono text-[#302E29] font-semibold">4. Deliver</span>
            </div>
          </div>

          <div className="pipeline-grid">
            <div className="pipeline-card">
              <div className="pipeline-step-badge">1</div>
              <div className="pipeline-role-tag">Client & Creative Producer</div>
              <h3 className="pipeline-title">Brief & Asset Intake</h3>
              <p className="pipeline-desc">
                Paste your prepared script, upload product pictures for AI assisted drafting, or drop a Google Drive folder link.
              </p>
            </div>

            <div className="pipeline-card">
              <div className="pipeline-step-badge">2</div>
              <div className="pipeline-role-tag">Real Human Creator</div>
              <h3 className="pipeline-title">Creator Shoots On Camera</h3>
              <p className="pipeline-desc">
                Vetted human creators with authentic presence record candid wear tests, stress demos, hooks, and problem-solution reactions.
              </p>
            </div>

            <div className="pipeline-card">
              <div className="pipeline-step-badge">3</div>
              <div className="pipeline-role-tag">AI Enhancement Suite</div>
              <h3 className="pipeline-title">AI Editing & Cutdowns</h3>
              <p className="pipeline-desc">
                Neural algorithms auto-generate timed kinetic captions, clean room audio, color balance, and match-cut 9:16 / 4:5 / 1:1 ratios.
              </p>
            </div>

            <div className="pipeline-card">
              <div className="pipeline-step-badge">4</div>
              <div className="pipeline-role-tag">Senior QA Director</div>
              <h3 className="pipeline-title">Human QA & Final Delivery</h3>
              <p className="pipeline-desc">
                Every video is checked for Meta ad policy compliance, crisp sound balance, and commercial rights before client handoff.
              </p>
            </div>
          </div>

          <div className="pipeline-guarantee-banner">
            <CheckCircle2 size={24} className="pipeline-guarantee-icon" />
            <span className="pipeline-guarantee-text">
              <strong>Human-Verified Guarantee:</strong> AI never replaces the person on camera. You get authentic human connection with AI speed and efficiency.
            </span>
          </div>
        </section>

        {/* ====================================================================
            NEW SECTION 5: Meta Strip Section
            ==================================================================== */}
        <section className="home-section" id="meta-strip">
          <div className="meta-strip-card">
            <div>
              <span className="section-eyebrow" style={{ color: "#0081FB", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <PlatformIcon platform="meta" size={16} />
                Built for Meta Ads &amp; Reels
              </span>
              <h3 className="section-title" style={{ fontSize: "2rem", marginBottom: "8px" }}>
                Every deliverable formatted for <em>maximum ROAS.</em>
              </h3>
              <p className="section-desc" style={{ marginBottom: "20px" }}>
                All creative chambers deliver full aspect ratio suites for Reels, Stories, and Feeds — ready to drop into Meta Ads Manager.
              </p>
              <a
                href={getMetaAdLibraryLink("clothing fashion video ads")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-video-cta"
                style={{ fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <PlatformIcon platform="meta" size={14} />
                <span>Browse live ads on Meta Ad Library</span>
                <ArrowUpRight size={14} />
              </a>
            </div>

            <div className="meta-ratios-box">
              <div className="ratio-spec-pill">
                <div className="ratio-aspect">9:16</div>
                <div className="ratio-label">Reels & Stories</div>
              </div>
              <div className="ratio-spec-pill">
                <div className="ratio-aspect">4:5</div>
                <div className="ratio-label">Instagram Feed</div>
              </div>
              <div className="ratio-spec-pill">
                <div className="ratio-aspect">1:1</div>
                <div className="ratio-label">Square Feed</div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            NEW SECTION 6: Pricing Section
            ==================================================================== */}
        <section className="home-section" id="pricing">
          <div className="section-header" style={{ textAlign: "center", margin: "0 auto 40px auto" }}>
            <span className="section-eyebrow">
              <Sparkles size={14} /> Transparent Production
            </span>
            <h2 className="section-title">
              Simple, predictable <em>pricing.</em>
            </h2>
            <p className="section-desc" style={{ margin: "10px auto 0 auto" }}>
              No retainer lock-ins. Start with a single pilot reel or scale full monthly ad campaigns.
            </p>
          </div>

          <div className="pricing-grid">
            <div className="pricing-card">
              <h3 className="pricing-plan-name">Pilot Reel</h3>
              <p className="pricing-plan-desc">Perfect for testing a new hook or hero product.</p>
              <div className="pricing-price-wrap">
                <span className="pricing-amount">$499</span>
                <span className="pricing-period">/ single project</span>
              </div>
              <ul className="pricing-features-list">
                <li className="pricing-feature-item">
                  <CheckCircle2 size={16} color="#10B981" /> 1 Real Creator on Camera
                </li>
                <li className="pricing-feature-item">
                  <CheckCircle2 size={16} color="#10B981" /> 9:16 Native Vertical Video
                </li>
                <li className="pricing-feature-item">
                  <CheckCircle2 size={16} color="#10B981" /> AI Kinetic Captions & Color Grade
                </li>
                <li className="pricing-feature-item">
                  <CheckCircle2 size={16} color="#10B981" /> 72-Hour Turnaround
                </li>
                <li className="pricing-feature-item">
                  <CheckCircle2 size={16} color="#10B981" /> 1 Round of Human Revision
                </li>
              </ul>
              <Link href="/studio" className="btn-video-cta" style={{ width: "100%", justifyContent: "center" }}>
                <span>Start Pilot Reel ↗</span>
              </Link>
            </div>

            <div className="pricing-card featured">
              <span className="pricing-popular-chip">Most Popular</span>
              <h3 className="pricing-plan-name">Growth Pack</h3>
              <p className="pricing-plan-desc">3 unique creator angles to split-test ROAS.</p>
              <div className="pricing-price-wrap">
                <span className="pricing-amount">$1,299</span>
                <span className="pricing-period">/ pack of 3</span>
              </div>
              <ul className="pricing-features-list">
                <li className="pricing-feature-item">
                  <CheckCircle2 size={16} color="#10B981" /> 3 Different Real Creators
                </li>
                <li className="pricing-feature-item">
                  <CheckCircle2 size={16} color="#10B981" /> 3 Unique Hook Variations
                </li>
                <li className="pricing-feature-item">
                  <CheckCircle2 size={16} color="#10B981" /> 9:16, 4:5 & 1:1 Deliverables Included
                </li>
                <li className="pricing-feature-item">
                  <CheckCircle2 size={16} color="#10B981" /> Commercial Rights & Model Releases
                </li>
                <li className="pricing-feature-item">
                  <CheckCircle2 size={16} color="#10B981" /> Priority 5-Day Delivery
                </li>
              </ul>
              <Link href="/studio" className="btn-primary-cta" style={{ width: "100%", justifyContent: "center" }}>
                <span>Start Growth Pack ↗</span>
              </Link>
            </div>

            <div className="pricing-card">
              <h3 className="pricing-plan-name">Scale Chamber</h3>
              <p className="pricing-plan-desc">For aggressive D2C scaling & weekly creative refresh.</p>
              <div className="pricing-price-wrap">
                <span className="pricing-amount">$2,999</span>
                <span className="pricing-period">/ 8 videos</span>
              </div>
              <ul className="pricing-features-list">
                <li className="pricing-feature-item">
                  <CheckCircle2 size={16} color="#10B981" /> 8 Full Creative Video Ads
                </li>
                <li className="pricing-feature-item">
                  <CheckCircle2 size={16} color="#10B981" /> Dedicated Creative Producer
                </li>
                <li className="pricing-feature-item">
                  <CheckCircle2 size={16} color="#10B981" /> Complete Meta Ad Library Analysis
                </li>
                <li className="pricing-feature-item">
                  <CheckCircle2 size={16} color="#10B981" /> Rapid 48-Hour Rush Deliveries
                </li>
                <li className="pricing-feature-item">
                  <CheckCircle2 size={16} color="#10B981" /> Direct Creator Whitelisting Access
                </li>
              </ul>
              <Link href="/studio" className="btn-video-cta" style={{ width: "100%", justifyContent: "center" }}>
                <span>Inquire Scale Chamber ↗</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ====================================================================
            NEW SECTION 7: FAQ & Footer
            ==================================================================== */}
        <section className="home-section" id="faq">
          <div className="section-header">
            <span className="section-eyebrow">
              <Sparkles size={14} /> Questions Answered
            </span>
            <h2 className="section-title">
              Frequently asked <em>questions.</em>
            </h2>
          </div>

          <div className="faq-list">
            {[
              {
                q: "Are the people in the videos real humans or AI-generated avatars?",
                a: "100% real humans on camera. We do NOT use synthetic AI-generated faces or robotic digital puppets. Authentic human charisma, micro-expressions, and genuine touch are critical for customer trust.",
              },
              {
                q: "How does the AI part of 'Human + AI' work?",
                a: "AI accelerates script drafting, hook brainstorming from product photos, kinetic subtitle generation, background audio noise isolation, auto-color grading, and formatting into 9:16, 4:5, and 1:1 cutdowns.",
              },
              {
                q: "Can you create ads for Sexual Wellness, Intimate Care, or sensitive products?",
                a: "Yes! We specialize in policy-compliant creative storytelling. We steer clear of overt explicit visuals, focusing instead on relatable relationship dialogue, holistic self-care routines, and tasteful product aesthetics that pass Meta and Google ad reviews.",
              },
              {
                q: "How does the Studio briefing process work?",
                a: "You enter our guided Studio chamber, where you can either paste a script, upload product images for our team to draft a script, or drop a Google Drive folder link. You get real-time timeline tracking from brief to final delivery.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="faq-item"
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
              >
                <div className="faq-question">
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: openFaqIndex === index ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </div>
                {openFaqIndex === index && <p className="faq-answer">{faq.a}</p>}
              </div>
            ))}
          </div>

          {/* Footer */}
          <footer className="footer-container">
            <div className="footer-top">
              <div>
                <BrandLogo size="lg" />
                <p style={{ fontSize: "0.86rem", color: "#71717A", marginTop: "8px", maxWidth: "340px" }}>
                  Real humans. AI-fast. Zero robotic-looking videos. The modern video marketing studio for fast-moving brands.
                </p>
              </div>

              <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "12px" }}>Platform</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.82rem" }}>
                    <Link href="/explore" style={{ color: "#71717A", textDecoration: "none" }}>Explore Library</Link>
                    <Link href="/studio" style={{ color: "#71717A", textDecoration: "none" }}>Creative Studio</Link>
                    <Link href="/studio/projects" style={{ color: "#71717A", textDecoration: "none" }}>Project Tracking</Link>
                    <Link href="/admin" style={{ color: "#71717A", textDecoration: "none" }}>Admin Portal</Link>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "12px" }}>Legal & Policies</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.82rem" }}>
                    <span style={{ color: "#71717A" }}>Model Release Guarantee</span>
                    <span style={{ color: "#71717A" }}>Meta Ad Policy Compliance</span>
                    <span style={{ color: "#71717A" }}>18+ Age Restricted Policy</span>
                    <span style={{ color: "#71717A" }}>Privacy & Cookie Policy</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="footer-policy-notice">
              <strong>Notice & Trademark Disclaimer:</strong> Meta, Instagram, Facebook, and the Meta Ad Library are trademarks of Meta Platforms, Inc. infimindss is an independent creative studio and software platform. All sample reels and ads remain the property of their respective creators and brands, displayed strictly via official embed standards.
            </div>

            <div className="footer-bottom">
              <span>© {new Date().getFullYear()} infimindss Studio. All rights reserved.</span>
              <span>Made for bold brand builders worldwide.</span>
            </div>
          </footer>
        </section>
      </div>

      {/* Video Modal (Existing Showreel) */}
      {isVideoModalOpen && (
        <dialog className="video-modal" open aria-label="infimindss Product Overview">
          <div className="modal-card">
            <button type="button" className="modal-close" onClick={() => setIsVideoModalOpen(false)} aria-label="Close modal">
              ✕
            </button>
            <div className="video-preview-header">
              <h3>Experience infimindss</h3>
              <p>See how 50,000+ thinkers turn abstract thoughts into focused execution.</p>
            </div>
            <div className="video-embed-container">
              <div className="video-mock-screen">
                <div className="mock-play-btn">
                  <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
                    <polygon points="6 4 20 12 6 20 6 4"></polygon>
                  </svg>
                </div>
                <span className="mock-duration">2:14 Product Walkthrough</span>
              </div>
            </div>
          </div>
        </dialog>
      )}

      {/* Global Command Palette Modal (⌘K) */}
      <CommandPalette
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        isAdultVerified={isAdultVerified}
      />

      {/* Instagram Reel Embed Modal */}
      <InstagramEmbedModal
        reel={selectedReel}
        onClose={() => setSelectedReel(null)}
      />

      {/* 18+ Age Verification Modal */}
      <AgeGateModal
        isOpen={isAgeGateOpen}
        onConfirm={handleAgeConfirm}
        onCancel={() => {
          setIsAgeGateOpen(false);
          setPendingAdultCat(null);
        }}
      />

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </div>
  );
}
