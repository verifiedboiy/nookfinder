'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getStoredProperties, syncWithServer } from '@/data/propertyStore';
import { Property } from '@/types/property';
import PropertyCard from '@/components/listings/PropertyCard';
import PropertyCardSkeleton from '@/components/listings/PropertyCardSkeleton';
import { ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

export default function FeaturedProperties() {
  const [filter, setFilter] = useState<'all' | 'sale' | 'rent'>('all');
  const [allProperties, setAllProperties] = useState<Property[]>(() =>
    typeof window !== 'undefined' ? getStoredProperties() : []
  );
  const [isLoading, setIsLoading] = useState(() =>
    typeof window === 'undefined' ? true : getStoredProperties().length === 0
  );

  useEffect(() => {
    let isMounted = true;

    const loadData = () => {
      const stored = getStoredProperties();
      if (isMounted) {
        setAllProperties(stored);
        if (stored.length > 0) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    // Trigger server sync to pull latest database properties
    syncWithServer()
      .then((serverProps) => {
        if (isMounted && Array.isArray(serverProps) && serverProps.length > 0) {
          setAllProperties(serverProps);
          setIsLoading(false);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    window.addEventListener('nookfinder_storage_updated', loadData);
    window.addEventListener('storage', loadData);
    window.addEventListener('focus', loadData);
    window.addEventListener('visibilitychange', loadData);

    return () => {
      isMounted = false;
      window.removeEventListener('nookfinder_storage_updated', loadData);
      window.removeEventListener('storage', loadData);
      window.removeEventListener('focus', loadData);
      window.removeEventListener('visibilitychange', loadData);
    };
  }, []);

  const filteredProperties = allProperties.filter((prop) => {
    if (filter === 'all') return true;
    return prop.listingType === filter;
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
              All Listings
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
              For Sale
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
              For Rent
            </button>
          </div>
        </div>

        {/* LOADING ANIMATION STATE */}
        {isLoading && allProperties.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
          </div>
        ) : filteredProperties.length === 0 ? (
          /* Empty Catalog State */
          <div className="p-12 text-center bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <ShieldCheck className="w-10 h-10 text-emerald-700 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 font-display">
              Live Verified Catalog
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Our specialists are actively listing verified homes and rentals. Check back shortly or view our complete catalog.
            </p>
          </div>
        ) : (
          /* Render Active Property Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.slice(0, 6).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {/* View All CTA Footer */}
        <div className="mt-12 text-center">
          <Link
            href={`/listings${filter !== 'all' ? `?type=${filter}` : ''}`}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-md bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            <span>Explore All {allProperties.length > 0 ? allProperties.length : ''} Verified Properties</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
