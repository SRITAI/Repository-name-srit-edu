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

  // Category Filtering for Famous Ads
  const [activeAdCategory, setActiveAdCategory] = useState<string>("all");

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Refs for Spline & Orbit
  const leftCardRef = useRef<HTMLDivElement>(null);
  const rightCardRef = useRef<HTMLDivElement>(null);
  const centerPieceRef = useRef<HTMLDivElement>(null);
  const haloContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pathLeftRef = useRef<SVGPathElement>(null);
  const pathRightRef = useRef<SVGPathElement>(null);

  // Check adult verification on mount
  useEffect(() => {
    const verified = localStorage.getItem("infimindss_adult_verified") === "true";
    setIsAdultVerified(verified);
  }, []);

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Connecting Splines update
  useEffect(() => {
    function updateSplines() {
      if (typeof window === "undefined" || window.innerWidth <= 860) return;

      const stage = document.querySelector(".hero-stage");
      const leftCard = leftCardRef.current;
      const rightCard = rightCardRef.current;
      const centerPiece = centerPieceRef.current;
      const pathLeft = pathLeftRef.current;
      const pathRight = pathRightRef.current;

      if (!stage || !leftCard || !rightCard || !centerPiece || !pathLeft || !pathRight) return;

      const stageRect = stage.getBoundingClientRect();
      const leftRect = leftCard.getBoundingClientRect();
      const rightRect = rightCard.getBoundingClientRect();
      const centerRect = centerPiece.getBoundingClientRect();

      const startLeftX = leftRect.left + leftRect.width / 2 - stageRect.left;
      const startLeftY = leftRect.bottom - 4 - stageRect.top;

      const startRightX = rightRect.left + 8 - stageRect.left;
      const startRightY = rightRect.top + rightRect.height * 0.45 - stageRect.top;

      const targetLeftX = centerRect.left + centerRect.width * 0.28 - stageRect.left;
      const targetLeftY = centerRect.top + centerRect.height * 0.38 - stageRect.top;

      const targetRightX = centerRect.left + centerRect.width * 0.72 - stageRect.left;
      const targetRightY = centerRect.top + centerRect.height * 0.38 - stageRect.top;

      const cp1LeftX = startLeftX;
      const cp1LeftY = startLeftY + (targetLeftY - startLeftY) * 0.65;
      const cp2LeftX = targetLeftX - 60;
      const cp2LeftY = targetLeftY;

      const cp1RightX = startRightX - (startRightX - targetRightX) * 0.4;
      const cp1RightY = startRightY + 40;
      const cp2RightX = targetRightX + 40;
      const cp2RightY = targetRightY;

      pathLeft.setAttribute(
        "d",
        `M ${startLeftX.toFixed(1)} ${startLeftY.toFixed(1)} C ${cp1LeftX.toFixed(1)} ${cp1LeftY.toFixed(1)}, ${cp2LeftX.toFixed(1)} ${cp2LeftY.toFixed(1)}, ${targetLeftX.toFixed(1)} ${targetLeftY.toFixed(1)}`
      );
      pathRight.setAttribute(
        "d",
        `M ${startRightX.toFixed(1)} ${startRightY.toFixed(1)} C ${cp1RightX.toFixed(1)} ${cp1RightY.toFixed(1)}, ${cp2RightX.toFixed(1)} ${cp2RightY.toFixed(1)}, ${targetRightX.toFixed(1)} ${targetRightY.toFixed(1)}`
      );
    }

    updateSplines();
    window.addEventListener("resize", updateSplines, { passive: true });
    window.addEventListener("load", updateSplines);
    return () => {
      window.removeEventListener("resize", updateSplines);
      window.removeEventListener("load", updateSplines);
    };
  }, []);

  // 3D Orbital Carousel Animation Loop
  useEffect(() => {
    let rafId: number;
    let rotation = 0;
    let velocity = 0;
    let isHovered = false;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartRotation = 0;
    let lastDragX = 0;
    let lastDragTime = 0;

    const container = haloContainerRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const updateTransforms = () => {
      if (!container) return;
      const width = container.offsetWidth || 500;
      const height = container.offsetHeight || 500;
      const isMobile = window.innerWidth <= 640;

      const rx = isMobile ? Math.min(160, width * 0.42) : Math.min(240, width * 0.45);
      const ry = rx * 0.32;
      const cx = width / 2;
      const cy = height * 0.38;
      const tiltAngle = -0.11;

      const total = ORBIT_ITEMS.length;

      for (let i = 0; i < total; i++) {
        const el = itemRefs.current[i];
        if (!el) continue;

        const baseAngle = (i * 2 * Math.PI) / total;
        const angle = baseAngle + rotation;

        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        const x = cosA * rx;
        const y = sinA * ry + x * Math.sin(tiltAngle);
        const z = sinA;

        const rotY = -cosA * 32;
        const rotZ = rotY * 0.12;

        if (z >= -0.15) {
          const scale = isMobile ? 0.88 + z * 0.14 : 0.96 + z * 0.16;
          const zIndex = Math.round(20 + z * 15);
          el.style.transform = `translate3d(${cx + x}px, ${cy + y}px, 0px) translate(-50%, -50%) rotateY(${rotY.toFixed(1)}deg) rotateZ(${rotZ.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
          el.style.zIndex = String(zIndex);
          el.style.opacity = "1";
          el.style.filter = "none";
        } else {
          const scale = isMobile ? 0.72 + (z + 1) * 0.16 : 0.82 + (z + 1) * 0.14;
          const opacity = 0.52 + (z + 1) * 0.38;
          const zIndex = Math.round(4 + (z + 1) * 4);
          el.style.transform = `translate3d(${cx + x}px, ${cy + y}px, 0px) translate(-50%, -50%) rotateY(${rotY.toFixed(1)}deg) rotateZ(${rotZ.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
          el.style.zIndex = String(zIndex);
          el.style.opacity = opacity.toFixed(3);
          el.style.filter = "blur(0.8px)";
        }
      }
    };

    const animate = () => {
      if (!isDragging && !prefersReducedMotion) {
        const baseSpeed = isHovered ? 0.0008 : 0.0032;
        rotation += baseSpeed + velocity;
        velocity *= 0.94;
      }
      updateTransforms();
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartRotation = rotation;
      lastDragX = e.clientX;
      lastDragTime = performance.now();
      velocity = 0;
      try {
        container.setPointerCapture(e.pointerId);
      } catch {}
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartX;
      rotation = dragStartRotation + deltaX * 0.006;

      const now = performance.now();
      const dt = Math.max(1, now - lastDragTime);
      const dx = e.clientX - lastDragX;
      velocity = (dx / dt) * 0.04;
      lastDragX = e.clientX;
      lastDragTime = now;
    };

    const handlePointerUp = (e: PointerEvent) => {
      isDragging = false;
      try {
        container.releasePointerCapture(e.pointerId);
      } catch {}
    };

    const handlePointerEnter = () => {
      isHovered = true;
    };

    const handlePointerLeave = () => {
      isHovered = false;
      isDragging = false;
    };

    container.addEventListener("pointerdown", handlePointerDown);
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerup", handlePointerUp);
    container.addEventListener("pointercancel", handlePointerUp);
    container.addEventListener("pointerenter", handlePointerEnter);
    container.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerup", handlePointerUp);
      container.removeEventListener("pointercancel", handlePointerUp);
      container.removeEventListener("pointerenter", handlePointerEnter);
      container.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  const triggerToast = (msg: string) => {
    setActiveToast(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setActiveToast(null);
    }, 2800);
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
        {/* Header Navigation */}
        <header className="header">
          <Link href="/" className="brand-logo" aria-label="infimindss Home">
            infimindss<span className="logo-degree">°</span>
          </Link>

          <nav className="nav-pill" aria-label="Main Navigation">
            <a href="#features" className="nav-item">Features</a>
            <a href="#how-it-works" className="nav-item">How it works</a>
            <Link href="/explore" className="nav-item">Explore</Link>
            <Link href="/studio" className="nav-item">Studio</Link>
            <a href="#pricing" className="nav-item">Pricing</a>
          </nav>

          <div className="header-right" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              className="btn-search-trigger"
              onClick={() => setIsCmdOpen(true)}
              title="Search (Ctrl+K / ⌘K)"
              aria-label="Open command palette search"
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

        {/* Existing Hero Stage (Preserved Intact) */}
        <main className="hero-stage">
          {/* Connecting SVG Splines */}
          <svg className="connecting-splines" viewBox="0 0 1200 700" preserveAspectRatio="none" aria-hidden="true">
            <path id="spline-left" ref={pathLeftRef} className="spline-path" d="M 235 300 C 235 365, 340 410, 440 430" />
            <path id="spline-right" ref={pathRightRef} className="spline-path" d="M 945 325 C 870 360, 780 410, 730 425" />
            <circle className="pulse-dot-wire" r="2.5">
              <animateMotion dur="4s" repeatCount="indefinite">
                <mpath href="#spline-left" />
              </animateMotion>
            </circle>
            <circle className="pulse-dot-wire" r="2.5">
              <animateMotion dur="4.5s" repeatCount="indefinite">
                <mpath href="#spline-right" />
              </animateMotion>
            </circle>
          </svg>

          {/* Top Right Rotating Circular Stamp */}
          <div className="circular-stamp" aria-label="A more focused you, everyday">
            <svg className="rotating-text-svg" viewBox="0 0 120 120" width="88" height="88">
              <defs>
                <path id="stampCircle" d="M 60,60 m -42,0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0" />
              </defs>
              <text className="stamp-text">
                <textPath href="#stampCircle" startOffset="0%">
                  A MORE FOCUSED YOU • EVERYDAY •
                </textPath>
              </text>
            </svg>
            <div className="stamp-star-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 0 L14 9 L23 12 L14 15 L12 24 L10 15 L1 12 L10 9 Z"></path>
              </svg>
            </div>
          </div>

          {/* Left Floating Card */}
          <div className="floating-card left-card" ref={leftCardRef} tabIndex={0}>
            <div className="card-icon-box">
              <div className="soundwave-icon" aria-hidden="true">
                <span className="bar bar-1"></span>
                <span className="bar bar-2"></span>
                <span className="bar bar-3"></span>
                <span className="bar bar-4"></span>
                <span className="bar bar-5"></span>
              </div>
            </div>
            <h3 className="card-title">Turn thoughts<br />into progress.</h3>
            <p className="card-subtitle">Capture, organise and<br />do more.</p>
          </div>

          {/* Right Floating Card */}
          <div className="floating-card right-card" ref={rightCardRef} tabIndex={0}>
            <div className="card-avatar-stack" aria-label="Collaborators">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="Team member" className="avatar-img" />
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80" alt="Team member" className="avatar-img" />
              <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80" alt="Team member" className="avatar-img" />
              <span className="avatar-plus-badge">+</span>
            </div>
            <h3 className="card-title">Ideas, anytime,<br />anywhere.</h3>
            <p className="card-subtitle">Sync across all<br />your devices.</p>
          </div>

          {/* Hero Content */}
          <div className="hero-content">
            <h1 className="hero-headline">
              <span className="headline-regular">A clearer mind</span>
              <span className="headline-italic">for a brighter you.</span>
            </h1>

            <p className="hero-subheading">
              infimindss helps you capture ideas, organize your thoughts,<br />
              and stay focused — all in one beautiful space.
            </p>

            <div className="hero-cta-group">
              <Link href="/studio" className="btn-primary-cta">
                <span>Start a project free</span>
                <ArrowUpRight size={15} />
              </Link>

              <button type="button" className="btn-video-cta" onClick={() => setIsVideoModalOpen(true)}>
                <span className="video-play-disc" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                    <polygon points="6 4 20 12 6 20 6 4"></polygon>
                  </svg>
                </span>
                <span>Watch showreel</span>
              </button>
            </div>
          </div>

          {/* Centerpiece Visual with 3D Orbiting Halo Ribbon */}
          <div className="hero-centerpiece" id="hero-centerpiece" ref={centerPieceRef}>
            <div className="centerpiece-canvas">
              <img
                src="/assets/hero_man_clean.png"
                alt="Real creator portrait surrounded by orbiting productivity and creative ideas"
                className="center-man-image"
              />

              <div
                className="orbiting-halo-container"
                ref={haloContainerRef}
                title="Drag or swipe to rotate the halo"
                aria-label="Orbiting productivity tools. Drag horizontally to rotate."
              >
                {ORBIT_ITEMS.map((item, index) => {
                  if (item.type === "chip") {
                    return (
                      <div
                        key={item.id}
                        ref={(el) => { itemRefs.current[index] = el; }}
                        className={`halo-chip chip-${item.id}`}
                        onClick={() => handleCardClick(item)}
                        tabIndex={0}
                        role="button"
                        aria-label={`${item.title}: ${item.desc}`}
                      >
                        <span className={`chip-icon ${item.iconClass || ""}`}>
                          {item.icon === "spark" && (
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M9 18h6"></path>
                              <path d="M10 22h4"></path>
                              <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6v1a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-1c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z"></path>
                            </svg>
                          )}
                          {item.icon === "calendar" && (
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                          )}
                          {item.icon === "target" && (
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"></polygon>
                            </svg>
                          )}
                          {item.icon === "flame" && (
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M12 2c0 4-5 6-5 10a7 7 0 0 0 14 0c0-4-5-6-5-10z"></path>
                            </svg>
                          )}
                          {item.icon === "sun" && (
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <circle cx="12" cy="12" r="4"></circle>
                              <line x1="12" y1="2" x2="12" y2="4"></line>
                              <line x1="12" y1="20" x2="12" y2="22"></line>
                              <line x1="2" y1="12" x2="4" y2="12"></line>
                              <line x1="20" y1="12" x2="22" y2="12"></line>
                            </svg>
                          )}
                        </span>
                        <div className="chip-text">
                          <span className="chip-title">{item.title}</span>
                          <span className="chip-desc">{item.desc}</span>
                        </div>
                      </div>
                    );
                  }

                  if (item.type === "image") {
                    return (
                      <div
                        key={item.id}
                        ref={(el) => { itemRefs.current[index] = el; }}
                        className={`halo-chip chip-image chip-${item.id}`}
                        onClick={() => handleCardClick(item)}
                        tabIndex={0}
                        role="button"
                        aria-label={item.badge}
                      >
                        <div className="chip-image-inner">
                          <img src={item.imageSrc} alt={item.imageAlt} />
                          {item.badge && <span className="chip-image-badge">{item.badge}</span>}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={item.id}
                      ref={(el) => { itemRefs.current[index] = el; }}
                      className="halo-chip chip-panel"
                      onClick={() => handleCardClick(item)}
                      aria-hidden="true"
                    >
                      <div className="panel-glimmer"></div>
                    </div>
                  );
                })}
              </div>

              {activeToast && (
                <div className="orbit-toast show" role="status" aria-live="polite">
                  <span className="toast-dot"></span>
                  <span>{activeToast}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Left Proof */}
          <div className="bottom-badge bottom-left-proof">
            <div className="proof-bar" aria-hidden="true"></div>
            <p className="proof-text">Trusted by 50,000+<br />creators worldwide.</p>
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
              <span>Less chaos.</span>
              <span>More clarity.</span>
            </div>
          </div>
        </main>

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
            NEW SECTION 2: Trending on Instagram
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
                Hand-curated viral formats created by real humans. Verified engagement benchmarks.
              </p>
            </div>
            <Link href="/explore" className="btn-video-cta" style={{ fontSize: "0.85rem" }}>
              <span>View all trending reels</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="reels-scroll-row">
            {SEED_REELS.map((reel) => (
              <div
                key={reel.id}
                className="reel-card-916"
                onClick={() => setSelectedReel(reel)}
              >
                {reel.is_seed && <span className="sample-badge">Sample</span>}
                <img src={reel.thumbnail_url || ""} alt="" className="reel-thumb-img" />
                <div className="reel-card-overlay">
                  <div className="reel-top-meta">
                    <span className="ig-badge-pill">
                      <Instagram size={11} /> Reel
                    </span>
                    <span className="reel-views-tag">{reel.views_label} views</span>
                  </div>
                  <div className="reel-bottom-info">
                    <span className="reel-creator-handle">{reel.creator_handle}</span>
                    <p className="reel-caption-text">{reel.caption}</p>
                  </div>
                </div>
              </div>
            ))}
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
              <span className="section-eyebrow" style={{ color: "#0081FB" }}>
                Built for Meta Ads & Reels
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
                style={{ fontSize: "0.85rem" }}
              >
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
                <Link href="/" className="brand-logo" style={{ fontSize: "1.5rem" }}>
                  infimindss<span className="logo-degree">°</span>
                </Link>
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
