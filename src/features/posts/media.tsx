"use client";
import { useEffect, useState } from "react";
import { Modal, Icon } from "@/components/ui";
import type { Media } from "@/lib/types";
import { ReportDialog } from "../app/safety";
export function MediaGallery({
  items,
  compact = false,
}: {
  items: Media[];
  compact?: boolean;
}) {
  const [active, setActive] = useState<number | null>(null);
  const [report, setReport] = useState<{ type: string; id: string } | null>(
    null,
  );
  useEffect(() => {
    if (active === null) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight")
        setActive((v) => (v === null ? null : (v + 1) % items.length));
      if (e.key === "ArrowLeft")
        setActive((v) =>
          v === null ? null : (v - 1 + items.length) % items.length,
        );
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [active, items.length]);
  return (
    <>
      <div
        className={
          "media-grid " +
          (items.length === 1 ? "single " : "") +
          (compact ? "compact" : "")
        }
      >
        {items.map((m, i) =>
          m.kind === "video" ? (
            <div className="video-media" key={m.id}>
              <video
                controls
                preload="metadata"
                playsInline
                src={m.url || "/api/media/" + m.id}
                poster={m.url ? undefined : "/api/media/" + m.id + "?poster=1"}
                aria-label={m.caption || "Shared video"}
              />
              <button
                className="media-expand"
                aria-label="Open video viewer"
                onClick={() => setActive(i)}
              >
                <Icon name="arrow" size={17} />
              </button>
              {m.caption && <span className="media-caption">{m.caption}</span>}
            </div>
          ) : (
            <button
              className="image-media"
              key={m.id}
              onClick={() => setActive(i)}
              aria-label={
                "View image " + (i + 1) + (m.caption ? ": " + m.caption : "")
              }
            >
              <img
                alt={m.caption || "Shared image " + (i + 1)}
                loading="lazy"
                src={m.url || "/api/media/" + m.id}
              />
            </button>
          ),
        )}
      </div>
      <Modal
        open={active !== null}
        onClose={() => setActive(null)}
        title="Shared media"
        wide
      >
        {active !== null && items[active] && (
          <div className="media-viewer">
            {items[active].kind === "video" ? (
              <video
                controls
                playsInline
                src={items[active].url || "/api/media/" + items[active].id}
                poster={
                  items[active].url
                    ? undefined
                    : "/api/media/" + items[active].id + "?poster=1"
                }
              />
            ) : (
              <img
                alt={items[active].caption || "Shared image"}
                src={items[active].url || "/api/media/" + items[active].id}
              />
            )}
            <p>{items[active].caption}</p>
            <div className="viewer-controls">
              <button
                className="icon-button"
                aria-label="Previous image"
                disabled={items.length < 2}
                onClick={() =>
                  setActive((active - 1 + items.length) % items.length)
                }
              >
                <Icon name="left" />
              </button>
              <span>
                {active + 1} / {items.length}
              </span>
              <button
                className="icon-button"
                aria-label="Next image"
                disabled={items.length < 2}
                onClick={() => setActive((active + 1) % items.length)}
              >
                <Icon name="right" />
              </button>
              <button
                className="text-link"
                onClick={() =>
                  setReport({ type: "media", id: items[active].id })
                }
              >
                <Icon name="flag" size={15} /> Report media
              </button>
            </div>
          </div>
        )}
      </Modal>
      <ReportDialog target={report} onClose={() => setReport(null)} />
    </>
  );
}
