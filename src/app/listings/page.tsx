'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FilterBar from '@/components/listings/FilterBar';
import PropertyCard from '@/components/listings/PropertyCard';
import PropertyCardSkeleton, { LoadingPropertiesBanner } from '@/components/listings/PropertyCardSkeleton';
import InteractiveMap from '@/components/listings/InteractiveMap';
import PageGuide from '@/components/guide/PageGuide';
import { getStoredProperties, syncWithServer } from '@/data/propertyStore';
import { FilterState, ListingType, Property } from '@/types/property';
import { Map, Grid, ShieldCheck, RefreshCw } from 'lucide-react';

function ListingsContent() {
  const searchParams = useSearchParams();

  const [allProperties, setAllProperties] = useState<Property[]>(() =>
    typeof window !== 'undefined' ? getStoredProperties() : []
  );
  const [isLoading, setIsLoading] = useState(() =>
    typeof window === 'undefined' ? true : getStoredProperties().length === 0
  );

  // Initialize filters based on URL parameters
  const [filters, setFilters] = useState<FilterState>({
    listingType: (searchParams.get('type') as ListingType) || 'sale',
    query: '',
    location: searchParams.get('location') || 'all',
    state: searchParams.get('state') || 'all',
    propertyType: 'all',
    minPrice: 0,
    maxPrice: 9999999,
    bedrooms: searchParams.get('bedrooms')
      ? searchParams.get('bedrooms') === 'any'
        ? 'any'
        : Number(searchParams.get('bedrooms'))
      : 'any',
    bathrooms: 'any',
    verifiedOnly: false,
    fhaOnly: searchParams.get('fha') === 'true',
    underMarketOnly: false,
  });

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'price-asc' | 'price-desc' | 'newest'>('price-asc');
  const [mobileTab, setMobileTab] = useState<'list' | 'map'>('list');

  // Load properties from reactive store & sync with server
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

  // Handle URL presets
  useEffect(() => {
    const priceParam = searchParams.get('price');
    if (priceParam) {
      if (priceParam === 'under150k') setFilters((f) => ({ ...f, maxPrice: 150000 }));
      else if (priceParam === '150k-250k') setFilters((f) => ({ ...f, maxPrice: 250000 }));
      else if (priceParam === '250k-350k') setFilters((f) => ({ ...f, maxPrice: 350000 }));
      else if (priceParam === '350k-500k') setFilters((f) => ({ ...f, maxPrice: 500000 }));
      else if (priceParam === 'under800') setFilters((f) => ({ ...f, maxPrice: 800 }));
      else if (priceParam === '800-1200') setFilters((f) => ({ ...f, maxPrice: 1200 }));
      else if (priceParam === '1200-1600') setFilters((f) => ({ ...f, maxPrice: 1600 }));
    }

    const typeParam = searchParams.get('type');
    if (typeParam === 'sale' || typeParam === 'rent') {
      setFilters((f) => ({ ...f, listingType: typeParam }));
    }

    const stateParam = searchParams.get('state');
    if (stateParam) {
      setFilters((f) => ({ ...f, state: stateParam }));
    }
  }, [searchParams]);

  // Filter properties
  const filteredProperties = allProperties
    .filter((prop) => {
      if (prop.listingType !== filters.listingType) return false;

      // Filter by state
      if (filters.state !== 'all' && prop.address.state.toUpperCase() !== filters.state.toUpperCase()) {
        return false;
      }

      // Filter by city / metro keyword
      if (
        filters.location !== 'all' &&
        !prop.address.city.toLowerCase().includes(filters.location.toLowerCase()) &&
        !prop.address.neighborhood?.toLowerCase().includes(filters.location.toLowerCase())
      ) {
        return false;
      }

      // Filter by property type
      if (filters.propertyType !== 'all' && prop.propertyType !== filters.propertyType) {
        return false;
      }

      // Filter by budget
      if (prop.price < filters.minPrice || prop.price > filters.maxPrice) {
        return false;
      }

      // Filter by bedrooms
      if (filters.bedrooms !== 'any' && prop.specs.bedrooms < (filters.bedrooms as number)) {
        return false;
      }

      // Filter by bathrooms
      if (filters.bathrooms !== 'any' && prop.specs.bathrooms < (filters.bathrooms as number)) {
        return false;
      }

      // Toggles
      if (filters.verifiedOnly && !prop.isVerified) return false;
      if (filters.fhaOnly && !prop.fhaEligible) return false;
      if (filters.underMarketOnly && !prop.underMarketValue) return false;

      // Search Query Text
      if (filters.query.trim()) {
        const q = filters.query.toLowerCase();
        const matchTitle = prop.title.toLowerCase().includes(q);
        const matchCity = prop.address.city.toLowerCase().includes(q);
        const matchState = prop.address.state.toLowerCase().includes(q);
        const matchZip = prop.address.zipCode.includes(q);
        const matchDesc = prop.description.toLowerCase().includes(q);
        if (!matchTitle && !matchCity && !matchState && !matchZip && !matchDesc) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'price-asc') return a.price - b.price;
      if (sortOrder === 'price-desc') return b.price - a.price;
      if (sortOrder === 'newest') return new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime();
      return 0;
    });

  const handleResetFilters = () => {
    setFilters({
      listingType: 'sale',
      query: '',
      location: 'all',
      state: 'all',
      propertyType: 'all',
      minPrice: 0,
      maxPrice: 9999999,
      bedrooms: 'any',
      bathrooms: 'any',
      verifiedOnly: false,
      fhaOnly: false,
      underMarketOnly: false,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Filter Control Header */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        resultCount={isLoading && allProperties.length === 0 ? 0 : filteredProperties.length}
      />

      {/* Main Split Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Page Guide Avatar Banner */}
        <PageGuide
          variant="banner"
          avatarSrc="/images/avatars/guide-map.jpg"
          badgeText="Nookfinder Metro Explorer"
          title="Interactive Map & 25+ Major State Inventory"
          description="Every property is verified by in-house Nookfinder staff with audited titles and deeds. Contact assigned staff directly via Email or Telegram with zero middleman markups."
          tips={['Synced card and map pins', 'Direct in-house staff contact', 'FHA & down payment grant filters']}
        />

        {/* Mobile View Toggle Buttons */}
        <div className="flex lg:hidden items-center justify-center p-1 bg-slate-200 rounded-md max-w-xs mx-auto">
          <button
            onClick={() => setMobileTab('list')}
            className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1.5 ${
              mobileTab === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>List View ({isLoading && allProperties.length === 0 ? '...' : filteredProperties.length})</span>
          </button>
          <button
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1.5 ${
              mobileTab === 'map' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>
        </div>

        {/* Split-Screen Grid & Map Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Property List (7 cols) */}
          <div
            className={`lg:col-span-7 space-y-4 ${
              mobileTab === 'map' ? 'hidden lg:block' : 'block'
            }`}
          >
            {/* Sort Order Bar */}
            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-500 font-medium">
                {isLoading && allProperties.length === 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-800 font-semibold">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                    <span>Loading verified inventory from database...</span>
                  </span>
                ) : (
                  <>
                    Showing{' '}
                    <strong className="text-slate-900">{filteredProperties.length}</strong>{' '}
                    {filters.listingType === 'sale' ? 'homes for sale' : 'verified rentals'}
                  </>
                )}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">Sort by:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="font-medium text-slate-800 bg-transparent border-none focus:outline-hidden cursor-pointer"
                >
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest">Recently Added</option>
                </select>
              </div>
            </div>

            {/* LOADING STATE SKELETON CARDS */}
            {isLoading && allProperties.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PropertyCardSkeleton />
                <PropertyCardSkeleton />
                <PropertyCardSkeleton />
                <PropertyCardSkeleton />
              </div>
            ) : filteredProperties.length === 0 ? (
              /* Empty Filter State */
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center space-y-3">
                <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No properties matched this filter</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your budget slider or expanding the target state to discover available verified homes.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              /* Active Property Cards Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProperties.map((property) => (
                  <div
                    key={property.id}
                    onMouseEnter={() => setSelectedPropertyId(property.id)}
                    className={selectedPropertyId === property.id ? 'ring-2 ring-emerald-600 rounded-lg' : ''}
                  >
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Sticky Interactive Map (5 cols) */}
          <div
            className={`lg:col-span-5 sticky top-36 ${
              mobileTab === 'list' ? 'hidden lg:block' : 'block'
            }`}
          >
            <InteractiveMap
              properties={filteredProperties}
              selectedPropertyId={selectedPropertyId}
              onSelectProperty={setSelectedPropertyId}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
          Loading verified listings...
        </div>
      }
    >
      <ListingsContent />
    </Suspense>
  );
}
