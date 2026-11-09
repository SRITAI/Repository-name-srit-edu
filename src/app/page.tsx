"use client";

import React, { useEffect, useRef, useState } from "react";

export default function MindlyPage() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const leftCardRef = useRef<HTMLDivElement>(null);
  const rightCardRef = useRef<HTMLDivElement>(null);
  const centerPieceRef = useRef<HTMLDivElement>(null);
  const pathLeftRef = useRef<SVGPathElement>(null);
  const pathRightRef = useRef<SVGPathElement>(null);

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
      const targetLeftY = centerRect.top + centerRect.height * 0.28 - stageRect.top;

      const targetRightX = centerRect.left + centerRect.width * 0.72 - stageRect.left;
      const targetRightY = centerRect.top + centerRect.height * 0.32 - stageRect.top;

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

  return (
    <div className="presentation-wrapper">
      <div className="window-frame">
        {/* Header */}
        <header className="header">
          <a href="#" className="brand-logo" aria-label="Mindly Home">
            Mindly<span className="logo-degree">°</span>
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
              Mindly helps you capture ideas, organize your thoughts,<br />
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

          {/* Centerpiece Visual */}
          <div className="hero-centerpiece" id="hero-centerpiece" ref={centerPieceRef}>
            <div className="centerpiece-canvas">
              <img src="/assets/hero_center_hd.png" alt="A focused mind surrounded by orbiting ideas, focus, and plan cards" className="center-man-image" />
              <div className="orbiting-halo-container" aria-hidden="true">
                <div className="halo-chip chip-focus">
                  <span className="chip-icon lime">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"></polygon>
                    </svg>
                  </span>
                  <div className="chip-text">
                    <span className="chip-title">Focus</span>
                    <span className="chip-desc">Deep work, bigger results</span>
                  </div>
                </div>

                <div className="halo-chip chip-ideas">
                  <span className="chip-icon purple">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 18h6"></path>
                      <path d="M10 22h4"></path>
                      <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6v1a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-1c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z"></path>
                    </svg>
                  </span>
                  <div className="chip-text">
                    <span className="chip-title">Ideas</span>
                    <span className="chip-desc">Capture everything</span>
                  </div>
                </div>

                <div className="halo-chip chip-plan">
                  <span className="chip-icon orange">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </span>
                  <div className="chip-text">
                    <span className="chip-title">Plan</span>
                    <span className="chip-desc">Turn ideas into action</span>
                  </div>
                </div>
              </div>
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
        <dialog className="video-modal" open aria-label="Mindly Product Overview">
          <div className="modal-card">
            <button type="button" className="modal-close" onClick={() => setIsVideoModalOpen(false)} aria-label="Close modal">
              ✕
            </button>
            <div className="video-preview-header">
              <h3>Experience Mindly</h3>
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
