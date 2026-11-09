"use client";

import React, { useEffect, useRef, useState } from "react";

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
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const leftCardRef = useRef<HTMLDivElement>(null);
  const rightCardRef = useRef<HTMLDivElement>(null);
  const centerPieceRef = useRef<HTMLDivElement>(null);
  const haloContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pathLeftRef = useRef<SVGPathElement>(null);
  const pathRightRef = useRef<SVGPathElement>(null);

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

      // Orbit radii
      const rx = isMobile ? Math.min(160, width * 0.42) : Math.min(240, width * 0.45);
      const ry = rx * 0.32;
      const cx = width / 2;
      const cy = height * 0.38;
      const tiltAngle = -0.11; // -6.3 degrees tilt matching reference

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
        const z = sinA; // -1 to +1

        const rotY = -cosA * 32;
        const rotZ = rotY * 0.12;

        if (z >= -0.15) {
          // FRONT HALF: Passes in front of the man's head (z-index 20-35)
          const scale = isMobile ? 0.88 + z * 0.14 : 0.96 + z * 0.16;
          const zIndex = Math.round(20 + z * 15);
          el.style.transform = `translate3d(${cx + x}px, ${cy + y}px, 0px) translate(-50%, -50%) rotateY(${rotY.toFixed(1)}deg) rotateZ(${rotZ.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
          el.style.zIndex = String(zIndex);
          el.style.opacity = "1";
          el.style.filter = "none";
        } else {
          // BACK HALF: Passes behind the man's head (z-index 4-8, man is at 12)
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
        velocity *= 0.94; // friction damping
      }
      updateTransforms();
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    // Pointer event listeners for dragging & hovering
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

  return (
    <div className="presentation-wrapper">
      <div className="window-frame">
        {/* Header */}
        <header className="header">
          <a href="#" className="brand-logo" aria-label="infimindss Home">
            infimindss<span className="logo-degree">°</span>
          </a>

          <nav className="nav-pill" aria-label="Main Navigation">
            <a href="#features" className="nav-item">Features</a>
            <a href="#how-it-works" className="nav-item">How it works</a>
            <a href="#integrations" className="nav-item active">Integrations</a>
            <a href="#pricing" className="nav-item">Pricing</a>
          </nav>

          <div className="header-right">
            <a href="#download" className="btn-get-app">
              <span>Get the app</span>
              <svg className="arrow-up-right" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg>
            </a>
          </div>
        </header>

        {/* Hero Stage */}
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
              <a href="#get-started" className="btn-primary-cta">
                <span>Get started free</span>
                <svg className="arrow-right" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>

              <button type="button" className="btn-video-cta" onClick={() => setIsVideoModalOpen(true)}>
                <span className="video-play-disc" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                    <polygon points="6 4 20 12 6 20 6 4"></polygon>
                  </svg>
                </span>
                <span>Watch video</span>
              </button>
            </div>
          </div>

          {/* Centerpiece Visual with Dynamic 3D Rotating Orbit */}
          <div className="hero-centerpiece" id="hero-centerpiece" ref={centerPieceRef}>
            <div className="centerpiece-canvas">
              {/* Clean Portrait of the Man */}
              <img
                src="/assets/hero_man_clean.png"
                alt="A focused mind surrounded by orbiting ideas, focus, and plan cards"
                className="center-man-image"
              />

              {/* 3D Orbiting Carousel Ribbon */}
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

                  // Translucent Curved Glass Spacer Panel
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

              {/* Interactive notification toast on click */}
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
      </div>

      {/* Video Modal */}
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
    </div>
  );
}
