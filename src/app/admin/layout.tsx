import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Shield,
  Sparkles,
  FolderGit2,
  Instagram,
  Film,
  Tag,
  ArrowUpRight,
  LogOut,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  let user = null;
  let profile = null;
  let isLocalPreview = false;

  if (!supabase) {
    // Local dev mode without Supabase environment variables configured
    isLocalPreview = true;
  } else {
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      redirect("/login?next=/admin/ad-explorer");
    }

    user = authUser;

    const { data: userProfile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", authUser.id)
      .single();

    profile = userProfile;

    // Strict Server-Side Role Guard: non-admins are denied access
    if (userProfile?.role !== "admin") {
      return (
        <div className="min-h-screen bg-[#0C0D0E] text-[#F3F4F6] font-sans flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#141618] border border-red-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                Access Denied · 403
              </span>
              <h2 className="text-2xl font-serif text-white">Administrator Access Required</h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                You are currently signed in as{" "}
                <span className="text-white font-mono font-semibold">{user.email}</span> with role{" "}
                <span className="text-amber-400 font-mono font-semibold">
                  &lsquo;{userProfile?.role || "client"}&rsquo;
                </span>
                . Only accounts with verified administrator credentials can manage ad listings or operations.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-neutral-400 text-left">
              <div className="text-neutral-300 font-semibold mb-1 flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-amber-400" />
                <span>Site Owner Notice:</span>
              </div>
              To promote this account, run in your Supabase SQL editor:
              <pre className="mt-1.5 p-2 rounded bg-black/60 text-emerald-400 overflow-x-auto text-[10px]">
                UPDATE public.profiles SET role = &apos;admin&apos; WHERE id = &apos;{user.id}&apos;;
              </pre>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/"
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors"
              >
                Return to Site
              </Link>
              <Link
                href="/studio/projects"
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#1C1F23] border border-white/10 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
              >
                Go to User Studio
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#0C0D0E] text-[#EDEDED] font-sans antialiased selection:bg-[#C8FF00] selection:text-black">
      {/* Top Banner for Local Dev if env vars missing */}
      {isLocalPreview && (
        <div className="bg-amber-950/80 border-b border-amber-600/30 px-4 py-2 text-center text-xs text-amber-200 flex items-center justify-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>
            <strong>Local Admin Preview Mode:</strong> Supabase credentials not set in environment. Running in local simulated admin session.
          </span>
        </div>
      )}

      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#0C0D0E]/90 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-bold text-lg tracking-tight text-white flex items-center gap-1 group">
              <span>infimindss</span>
              <span className="text-xs align-super text-[#C8FF00] font-mono">°</span>
            </Link>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C8FF00]/10 border border-[#C8FF00]/25 text-[#C8FF00] text-xs font-mono font-semibold">
              <Shield className="w-3 h-3" />
              <span>Admin Control</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <span className="hidden md:inline-block text-xs font-mono text-neutral-400">
                Signed in as <strong className="text-neutral-200">{user.email}</strong>
              </span>
            )}

            <Link
              href="/ad-explorer"
              target="_blank"
              className="text-xs font-mono text-neutral-300 hover:text-white px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-1.5"
            >
              <span>Public Ad Explorer</span>
              <ArrowUpRight className="w-3 h-3 text-[#C8FF00]" />
            </Link>

            <Link
              href="/studio"
              className="text-xs font-mono text-neutral-300 hover:text-white px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-1"
            >
              <span>Studio</span>
            </Link>
          </div>
        </div>

        {/* Subnav Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-3 pt-2 border-t border-white/[0.06] flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          <Link
            href="/admin"
            className="px-3.5 py-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
            <span>Overview</span>
          </Link>
          <Link
            href="/admin/ad-explorer"
            className="px-3.5 py-1.5 rounded-lg bg-[#C8FF00]/15 text-[#C8FF00] font-semibold border border-[#C8FF00]/30 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C8FF00]" />
            <span>Ad Explorer</span>
          </Link>
          <Link
            href="/admin/projects"
            className="px-3.5 py-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-neutral-400" />
            <span>Projects Queue</span>
          </Link>
          <Link
            href="/admin/reels"
            className="px-3.5 py-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
          >
            <Instagram className="w-3.5 h-3.5 text-neutral-400" />
            <span>Trending Reels</span>
          </Link>
          <Link
            href="/admin/ads"
            className="px-3.5 py-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
          >
            <Film className="w-3.5 h-3.5 text-neutral-400" />
            <span>Benchmark Ads</span>
          </Link>
          <Link
            href="/admin/categories"
            className="px-3.5 py-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
          >
            <Tag className="w-3.5 h-3.5 text-neutral-400" />
            <span>Categories</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">{children}</main>
    </div>
  );
}
