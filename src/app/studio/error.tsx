"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home, Sparkles } from "lucide-react";

export default function StudioError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log real error to console with readable label
    console.error("[Studio]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111111] flex items-center justify-center p-6 font-sans antialiased">
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-black/[0.06] text-center">
        {/* Brand header */}
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200/70 px-3 py-1 rounded-full w-fit mx-auto mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>infimindss Studio</span>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-amber-100/60 text-amber-700 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-serif text-[#111111] mb-2 leading-tight">
          We encountered a brief snag <br />
          <span className="italic font-normal">in the Studio chamber.</span>
        </h1>

        <p className="text-xs sm:text-sm text-[#6B6B6B] mb-6 max-w-sm mx-auto leading-relaxed">
          Your project draft is safe. Try reloading the chamber or return to the main hub.
        </p>

        {error?.message && (
          <div className="mb-6 p-3 rounded-xl bg-neutral-50 border border-black/[0.06] text-[11px] font-mono text-left text-neutral-600 overflow-x-auto max-h-24">
            <code>{error.message}</code>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#111111] text-white text-xs font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-black/10 hover:border-black/20 text-[#111111] text-xs font-medium bg-white hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
