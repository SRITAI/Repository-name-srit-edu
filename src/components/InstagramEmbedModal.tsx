"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowUpRight, Sparkles } from "lucide-react";
import { TrendingReel } from "@/lib/supabase/types";
import { PlatformIcon } from "@/components/ad-explorer/PlatformIcon";

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
            <span className="ig-glyph-badge flex items-center justify-center">
              <PlatformIcon platform="instagram" size={14} />
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
