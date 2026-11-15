"use client";

import React from "react";
import { Cpu, Activity, Waves, Sparkles } from "lucide-react";

export function AiAssistedProductionCard() {
  return (
    <div className="relative w-full rounded-3xl bg-[#1E1D1A] text-[#FFFCF5] border border-[#302E29]/30 p-4 sm:p-6 lg:p-8 shadow-paper-lg overflow-hidden group">
      {/* Subtle background ambient mesh */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 20%, rgba(200, 100, 70, 0.25) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(74, 124, 122, 0.2) 0%, transparent 50%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Technical Point-Cloud & Scanline Portrait Display (Inspired by Polyghost) */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="relative w-full max-w-[320px] aspect-[9/14] rounded-2xl overflow-hidden bg-[#12110F] border border-white/10 shadow-2xl">
            {/* The Polyghost point-cloud portrait asset */}
            <img
              src="/assets/polyghost-pointcloud.jpg"
              alt="AI-assisted neural creative pacing analysis"
              className="w-full h-full object-cover object-center filter contrast-125 brightness-95 opacity-90 transition-transform duration-700 group-hover:scale-105"
            />

            {/* Subtle Vertical Scanning Line Sweep */}
            <div
              className="scanline-beam absolute inset-x-0 h-16 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to bottom, transparent, rgba(200, 100, 70, 0.15) 50%, rgba(200, 100, 70, 0.4) 95%, #C86446 100%)",
                filter: "drop-shadow(0 2px 6px rgba(200, 100, 70, 0.5))",
              }}
              aria-hidden="true"
            />

            {/* Technical Wireframe & Coordinate Overlays */}
            <div className="absolute inset-0 p-4 pointer-events-none flex flex-col justify-between font-mono text-[9px] text-white/60 tracking-wider">
              {/* Top metadata */}
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="text-[#C86446] font-bold">● AI.VISION [ACTIVE]</div>
                  <div>LOC // 572.693</div>
                  <div>SPECTRAL // 311.354</div>
                </div>
                <div className="text-right">
                  <div className="px-1.5 py-0.5 rounded bg-white/10 text-white font-semibold">
                    FRAME 00:01.4
                  </div>
                  <div className="mt-1 text-[8px] text-white/40">RETENTION: 94.2%</div>
                </div>
              </div>

              {/* Center point marker */}
              <div className="relative my-auto flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border border-dashed border-white/30 flex items-center justify-center animate-[spin_18s_linear_infinite]">
                  <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                </div>
                <span className="absolute -bottom-4 text-[8px] text-white/50 bg-black/60 px-1 py-0.2 rounded">
                  PT: 572492
                </span>
              </div>

              {/* Bottom technical specifications */}
              <div className="flex items-end justify-between pt-2 border-t border-white/10 text-[8.5px]">
                <div className="space-y-0.5">
                  <div>PACING // 138 WPM</div>
                  <div>AUDIO // CLEAN ROOM -6dB</div>
                </div>
                <div className="text-right text-[#C86446] font-bold">
                  HUMAN ACTOR VERIFIED
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Narrative & Production Intelligence Features */}
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C86446]/20 border border-[#C86446]/40 text-[#E89278] text-xs font-mono font-semibold uppercase tracking-wider">
            <Cpu size={13} />
            <span>AI-Assisted Production Suite</span>
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-[#FFFCF5] leading-tight">
            Neural pacing &amp; hook modeling <br className="hidden sm:inline" />
            <em className="italic text-[#E89278]">crafted for human charisma.</em>
          </h3>

          <p className="font-sans text-sm text-[#D8D2C5] leading-relaxed max-w-xl">
            Before a single camera rolls, our custom intelligence tools analyze over 150+ high-performing vertical ad hooks across Meta and TikTok. We benchmark cadence, speech velocity, and visual retention markers—giving our real creators and video editors a high-confidence blueprint while leaving 100% of the on-camera charisma to real people.
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-[#E89278] font-bold text-xs">
                <Activity size={14} />
                <span>Audience Hook Psychology</span>
              </div>
              <p className="text-[11px] text-[#A69F92] leading-snug">
                First-3-second stop-rate modeling based on verified reel performance.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-[#E89278] font-bold text-xs">
                <Sparkles size={14} />
                <span>AI Kinetic Typography</span>
              </div>
              <p className="text-[11px] text-[#A69F92] leading-snug">
                Auto-generated punchy captions calibrated to speech beat &amp; visual pauses.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-[#E89278] font-bold text-xs">
                <Waves size={14} />
                <span>Studio Audio Scrubbing</span>
              </div>
              <p className="text-[11px] text-[#A69F92] leading-snug">
                De-noising, room-tone isolation, and high-clarity vocal balancing.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-[#10B981] font-bold text-xs">
                <span>✓</span>
                <span>Zero Synthetic Faces</span>
              </div>
              <p className="text-[11px] text-[#A69F92] leading-snug">
                Never robotic deepfakes. Authentic human connection, guaranteed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
