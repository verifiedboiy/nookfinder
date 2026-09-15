'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getStoredProperties } from '@/data/propertyStore';
import { Property } from '@/types/property';
import PropertyCard from '@/components/listings/PropertyCard';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function FeaturedProperties() {
  const [filter, setFilter] = useState<'all' | 'sale' | 'rent'>('all');
  const [allProperties, setAllProperties] = useState<Property[]>([]);

  useEffect(() => {
    const loadData = () => {
      setAllProperties(getStoredProperties());
    };
    loadData();

    window.addEventListener('nookfinder_storage_updated', loadData);
    window.addEventListener('storage', loadData);
    window.addEventListener('focus', loadData);
    window.addEventListener('visibilitychange', loadData);
    return () => {
      window.removeEventListener('nookfinder_storage_updated', loadData);
      window.removeEventListener('storage', loadData);
      window.removeEventListener('focus', loadData);
      window.removeEventListener('visibilitychange', loadData);
    };
  }, []);

  const filteredProperties = allProperties.filter((prop) => {
    if (filter === 'all') return prop.featured;
    return prop.featured && prop.listingType === filter;
  });

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Audited Inventory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
              Curated Affordable Properties
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Every home is verified for accurate pricing, clear title or lease terms, and zero inflated administrative fees.
            </p>
          </div>

          {/* Filter Segmented Controls */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Featured
            </button>
            <button
              type="button"
              onClick={() => setFilter('sale')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                filter === 'sale'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              For Sale ($140k+)
            </button>
            <button
              type="button"
              onClick={() => setFilter('rent')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                filter === 'rent'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              For Rent (Under $800+)
            </button>
          </div>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.slice(0, 6).map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {/* View All CTA Footer */}
        <div className="mt-12 text-center">
          <Link
            href={`/listings${filter !== 'all' ? `?type=${filter}` : ''}`}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-md bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            <span>Explore All {allProperties.length} Verified Properties</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
