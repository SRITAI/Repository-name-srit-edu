import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "var(--bg)",
          elevated: "var(--bg-elevated)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          2: "var(--surface-2)",
          3: "var(--surface-3)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        text: {
          DEFAULT: "var(--text)",
          muted: "var(--text-muted)",
          faint: "var(--text-faint)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          ink: "var(--accent-ink)",
          2: "var(--accent-2)",
          3: "var(--accent-3)",
        },
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter Tight", "Geist", "Inter", "sans-serif"],
        serif: ["var(--font-serif)", "Instrument Serif", "Georgia", "serif"],
        mono: ["var(--font-mono)", "Geist Mono", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glow: "var(--glow-accent)",
        "glow-violet": "0 0 0 1px rgba(139,108,255,.35), 0 8px 40px rgba(139,108,255,.18)",
        spotlight: "0 24px 60px -12px rgba(0,0,0,.7)",
      },
      borderRadius: {
        "3xl": "24px",
        "4xl": "32px",
      },
      animation: {
        "spin-slow": "spin 8s linear infinite",
        "pulse-glow": "pulseGlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "conic-spin": "conicSpin 6s linear infinite",
        marquee: "marquee 35s linear infinite",
        "marquee-reverse": "marqueeReverse 35s linear infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        conicSpin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        marqueeReverse: {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
