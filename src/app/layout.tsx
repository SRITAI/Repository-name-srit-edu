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
  themeColor: "#F6F1E7",
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
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body className="bg-bg text-text font-sans antialiased min-h-screen selection:bg-accent/20 selection:text-text overflow-x-hidden w-full m-0 p-0">
        {/* Tactile Fine-Art Cold-Press Paper Grain Overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-50 opacity-[0.04] mix-blend-multiply"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Ambient Watercolor Wash (Terracotta, Butter Yellow, Sage Gouache) */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-[-140px] left-1/2 -translate-x-1/2 w-[1200px] max-w-[100vw] h-[640px] rounded-full blur-[140px] opacity-[0.14] bg-gradient-to-r from-[#C86446] via-[#E2C879] to-[#5B7065] z-0"
        />

        <div className="relative z-10 flex flex-col min-h-screen w-full overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
