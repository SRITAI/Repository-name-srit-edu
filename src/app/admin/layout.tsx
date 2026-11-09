import React from "react";
import Link from "next/link";
import { Shield, Sparkles, FolderGit2, Instagram, Film, Tag, ArrowUpRight } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#111111] font-sans antialiased">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-black/[0.06] px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-bold text-lg tracking-tight text-[#111111]">
              infimindss<span className="text-xs align-super opacity-70">°</span>
            </Link>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
              <Shield className="w-3 h-3 text-amber-600" />
              <span>Admin Operations</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/studio"
              className="text-xs font-medium text-[#6B6B6B] hover:text-[#111111] px-3 py-1.5 rounded-full hover:bg-neutral-100 transition-colors flex items-center gap-1"
            >
              <span>User Studio</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
            <Link
              href="/"
              className="text-xs font-medium text-[#6B6B6B] hover:text-[#111111] px-3 py-1.5 rounded-full hover:bg-neutral-100 transition-colors"
            >
              View Site
            </Link>
          </div>
        </div>

        {/* Subnav Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-black/[0.04] flex items-center gap-1 overflow-x-auto text-xs">
          <Link
            href="/admin"
            className="px-3 py-1.5 rounded-lg text-[#111111] font-medium hover:bg-neutral-100 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
            <span>Overview</span>
          </Link>
          <Link
            href="/admin/projects"
            className="px-3 py-1.5 rounded-lg text-[#111111] font-medium hover:bg-neutral-100 transition-colors flex items-center gap-1.5"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-neutral-500" />
            <span>Projects Queue</span>
          </Link>
          <Link
            href="/admin/reels"
            className="px-3 py-1.5 rounded-lg text-[#111111] font-medium hover:bg-neutral-100 transition-colors flex items-center gap-1.5"
          >
            <Instagram className="w-3.5 h-3.5 text-neutral-500" />
            <span>Trending Reels</span>
          </Link>
          <Link
            href="/admin/ads"
            className="px-3 py-1.5 rounded-lg text-[#111111] font-medium hover:bg-neutral-100 transition-colors flex items-center gap-1.5"
          >
            <Film className="w-3.5 h-3.5 text-neutral-500" />
            <span>Benchmark Ads</span>
          </Link>
          <Link
            href="/admin/categories"
            className="px-3 py-1.5 rounded-lg text-[#111111] font-medium hover:bg-neutral-100 transition-colors flex items-center gap-1.5"
          >
            <Tag className="w-3.5 h-3.5 text-neutral-500" />
            <span>Categories</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">{children}</main>
    </div>
  );
}
