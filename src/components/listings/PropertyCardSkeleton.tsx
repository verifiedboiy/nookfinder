'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs animate-pulse flex flex-col">
      {/* Image Skeleton */}
      <div className="relative aspect-4/3 bg-slate-200 overflow-hidden">
        <div className="absolute top-3 left-3 flex gap-1.5">
          <div className="h-5 w-20 bg-slate-300 rounded" />
          <div className="h-5 w-24 bg-slate-300 rounded" />
        </div>
        <div className="absolute bottom-3 right-3 h-6 w-16 bg-slate-300 rounded" />
      </div>

      {/* Content Skeleton */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Price & Badge */}
          <div className="flex items-center justify-between">
            <div className="h-6 w-28 bg-slate-200 rounded" />
            <div className="h-4 w-16 bg-slate-200 rounded" />
          </div>

          {/* Title */}
          <div className="h-4 w-full bg-slate-200 rounded" />
          <div className="h-3 w-2/3 bg-slate-200 rounded" />

          {/* Views & Saves stats */}
          <div className="flex items-center gap-3 pt-1">
            <div className="h-3 w-16 bg-slate-200 rounded" />
            <div className="h-3 w-16 bg-slate-200 rounded" />
          </div>
        </div>

        {/* Specs Grid Skeleton */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="h-4 w-14 bg-slate-200 rounded" />
          <div className="h-4 w-14 bg-slate-200 rounded" />
          <div className="h-4 w-20 bg-slate-200 rounded" />
        </div>

        {/* Lot Size & Action Button Skeleton */}
        <div className="space-y-2 pt-1">
          <div className="h-6 w-full bg-slate-100 rounded" />
          <div className="h-8 w-full bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export function LoadingPropertiesBanner({ message = 'Loading available verified properties...' }: { message?: string }) {
  return (
    <div className="w-full bg-emerald-950 text-white rounded-xl p-6 shadow-lg border border-emerald-800/60 overflow-hidden relative mb-8">
      {/* Subtle background glow */}
      <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-xl bg-emerald-800/80 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-inner">
            <ShieldCheck className="w-6 h-6 text-emerald-300 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live Database Connection</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-display mt-0.5">
              {message}
            </h3>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              Auditing title deeds, verified pricing, and mortgage assistance grants across 25+ states.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-900/80 border border-emerald-700/50 text-xs font-medium text-emerald-200">
          <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span>Synchronizing Catalog...</span>
        </div>
      </div>
    </div>
  );
}
