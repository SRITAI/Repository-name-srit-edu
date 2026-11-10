"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface SegmentedOption {
  value: string | number;
  label: string;
  badge?: string;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps {
  options: SegmentedOption[];
  value: string | number;
  onChange: (value: any) => void;
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps) {
  return (
    <div
      className={cn(
        "relative flex items-center p-1 rounded-full bg-surface-2 border border-border select-none",
        className
      )}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative z-10 flex-1 py-2 px-3 rounded-full text-xs font-medium font-sans transition-all duration-200 flex items-center justify-center gap-1.5",
              isSelected
                ? "bg-surface-3 text-text font-semibold shadow-sm border border-border-strong text-white"
                : "text-text-muted hover:text-text"
            )}
          >
            {opt.icon && <span className="flex-shrink-0 text-current">{opt.icon}</span>}
            <span>{opt.label}</span>
            {opt.badge && (
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-accent/20 text-accent">
                {opt.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
