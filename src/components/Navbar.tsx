"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Menu, X, ArrowUpRight } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

interface NavbarProps {
  activeRoute?: "home" | "explore" | "studio" | "projects" | "ad-explorer";
  onOpenSearch: () => void;
}

export default function Navbar({ activeRoute = "home", onOpenSearch }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasVisitedStudio, setHasVisitedStudio] = useState(true);
  const [platformKey, setPlatformKey] = useState("⌘K");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isMac = navigator.userAgent.toUpperCase().indexOf("MAC") >= 0;
      setPlatformKey(isMac ? "⌘K" : "Ctrl K");

      try {
        const visited = localStorage.getItem("infimindss_visited_studio");
        if (!visited) setHasVisitedStudio(false);
      } catch {}
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll and handle Escape key when mobile drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileDrawerOpen) {
        setMobileDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileDrawerOpen]);

  const handleStudioClick = () => {
    try {
      localStorage.setItem("infimindss_visited_studio", "true");
      setHasVisitedStudio(true);
    } catch {}
  };

  const navLinks = [
    { label: "Home", href: "/", id: "home" },
    { label: "Trending Reels", href: "/#trending-reels", id: "trending-reels" },
    { label: "Capabilities", href: "/#capabilities", id: "capabilities" },
    { label: "How it works", href: "/#how-it-works", id: "how-it-works" },
    { label: "Pricing", href: "/#pricing", id: "pricing" },
    { label: "Studio", href: "/studio", id: "studio", isStudio: true },
  ];

  return (
    <>
      <header
        className={cn(
          "sticky top-3.5 z-40 mx-auto w-full max-w-[1100px] transition-all duration-300 px-3 sm:px-6"
        )}
      >
        {/* Refined Translucent Glass Panel */}
        <div
          className={cn(
            "navbar-glass-panel flex items-center justify-between px-3.5 sm:px-5 py-2 rounded-full",
            isScrolled && "is-scrolled"
          )}
        >
          {/* Mind-Inspired Bespoke Brand Logo (Clickable Home Link) */}
          <div className="flex items-center shrink-0">
            <BrandLogo size="md" />
          </div>

          {/* Desktop Center Navigation Links (Visible on lg: ≥ 1024px) */}
          <nav
            className="hidden lg:flex items-center gap-0.5 p-1 rounded-full bg-[#302E29]/[0.03] border border-[#302E29]/[0.06]"
            aria-label="Main Navigation"
          >
            {navLinks.map((link) => {
              const isActive = activeRoute === link.id;
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={link.isStudio ? handleStudioClick : undefined}
                  className={cn(
                    "relative px-3.5 py-1.5 rounded-full text-xs font-sans font-medium transition-all duration-200 select-none whitespace-nowrap",
                    isActive
                      ? "text-[#C86446] bg-[#FFFCF5] font-semibold shadow-sm border border-[#302E29]/10"
                      : "text-[#716C63] hover:text-[#302E29] hover:bg-[#FFFCF5]/60"
                  )}
                >
                  <span>{link.label}</span>
                  {link.isStudio && !hasVisitedStudio && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-[#C86446] text-white text-[9px] font-mono font-bold tracking-tight">
                      ✦ NEW
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Search Pill Button */}
            <button
              type="button"
              onClick={onOpenSearch}
              className={cn(
                "h-9 px-2.5 sm:px-3 rounded-full bg-[#302E29]/[0.03] border border-[#302E29]/[0.08] hover:border-[#C86446]/40 hover:bg-[#FFFCF5]",
                "text-[#716C63] hover:text-[#302E29] transition-all duration-200 flex items-center gap-2 text-xs font-sans shrink-0",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C86446]"
              )}
              title={`Search (${platformKey}) or press /`}
              aria-label="Search short-form ads and viral hooks"
            >
              <Search size={14} className="text-[#716C63]" />
              <span className="hidden sm:inline font-medium">Search</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-[#302E29]/5 text-[10px] font-mono text-[#716C63] border border-[#302E29]/10">
                {platformKey}
              </kbd>
            </button>

            {/* "Start a project" CTA (Fixed sizing, single line, no wrapping or clipping) */}
            <Link
              href="/studio"
              className={cn(
                "hidden sm:inline-flex items-center justify-center gap-2 h-9 px-4 rounded-full",
                "bg-[#C86446] text-white font-medium text-xs tracking-tight",
                "shadow-[0_2px_8px_rgba(200,100,70,0.25)] hover:shadow-[0_4px_16px_rgba(200,100,70,0.35)]",
                "hover:bg-[#B55539] active:scale-[0.98] transition-all duration-200 shrink-0 whitespace-nowrap select-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C86446] focus-visible:ring-offset-2"
              )}
              aria-label="Start a video project"
            >
              <span>Start a project</span>
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <ArrowUpRight size={11} className="text-white" />
              </span>
            </Link>

            {/* Mobile / Tablet Menu Toggle Button (Visible on < lg: < 1024px) */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden w-9 h-9 rounded-full bg-[#302E29]/[0.04] border border-[#302E29]/[0.08] flex items-center justify-center text-[#302E29] hover:text-[#C86446] hover:border-[#C86446]/40 transition-colors shrink-0"
              aria-expanded={mobileDrawerOpen}
              aria-controls="mobile-navigation-drawer"
              aria-label="Open navigation menu"
            >
              <Menu size={17} />
            </button>
          </div>
        </div>
      </header>

      {/* Accessible Mobile & Tablet Navigation Drawer */}
      {mobileDrawerOpen && (
        <div
          id="mobile-navigation-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="fixed inset-0 z-50 bg-[#F6F1E7]/98 backdrop-blur-2xl animate-in fade-in duration-200 lg:hidden flex flex-col justify-between p-4 sm:p-6 overflow-y-auto text-[#302E29]"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div className="space-y-5" onClick={(e) => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#302E29]/10">
              <BrandLogo size="md" />
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="w-9 h-9 rounded-full bg-[#302E29]/5 border border-[#302E29]/10 flex items-center justify-center text-[#302E29] hover:text-[#C86446] transition-colors"
                aria-label="Close navigation menu"
              >
                <X size={17} />
              </button>
            </div>

            {/* Search Button in Mobile Menu */}
            <button
              type="button"
              onClick={() => {
                setMobileDrawerOpen(false);
                onOpenSearch();
              }}
              className="w-full h-11 px-4 rounded-2xl bg-[#FFFCF5] border border-[#302E29]/12 text-left flex items-center justify-between text-xs sm:text-sm text-[#716C63] hover:border-[#C86446]/40 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Search size={15} className="text-[#C86446]" />
                <span>Search categories, reels, ads...</span>
              </div>
              <kbd className="px-2 py-0.5 rounded bg-[#302E29]/5 text-[11px] font-mono">{platformKey}</kbd>
            </button>

            {/* Navigation Links */}
            <nav className="space-y-1.5 pt-1" aria-label="Mobile Navigation Links">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={() => {
                    if (link.isStudio) handleStudioClick();
                    setMobileDrawerOpen(false);
                  }}
                  className="block px-4 py-3 rounded-2xl text-base font-semibold text-[#302E29] hover:text-[#C86446] hover:bg-[#FFFCF5] transition-colors active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between">
                    <span>{link.label}</span>
                    {link.isStudio && !hasVisitedStudio && (
                      <span className="px-2 py-0.5 rounded-full bg-[#C86446] text-white text-[10px] font-mono font-bold">
                        ✦ NEW
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </nav>
          </div>

          {/* Drawer Bottom CTA */}
          <div className="pt-5 border-t border-[#302E29]/10 space-y-3 mt-6" onClick={(e) => e.stopPropagation()}>
            <Link
              href="/studio"
              onClick={() => setMobileDrawerOpen(false)}
              className="w-full h-12 rounded-2xl bg-[#C86446] hover:bg-[#B55539] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors active:scale-[0.99]"
            >
              <span>Start a video project</span>
              <ArrowUpRight size={16} />
            </Link>
            <p className="text-center text-[11px] text-[#716C63] font-mono">
              Real human creators • AI-fast delivery • 0 robotic faces
            </p>
          </div>
        </div>
      )}
    </>
  );
}
