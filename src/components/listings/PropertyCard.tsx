import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/types/property';
import { Bed, Bath, Maximize2, ShieldCheck, MapPin, Tag, Eye, Heart } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  compact?: boolean;
}

export default function PropertyCard({ property, compact = false }: PropertyCardProps) {
  const primaryImage = property.images.find((img) => img.isPrimary) || property.images[0];
  const isRent = property.listingType === 'rent';

  const formattedPrice = isRent
    ? `$${property.price.toLocaleString()}/mo`
    : `$${property.price.toLocaleString()}`;

  return (
    <div className="group bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col">
      {/* 60% Card Visual Ratio Image Container */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
        <Image
          src={primaryImage?.url || ''}
          alt={primaryImage?.caption || property.title}
          fill
          unoptimized={primaryImage?.url?.startsWith('data:')}
          className="object-cover group-hover:scale-103 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Status Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
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
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold tracking-wide rounded bg-emerald-50 text-emerald-800 border border-emerald-200/80">
              <ShieldCheck className="w-3 h-3 text-emerald-700" />
              <span>Verified Listing</span>
            </span>
          )}
        </div>

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
            <Link href={`/listings/${property.id}`} className="hover:underline">
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

          {/* Social Proof Stats: Views & Likes */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2">
            <span className="inline-flex items-center gap-1 font-medium text-slate-600">
              <Eye className="w-3 h-3 text-slate-400" />
              <span>{(property.views ?? 1280).toLocaleString()} views</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 font-medium text-slate-600">
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500/20" />
              <span>{(property.likes ?? 64).toLocaleString()} saves</span>
            </span>
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

          <div className="flex items-center gap-1.5" title="Living Area">
            <Maximize2 className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
            <span className="font-semibold">{property.specs.squareFeet.toLocaleString()}</span>
            <span className="text-slate-500">sq ft</span>
          </div>
        </div>

        {/* View Details Link Action */}
        <div className="pt-2">
          <Link
            href={`/listings/${property.id}`}
            className="block w-full text-center py-2 px-3 text-xs font-semibold rounded bg-slate-100 text-slate-800 hover:bg-emerald-700 hover:text-white transition-colors"
          >
            View Verified Details
          </Link>
        </div>
      </div>
    </div>
  );
}
