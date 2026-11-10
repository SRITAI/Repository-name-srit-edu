import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "lime" | "violet" | "orange" | "danger" | "outline" | "sample";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "sm",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-surface-2 text-text-muted border border-border",
    lime: "bg-accent/15 text-accent border border-accent/30 font-semibold shadow-[0_0_12px_rgba(215,255,61,0.2)]",
    violet: "bg-accent-2/15 text-accent-2 border border-accent-2/30 font-semibold",
    orange: "bg-accent-3/15 text-accent-3 border border-accent-3/30 font-semibold",
    danger: "bg-danger/15 text-danger border border-danger/30 font-bold",
    outline: "bg-transparent text-text border border-border-strong",
    sample: "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono tracking-wider",
  };

  const sizeStyles = {
    sm: "text-[10px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider",
    md: "text-xs px-2.5 py-1 rounded-full font-mono uppercase tracking-wider",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 transition-colors select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
