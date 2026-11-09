"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowUpRight, Sparkles } from "lucide-react";
import { TrendingReel } from "@/lib/supabase/types";

interface InstagramEmbedModalProps {
  reel: TrendingReel | null;
  onClose: () => void;
}

export default function InstagramEmbedModal({ reel, onClose }: InstagramEmbedModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (reel) {
      document.body.style.overflow = "hidden";

      // Dynamically load Instagram embed script if not present
      if (!(window as any).instgrm) {
        const script = document.createElement("script");
        script.src = "https://www.instagram.com/embed.js";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      } else {
        (window as any).instgrm?.Embeds?.process();
      }
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [reel]);

  if (!reel) return null;

  const handleMakeSimilar = () => {
    router.push(`/studio?ref=${encodeURIComponent(reel.id)}&category=${encodeURIComponent(reel.category?.slug || "")}`);
    onClose();
  };

  return (
    <div className="video-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="reel-modal-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={16} />
        </button>

        <div className="reel-modal-header">
          <div className="reel-author-badge">
            <span className="ig-glyph-badge">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </span>
            <span className="reel-handle">{reel.creator_handle}</span>
            <span className="views-pill">{reel.views_label} views</span>
          </div>
        </div>

        {/* Embedded Content preview */}
        <div className="reel-embed-stage">
          <div className="reel-preview-media">
            <img src={reel.thumbnail_url || ""} alt="" className="reel-preview-img" />
            <div className="reel-media-overlay">
              <p className="reel-overlay-caption">&ldquo;{reel.caption}&rdquo;</p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="reel-modal-actions">
          <a
            href={reel.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-video-cta"
            style={{ fontSize: "0.85rem" }}
          >
            <span>Open on Instagram</span>
            <ArrowUpRight size={14} />
          </a>
          <button type="button" className="btn-primary-cta" onClick={handleMakeSimilar}>
            <Sparkles size={14} />
            <span>Make something like this ↗</span>
          </button>
        </div>

        <div className="reel-modal-footer">
          <span>Reels belong to their creators. Shown via official Instagram embed metadata.</span>
        </div>
      </div>
    </div>
  );
}
