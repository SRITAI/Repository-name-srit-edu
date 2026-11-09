"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Sparkles,
  Film,
  ArrowUpRight,
  ShieldAlert,
  Loader2,
  Clock,
  TrendingUp,
  Tag,
  CornerDownLeft,
} from "lucide-react";
import { SearchResults } from "@/lib/supabase/types";
import { searchSeedData } from "@/lib/data/seed-data";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  isAdultVerified?: boolean;
}

const POPULAR_CHIPS = [
  { label: "Skincare", slug: "skincare" },
  { label: "Clothing & Fashion", slug: "clothing-fashion" },
  { label: "Makeup & Beauty", slug: "makeup-beauty" },
  { label: "Sexual Wellness (18+)", slug: "sexual-wellness" },
  { label: "Health Supplements", slug: "health-supplements" },
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
      // Don't trigger if user is typing in another input/textarea
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open palette
          const event = new CustomEvent("open-command-palette");
          window.dispatchEvent(event);
        }
      } else if (e.key === "/" && !isInput && !isOpen) {
        e.preventDefault();
        const event = new CustomEvent("open-command-palette");
        window.dispatchEvent(event);
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
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen, isAdultVerified]);

  // Flattened items for keyboard navigation
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

  // Highlight matching text helper
  const renderHighlighted = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-amber-100 text-amber-950 font-semibold rounded px-0.5">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div className="cmd-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Search Palette">
      <div className="cmd-container" onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        {/* Search Input Row */}
        <div className="cmd-input-row">
          <Search size={18} color="#71717A" />
          <input
            ref={inputRef}
            type="text"
            className="cmd-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search categories, reels, ads..."
            aria-label="Search"
          />
          {isLoading && <Loader2 size={16} className="animate-spin text-neutral-400" />}
          {query && !isLoading && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="text-neutral-400 hover:text-neutral-700 p-1"
              aria-label="Clear search query"
            >
              <X size={16} />
            </button>
          )}
          <span className="cmd-esc-badge" onClick={onClose}>
            ESC
          </span>
        </div>

        {/* Results / Default State Area */}
        <div className="cmd-results">
          {/* Default state when query is empty */}
          {!query.trim() && (
            <div className="space-y-6">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] mb-2 flex items-center gap-1.5">
                    <Clock size={12} />
                    <span>Recent Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setQuery(term)}
                        className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-xs text-[#111111] transition-colors"
                      >
                        <span>{term}</span>
                        <X
                          size={12}
                          className="text-neutral-400 group-hover:text-neutral-700"
                          onClick={(e) => removeRecentSearch(e, term)}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Categories */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] mb-2 flex items-center gap-1.5">
                  <Tag size={12} />
                  <span>Popular Categories</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_CHIPS.map((chip) => (
                    <button
                      key={chip.slug}
                      type="button"
                      onClick={() => {
                        router.push(`/explore/${chip.slug}`);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-full border border-black/10 hover:border-black/25 bg-white text-xs text-[#111111] font-medium transition-colors"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trending Now Quick Suggestions */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] mb-2 flex items-center gap-1.5">
                  <TrendingUp size={12} />
                  <span>Trending Inspiration</span>
                </div>
                <div className="space-y-1">
                  <div
                    onClick={() => {
                      router.push("/explore/skincare");
                      onClose();
                    }}
                    className="p-2.5 rounded-xl hover:bg-neutral-100 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-xs font-bold">
                        UV
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#111111]">Under-UV camera sunscreen wear test</div>
                        <div className="text-[11px] text-[#71717A]">Skincare & Derma · 3.1M views</div>
                      </div>
                    </div>
                    <ArrowUpRight size={14} className="text-neutral-400" />
                  </div>

                  <div
                    onClick={() => {
                      router.push("/explore/clothing-fashion");
                      onClose();
                    }}
                    className="p-2.5 rounded-xl hover:bg-neutral-100 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-xs font-bold">
                        9:16
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#111111]">Oversized linen blazer: 4 styling transitions</div>
                        <div className="text-[11px] text-[#71717A]">Clothing & Fashion · 2.8M views</div>
                      </div>
                    </div>
                    <ArrowUpRight size={14} className="text-neutral-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Search Results */}
          {query.trim() && (
            <>
              {/* Categories Group */}
              {results.categories.length > 0 && (
                <div>
                  <div className="cmd-group-label">Categories ({results.categories.length})</div>
                  <div className="space-y-1">
                    {results.categories.map((cat, idx) => {
                      const isSelected = selectedIndex === idx;
                      return (
                        <div
                          key={cat.id}
                          className={`cmd-item ${isSelected ? "selected" : ""}`}
                          onClick={() => handleSelectItem({ type: "category", data: cat })}
                        >
                          <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-sm flex-shrink-0">
                            {cat.icon || "✦"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-[#111111] flex items-center gap-2">
                              <span>{renderHighlighted(cat.name, query)}</span>
                              {cat.is_adult && (
                                <span className="text-[9px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded font-semibold">
                                  18+
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#71717A] truncate">{cat.description}</div>
                          </div>
                          <CornerDownLeft size={13} className="text-neutral-400 flex-shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reels Group */}
              {results.reels.length > 0 && (
                <div>
                  <div className="cmd-group-label">Trending Reels ({results.reels.length})</div>
                  <div className="space-y-1">
                    {results.reels.map((reel, idx) => {
                      const itemIndex = results.categories.length + idx;
                      const isSelected = selectedIndex === itemIndex;
                      return (
                        <div
                          key={reel.id}
                          className={`cmd-item ${isSelected ? "selected" : ""}`}
                          onClick={() => handleSelectItem({ type: "reel", data: reel })}
                        >
                          <img
                            src={reel.thumbnail_url || ""}
                            alt=""
                            className="w-8 h-12 rounded object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-[#111111]">
                              {renderHighlighted(reel.creator_handle || "@creator", query)}
                            </div>
                            <div className="text-[11px] text-[#71717A] truncate">
                              {renderHighlighted(reel.caption || "", query)}
                            </div>
                          </div>
                          <span className="text-[10px] text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                            {reel.views_label || "Viral"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Famous Ads Group */}
              {results.ads.length > 0 && (
                <div>
                  <div className="cmd-group-label">Benchmark Ads ({results.ads.length})</div>
                  <div className="space-y-1">
                    {results.ads.map((ad, idx) => {
                      const itemIndex = results.categories.length + results.reels.length + idx;
                      const isSelected = selectedIndex === itemIndex;
                      return (
                        <div
                          key={ad.id}
                          className={`cmd-item ${isSelected ? "selected" : ""}`}
                          onClick={() => handleSelectItem({ type: "ad", data: ad })}
                        >
                          <img
                            src={ad.thumbnail_url || ""}
                            alt=""
                            className="w-10 h-10 rounded object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-[#111111]">
                              {renderHighlighted(`${ad.brand_name || ""} — ${ad.title}`, query)}
                            </div>
                            <div className="text-[11px] text-[#71717A] truncate">
                              Hook: {ad.hook_type || "Direct response"}
                            </div>
                          </div>
                          <span className="text-[10px] bg-neutral-100 text-[#111111] px-2 py-0.5 rounded font-mono flex-shrink-0">
                            {ad.format || "9:16"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {allItems.length === 0 && !isLoading && (
                <div className="py-8 text-center">
                  <div className="text-sm font-semibold text-[#111111] mb-1">
                    No results found for "{query}"
                  </div>
                  <p className="text-xs text-[#71717A] mb-4">
                    Try searching for broader keywords like "skincare", "clothing", or "luxury".
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {POPULAR_CHIPS.map((chip) => (
                      <button
                        key={chip.slug}
                        type="button"
                        onClick={() => setQuery(chip.label)}
                        className="px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-[11px] text-[#111111]"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer with key hints & direct Start a project shortcut */}
        <div className="cmd-footer" style={{ borderTop: "1px solid rgba(0,0,0,0.06)", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FFFFFF" }}>
          <div className="hidden sm:flex items-center gap-4 text-[11px] text-[#71717A]">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-neutral-100 border border-black/10 rounded font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-neutral-100 border border-black/10 rounded font-mono text-[10px]">↓</kbd>
              <span>to move</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-neutral-100 border border-black/10 rounded font-mono text-[10px]">↵</kbd>
              <span>to select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-neutral-100 border border-black/10 rounded font-mono text-[10px]">esc</kbd>
              <span>to close</span>
            </span>
          </div>

          <Link
            href="/studio"
            onClick={onClose}
            className="text-xs font-semibold text-[#111111] hover:underline flex items-center gap-1 ml-auto"
          >
            <span>Start a project in Studio</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
