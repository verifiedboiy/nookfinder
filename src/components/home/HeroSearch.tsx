'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Home, DollarSign, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function HeroSearch() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'sale' | 'rent'>('sale');
  const [location, setLocation] = useState('all');
  const [propertyType, setPropertyType] = useState('all');
  const [priceBracket, setPriceBracket] = useState('all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set('type', activeTab);
    if (location !== 'all') params.set('location', location);
    if (propertyType !== 'all') params.set('propertyType', propertyType);
    if (priceBracket !== 'all') params.set('price', priceBracket);

    router.push(`/listings?${params.toString()}`);
  };

  return (
    <div className="relative bg-slate-900 text-white pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
      {/* Background Architectural Grid Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        {/* Verified Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>The 100% Verified Affordable Housing Platform</span>
        </div>

        {/* Hero Editorial Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-3xl mx-auto font-display leading-tight">
          Find your sanctuary. Discover homes to buy or rent.
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
          Curated starter homes from $140,000 and accessible rentals starting under $800/month. No bait-and-switch pricing, no fake listings, and zero hidden broker fees.
        </p>

        {/* Floating Search Card Module */}
        <div className="pt-4 max-w-4xl mx-auto">
          <div className="bg-white text-slate-900 rounded-lg p-3 sm:p-4 shadow-xl border border-slate-200">
            {/* Segmented Buy / Rent Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('sale');
                  setPriceBracket('all');
                }}
                className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                  activeTab === 'sale'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Buy a Home ($140k - $500k)
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('rent');
                  setPriceBracket('all');
                }}
                className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                  activeTab === 'rent'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Rent a Home (Under $800+)
              </button>
            </div>

            {/* Form Inputs Grid */}
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Location Select */}
              <div className="flex flex-col text-left">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-700" /> Target Metro
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-emerald-600"
                >
                  <option value="all">All 25+ Major States & Metros</option>
                  <option value="TX">Texas (Houston / Austin / Dallas)</option>
                  <option value="FL">Florida (Tampa / Orlando / Miami)</option>
                  <option value="GA">Georgia (Atlanta)</option>
                  <option value="NC">North Carolina (Charlotte / Raleigh)</option>
                  <option value="OH">Ohio (Columbus / Cleveland)</option>
                  <option value="PA">Pennsylvania (Philadelphia / Pittsburgh)</option>
                  <option value="IN">Indiana (Indianapolis)</option>
                  <option value="MI">Michigan (Detroit / Grand Rapids)</option>
                  <option value="IL">Illinois (Chicago / Peoria)</option>
                  <option value="MO">Missouri (Kansas City / St. Louis)</option>
                  <option value="TN">Tennessee (Nashville / Memphis)</option>
                  <option value="AZ">Arizona (Phoenix / Tucson)</option>
                  <option value="NV">Nevada (Las Vegas / Reno)</option>
                  <option value="CA">California (Sacramento / Fresno)</option>
                  <option value="NY">New York (Buffalo / Albany)</option>
                  <option value="WA">Washington (Spokane / Tacoma)</option>
                  <option value="CO">Colorado (Denver / Colorado Springs)</option>
                  <option value="VA">Virginia (Richmond / Norfolk)</option>
                  <option value="SC">South Carolina (Columbia / Greenville)</option>
                  <option value="MD">Maryland (Baltimore)</option>
                  <option value="WI">Wisconsin (Milwaukee / Madison)</option>
                  <option value="MN">Minnesota (Minneapolis / St. Paul)</option>
                  <option value="KY">Kentucky (Louisville / Lexington)</option>
                  <option value="AL">Alabama (Birmingham / Huntsville)</option>
                  <option value="OK">Oklahoma (Oklahoma City / Tulsa)</option>
                </select>
              </div>

              {/* Property Type Select */}
              <div className="flex flex-col text-left">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                  <Home className="w-3 h-3 text-emerald-700" /> Property Type
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-emerald-600"
                >
                  <option value="all">Any Category</option>
                  <option value="house">Single Family House</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="condo">Starter Condo</option>
                  <option value="studio">Minimalist Studio</option>
                </select>
              </div>

              {/* Price Range Select */}
              <div className="flex flex-col text-left">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-emerald-700" /> Budget Range
                </label>
                <select
                  value={priceBracket}
                  onChange={(e) => setPriceBracket(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-emerald-600"
                >
                  {activeTab === 'sale' ? (
                    <>
                      <option value="all">Any Price</option>
                      <option value="under150k">Under $150,000</option>
                      <option value="150k-250k">$150,000 - $250,000</option>
                      <option value="250k-350k">$250,000 - $350,000</option>
                      <option value="350k-500k">$350,000 - $500,000</option>
                    </>
                  ) : (
                    <>
                      <option value="all">Any Rent</option>
                      <option value="under800">Under $800 / month</option>
                      <option value="800-1200">$800 - $1,200 / month</option>
                      <option value="1200-1600">$1,200 - $1,600 / month</option>
                    </>
                  )}
                </select>
              </div>

              {/* Search Submit Action Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full h-10 inline-flex items-center justify-center gap-2 px-5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition-colors shadow-xs"
                >
                  <Search className="w-4 h-4" strokeWidth={2} />
                  <span>Search Nooks</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick Filter Pill Suggestions */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4 text-xs text-slate-300">
            <span className="text-slate-400">Popular Filters:</span>
            <button
              onClick={() => router.push('/listings?type=rent&price=under800')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              Rentals Under $800
            </button>
            <button
              onClick={() => router.push('/listings?type=sale&fha=true')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              FHA-Approved Homes
            </button>
            <button
              onClick={() => router.push('/listings?type=sale&price=under150k')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              Homes Under $150,000
            </button>
            <button
              onClick={() => router.push('/start')}
              className="px-2.5 py-1 rounded bg-emerald-900/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 transition-colors"
            >
              3-Step Match Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
