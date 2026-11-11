import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#09090B",
};

export const metadata: Metadata = {
  title: "infimindss° — Real Humans. AI-Fast. Zero Robotic Videos.",
  description:
    "Top-tier brand video studio. High-performing real human video ads for Instagram Reels, Meta Ads, and TikTok accelerated by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body className="bg-bg text-text font-sans antialiased min-h-screen selection:bg-accent selection:text-accent-ink overflow-x-hidden w-full m-0 p-0">
        {/* Subtle Film Grain Noise Overlay (Section 1.1: 3-4% opacity, fixed, pointer-events: none) */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-50 opacity-[0.035] mix-blend-screen"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Ambient Radial Gradient Glow (Violet + Lime, heavily blurred) */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-[-100px] left-1/2 -translate-x-1/2 w-[1100px] max-w-[100vw] h-[600px] rounded-full blur-[160px] opacity-[0.10] bg-gradient-to-r from-accent-2 via-transparent to-accent z-0"
        />

        <div className="relative z-10 flex flex-col min-h-screen w-full overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
