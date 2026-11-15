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
        terracotta: {
          DEFAULT: "#C86446",
          dark: "#B85637",
          light: "#EAD5CE",
        },
        sage: {
          DEFAULT: "#5B7065",
          light: "#D8E0DA",
        },
        dusty: {
          blue: "#4A6D88",
        },
        butter: {
          DEFAULT: "#E2C879",
          light: "#F5ECD0",
        },
        lavender: {
          DEFAULT: "#7C6C92",
          light: "#E3DFEB",
        },
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter Tight", "sans-serif"],
        serif: ["var(--font-serif)", "Instrument Serif", "Georgia", "serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        paper: "0 4px 16px -2px rgba(48, 46, 41, 0.08), 0 2px 6px -1px rgba(48, 46, 41, 0.04)",
        "paper-sm": "0 1px 3px rgba(48, 46, 41, 0.06), 0 1px 2px rgba(48, 46, 41, 0.04)",
        "paper-lg": "0 16px 36px -6px rgba(48, 46, 41, 0.10), 0 4px 12px -2px rgba(48, 46, 41, 0.05)",
        "paper-lift": "0 12px 28px -4px rgba(48, 46, 41, 0.12), 0 0 0 1px rgba(48, 46, 41, 0.08)",
        glow: "var(--glow-accent)",
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
