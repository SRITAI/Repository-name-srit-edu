import type { Config } from 'tailwindcss'

// Design tokens
// ─────────────
// Color:  pulled directly from the SRIT EDU logo (measured, not guessed) —
//   navy   #233e5f  → primary: headers, buttons, body headings
//   blue   #10588c  → secondary: sub-navigation, secondary buttons
//   accent #0090d1  → the logo's brighter blue: links, focus states, active badges
//   neutral 50/100  → warm-white backgrounds and hairline borders, not pure #fff
//   everywhere, so the palette stays disciplined rather than decorative.
//
// Type: "Hind" (Indian Type Foundry) for both scripts — it's a genuine
//   Latin + Devanagari family, so headings and body text keep one visual
//   voice whether a page is in English or Hindi, instead of pairing two
//   unrelated typefaces across languages. Loaded via next/font/google in
//   app/layout.tsx and exposed here as --font-hind.
//
// Layout: content container caps at 1120px — dense enough for course/exam
//   tables and the admin dashboard, narrow enough to keep line lengths
//   readable on the marketing pages.

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { lg: '1120px' },
    },
    extend: {
      colors: {
        navy: {
          DEFAULT: '#233e5f',
          900: '#182a3f',
          700: '#233e5f',
          500: '#2f507a',
        },
        blue: {
          DEFAULT: '#10588c',
          600: '#10588c',
          500: '#0090d1',
        },
        neutral: {
          50: '#f8fafc',
          100: '#eef2f6',
          600: '#475569',
        },
      },
      fontFamily: {
        sans: ['var(--font-hind)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
      },
    },
  },
  plugins: [],
}

export default config
