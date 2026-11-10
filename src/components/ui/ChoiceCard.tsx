"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChoiceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeVariant?: "danger" | "lime" | "default";
  ratioVisual?: "9:16" | "4:5" | "1:1";
}

export function ChoiceCard({
  className,
  selected = false,
  title,
  description,
  icon,
  badge,
  badgeVariant = "default",
  ratioVisual,
  onClick,
  ...props
}: ChoiceCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(e as any);
        }
      }}
      className={cn(
        "group relative p-5 rounded-2xl border text-left cursor-pointer transition-all duration-300 select-none overflow-hidden flex flex-col justify-between",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        selected
          ? "bg-surface-3/90 border-accent/60 shadow-[0_0_0_1px_rgba(215,255,61,0.4),0_12px_36px_rgba(215,255,61,0.14)] -translate-y-1"
          : "bg-surface border-border hover:border-border-strong hover:bg-surface-2 hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {/* Top Header Row with Icon & Check badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        {icon ? (
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 text-base",
              selected ? "bg-accent/20 text-accent" : "bg-surface-2 text-text-muted group-hover:text-text"
            )}
          >
            {icon}
          </div>
        ) : ratioVisual ? (
          <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center border border-border">
            {ratioVisual === "9:16" && (
              <div
                className={cn(
                  "w-4 h-7 rounded-[3px] border-2 transition-colors",
                  selected ? "border-accent bg-accent/20" : "border-text-faint"
                )}
              />
            )}
            {ratioVisual === "4:5" && (
              <div
                className={cn(
                  "w-5 h-6 rounded-[3px] border-2 transition-colors",
                  selected ? "border-accent bg-accent/20" : "border-text-faint"
                )}
              />
            )}
            {ratioVisual === "1:1" && (
              <div
                className={cn(
                  "w-6 h-6 rounded-[3px] border-2 transition-colors",
                  selected ? "border-accent bg-accent/20" : "border-text-faint"
                )}
              />
            )}
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-1.5">
          {badge && (
            <span
              className={cn(
                "text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider",
                badgeVariant === "danger"
                  ? "bg-danger/20 text-danger border border-danger/30"
                  : badgeVariant === "lime"
                  ? "bg-accent/20 text-accent border border-accent/40"
                  : "bg-surface-3 text-text-muted"
              )}
            >
              {badge}
            </span>
          )}

          <div
            className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center transition-all",
              selected
                ? "bg-accent text-accent-ink scale-100"
                : "border border-border-strong opacity-40 group-hover:opacity-80 scale-90"
            )}
          >
            {selected && <Check size={12} strokeWidth={3} />}
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        <div className={cn("text-sm font-semibold tracking-tight transition-colors", selected ? "text-text" : "text-text-muted group-hover:text-text")}>
          {title}
        </div>
        {description && (
          <div className="text-xs text-text-faint mt-1 leading-snug line-clamp-2">
            {description}
          </div>
        )}
      </div>
    </div>
  );
}
