"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ArrowUpRight, Menu, X, Sparkles, FolderGit2 } from "lucide-react";

interface NavbarProps {
  activeRoute?: "home" | "explore" | "studio" | "projects";
  onOpenSearch: () => void;
}

export default function Navbar({ activeRoute = "home", onOpenSearch }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasVisitedStudio, setHasVisitedStudio] = useState(true);
  const [platformKey, setPlatformKey] = useState("⌘K");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    // Detect OS for shortcut hint (Mac: ⌘K, Windows/Linux: Ctrl K)
    if (typeof window !== "undefined") {
      const isMac = navigator.userAgent.toUpperCase().indexOf("MAC") >= 0;
      setPlatformKey(isMac ? "⌘ K" : "Ctrl K");

      // Check if user has visited studio before
      try {
        const visited = localStorage.getItem("infimindss_visited_studio");
        if (!visited) {
          setHasVisitedStudio(false);
        }
      } catch {}
    }

    // Scroll listener for sticky navbar blur
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleStudioClick = () => {
    try {
      localStorage.setItem("infimindss_visited_studio", "true");
      setHasVisitedStudio(true);
    } catch {}
  };

  return (
    <>
      <header className={`header ${isScrolled ? "header-sticky" : ""}`}>
        {/* Brand Logo */}
        <Link href="/" className="brand-logo" aria-label="infimindss Home">
          infimindss<span className="logo-degree">°</span>
        </Link>

        {/* Center Pill Navigation (Desktop) */}
        <nav className="nav-pill hidden-mobile" aria-label="Main Navigation">
          <Link href="/" className={`nav-item ${activeRoute === "home" ? "active" : ""}`}>
            Home
          </Link>
          <a href="/#how-it-works" className="nav-item">
            How it works
          </a>
          <Link href="/explore" className={`nav-item ${activeRoute === "explore" ? "active" : ""}`}>
            Explore
          </Link>
          <Link
            href="/studio"
            onClick={handleStudioClick}
            className={`nav-item ${activeRoute === "studio" ? "active" : ""}`}
            style={{ position: "relative" }}
          >
            <span>Studio</span>
            {!hasVisitedStudio && (
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-2px",
                  background: "#10B981",
                  color: "#FFFFFF",
                  fontSize: "0.58rem",
                  fontWeight: 700,
                  padding: "1px 5px",
                  borderRadius: "9999px",
                  lineHeight: 1.2,
                  boxShadow: "0 2px 6px rgba(16, 185, 129, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  gap: "2px",
                }}
              >
                ✦ New
              </span>
            )}
          </Link>
          <a href="/#pricing" className="nav-item">
            Pricing
          </a>
        </nav>

        {/* Right Action Items */}
        <div className="header-right" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Search Button (Task B2) */}
          <button
            type="button"
            className="btn-search-pill"
            onClick={onOpenSearch}
            title={`Search (${platformKey}) or press /`}
            aria-label="Open command search"
          >
            <Search className="search-icon" size={16} />
            <span className="search-btn-label hidden-mobile" style={{ fontSize: "0.85rem", fontWeight: 500 }}>
              Search
            </span>
            <span className="search-kbd-chip hidden-mobile">{platformKey}</span>
          </button>

          {/* Start a project ↗ Button (Task B1) */}
          <Link
            href="/studio"
            onClick={handleStudioClick}
            className="btn-start-project hidden-mobile"
            aria-label="Start a project in Studio"
          >
            <span>Start a project</span>
            <span className="btn-arrow-circle" aria-hidden="true">
              <ArrowUpRight size={13} className="btn-arrow-icon primary" />
              <ArrowUpRight size={13} className="btn-arrow-icon clone" />
            </span>
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="mobile-hamburger-btn mobile-only"
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            aria-label={mobileDrawerOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileDrawerOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Slide-over */}
      {mobileDrawerOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setMobileDrawerOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 999,
          }}
        >
          <div
            className="mobile-drawer-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: "82%",
              maxWidth: "340px",
              background: "#FAF9F6",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "-10px 0 30px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
              <span className="brand-logo" style={{ fontSize: "1.2rem" }}>
                infimindss<span className="logo-degree">°</span>
              </span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                style={{ background: "none", border: "none", padding: "6px", cursor: "pointer", color: "#111111" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Search Button */}
            <button
              type="button"
              className="btn-search-pill"
              onClick={() => {
                setMobileDrawerOpen(false);
                onOpenSearch();
              }}
              style={{ width: "100%", justifyContent: "space-between", marginBottom: "24px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Search size={16} color="#71717A" />
                <span style={{ fontSize: "0.85rem", color: "#71717A" }}>Search reels, ads, categories...</span>
              </div>
              <span className="search-kbd-chip">{platformKey}</span>
            </button>

            {/* Mobile Nav Links */}
            <nav style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
              <Link
                href="/"
                onClick={() => setMobileDrawerOpen(false)}
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#111111",
                  textDecoration: "none",
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                Home
              </Link>
              <Link
                href="/explore"
                onClick={() => setMobileDrawerOpen(false)}
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#111111",
                  textDecoration: "none",
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                Explore Inspiration Hub
              </Link>
              <Link
                href="/studio"
                onClick={() => {
                  handleStudioClick();
                  setMobileDrawerOpen(false);
                }}
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#111111",
                  textDecoration: "none",
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(0,0,0,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>Studio Chamber</span>
                <span style={{ background: "#10B981", color: "#FFF", fontSize: "0.65rem", padding: "2px 8px", borderRadius: "999px" }}>
                  ✦ New
                </span>
              </Link>
              <Link
                href="/studio/projects"
                onClick={() => setMobileDrawerOpen(false)}
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#111111",
                  textDecoration: "none",
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                My Projects
              </Link>
              <a
                href="/#how-it-works"
                onClick={() => setMobileDrawerOpen(false)}
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#71717A",
                  textDecoration: "none",
                  padding: "8px 0",
                }}
              >
                How it works
              </a>
              <a
                href="/#pricing"
                onClick={() => setMobileDrawerOpen(false)}
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#71717A",
                  textDecoration: "none",
                  padding: "8px 0",
                }}
              >
                Pricing
              </a>
            </nav>

            {/* Mobile Bottom CTA */}
            <div style={{ paddingTop: "20px" }}>
              <Link
                href="/studio"
                onClick={() => {
                  handleStudioClick();
                  setMobileDrawerOpen(false);
                }}
                className="btn-start-project"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <span>Start a project free</span>
                <span className="btn-arrow-circle" aria-hidden="true">
                  <ArrowUpRight size={13} className="btn-arrow-icon primary" />
                  <ArrowUpRight size={13} className="btn-arrow-icon clone" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
