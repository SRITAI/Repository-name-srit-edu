"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils";

export interface BentoTileProps extends React.HTMLAttributes<HTMLDivElement> {
  spotlight?: boolean;
  glow?: boolean;
  featured?: boolean;
}

export function BentoTile({
  className,
  spotlight = true,
  glow = false,
  featured = false,
  children,
  onMouseMove,
  ...props
}: BentoTileProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!spotlight || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--mx", `${x}px`);
    cardRef.current.style.setProperty("--my", `${y}px`);
    onMouseMove?.(e);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative rounded-3xl bg-surface border border-border overflow-hidden transition-all duration-300",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_16px_36px_-12px_rgba(0,0,0,0.6)]",
        glow && "hover:border-accent/40 hover:shadow-[0_0_32px_rgba(215,255,61,0.12)]",
        featured && "border-accent/50 shadow-[0_0_0_1px_rgba(215,255,61,0.3),0_20px_50px_rgba(215,255,61,0.1)]",
        className
      )}
      {...props}
    >
      {/* Spotlight radial gradient overlay */}
      {spotlight && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          style={{
            background:
              "radial-gradient(500px circle at var(--mx, 0px) var(--my, 0px), rgba(215, 255, 61, 0.08), transparent 80%)",
          }}
        />
      )}

      {children}
    </div>
  );
}
