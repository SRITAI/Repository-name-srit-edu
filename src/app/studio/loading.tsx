import React from "react";

export default function StudioLoading() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111111] py-8 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="max-w-6xl mx-auto animate-pulse">
        {/* Nav Skeleton */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/[0.04]">
          <div className="h-6 w-28 bg-neutral-200/70 rounded-full" />
          <div className="h-9 w-64 bg-neutral-200/70 rounded-full hidden sm:block" />
          <div className="h-9 w-32 bg-neutral-200/70 rounded-full" />
        </div>

        {/* Header Block Skeleton */}
        <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
          <div className="h-5 w-24 bg-neutral-200/70 rounded-full mx-auto" />
          <div className="h-8 w-72 bg-neutral-200/70 rounded-xl mx-auto" />
          <div className="h-4 w-96 max-w-full bg-neutral-200/50 rounded-lg mx-auto" />
        </div>

        {/* Stepper Skeleton */}
        <div className="max-w-md mx-auto mb-10">
          <div className="h-10 bg-white rounded-full border border-black/[0.05] p-1 flex items-center justify-between">
            <div className="h-8 w-28 bg-neutral-200/70 rounded-full" />
            <div className="h-8 w-28 bg-neutral-100 rounded-full" />
            <div className="h-8 w-28 bg-neutral-100 rounded-full" />
          </div>
        </div>

        {/* Main Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] space-y-6">
            <div className="h-6 w-48 bg-neutral-200/70 rounded-lg" />
            <div className="space-y-3">
              <div className="h-4 w-24 bg-neutral-200/50 rounded" />
              <div className="h-11 bg-neutral-100 rounded-2xl" />
            </div>
            <div className="space-y-3">
              <div className="h-4 w-32 bg-neutral-200/50 rounded" />
              <div className="grid grid-cols-3 gap-2">
                <div className="h-10 bg-neutral-100 rounded-xl" />
                <div className="h-10 bg-neutral-100 rounded-xl" />
                <div className="h-10 bg-neutral-100 rounded-xl" />
              </div>
            </div>
            <div className="h-32 bg-neutral-100 rounded-2xl" />
          </div>

          <div className="bg-white rounded-3xl p-6 border border-black/[0.06] space-y-4">
            <div className="h-5 w-32 bg-neutral-200/70 rounded" />
            <div className="h-16 bg-neutral-100 rounded-xl" />
            <div className="h-16 bg-neutral-100 rounded-xl" />
            <div className="h-10 bg-neutral-900/10 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
