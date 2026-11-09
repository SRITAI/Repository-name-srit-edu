import React from "react";
import Link from "next/link";
import {
  FolderGit2,
  Instagram,
  Film,
  TrendingUp,
  Search,
  CheckCircle2,
  Clock,
  Video,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function AdminDashboardPage() {
  const kpis = [
    { label: "Active Projects", value: "8", delta: "+3 this week", icon: FolderGit2, color: "text-blue-600 bg-blue-50" },
    { label: "Needs Review", value: "3", delta: "1 urgent (<24h)", icon: Clock, color: "text-amber-600 bg-amber-50" },
    { label: "Shooting with Creators", value: "4", delta: "Real humans on camera", icon: Video, color: "text-purple-600 bg-purple-50" },
    { label: "Delivered & Approved", value: "24", delta: "100% human-verified", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
  ];

  const searchTrends = [
    { query: "skincare ugc reel", count: 142, category: "Skincare", trend: "+38%" },
    { query: "streetwear try on reel", count: 118, category: "Clothing & Fashion", trend: "+24%" },
    { query: "wellness gummies unboxing", count: 95, category: "Health Supplements", trend: "+19%" },
    { query: "luxury jewelry styling", count: 77, category: "Jewellery & Accessories", trend: "+12%" },
    { query: "sensual wellness couples ad", count: 64, category: "Sexual Wellness (18+)", trend: "+45%" },
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-black/[0.06] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Human + AI Production Chamber</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#111111]">
            Operations & Curation Command
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Manage video briefs, assign creators, run AI polish, and curate trending Instagram Reels.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/projects"
            className="px-4 py-2 rounded-full bg-[#111111] text-white text-xs font-medium hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
          >
            <span>View Projects Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/admin/reels"
            className="px-4 py-2 rounded-full border border-black/10 bg-white text-[#111111] text-xs font-medium hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
          >
            <Instagram className="w-3.5 h-3.5 text-neutral-600" />
            <span>Curate Reel</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-black/[0.06] shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-[#6B6B6B]">{kpi.label}</span>
                <div className={`p-2 rounded-xl ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-serif text-[#111111] font-normal">{kpi.value}</div>
                <div className="text-[11px] text-[#6B6B6B] mt-1 flex items-center gap-1">
                  <span>{kpi.delta}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Search Telemetry & Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Telemetry */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-black/[0.06] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#111111]" />
              <h2 className="text-base font-semibold text-[#111111]">
                Search Telemetry Insights
              </h2>
            </div>
            <span className="text-[11px] text-[#6B6B6B] bg-neutral-100 px-2.5 py-1 rounded-full">
              Real-time user queries
            </span>
          </div>
          <p className="text-xs text-[#6B6B6B] mb-4">
            These top search terms guide which creator niches and benchmark ads to curate next.
          </p>

          <div className="divide-y divide-black/[0.04]">
            {searchTrends.map((trend, i) => (
              <div key={i} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-[#6B6B6B] font-mono text-[11px] w-4">{i + 1}.</span>
                  <div>
                    <span className="font-medium text-[#111111]">"{trend.query}"</span>
                    <span className="ml-2 text-[10px] text-[#6B6B6B] bg-neutral-100 px-2 py-0.5 rounded-full">
                      {trend.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-[#6B6B6B]">{trend.count} searches</span>
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    {trend.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Operations Guide */}
        <div className="bg-white p-6 rounded-3xl border border-black/[0.06] shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#111111] mb-2">
              Human + AI Standard
            </h2>
            <p className="text-xs text-[#6B6B6B] leading-relaxed mb-4">
              All client deliverables follow strict quality gates:
            </p>

            <ul className="space-y-3 text-xs text-[#111111]">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                  1
                </span>
                <span><strong>Real Creator Verification:</strong> Zero AI synthetic face avatars permitted.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                  2
                </span>
                <span><strong>AI Polish:</strong> Dynamic word-by-word captions, hook pacing, color grading.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                  3
                </span>
                <span><strong>Multi-Ratio Export:</strong> Render 9:16 vertical, 4:5 feed, and 1:1 square.</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 border-t border-black/[0.06] mt-6">
            <Link
              href="/admin/projects"
              className="w-full py-2.5 rounded-full bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
            >
              <span>Manage Projects Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
