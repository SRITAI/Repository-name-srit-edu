"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Sparkles, Film, ArrowUpRight, ShieldAlert } from "lucide-react";
import { SearchResults } from "@/lib/supabase/types";
import { searchSeedData, getMetaAdLibraryLink } from "@/lib/data/seed-data";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  isAdultVerified?: boolean;
}

export default function CommandPalette({
  isOpen,
  onClose,
  isAdultVerified = false,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ categories: [], reels: [], ads: [] });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        // Fetch from API or fallback locally
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
          });
      } else {
        // Default suggestions
        setResults(searchSeedData("", null, isAdultVerified, 6));
      }
      setSelectedIndex(0);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen, isAdultVerified]);

  // Keyboard navigation
  const allItems = [
    ...results.categories.map((c) => ({ type: "category", data: c })),
    ...results.reels.map((r) => ({ type: "reel", data: r })),
    ...results.ads.map((a) => ({ type: "ad", data: a })),
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, allItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % Math.max(1, allItems.length));
    } else if (e.key === "Enter" && allItems[selectedIndex]) {
      e.preventDefault();
      const current = allItems[selectedIndex];
      if (current.type === "category") {
        router.push(`/explore/${(current.data as any).slug}`);
      } else if (current.type === "reel") {
        router.push(`/explore?q=${encodeURIComponent((current.data as any).creator_handle)}`);
      } else if (current.type === "ad") {
        router.push(`/studio?ref=${(current.data as any).id}`);
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cmd-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="cmd-container" onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        {/* Search Input Bar */}
        <div className="cmd-input-row">
          <Search className="cmd-icon" size={19} />
          <input
            ref={inputRef}
            type="text"
            className="cmd-input"
            placeholder="Search categories, reels, or famous ads (e.g. makeup, fashion, derma)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button type="button" className="cmd-clear" onClick={() => setQuery("")}>
              <X size={16} />
            </button>
          )}
          <kbd className="cmd-esc-badge" onClick={onClose}>ESC</kbd>
        </div>

        {/* Results List */}
        <div className="cmd-results">
          {/* Categories */}
          {results.categories.length > 0 && (
            <div className="cmd-group">
              <div className="cmd-group-label">Categories</div>
              <div className="cmd-chips-wrap">
                {results.categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className="cmd-chip"
                    onClick={() => {
                      router.push(`/explore/${cat.slug}`);
                      onClose();
                    }}
                  >
                    <span className="cmd-chip-dot" style={{ backgroundColor: cat.accent_color || "#111" }} />
                    <span>{cat.name}</span>
                    {cat.is_adult && (
                      <span className="cmd-adult-tag">
                        <ShieldAlert size={10} /> 18+
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Reels */}
          {results.reels.length > 0 && (
            <div className="cmd-group">
              <div className="cmd-group-label">Trending Instagram Reels</div>
              <div className="cmd-items-list">
                {results.reels.map((reel) => (
                  <div
                    key={reel.id}
                    className="cmd-item"
                    onClick={() => {
                      router.push(`/explore?q=${encodeURIComponent(reel.creator_handle || "")}`);
                      onClose();
                    }}
                  >
                    <div className="cmd-thumb-box">
                      <img src={reel.thumbnail_url || ""} alt="" className="cmd-thumb" />
                      <span className="cmd-thumb-badge">{reel.views_label}</span>
                    </div>
                    <div className="cmd-item-info">
                      <div className="cmd-item-title">{reel.creator_handle}</div>
                      <div className="cmd-item-desc">{reel.caption}</div>
                    </div>
                    <span className="cmd-action-tag">View Reel ↗</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Famous Ads */}
          {results.ads.length > 0 && (
            <div className="cmd-group">
              <div className="cmd-group-label">Famous Benchmark Ads</div>
              <div className="cmd-items-list">
                {results.ads.map((ad) => (
                  <div
                    key={ad.id}
                    className="cmd-item"
                    onClick={() => {
                      router.push(`/studio?ref=${ad.id}&title=${encodeURIComponent(ad.title)}`);
                      onClose();
                    }}
                  >
                    <div className="cmd-thumb-box">
                      <img src={ad.thumbnail_url || ""} alt="" className="cmd-thumb" />
                      <span className="cmd-thumb-badge">{ad.format}</span>
                    </div>
                    <div className="cmd-item-info">
                      <div className="cmd-item-title">
                        {ad.brand_name} — {ad.title}
                      </div>
                      <div className="cmd-item-hook">Hook: {ad.hook_type}</div>
                    </div>
                    <span className="cmd-action-tag primary">Make Similar ↗</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meta Ad Library Deep Link Bar */}
          {query.trim().length >= 2 && (
            <div className="cmd-meta-row">
              <a
                href={getMetaAdLibraryLink(query)}
                target="_blank"
                rel="noopener noreferrer"
                className="cmd-meta-link"
              >
                <span>See live video ads for &ldquo;{query}&rdquo; on Meta Ad Library</span>
                <ArrowUpRight size={14} />
              </a>
            </div>
          )}

          {/* Empty State */}
          {query.trim().length >= 2 &&
            results.categories.length === 0 &&
            results.reels.length === 0 &&
            results.ads.length === 0 && (
              <div className="cmd-empty">
                <Sparkles size={24} className="cmd-empty-icon" />
                <p>No exact match — try broader keywords like &ldquo;makeup&rdquo;, &ldquo;clothing&rdquo;, or &ldquo;skincare&rdquo;.</p>
                <a
                  href={getMetaAdLibraryLink(query)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary-cta"
                  style={{ display: "inline-flex", marginTop: "12px", fontSize: "0.82rem", padding: "8px 18px" }}
                >
                  <span>Search Meta Ad Library for &ldquo;{query}&rdquo;</span>
                  <ArrowUpRight size={13} />
                </a>
              </div>
            )}
        </div>

        {/* Footer info */}
        <div className="cmd-footer">
          <span>Tip: Use ↑ ↓ to navigate, Enter to select, ESC to exit</span>
          <span>infimindss Video Intelligence</span>
        </div>
      </div>
    </div>
  );
}
