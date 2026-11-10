"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Sparkles,
  ArrowUpRight,
  Loader2,
  Clock,
  TrendingUp,
  Tag,
  Film,
  Instagram,
  CornerDownLeft,
} from "lucide-react";
import { SearchResults } from "@/lib/supabase/types";
import { searchSeedData, SEED_CATEGORIES } from "@/lib/data/seed-data";
import { MEDIA_ITEMS } from "@/lib/media";
import { Badge } from "@/components/ui/Badge";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  isAdultVerified?: boolean;
}

const POPULAR_CHIPS = [
  { label: "Skincare", slug: "skincare", icon: "💧" },
  { label: "Clothing & Fashion", slug: "clothing-fashion", icon: "👕" },
  { label: "Makeup & Beauty", slug: "makeup-beauty", icon: "✨" },
  { label: "Sexual Wellness", slug: "sexual-wellness", icon: "🔞", badge: "18+" },
  { label: "Health Supplements", slug: "health-supplements", icon: "🌿" },
  { label: "Jewellery", slug: "jewellery-accessories", icon: "💎" },
];

export default function CommandPalette({
  isOpen,
  onClose,
  isAdultVerified = false,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ categories: [], reels: [], ads: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("infimindss_recent_searches");
        if (stored) {
          setRecentSearches(JSON.parse(stored).slice(0, 5));
        }
      }
    } catch {}
  }, [isOpen]);

  // Global keyboard shortcuts: ⌘K, Ctrl+K, and '/'
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          window.dispatchEvent(new CustomEvent("open-command-palette"));
        }
      } else if (e.key === "/" && !isInput && !isOpen) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("open-command-palette"));
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isOpen, onClose]);

  // Focus & lock scroll
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setIsLoading(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    try {
      const updated = [term, ...recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("infimindss_recent_searches", JSON.stringify(updated));
    } catch {}
  };

  const removeRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    try {
      const updated = recentSearches.filter((s) => s !== term);
      setRecentSearches(updated);
      localStorage.setItem("infimindss_recent_searches", JSON.stringify(updated));
    } catch {}
  };

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    if (!query.trim()) {
      setResults({ categories: [], reels: [], ads: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        fetch(`/api/search?q=${encodeURIComponent(query)}&include_adult=${isAdultVerified}`)
          .then((r) => r.json())
          .then((data) => {
            if (data && !data.error) {
              setResults(data);
            } else {
              setResults(searchSeedData(query, null, isAdultVerified));
            }
          })
          .catch(() => {
            setResults(searchSeedData(query, null, isAdultVerified));
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        setResults({ categories: [], reels: [], ads: [] });
        setIsLoading(false);
      }
      setSelectedIndex(0);
    }, 180);

    return () => clearTimeout(timer);
  }, [query, isOpen, isAdultVerified]);

  const allItems = [
    ...results.categories.map((c) => ({ type: "category", data: c })),
    ...results.reels.map((r) => ({ type: "reel", data: r })),
    ...results.ads.map((a) => ({ type: "ad", data: a })),
  ];

  const handleSelectItem = (item: (typeof allItems)[0]) => {
    if (query.trim()) saveRecentSearch(query.trim());
    if (item.type === "category") {
      router.push(`/explore/${(item.data as any).slug}`);
    } else if (item.type === "reel") {
      router.push(`/explore?q=${encodeURIComponent((item.data as any).creator_handle)}`);
    } else if (item.type === "ad") {
      router.push(`/studio?ref=${(item.data as any).id}&title=${encodeURIComponent((item.data as any).title)}`);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, allItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % Math.max(1, allItems.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        handleSelectItem(allItems[selectedIndex]);
      } else if (query.trim()) {
        saveRecentSearch(query.trim());
        router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
        onClose();
      }
    }
  };

  const renderHighlighted = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-accent/20 text-accent font-semibold px-0.5 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Universal Search Palette"
    >
      <div
        className={cn(
          "w-full max-w-[680px] rounded-[28px] bg-surface border border-border-strong shadow-[0_24px_80px_rgba(0,0,0,0.85)]",
          "overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 backdrop-blur-3xl"
        )}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Top Input Bar */}
        <div className="flex items-center gap-3.5 px-6 py-4.5 border-b border-border bg-surface-2/40">
          <Search size={18} className="text-accent flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-text text-base font-sans placeholder:text-text-faint focus:outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search categories, reels, benchmark ads..."
            aria-label="Search"
          />
          {isLoading && <Loader2 size={16} className="animate-spin text-accent flex-shrink-0" />}
          {query && !isLoading && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="text-text-faint hover:text-text p-1"
              aria-label="Clear query"
            >
              <X size={16} />
            </button>
          )}
          <kbd className="px-2 py-0.5 rounded-lg bg-surface-3 border border-border text-[10px] font-mono font-bold text-text-muted select-none">
            ESC
          </kbd>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Empty Query State: Popular Categories, Trending, Recent */}
          {!query.trim() && (
            <div className="space-y-6">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-text-muted mb-2.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} className="text-accent" />
                      <span>Recent Searches</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setRecentSearches([]);
                        localStorage.removeItem("infimindss_recent_searches");
                      }}
                      className="text-[10px] text-text-faint hover:text-text underline"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setQuery(term)}
                        className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-2 hover:bg-surface-3 border border-border text-xs text-text transition-colors"
                      >
                        <span>{term}</span>
                        <X
                          size={12}
                          className="text-text-faint group-hover:text-text"
                          onClick={(e) => removeRecentSearch(e, term)}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Categories Chips */}
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-text-muted mb-3 flex items-center gap-1.5">
                  <Tag size={12} className="text-accent" />
                  <span>Popular Categories</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_CHIPS.map((chip) => (
                    <Chip
                      key={chip.slug}
                      icon={<span>{chip.icon}</span>}
                      badge={chip.badge}
                      badgeVariant={chip.badge === "18+" ? "danger" : "default"}
                      onClick={() => {
                        router.push(`/explore/${chip.slug}`);
                        onClose();
                      }}
                    >
                      {chip.label}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Trending Inspiration with 48x64 9:16 Thumbnails */}
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-text-muted mb-3 flex items-center gap-1.5">
                  <TrendingUp size={12} className="text-accent" />
                  <span>Trending Inspiration</span>
                </div>
                <div className="space-y-2">
                  {MEDIA_ITEMS.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        router.push(`/explore/${item.categorySlug}`);
                        onClose();
                      }}
                      className="group p-2.5 rounded-2xl bg-surface-2/60 hover:bg-surface-2 border border-border hover:border-accent/40 flex items-center justify-between cursor-pointer transition-all duration-200"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* 48x64 9:16 Video Thumbnail */}
                        <div className="w-12 h-16 rounded-xl overflow-hidden bg-surface-3 border border-border flex-shrink-0 relative">
                          <img
                            src={item.posterSrc}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-1 left-1 p-0.5 rounded bg-black/60 text-white">
                            <Instagram size={9} className="text-pink-400" />
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="lime" size="sm">
                              {item.category}
                            </Badge>
                            <span className="text-[11px] font-mono text-text-muted">
                              {item.views} views
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-text group-hover:text-white transition-colors truncate">
                            {item.title}
                          </h4>
                          <div className="text-[11px] text-text-faint font-mono mt-0.5">
                            {item.handle}
                          </div>
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-text-muted group-hover:text-accent group-hover:bg-accent/15 transition-all flex-shrink-0 ml-3">
                        <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active Query Grouped Results */}
          {query.trim() && (
            <div className="space-y-6">
              {/* Categories */}
              {results.categories.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-2">
                    Categories ({results.categories.length})
                  </div>
                  <div className="space-y-1">
                    {results.categories.map((cat, idx) => {
                      const isSelected = selectedIndex === idx;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => handleSelectItem({ type: "category", data: cat })}
                          className={cn(
                            "p-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors border",
                            isSelected
                              ? "bg-accent/10 border-accent/40 text-text"
                              : "bg-surface-2/40 border-border hover:bg-surface-2 text-text"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center text-sm flex-shrink-0">
                              {cat.icon || "✦"}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold flex items-center gap-2">
                                <span>{renderHighlighted(cat.name, query)}</span>
                                {cat.is_adult && <Badge variant="danger">18+</Badge>}
                              </div>
                              <div className="text-[11px] text-text-muted truncate">
                                {cat.description}
                              </div>
                            </div>
                          </div>
                          <CornerDownLeft size={13} className="text-text-faint flex-shrink-0 ml-2" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reels */}
              {results.reels.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-2">
                    Trending Reels ({results.reels.length})
                  </div>
                  <div className="space-y-2">
                    {results.reels.map((reel, idx) => {
                      const itemIndex = results.categories.length + idx;
                      const isSelected = selectedIndex === itemIndex;
                      return (
                        <div
                          key={reel.id}
                          onClick={() => handleSelectItem({ type: "reel", data: reel })}
                          className={cn(
                            "p-2.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all border",
                            isSelected
                              ? "bg-accent/10 border-accent/40 text-text"
                              : "bg-surface-2/40 border-border hover:bg-surface-2 text-text"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-16 rounded-xl overflow-hidden bg-surface-3 flex-shrink-0 border border-border">
                              <img
                                src={reel.thumbnail_url || ""}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-text">
                                {renderHighlighted(reel.creator_handle || "@creator", query)}
                              </div>
                              <div className="text-[11px] text-text-muted truncate mt-0.5">
                                {renderHighlighted(reel.caption || "", query)}
                              </div>
                            </div>
                          </div>
                          <Badge variant="violet" size="sm" className="flex-shrink-0 ml-2">
                            {reel.views_label || "Viral"}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ads */}
              {results.ads.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-2">
                    Benchmark Ads ({results.ads.length})
                  </div>
                  <div className="space-y-2">
                    {results.ads.map((ad, idx) => {
                      const itemIndex = results.categories.length + results.reels.length + idx;
                      const isSelected = selectedIndex === itemIndex;
                      return (
                        <div
                          key={ad.id}
                          onClick={() => handleSelectItem({ type: "ad", data: ad })}
                          className={cn(
                            "p-2.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all border",
                            isSelected
                              ? "bg-accent/10 border-accent/40 text-text"
                              : "bg-surface-2/40 border-border hover:bg-surface-2 text-text"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-3 flex-shrink-0 border border-border">
                              <img
                                src={ad.thumbnail_url || ""}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-text truncate">
                                {renderHighlighted(`${ad.brand_name || ""} — ${ad.title}`, query)}
                              </div>
                              <div className="text-[11px] text-text-muted truncate">
                                Hook: {ad.hook_type || "Direct response"}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" size="sm" className="flex-shrink-0 ml-2">
                            {ad.format || "9:16"}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Empty Search Results */}
              {allItems.length === 0 && !isLoading && (
                <div className="py-12 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-text-muted mx-auto">
                    <Search size={18} />
                  </div>
                  <div className="text-sm font-semibold text-text">
                    No results for "{query}"
                  </div>
                  <p className="text-xs text-text-faint max-w-sm mx-auto">
                    Try searching for broader keywords like "skincare", "clothing", or "luxury".
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Bar */}
        <div className="px-6 py-3.5 border-t border-border bg-surface-2/60 flex items-center justify-between text-[11px] text-text-faint">
          <div className="hidden sm:flex items-center gap-3 font-mono">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-3 border border-border text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-3 border border-border text-[10px]">↓</kbd>
              <span>to navigate</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-3 border border-border text-[10px]">↵</kbd>
              <span>to open</span>
            </span>
          </div>

          <Link
            href="/studio"
            onClick={onClose}
            className="text-accent hover:underline flex items-center gap-1 font-medium font-sans ml-auto"
          >
            <span>Start a project in Studio</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
