"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
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
    { label: "Ad Explorer", href: "/ad-explorer", id: "ad-explorer" },
    { label: "How it works", href: "/#how-it-works", id: "how-it-works" },
    { label: "Explore", href: "/explore", id: "explore" },
    { label: "Studio", href: "/studio", id: "studio", isStudio: true },
    { label: "Pricing", href: "/#pricing", id: "pricing" },
  ];

  return (
    <>
      <header
        className={cn(
          "sticky top-4 z-40 mx-auto w-full max-w-[1100px] transition-all duration-300 px-4 sm:px-6"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-full transition-all duration-300",
            "bg-surface/70 backdrop-blur-2xl border border-border",
            isScrolled
              ? "shadow-[0_16px_40px_-12px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.06)] bg-surface/90"
              : "shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)]"
          )}
        >
          {/* Brand Wordmark with signature degree */}
          <Link
            href="/"
            className="flex items-center gap-1 text-base sm:text-lg font-bold font-sans tracking-tight text-text hover:text-white transition-colors"
          >
            <span>infimindss</span>
            <span className="text-accent font-serif text-sm -mt-2">°</span>
          </Link>

          {/* Desktop Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-surface-2/60 border border-border/60">
            {navLinks.map((link) => {
              const isActive = activeRoute === link.id;
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={link.isStudio ? handleStudioClick : undefined}
                  className={cn(
                    "relative px-4 py-1.5 rounded-full text-xs font-sans font-medium transition-all duration-200 select-none",
                    isActive
                      ? "text-accent bg-surface-3 font-semibold shadow-sm border border-border"
                      : "text-text-muted hover:text-text hover:bg-surface-3/50"
                  )}
                >
                  <span>{link.label}</span>
                  {link.isStudio && !hasVisitedStudio && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-accent text-accent-ink text-[9px] font-mono font-bold tracking-tight">
                      ✦ NEW
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-2.5">
            {/* Search Pill Button */}
            <button
              type="button"
              onClick={onOpenSearch}
              className={cn(
                "h-10 px-3.5 rounded-full bg-surface-2/80 border border-border hover:border-border-strong hover:bg-surface-3",
                "text-text-muted hover:text-text transition-all duration-200 flex items-center gap-2 text-xs font-sans",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              )}
              title={`Search (${platformKey}) or press /`}
            >
              <Search size={15} className="text-text-muted group-hover:text-accent transition-colors" />
              <span className="hidden sm:inline font-medium">Search</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-surface-3 text-[10px] font-mono text-text-faint border border-border">
                {platformKey}
              </kbd>
            </button>

            {/* Start a project primary lime CTA */}
            <Button
              href="/studio"
              variant="primary"
              size="sm"
              withArrow
              className="hidden sm:inline-flex"
            >
              Start a project
            </Button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden w-10 h-10 rounded-full bg-surface-2 border border-border flex items-center justify-center text-text hover:text-white"
              aria-label="Open navigation drawer"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Full screen slide-over) */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200 md:hidden flex flex-col justify-between p-4 sm:p-6 overflow-y-auto"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div className="space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3.5 border-b border-border">
              <Link href="/" className="text-xl font-bold font-sans text-text">
                infimindss<span className="text-accent font-serif">°</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="w-10 h-10 rounded-full bg-surface-2 border border-border flex items-center justify-center text-text hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Button in Mobile Menu */}
            <button
              type="button"
              onClick={() => {
                setMobileDrawerOpen(false);
                onOpenSearch();
              }}
              className="w-full h-12 px-4 rounded-2xl bg-surface-2 border border-border text-left flex items-center justify-between text-sm text-text-muted hover:border-accent/40 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Search size={16} className="text-accent" />
                <span>Search categories, reels, ads...</span>
              </div>
              <kbd className="px-2 py-0.5 rounded bg-surface-3 text-xs font-mono">{platformKey}</kbd>
            </button>

            {/* Navigation Links */}
            <div className="space-y-1.5 pt-1">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={() => {
                    if (link.isStudio) handleStudioClick();
                    setMobileDrawerOpen(false);
                  }}
                  className="block px-4 py-3 rounded-2xl text-base font-semibold text-text hover:text-accent hover:bg-surface-2 transition-colors active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between">
                    <span>{link.label}</span>
                    {link.isStudio && !hasVisitedStudio && (
                      <Badge variant="lime">✦ NEW</Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Drawer Bottom CTA */}
          <div className="pt-5 border-t border-border space-y-3 mt-6" onClick={(e) => e.stopPropagation()}>
            <Button
              href="/studio"
              variant="primary"
              size="lg"
              withArrow
              className="w-full h-12 text-sm justify-center"
              onClick={() => setMobileDrawerOpen(false)}
            >
              Start a project ↗
            </Button>
            <p className="text-center text-[11px] text-text-faint font-mono">
              Real humans on camera • AI-fast delivery • 0 robotic faces
            </p>
          </div>
        </div>
      )}
    </>
  );
}
