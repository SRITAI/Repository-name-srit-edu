"use client";

import React from "react";
import Link from "next/link";
import { Compass, ArrowUpRight, Crosshair, Layers, Zap } from "lucide-react";

export function EditorialTrendXrayCard() {
  return (
    <div className="relative w-full rounded-3xl bg-[#262420] text-[#FFFCF5] border border-[#302E29]/30 p-4 sm:p-6 lg:p-8 shadow-paper-lg overflow-hidden group">
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Narrative & Dissection Specs */}
        <div className="lg:col-span-7 space-y-5 order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A373]/20 border border-[#D4A373]/40 text-[#D4A373] text-xs font-mono font-semibold uppercase tracking-wider">
            <Compass size={13} />
            <span>Trend Architecture &amp; X-Ray Intelligence</span>
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-[#FFFCF5] leading-tight">
            Deconstructing viral Reel formats <br className="hidden sm:inline" />
            <em className="italic text-[#D4A373]">down to the microsecond.</em>
          </h3>

          <p className="font-sans text-sm text-[#D8D2C5] leading-relaxed max-w-xl">
            Winning short-form ads aren&apos;t accidental. Like an anatomical x-ray, we dissect top-performing Reels into four crucial levers: the 3-second hook pattern, the candid tactile proof, the audio rhythm, and the Meta platform delivery ratio.
          </p>

          {/* Technical Spec List */}
          <div className="space-y-2.5 pt-1 font-mono text-xs">
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[#D4A373] font-bold shrink-0">[01] HOOK PATTERN</span>
              <span className="text-[#D8D2C5]">Problem-first visual interruption with immediate verbal tension</span>
            </div>
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[#D4A373] font-bold shrink-0">[02] FORMAT SPEC</span>
              <span className="text-[#D8D2C5]">Candid wear-test or stress test by a relatable on-camera creator</span>
            </div>
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[#D4A373] font-bold shrink-0">[03] RATIO ADAPT</span>
              <span className="text-[#D8D2C5]">9:16 vertical priority with safe-zone UI margins for Instagram &amp; TikTok</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/ad-explorer"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#D4A373] hover:text-[#E6B98D] transition-colors"
            >
              <span>Explore live ad intelligence specimens</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Right: Editorial X-Ray Specimen Art Card (Adapted from Image 2) */}
        <div className="lg:col-span-5 relative flex items-center justify-center order-1 lg:order-2">
          <div className="relative w-full max-w-[340px] aspect-[4/5] rounded-2xl overflow-hidden bg-[#181715] border border-white/15 shadow-2xl p-4 flex flex-col justify-between">
            {/* Background Editorial X-Ray Image */}
            <img
              src="/assets/editorial-xray-spec.jpg"
              alt="Editorial creative x-ray trend dissection"
              className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen filter contrast-125"
            />

            {/* Editorial Header */}
            <div className="relative z-10 flex items-center justify-between text-[9px] font-mono text-white/70 border-b border-white/10 pb-2">
              <span className="font-bold tracking-widest text-[#D4A373]">SENS.CREATIVE</span>
              <span>SPECIMEN (01)</span>
              <span>FORMAT AD</span>
            </div>

            {/* Fine Technical Coordinate & Feature Callouts */}
            <div className="relative z-10 my-auto space-y-6 pointer-events-none">
              {/* Callout 1 */}
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded border border-[#D4A373]/80 flex items-center justify-center">
                  <Crosshair size={10} className="text-[#D4A373]" />
                </div>
                <div className="font-mono text-[8.5px] bg-black/70 px-2 py-1 rounded border border-white/10 backdrop-blur-sm">
                  <div className="text-white font-bold">HOOK.STOP_RATE // 00:03</div>
                  <div className="text-white/60">3s retention threshold verified</div>
                </div>
              </div>

              {/* Callout 2 */}
              <div className="flex items-center gap-2 ml-6">
                <div className="w-5 h-5 rounded border border-white/40 flex items-center justify-center">
                  <Layers size={10} className="text-white/80" />
                </div>
                <div className="font-mono text-[8.5px] bg-black/70 px-2 py-1 rounded border border-white/10 backdrop-blur-sm">
                  <div className="text-[#D4A373] font-bold">CREATIVE.TACTILE_PROOF</div>
                  <div className="text-white/60">Genuine hand touch &amp; texture</div>
                </div>
              </div>

              {/* Callout 3 */}
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded border border-[#4A7C7A]/80 flex items-center justify-center">
                  <Zap size={10} className="text-[#4A7C7A]" />
                </div>
                <div className="font-mono text-[8.5px] bg-black/70 px-2 py-1 rounded border border-white/10 backdrop-blur-sm">
                  <div className="text-white font-bold">META.RATIO // 9:16</div>
                  <div className="text-white/60">Full-bleed vertical storytelling</div>
                </div>
              </div>
            </div>

            {/* Editorial Footer Tag */}
            <div className="relative z-10 flex items-center justify-between text-[8px] font-mono text-white/50 border-t border-white/10 pt-2">
              <span>PATTERN: D2C HIGH-GROWTH</span>
              <span>VERIFIED REAL REEL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
