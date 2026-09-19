'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Property } from '@/types/property';
import { Bed, Bath, Maximize2, ShieldCheck, MapPin, Tag, Eye, Heart, Sparkles, TrendingUp } from 'lucide-react';
import { isPropertySaved, toggleSaveProperty } from '@/lib/savedProperties';

interface PropertyCardProps {
  property: Property;
  compact?: boolean;
}

export default function PropertyCard({ property, compact = false }: PropertyCardProps) {
  const router = useRouter();
  const primaryImage = property.images.find((img) => img.isPrimary) || property.images[0];
  const isRent = property.listingType === 'rent';

  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(property.likes ?? 64);

  const handlePrefetch = useCallback(() => {
    try {
      router.prefetch(`/listings/${property.id}`);
    } catch {}
  }, [router, property.id]);

  useEffect(() => {
    setIsSaved(isPropertySaved(property.id));

    const handleSavedChange = (e: any) => {
      if (e.detail?.propertyId === property.id) {
        setIsSaved(e.detail.isSaved);
        setLikesCount((prev) => (e.detail.isSaved ? prev + 1 : Math.max(0, prev - 1)));
      }
    };

    window.addEventListener('nookfinder_saved_homes_updated', handleSavedChange);
    return () => window.removeEventListener('nookfinder_saved_homes_updated', handleSavedChange);
  }, [property.id]);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newSaved = toggleSaveProperty(property.id);
    setIsSaved(newSaved);
    setLikesCount((prev) => (newSaved ? prev + 1 : Math.max(0, prev - 1)));
  };

  const formattedPrice = isRent
    ? `$${property.price.toLocaleString()}/mo`
    : `$${property.price.toLocaleString()}`;

  const hasMarketBadge = property.marketDemandBadge && property.marketDemandBadge !== 'none';

  return (
    <div
      onMouseEnter={handlePrefetch}
      onTouchStart={handlePrefetch}
      className="group bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col"
    >
      {/* 60% Card Visual Ratio Image Container */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
        <Link
          href={`/listings/${property.id}`}
          prefetch={true}
          className="block w-full h-full relative cursor-pointer"
          aria-label={`View ${property.title}`}
        >
          <Image
            src={primaryImage?.url || ''}
            alt={primaryImage?.caption || property.title}
            fill
            unoptimized={primaryImage?.url?.startsWith('data:')}
            className="object-cover group-hover:scale-103 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>

        {/* Status Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 max-w-[80%]">
          <span
            className={`px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded ${
              isRent
                ? 'bg-slate-900 text-white'
                : 'bg-emerald-800 text-white'
            }`}
          >
            {isRent ? 'For Rent' : 'For Sale'}
          </span>

          {property.isVerified && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold tracking-wide rounded bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
              <ShieldCheck className="w-3 h-3 text-emerald-700" />
              <span>Verified Listing</span>
            </span>
          )}

          {hasMarketBadge && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold tracking-wide rounded bg-amber-50 text-amber-900 border border-amber-200/90 shadow-2xs">
              <TrendingUp className="w-3 h-3 text-amber-700" />
              <span>{property.marketDemandBadge}</span>
            </span>
          )}
        </div>

        {/* Interactive Save / Favorite Button */}
        <button
          type="button"
          onClick={handleSaveToggle}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 z-20 cursor-pointer shadow-sm ${
            isSaved
              ? 'bg-rose-600 text-white hover:bg-rose-700'
              : 'bg-slate-900/60 text-white hover:bg-slate-900/80 hover:text-rose-400'
          }`}
          title={isSaved ? 'Remove from Saved Homes' : 'Save this Home'}
          aria-label={isSaved ? 'Saved home' : 'Save home'}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-white stroke-white' : ''}`} />
        </button>

        {/* Affordability Tag */}
        <div className="absolute bottom-3 left-3 flex gap-1 z-10">
          {property.price < 800 && isRent && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded bg-emerald-600 text-white shadow-xs">
              <Tag className="w-2.5 h-2.5" /> Under $800/mo
            </span>
          )}
          {property.fhaEligible && !isRent && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded bg-slate-900 text-white shadow-xs">
              FHA Approved
            </span>
          )}
        </div>
      </div>

      {/* Card Information Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Price Header */}
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold tracking-tight text-slate-900 font-display">
              {formattedPrice}
            </span>
            {isRent && (
              <span className="text-xs text-slate-500 font-medium">
                Deposit: ${property.price.toLocaleString()}
              </span>
            )}
            {!isRent && (
              <span className="text-xs text-slate-500 font-medium">
                Est. ${(Math.round(property.price * 0.006)).toLocaleString()}/mo
              </span>
            )}
          </div>

          {/* Title & Tagline */}
          <h3 className="text-base font-semibold text-slate-900 line-clamp-1 mt-1 font-display group-hover:text-emerald-700 transition-colors">
            <Link href={`/listings/${property.id}`} prefetch={true} className="hover:underline">
              {property.title}
            </Link>
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {property.address.neighborhood}, {property.address.city}, {property.address.state}
            </span>
          </div>

          {/* Social Proof Stats: Views & Interactive Saves */}
          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2">
            <span className="inline-flex items-center gap-1 font-medium text-slate-600">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>{(property.views ?? 1280).toLocaleString()} views</span>
            </span>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={handleSaveToggle}
              className={`inline-flex items-center gap-1 font-medium cursor-pointer transition-colors ${
                isSaved ? 'text-rose-600 font-bold' : 'text-slate-600 hover:text-rose-600'
              }`}
              title={isSaved ? 'Click to unsave' : 'Click to save'}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'text-rose-600 fill-rose-600' : 'text-slate-400'}`} />
              <span>{likesCount.toLocaleString()} {isSaved ? 'saved' : 'saves'}</span>
            </button>
          </div>
        </div>

        {/* Specifications Line Grid */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-1.5" title="Bedrooms">
            <Bed className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
            <span className="font-semibold">{property.specs.bedrooms}</span>
            <span className="text-slate-500">{property.specs.bedrooms === 1 ? 'bed' : 'beds'}</span>
          </div>

          <div className="flex items-center gap-1.5" title="Bathrooms">
            <Bath className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
            <span className="font-semibold">{property.specs.bathrooms}</span>
            <span className="text-slate-500">bath</span>
          </div>

          <div className="flex items-center gap-1.5" title="Interior Living Space">
            <Maximize2 className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
            <span className="font-semibold">{property.specs.squareFeet.toLocaleString()}</span>
            <span className="text-slate-500">sq ft living</span>
          </div>
        </div>

        {/* Lot / Land Size Indicator (Total land the house sits on) */}
        {(property.specs.lotSizeSqFt || property.specs.lotSizeAcres) && (
          <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-100">
            <span className="text-slate-600 font-medium">Total Land / Lot Size:</span>
            <span className="font-bold text-slate-800">
              {property.specs.lotSizeSqFt
                ? `${property.specs.lotSizeSqFt.toLocaleString()} sq ft (${(property.specs.lotSizeAcres || (property.specs.lotSizeSqFt / 43560).toFixed(2))} ac)`
                : `${property.specs.lotSizeAcres} ac (${Math.round(Number(property.specs.lotSizeAcres) * 43560).toLocaleString()} sq ft)`}
            </span>
          </div>
        )}

        {/* View Details Link Action */}
        <div className="pt-2">
          <Link
            href={`/listings/${property.id}`}
            prefetch={true}
            className="block w-full text-center py-2 px-3 text-xs font-semibold rounded bg-slate-100 text-slate-800 hover:bg-emerald-700 hover:text-white transition-colors"
          >
            View Verified Details
          </Link>
        </div>
      </div>
    </div>
  );
}
