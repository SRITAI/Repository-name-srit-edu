"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import CommandPalette from "@/components/CommandPalette";
import CookieConsent from "@/components/CookieConsent";
import { AdExplorerModule } from "@/components/ad-explorer/AdExplorerModule";

function AdExplorerPageContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const initialPlatform = searchParams.get("platform") || "all";
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-accent selection:text-accent-ink pb-16 sm:pb-28">
      {/* Navbar */}
      <Navbar activeRoute="explore" onOpenSearch={() => setIsCmdOpen(true)} />

      {/* Main Container */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 space-y-6 sm:space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-text-muted hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO HOME</span>
          </Link>
        </div>

        {/* Full Ad Explorer Module */}
        <AdExplorerModule
          mode="full"
          initialQuery={initialQ}
          initialPlatform={initialPlatform}
        />
      </div>

      {/* Command Palette */}
      <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} />

      {/* Cookie Consent */}
      <CookieConsent />
    </div>
  );
}

export default function AdExplorerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg flex items-center justify-center text-text-muted">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      }
    >
      <AdExplorerPageContent />
    </Suspense>
  );
}
