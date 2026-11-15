"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
}

/**
 * Text-only Brand Lockup for infimindss°
 * Clean lowercase wordmark with signature terracotta degree mark.
 */
export function BrandLogo({
  className,
  size = "md",
  href = "/",
}: BrandLogoProps) {
  const textSizeClass =
    size === "sm"
      ? "text-[16px]"
      : size === "lg"
      ? "text-xl sm:text-2xl"
      : "text-lg sm:text-xl";

  const logoContent = (
    <span
      className={cn(
        "font-sans font-bold tracking-tight text-[#302E29] transition-colors duration-200 hover:text-[#C86446] inline-flex items-center leading-none select-none whitespace-nowrap",
        textSizeClass,
        className
      )}
    >
      <span>infimindss</span>
      <span className="text-[#C86446] font-serif text-sm -mt-1.5 ml-0.5 select-none">°</span>
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label="infimindss homepage"
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C86446] focus-visible:ring-offset-2 rounded-md inline-flex items-center"
      >
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}

export default BrandLogo;
