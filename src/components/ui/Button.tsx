"use client";

import React, { forwardRef } from "react";
import Link from "next/link";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "glass";
  size?: "sm" | "md" | "lg";
  withArrow?: boolean;
  isLoading?: boolean;
  href?: string;
  external?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      withArrow = false,
      isLoading = false,
      href,
      external = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "h-9 px-3.5 text-xs gap-2 rounded-full",
      md: "h-11 px-5 text-sm gap-2.5 rounded-full font-medium",
      lg: "h-14 px-7 text-base gap-3 rounded-full font-semibold",
    };

    const variantClasses = {
      primary:
        "bg-accent text-accent-ink font-semibold shadow-[0_0_0_1px_rgba(215,255,61,0.4),0_8px_32px_rgba(215,255,61,0.25)] hover:shadow-[0_0_0_1px_rgba(215,255,61,0.6),0_12px_44px_rgba(215,255,61,0.38)] hover:bg-[#e4ff5e]",
      secondary:
        "bg-surface-2 text-text border border-border hover:border-border-strong hover:bg-surface-3 shadow-sm",
      glass:
        "bg-surface/60 backdrop-blur-xl text-text border border-border hover:border-accent/40 hover:bg-surface/80 shadow-lg",
      ghost:
        "bg-transparent text-text-muted hover:text-text hover:bg-surface-2",
      danger:
        "bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20",
    };

    const commonClasses = cn(
      "group relative inline-flex items-center justify-center select-none overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
      "hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0",
      "disabled:opacity-50 disabled:pointer-events-none disabled:transform-none",
      sizeClasses[size],
      variantClasses[variant],
      className
    );

    // Inner shine sweep element for primary buttons
    const shineElement = variant === "primary" ? (
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
      />
    ) : null;

    // Arrow swap element
    const arrowElement = withArrow && !isLoading ? (
      <span
        aria-hidden="true"
        className={cn(
          "relative flex items-center justify-center rounded-full overflow-hidden flex-shrink-0 transition-transform duration-300",
          variant === "primary" ? "w-6 h-6 bg-accent-ink text-accent" : "w-6 h-6 bg-surface-3 text-text",
          size === "sm" && "w-5 h-5",
          size === "lg" && "w-7 h-7"
        )}
      >
        <ArrowUpRight
          size={size === "sm" ? 11 : size === "lg" ? 15 : 13}
          className="absolute transition-transform duration-300 group-hover:translate-x-4 group-hover:-translate-y-4"
        />
        <ArrowUpRight
          size={size === "sm" ? 11 : size === "lg" ? 15 : 13}
          className="absolute -translate-x-4 translate-y-4 transition-transform duration-300 group-hover:translate-x-0 group-hover:translate-y-0"
        />
      </span>
    ) : null;

    const content = (
      <>
        {shineElement}
        {isLoading && <Loader2 size={16} className="animate-spin text-current" />}
        <span>{children}</span>
        {arrowElement}
      </>
    );

    if (href) {
      if (external) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={commonClasses}
          >
            {content}
          </a>
        );
      }
      return (
        <Link href={href} className={commonClasses}>
          {content}
        </Link>
      );
    }

    return (
      <button ref={ref} disabled={disabled || isLoading} className={commonClasses} {...props}>
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";
