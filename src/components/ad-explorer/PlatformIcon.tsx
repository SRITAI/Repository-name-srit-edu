import React from "react";
import { AdPlatform } from "@/lib/supabase/types";

interface PlatformIconProps {
  platform: AdPlatform;
  className?: string;
  size?: number;
}

export function PlatformIcon({ platform, className = "", size = 16 }: PlatformIconProps) {
  switch (platform) {
    case "meta":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-label="Meta"
        >
          {/* Meta Infinity Loop */}
          <path d="M7 16.5c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5c2 0 3.5 1.5 5 4.5 1.5-3 3-4.5 5-4.5 2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5c-2 0-3.5-1.5-5-4.5-1.5 3-3 4.5-5 4.5z" />
        </svg>
      );

    case "google":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={className}
          aria-label="Google"
          fill="currentColor"
        >
          {/* Crisp Google 'G' Mark */}
          <path d="M12.24 10.285v3.608h5.12c-.22 1.458-1.7 4.275-5.12 4.275-3.08 0-5.59-2.55-5.59-5.694 0-3.144 2.51-5.694 5.59-5.694 1.75 0 2.92.748 3.59 1.39l2.85-2.74C16.85 3.655 14.73 2.75 12.24 2.75 7.14 2.75 3 6.89 3 11.99s4.14 9.24 9.24 9.24c5.33 0 8.87-3.75 8.87-9.03 0-.61-.07-1.07-.15-1.53l-8.72-.385z" />
        </svg>
      );

    case "linkedin":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="currentColor"
          className={className}
          aria-label="LinkedIn"
        >
          {/* Official LinkedIn 'in' Mark */}
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.65 1.65 0 0 0 1.66-1.66 1.66 1.66 0 0 0-3.32 0c0 .92.74 1.66 1.66 1.66m1.39 9.74v-8.37H5.07v8.37h2.78z" />
        </svg>
      );

    case "tiktok":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="currentColor"
          className={className}
          aria-label="TikTok"
        >
          {/* TikTok Musical Note */}
          <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743 2.895 2.895 0 0 1 2.306-4.637c.334 0 .654.062.951.171V9.387a6.37 6.37 0 0 0-.951-.072A6.338 6.338 0 0 0 3.14 15.653a6.338 6.338 0 0 0 10.74 4.542 6.275 6.275 0 0 0 1.93-4.523V8.847c1.32.938 2.923 1.492 4.654 1.545V6.953a4.814 4.814 0 0 1-.875-.267z" />
        </svg>
      );

    case "x":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="currentColor"
          className={className}
          aria-label="X"
        >
          {/* X Logomark */}
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );

    case "amazon":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="currentColor"
          className={className}
          aria-label="Amazon Ads"
        >
          {/* Amazon 'a' with smile arrow */}
          <path d="M13.92 12.38c-.37-.21-1.04-.37-1.74-.37-1.42 0-2.31.76-2.31 1.94 0 1.15.82 1.83 2.06 1.83.94 0 1.58-.33 1.99-.75v-2.65zm1.88 4.67c-.24.23-.59.25-.86.08-.6-.39-1.08-.85-1.39-1.38-.99.96-2.18 1.48-3.56 1.48-2.34 0-4.04-1.55-4.04-3.86 0-2.17 1.63-3.69 4.14-3.79 1.15-.05 2.51.13 3.73.49v-.53c0-1.13-.76-1.77-2.13-1.77-1.12 0-2.29.39-3.23.94-.25.15-.55.1-.73-.12l-.65-.8c-.16-.2-.12-.49.1-.65 1.25-.91 2.87-1.41 4.69-1.41 2.91 0 4.65 1.5 4.65 4.16v4.6c0 1.09.43 1.57.82 2.16.18.27.14.61-.1.8l-.83.69c-.2.17-.47.16-.66-.04zm5.8 4.29c-.27.2-.67.14-.84-.13-1.92-2.92-5.46-4.59-9.15-4.59-3.85 0-7.39 1.77-9.35 4.79-.17.26-.54.33-.82.16l-.8-.5c-.27-.17-.35-.52-.18-.79 2.24-3.46 6.32-5.49 10.74-5.49 4.23 0 8.28 1.91 10.49 5.25.18.28.1.65-.17.84l-.92.46z" />
        </svg>
      );

    default:
      return null;
  }
}
