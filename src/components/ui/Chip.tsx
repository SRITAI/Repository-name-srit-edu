"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  label?: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeVariant?: "danger" | "default";
}

export function Chip({
  className,
  selected = false,
  label,
  icon,
  badge,
  badgeVariant = "default",
  children,
  ...props
}: ChipProps) {
  return (
    <button
      type="button"
      className={cn(
        "h-10 px-4 rounded-full text-xs font-sans font-medium select-none transition-all duration-200 inline-flex items-center gap-2",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        selected
          ? "bg-accent/15 text-accent border border-accent/40 font-semibold shadow-[0_0_16px_rgba(215,255,61,0.18)]"
          : "bg-surface-2 text-text border border-border hover:border-border-strong hover:bg-surface-3",
        className
      )}
      {...props}
    >
      {icon && <span className="text-current flex-shrink-0">{icon}</span>}
      <span className="truncate">{children || label}</span>
      {badge && (
        <span
          className={cn(
            "text-[9px] px-1.5 py-0.2 rounded font-mono font-bold tracking-wider uppercase",
            badgeVariant === "danger"
              ? "bg-danger/20 text-danger border border-danger/30"
              : selected
              ? "bg-accent/25 text-accent"
              : "bg-surface-3 text-text-muted"
          )}
        >
          {badge}
        </span>
      )}
      {selected && <Check size={12} strokeWidth={3} className="text-accent ml-0.5 flex-shrink-0" />}
    </button>
  );
}
