'use client';

import React from 'react';

export default function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs flex flex-col transition-all duration-300">
      {/* Shimmer Image Area */}
      <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200/60 to-transparent -translate-x-full animate-[shimmer_1.6s_infinite]" />
        
        {/* Top Floating Badge Placeholders */}
        <div className="absolute top-3 left-3 flex gap-2">
          <div className="h-5 w-20 bg-slate-200/80 rounded-md backdrop-blur-xs" />
          <div className="h-5 w-24 bg-slate-200/80 rounded-md backdrop-blur-xs" />
        </div>

        {/* Bottom Floating Price Badge Placeholder */}
        <div className="absolute bottom-3 right-3 h-7 w-24 bg-slate-300/80 rounded-md backdrop-blur-xs" />
      </div>

      {/* Card Content Placeholder */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Price & Monthly Tag */}
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 bg-slate-200 rounded-md" />
            <div className="h-4 w-16 bg-slate-100 rounded-md" />
          </div>

          {/* Title Placeholder */}
          <div className="h-4 w-full bg-slate-200 rounded-md" />
          <div className="h-3.5 w-3/4 bg-slate-100 rounded-md" />

          {/* Location / Street Placeholder */}
          <div className="h-3 w-1/2 bg-slate-100 rounded-md pt-0.5" />
        </div>

        {/* Specs Grid Skeleton (Beds, Baths, SqFt) */}
        <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between">
          <div className="h-4 w-16 bg-slate-100 rounded-md" />
          <div className="h-4 w-16 bg-slate-100 rounded-md" />
          <div className="h-4 w-20 bg-slate-100 rounded-md" />
        </div>

        {/* Action Button Placeholder */}
        <div className="pt-1">
          <div className="h-9 w-full bg-slate-100 hover:bg-slate-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function LoadingGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <PropertyCardSkeleton key={idx} />
      ))}
    </div>
  );
}

export function LoadingPropertiesBanner() {
  // Ultra-clean, subtle non-intrusive loading placeholder
  return null;
}
