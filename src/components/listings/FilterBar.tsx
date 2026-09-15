'use client';

import React from 'react';
import { FilterState, ListingType } from '@/types/property';
import { MAJOR_US_STATES } from '@/data/states';
import { RotateCcw, ShieldCheck, Check } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
  resultCount: number;
}

export default function FilterBar({ filters, onChange, onReset, resultCount }: FilterBarProps) {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-16 z-30 px-4 py-3 shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Side: Core Quick Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Buy / Rent Segment */}
          <div className="inline-flex rounded-md border border-slate-200 bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => onChange({ ...filters, listingType: 'sale' })}
              className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                filters.listingType === 'sale'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              For Sale
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...filters, listingType: 'rent' })}
              className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                filters.listingType === 'rent'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              For Rent
            </button>
          </div>

          {/* 25+ Major States Selector */}
          <select
            value={filters.state || 'all'}
            onChange={(e) => onChange({ ...filters, state: e.target.value })}
            aria-label="Filter by US State"
            className="text-xs font-medium border border-slate-200 rounded px-2.5 py-1.5 bg-white text-slate-800 focus:outline-hidden focus:border-emerald-600"
          >
            <option value="all">All 25+ Major States</option>
            {MAJOR_US_STATES.map((st) => (
              <option key={st.code} value={st.code}>
                {st.name} ({st.code})
              </option>
            ))}
          </select>

          {/* Price Range Filter */}
          <select
            value={filters.maxPrice}
            onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
            aria-label="Filter by Maximum Price"
            className="text-xs font-medium border border-slate-200 rounded px-2.5 py-1.5 bg-white text-slate-800 focus:outline-hidden focus:border-emerald-600"
          >
            {filters.listingType === 'sale' ? (
              <>
                <option value="9999999">Max Price: Any</option>
                <option value="150000">Max: $150,000</option>
                <option value="250000">Max: $250,000</option>
                <option value="350000">Max: $350,000</option>
                <option value="500000">Max: $500,000</option>
              </>
            ) : (
              <>
                <option value="9999999">Max Rent: Any</option>
                <option value="800">Max: $800/mo (Under $800)</option>
                <option value="1200">Max: $1,200/mo</option>
                <option value="1600">Max: $1,600/mo</option>
              </>
            )}
          </select>

          {/* Bedrooms Filter */}
          <select
            value={filters.bedrooms}
            onChange={(e) =>
              onChange({
                ...filters,
                bedrooms: e.target.value === 'any' ? 'any' : Number(e.target.value),
              })
            }
            aria-label="Filter by Bedroom Count"
            className="text-xs font-medium border border-slate-200 rounded px-2.5 py-1.5 bg-white text-slate-800 focus:outline-hidden focus:border-emerald-600"
          >
            <option value="any">Beds: Any</option>
            <option value="0">Studio</option>
            <option value="1">1+ Bed</option>
            <option value="2">2+ Beds</option>
            <option value="3">3+ Beds</option>
          </select>

          {/* FHA Toggle for Sales */}
          {filters.listingType === 'sale' && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, fhaOnly: !filters.fhaOnly })}
              className={`px-2.5 py-1.5 rounded text-xs font-medium border transition-colors flex items-center gap-1 ${
                filters.fhaOnly
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-semibold'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {filters.fhaOnly && <Check className="w-3 h-3 text-emerald-700" />}
              <span>FHA Eligible</span>
            </button>
          )}

          {/* Verified Only Toggle */}
          <button
            type="button"
            onClick={() => onChange({ ...filters, verifiedOnly: !filters.verifiedOnly })}
            className={`px-2.5 py-1.5 rounded text-xs font-medium border transition-colors flex items-center gap-1 ${
              filters.verifiedOnly
                ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-semibold'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-emerald-700" />
            <span>Verified Only</span>
          </button>
        </div>

        {/* Right Side: Result Count & Reset */}
        <div className="flex items-center gap-3 self-end md:self-auto text-xs text-slate-500">
          <span className="font-semibold text-slate-900">
            {resultCount} {resultCount === 1 ? 'Property' : 'Properties'} Available
          </span>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
