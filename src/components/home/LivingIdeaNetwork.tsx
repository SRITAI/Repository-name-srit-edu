"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  FileText,
  Palette,
  Film,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

export interface NetworkNodeItem {
  id: string;
  label: string;
  desc: string;
  icon: "trend" | "script" | "visuals" | "produce" | "publish";
  badge?: string;
  href?: string;
  accent: "terracotta" | "gold" | "teal";
}

export const PRODUCTION_NODES: NetworkNodeItem[] = [
  {
    id: "trend",
    label: "Find the trend",
    desc: "Discover timely Reel formats & viral patterns",
    icon: "trend",
    badge: "Trend Intel",
    accent: "teal",
    href: "#trending-reels",
  },
  {
    id: "script",
    label: "Write the script",
    desc: "Turn a brand brief into a high-retention hook",
    icon: "script",
    badge: "AI Scripting",
    accent: "terracotta",
    href: "/studio",
  },
  {
    id: "visuals",
    label: "Create the visuals",
    desc: "Develop graphics, product story & motion rhythm",
    icon: "visuals",
    badge: "Motion & Art",
    accent: "gold",
    href: "/studio",
  },
  {
    id: "produce",
    label: "Produce the video",
    desc: "Combine human creators with AI editing pipelines",
    icon: "produce",
    badge: "72h Turnaround",
    accent: "terracotta",
    href: "/studio",
  },
  {
    id: "publish",
    label: "Ready to publish",
    desc: "Deliver 9:16, 4:5 & 1:1 Meta-ready assets",
    icon: "publish",
    badge: "Meta Ready",
    accent: "teal",
    href: "#meta-strip",
  },
];

interface LivingIdeaNetworkProps {
  onNodeSelect?: (node: NetworkNodeItem) => void;
  className?: string;
  supportingLine?: string;
}

export function LivingIdeaNetwork({
  onNodeSelect,
  className = "",
  supportingLine = "Human creativity, connected with AI.",
}: LivingIdeaNetworkProps) {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [isMotionPaused, setIsMotionPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);

  // Sync with global motion settings and prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;

    const revealTimer = setTimeout(() => setHasRevealed(true), 60);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const mqHandler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    if (mq.addEventListener) {
      mq.addEventListener("change", mqHandler);
    }

    const toggleHandler = (e: Event) => {
      const ce = e as CustomEvent<{ paused: boolean }>;
      if (ce.detail) {
        setIsMotionPaused(ce.detail.paused);
      }
    };
    window.addEventListener("infimindss-motion-toggle", toggleHandler);

    if (document.documentElement.classList.contains("motion-paused")) {
      setIsMotionPaused(true);
    }

    const visHandler = () => {
      if (document.hidden) {
        setIsMotionPaused(true);
      } else {
        setIsMotionPaused(document.documentElement.classList.contains("motion-paused"));
      }
    };
    document.addEventListener("visibilitychange", visHandler);

    return () => {
      clearTimeout(revealTimer);
      if (mq.removeEventListener) {
        mq.removeEventListener("change", mqHandler);
      }
      window.removeEventListener("infimindss-motion-toggle", toggleHandler);
      document.removeEventListener("visibilitychange", visHandler);
    };
  }, []);

  const shouldPause = isMotionPaused || prefersReducedMotion;

  const handleNodeClick = (node: NetworkNodeItem) => {
    setActiveNodeId(node.id);
    if (onNodeSelect) {
      onNodeSelect(node);
    }
  };

  // Node icon helper with consistent sizing and 1.75 stroke weight
  const renderIcon = (iconName: string) => {
    const iconProps = { className: "w-4 h-4", strokeWidth: 1.75 };
    switch (iconName) {
      case "trend":
        return <TrendingUp {...iconProps} />;
      case "script":
        return <FileText {...iconProps} />;
      case "visuals":
        return <Palette {...iconProps} />;
      case "produce":
        return <Film {...iconProps} />;
      case "publish":
        return <CheckCircle2 {...iconProps} />;
      default:
        return <Sparkles {...iconProps} />;
    }
  };

  /**
   * Continuous Bézier paths for desktop constellation (980 x 430).
   * Center artwork sits at (490, 160) [width ~160, height ~230].
   * Center verse pill sits at (490, 310).
   * Connectors branch organically to each of the 5 production nodes.
   */
  const pathsData = [
    {
      id: "trend",
      // to Node 1 (Find the trend: top-left ~170, 75)
      d: "M 410 130 C 330 125, 275 85, 235 75",
      particleDur: "7.2s",
      startPoint: { x: 410, y: 130 },
      endPoint: { x: 235, y: 75 },
    },
    {
      id: "script",
      // to Node 2 (Write the script: top-right ~810, 75)
      d: "M 570 130 C 650 125, 705 85, 745 75",
      particleDur: "6.8s",
      startPoint: { x: 570, y: 130 },
      endPoint: { x: 745, y: 75 },
    },
    {
      id: "visuals",
      // to Node 3 (Create the visuals: middle-right ~820, 260)
      d: "M 570 215 C 640 225, 700 250, 755 260",
      particleDur: "7.5s",
      startPoint: { x: 570, y: 215 },
      endPoint: { x: 755, y: 260 },
    },
    {
      id: "produce",
      // to Node 4 (Produce the video: bottom-center ~490, 390)
      d: "M 490 334 C 490 348, 490 358, 490 368",
      particleDur: "6.4s",
      startPoint: { x: 490, y: 334 },
      endPoint: { x: 490, y: 368 },
    },
    {
      id: "publish",
      // to Node 5 (Ready to publish: middle-left ~160, 260)
      d: "M 410 215 C 340 225, 280 250, 225 260",
      particleDur: "7.0s",
      startPoint: { x: 410, y: 215 },
      endPoint: { x: 225, y: 260 },
    },
  ];

  return (
    <div
      className={`idea-network-wrapper relative w-full select-none ${className}`}
      role="region"
      aria-label="Interactive infimindss verse living production network"
    >
      {/* ====================================================================
          DESKTOP CONSTELLATION (≥ 768px)
          Stage: 980 x 430 with aspect-ratio preserving responsiveness
          ==================================================================== */}
      <div className="hidden md:block relative w-full max-w-[980px] aspect-[980/430] min-h-[380px] mx-auto constellation-stage">
        {/* Soft Watercolor Halo behind Central Brain & Hands Composition */}
        <div
          className={`absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full pointer-events-none transition-all duration-700 ${
            shouldPause ? "" : "hub-wash-pulse"
          }`}
          style={{
            background:
              "radial-gradient(circle at center, rgba(200, 100, 70, 0.08) 0%, rgba(226, 215, 196, 0.32) 42%, transparent 72%)",
            filter: "blur(32px)",
          }}
          aria-hidden="true"
        />

        {/* SVG Living Connector Paths Canvas */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          viewBox="0 0 980 430"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            {/* Ink Droplet Pulse Gradient */}
            <radialGradient id="verseInkPulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C86446" stopOpacity="1" />
              <stop offset="70%" stopColor="#C86446" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#8C422C" stopOpacity="0" />
            </radialGradient>

            {/* Path Glow Filter */}
            <filter id="versePathGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodColor="#C86446" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Faint Layered Orbital Rings */}
          <g className="orbital-arcs-group opacity-60">
            <ellipse
              cx="490"
              cy="200"
              rx="420"
              ry="165"
              fill="none"
              stroke="#302E29"
              strokeWidth="0.8"
              strokeDasharray="4 8"
              strokeOpacity="0.08"
            />
            <ellipse
              cx="490"
              cy="200"
              rx="240"
              ry="95"
              fill="none"
              stroke="#C86446"
              strokeWidth="0.8"
              strokeDasharray="3 6"
              strokeOpacity="0.14"
            />
          </g>

          {/* Continuous Curved Connectors with Reveal & Signal Pulse */}
          {pathsData.map((path) => {
            const isActive = activeNodeId === path.id;
            const isAnyActive = activeNodeId !== null;

            return (
              <g key={`path-group-${path.id}`} className="transition-opacity duration-300">
                {/* Continuous Base Curved Bézier Stroke */}
                <path
                  id={`network-path-${path.id}`}
                  d={path.d}
                  fill="none"
                  className={`transition-all duration-300 ${
                    isActive
                      ? "stroke-[#C86446] stroke-[2.4px] opacity-100"
                      : isAnyActive
                      ? "stroke-[#302E29] stroke-[1px] opacity-15"
                      : "stroke-[#302E29] stroke-[1.4px] opacity-35"
                  }`}
                  style={{
                    strokeLinecap: "round",
                    strokeDasharray: hasRevealed ? "none" : "340",
                    strokeDashoffset: hasRevealed ? "0" : "340",
                    transition:
                      "stroke-dashoffset 0.9s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, stroke-width 0.3s ease",
                    filter: isActive ? "url(#versePathGlow)" : undefined,
                  }}
                />

                {/* Connection Terminal Points */}
                <circle
                  cx={path.startPoint.x}
                  cy={path.startPoint.y}
                  r={isActive ? "3.2" : "2.2"}
                  className="transition-all duration-300"
                  fill={isActive ? "#C86446" : "#302E29"}
                  fillOpacity={isActive ? "1" : "0.45"}
                />
                <circle
                  cx={path.endPoint.x}
                  cy={path.endPoint.y}
                  r={isActive ? "3.2" : "2.2"}
                  className="transition-all duration-300"
                  fill={isActive ? "#C86446" : "#302E29"}
                  fillOpacity={isActive ? "1" : "0.45"}
                />

                {/* Signal Pulse Traveling Along Selected Path */}
                {!shouldPause && hasRevealed && (
                  <circle r="3" fill="url(#verseInkPulse)" className="network-droplet">
                    <animateMotion dur={path.particleDur} repeatCount="indefinite" rotate="auto">
                      <mpath href={`#network-path-${path.id}`} />
                    </animateMotion>
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {/* ==================================================================
            CENTRAL BRAND VISUAL: The Brain Held by Hands with GPU
            Using the processed asset: /assets/infimindss-human-ai-gpu-color.png
            ================================================================== */}
        <div
          className={`absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 z-20 central-artwork-container ${
            shouldPause ? "" : "hub-breathing"
          }`}
          style={{ width: "220px", height: "260px" }}
          aria-hidden="true"
        >
          <img
            src="/assets/infimindss-human-ai-gpu-color.png"
            alt="infimindss verse — Human creativity connected with AI"
            className="w-full h-full object-contain pointer-events-none drop-shadow-[0_12px_24px_rgba(48,46,41,0.12)] select-none"
          />
        </div>

        {/* Central Branded Pill: infimindss verse */}
        <div
          className="absolute left-1/2 top-[72%] -translate-x-1/2 -translate-y-1/2 z-30"
          onMouseEnter={() => setActiveNodeId(null)}
          tabIndex={0}
          role="button"
          aria-label={`infimindss verse: ${supportingLine}`}
        >
          <div className="flex items-center gap-3 px-4.5 py-2.5 bg-[#FFFCF5]/95 backdrop-blur-md border border-[#302E29]/15 rounded-full shadow-paper-md hover:border-[#C86446]/60 transition-all cursor-pointer">
            <span className="relative flex h-2 w-2">
              {!shouldPause && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C86446] opacity-75" />
              )}
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C86446]" />
            </span>

            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1 leading-none">
                <span className="font-serif text-[14px] font-bold tracking-tight text-[#302E29]">
                  infimindss verse
                </span>
                <span className="text-[#C86446] font-mono text-xs select-none">°</span>
              </div>
              <span className="font-sans text-[10px] text-[#716C63] font-medium tracking-normal mt-0.5 leading-tight">
                {supportingLine}
              </span>
            </div>

            <span className="ml-1 px-2 py-0.5 rounded-full bg-[#C86446]/10 text-[#C86446] text-[9.5px] font-mono font-semibold uppercase tracking-wider">
              Verse
            </span>
          </div>
        </div>

        {/* ==================================================================
            5 SERVICE PRODUCTION NODES
            ================================================================== */}
        {PRODUCTION_NODES.map((node) => {
          const isActive = activeNodeId === node.id;

          // Asymmetric constellation coordinates & low-amplitude drift classes
          let posStyle: React.CSSProperties = {};
          let driftClass = "";

          if (node.id === "trend") {
            posStyle = { left: "17%", top: "18%", transform: "translate(-50%, -50%)" };
            driftClass = "node-drift-a";
          } else if (node.id === "script") {
            posStyle = { left: "83%", top: "18%", transform: "translate(-50%, -50%)" };
            driftClass = "node-drift-b";
          } else if (node.id === "visuals") {
            posStyle = { left: "84%", top: "60%", transform: "translate(-50%, -50%)" };
            driftClass = "node-drift-c";
          } else if (node.id === "produce") {
            posStyle = { left: "50%", top: "91%", transform: "translate(-50%, -50%)" };
            driftClass = "node-drift-a";
          } else if (node.id === "publish") {
            posStyle = { left: "16%", top: "60%", transform: "translate(-50%, -50%)" };
            driftClass = "node-drift-b";
          }

          // Restrained accent dot color
          const accentDotColor =
            node.accent === "terracotta"
              ? "bg-[#C86446]"
              : node.accent === "gold"
              ? "bg-[#D4A373]"
              : "bg-[#4A7C7A]";

          return (
            <div
              key={node.id}
              style={posStyle}
              className={`absolute z-20 ${shouldPause ? "" : driftClass}`}
            >
              <button
                type="button"
                onClick={() => handleNodeClick(node)}
                onMouseEnter={() => setActiveNodeId(node.id)}
                onMouseLeave={() => setActiveNodeId(null)}
                onFocus={() => setActiveNodeId(node.id)}
                onBlur={() => setActiveNodeId(null)}
                aria-label={`${node.label}: ${node.desc}`}
                className={`node-pill group flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-[#FFFCF5] border transition-all duration-200 cursor-pointer text-left ${
                  isActive
                    ? "border-[#C86446] shadow-paper-md -translate-y-1 scale-[1.03]"
                    : "border-[#302E29]/12 shadow-paper-sm hover:border-[#C86446]/50 hover:shadow-paper hover:-translate-y-0.5"
                }`}
              >
                {/* Refined cohesive icon container: matte ivory with micro accent pip */}
                <div className="relative w-8 h-8 rounded-xl bg-[#F6F1E7] border border-[#302E29]/10 flex items-center justify-center text-[#302E29] shrink-0 group-hover:text-[#C86446] transition-colors">
                  {renderIcon(node.icon)}
                  <span
                    className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${accentDotColor} border border-[#FFFCF5]`}
                    aria-hidden="true"
                  />
                </div>

                {/* Node typography */}
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-sans text-xs font-bold text-[#302E29] group-hover:text-[#C86446] transition-colors">
                      {node.label}
                    </span>
                    {node.badge && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-[#302E29]/5 text-[#716C63] border border-[#302E29]/5">
                        {node.badge}
                      </span>
                    )}
                    {node.href && (
                      <ArrowUpRight className="w-3 h-3 text-[#716C63] opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                    )}
                  </div>
                  <span className="text-[10px] text-[#716C63] font-normal leading-tight max-w-[135px] truncate">
                    {node.desc}
                  </span>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* ====================================================================
          MOBILE COMPACT FLOW (< 768px)
          Compact central hub with central artwork & clean 2-column grid
          ==================================================================== */}
      <div className="block md:hidden w-full max-w-sm mx-auto px-2">
        {/* Mobile Hub with Brain-and-Hands Artwork */}
        <div className="flex flex-col items-center mb-3">
          <div className="relative w-24 h-24 mb-1">
            <img
              src="/assets/infimindss-human-ai-gpu-color.png"
              alt="infimindss verse"
              className="w-full h-full object-contain pointer-events-none drop-shadow-md select-none"
            />
          </div>

          <div className="flex items-center gap-2.5 px-4 py-2 bg-[#FFFCF5] border border-[#C86446]/40 rounded-full shadow-paper-sm">
            <span className="w-2 h-2 rounded-full bg-[#C86446] animate-pulse" />
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1 leading-none">
                <span className="font-serif text-xs font-bold text-[#302E29]">
                  infimindss verse
                </span>
                <span className="text-[#C86446] font-mono text-[10px]">°</span>
              </div>
              <span className="text-[9px] text-[#716C63] font-medium tracking-tight mt-0.5">
                {supportingLine}
              </span>
            </div>
            <span className="text-[9px] font-mono font-semibold text-[#8C422C] bg-[#C86446]/10 px-1.5 py-0.5 rounded">
              Verse
            </span>
          </div>

          {/* Organic ink conduit connector */}
          <div className="w-0.5 h-3.5 bg-[#C86446]/30 my-1" aria-hidden="true" />
        </div>

        {/* Mobile 2-Column Clean Node Grid (1-col on <360px for perfect readability) */}
        <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-2">
          {PRODUCTION_NODES.map((node, idx) => {
            const isActive = activeNodeId === node.id;
            const accentDotColor =
              node.accent === "terracotta"
                ? "bg-[#C86446]"
                : node.accent === "gold"
                ? "bg-[#D4A373]"
                : "bg-[#4A7C7A]";

            // Span 5th node across 2 cols if odd
            const isFullWidth = idx === PRODUCTION_NODES.length - 1;

            return (
              <button
                key={`mobile-${node.id}`}
                type="button"
                onClick={() => handleNodeClick(node)}
                aria-label={`${node.label}: ${node.desc}`}
                className={`flex items-center gap-2 p-2 rounded-xl bg-[#FFFCF5] border transition-all text-left ${
                  isFullWidth ? "col-span-2" : ""
                } ${
                  isActive
                    ? "border-[#C86446] shadow-paper-sm"
                    : "border-[#302E29]/12 hover:border-[#C86446]/40"
                }`}
              >
                <div className="relative w-7 h-7 rounded-lg bg-[#F6F1E7] border border-[#302E29]/10 flex items-center justify-center text-[#302E29] shrink-0">
                  {renderIcon(node.icon)}
                  <span
                    className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${accentDotColor}`}
                    aria-hidden="true"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-[#302E29] truncate">
                      {node.label}
                    </span>
                    {node.href && (
                      <ArrowUpRight className="w-2.5 h-2.5 text-[#716C63] shrink-0" />
                    )}
                  </div>
                  <span className="text-[9px] text-[#716C63] truncate">
                    {node.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
