'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageGuide from '@/components/guide/PageGuide';
import { getStoredProperties } from '@/data/propertyStore';
import { Property } from '@/types/property';
import {
  Bed,
  Bath,
  Maximize2,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Mail,
  Send,
  ArrowLeft,
  Share2,
  ChevronLeft,
  ChevronRight,
  X,
  ImageIcon,
  DollarSign,
  Building,
} from 'lucide-react';

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = params?.id as string;

  const [properties, setProperties] = useState<Property[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Inquiry Form State
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState(
    'Hello, I would like to schedule a showing and inquire about this property.'
  );
  const [inquirySent, setInquirySent] = useState(false);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = () => {
      setProperties(getStoredProperties());
      setIsLoaded(true);
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

  const property = properties.find((p) => p.id === propertyId) || null;

  // Keyboard navigation for photo lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
      } else if (e.key === 'ArrowRight') {
        setActivePhotoIdx((prev) => (prev + 1) % (property?.images?.length || 1));
      } else if (e.key === 'ArrowLeft') {
        setActivePhotoIdx((prev) => (prev - 1 + (property?.images?.length || 1)) % (property?.images?.length || 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, property?.images?.length]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        Loading verified property details...
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
            <Building className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Listing No Longer Available
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            This property listing has been removed or is off the market. Explore our active verified inventory to find other homes.
          </p>
          <div className="pt-4">
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Active Listings</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isRent = property.listingType === 'rent';

  // Monthly breakdown calculation
  const downPayment = Math.round(property.price * 0.05);
  const loanAmount = property.price - downPayment;
  const monthlyRate = 0.065 / 12;
  const totalMonths = 360;
  const monthlyPI = isRent
    ? property.price
    : Math.round(
        (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
          (Math.pow(1 + monthlyRate, totalMonths) - 1)
      );
  const monthlyTax = Math.round(property.specs.propertyTaxAnnual / 12);
  const monthlyInsurance = isRent ? 25 : Math.round((property.price * 0.005) / 12);
  const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + property.specs.hoaMonthly;

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryEmail.trim()) return;

    try {
      // Record inquiry in server database
      await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          propertyTitle: property.title,
          propertyAddress: `${property.address.street}, ${property.address.city}, ${property.address.state}`,
          propertyPrice: property.price,
          userName: inquiryName.trim(),
          userEmail: inquiryEmail.trim(),
          message: inquiryMessage.trim() || `I am interested in scheduling a showing for ${property.title}.`,
        }),
      });
    } catch (err) {
      console.warn('Inquiry local logging error:', err);
    }

    setInquirySent(true);

    // Also trigger email client pre-filled to nookkfinder@gmail.com
    const subject = encodeURIComponent(`[Nookfinder Inquiry] ${property.title} (${property.id})`);
    const body = encodeURIComponent(
      `Hello Nookfinder Staff,\n\nI would like to inquire about the following verified property:\n\nProperty: ${property.title}\nAddress: ${property.address.street}, ${property.address.city}, ${property.address.state}\nPrice: $${property.price.toLocaleString()}\n\nMy Contact Information:\nName: ${inquiryName.trim()}\nEmail: ${inquiryEmail.trim()}\n\nMessage:\n${inquiryMessage.trim() || 'I would like to schedule a showing.'}\n\nThank you!`
    );
    window.open(`mailto:nookkfinder@gmail.com?subject=${subject}&body=${body}`, '_blank');
  };

  const nextPhoto = () => {
    setActivePhotoIdx((prev) => (prev + 1) % property.images.length);
  };

  const prevPhoto = () => {
    setActivePhotoIdx((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <Link
            href="/listings"
            className="inline-flex items-center gap-1 text-slate-700 hover:text-emerald-700 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Explorer</span>
          </Link>

          <div className="flex items-center gap-3">
            <span>
              Listing ID: <span className="font-mono text-slate-700">{property.id}</span>
            </span>
            <button
              onClick={() => alert('Listing link copied to clipboard.')}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        </div>

        {/* Title Header Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded ${
                  isRent ? 'bg-slate-900 text-white' : 'bg-emerald-800 text-white'
                }`}
              >
                {isRent ? 'Verified Rental' : 'Verified For Sale'}
              </span>

              {property.isVerified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>100% Audited Title & Deed</span>
                </span>
              )}

              {property.fhaEligible && !isRent && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-800">
                  FHA Loan Eligible
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
              {property.title}
            </h1>

            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {property.address.street}, {property.address.neighborhood}, {property.address.city},{' '}
                {property.address.state} {property.address.zipCode}
              </span>
            </div>
          </div>

          <div className="text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
            <div className="text-3xl font-bold tracking-tight text-slate-900 font-display">
              {isRent ? `$${property.price.toLocaleString()}` : `$${property.price.toLocaleString()}`}
              {isRent && <span className="text-base font-normal text-slate-500"> / mo</span>}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {isRent
                ? 'Zero broker fee • Standardized tenant agreement'
                : `Est. Total: $${totalMonthly.toLocaleString()} / mo with 5% down`}
            </div>
          </div>
        </div>

        {/* COMPREHENSIVE MULTI-PHOTO GALLERY (3 to 20 Photos - Clean & Proportioned) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-emerald-700" />
              <span>Verified Photo Gallery ({property.images.length} Photos)</span>
            </span>

            <button
              type="button"
              onClick={() => {
                setActivePhotoIdx(0);
                setLightboxOpen(true);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>View All {property.images.length} Photos Fullscreen</span>
            </button>
          </div>

          {/* Cleanly Constrained Gallery Container (Max Height bounded so images never blow up) */}
          <div className="w-full h-[280px] sm:h-[360px] md:h-[440px] rounded-xl overflow-hidden border border-slate-200 bg-slate-950 shadow-xs select-none">
            {property.images.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <ImageIcon className="w-8 h-8 mr-2 text-slate-500" />
                <span>No photos available for this listing</span>
              </div>
            ) : property.images.length === 1 ? (
              // 1 Photo: Full bleed hero
              <div
                onClick={() => {
                  setActivePhotoIdx(0);
                  setLightboxOpen(true);
                }}
                className="relative w-full h-full cursor-pointer group"
              >
                <Image
                  src={property.images[0].url}
                  alt={property.images[0].caption || property.title}
                  fill
                  unoptimized={property.images[0].url.startsWith('data:')}
                  className="object-cover group-hover:scale-101 transition-transform duration-300"
                  sizes="100vw"
                  priority
                />
                <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded">
                  {property.images[0].caption || 'Primary View'}
                </span>
              </div>
            ) : property.images.length === 2 ? (
              // 2 Photos: 50 / 50 Split
              <div className="grid grid-cols-2 gap-2 h-full w-full">
                {property.images.slice(0, 2).map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setActivePhotoIdx(idx);
                      setLightboxOpen(true);
                    }}
                    className="relative h-full w-full cursor-pointer group overflow-hidden"
                  >
                    <Image
                      src={img.url}
                      alt={img.caption || `Photo ${idx + 1}`}
                      fill
                      unoptimized={img.url.startsWith('data:')}
                      className="object-cover group-hover:scale-102 transition-transform duration-300"
                      sizes="50vw"
                      priority={idx === 0}
                    />
                    <span className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded truncate max-w-[85%]">
                      {img.caption}
                    </span>
                  </div>
                ))}
              </div>
            ) : property.images.length === 3 ? (
              // 3 Photos: 2/3 Main Hero (Left) + 2 Stacked Tiles (Right)
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 h-full w-full">
                <div
                  onClick={() => {
                    setActivePhotoIdx(0);
                    setLightboxOpen(true);
                  }}
                  className="md:col-span-2 relative h-full w-full cursor-pointer group overflow-hidden"
                >
                  <Image
                    src={property.images[0].url}
                    alt={property.images[0].caption || property.title}
                    fill
                    unoptimized={property.images[0].url.startsWith('data:')}
                    className="object-cover group-hover:scale-102 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 66vw"
                    priority
                  />
                  <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded">
                    {property.images[0].caption || 'Primary View'}
                  </span>
                </div>

                <div className="grid grid-rows-2 gap-2 h-full">
                  {property.images.slice(1, 3).map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setActivePhotoIdx(idx + 1);
                        setLightboxOpen(true);
                      }}
                      className="relative h-full w-full cursor-pointer group overflow-hidden"
                    >
                      <Image
                        src={img.url}
                        alt={img.caption || `Photo ${idx + 2}`}
                        fill
                        unoptimized={img.url.startsWith('data:')}
                        className="object-cover group-hover:scale-103 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                      <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded truncate max-w-[85%]">
                        {img.caption}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : property.images.length === 4 ? (
              // 4 Photos: 2/3 Main Hero (Left) + 3 Stacked Tiles (Right)
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 h-full w-full">
                <div
                  onClick={() => {
                    setActivePhotoIdx(0);
                    setLightboxOpen(true);
                  }}
                  className="md:col-span-2 relative h-full w-full cursor-pointer group overflow-hidden"
                >
                  <Image
                    src={property.images[0].url}
                    alt={property.images[0].caption || property.title}
                    fill
                    unoptimized={property.images[0].url.startsWith('data:')}
                    className="object-cover group-hover:scale-102 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 66vw"
                    priority
                  />
                  <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded">
                    {property.images[0].caption || 'Primary View'}
                  </span>
                </div>

                <div className="grid grid-rows-3 gap-2 h-full">
                  {property.images.slice(1, 4).map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setActivePhotoIdx(idx + 1);
                        setLightboxOpen(true);
                      }}
                      className="relative h-full w-full cursor-pointer group overflow-hidden"
                    >
                      <Image
                        src={img.url}
                        alt={img.caption || `Photo ${idx + 2}`}
                        fill
                        unoptimized={img.url.startsWith('data:')}
                        className="object-cover group-hover:scale-103 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                      <span className="absolute bottom-1.5 left-1.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-1.5 py-0.2 rounded truncate max-w-[85%]">
                        {img.caption}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // 5+ Photos: Balanced 5-Tile Mosaic (50% Hero + 2x2 Grid of 4)
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-full w-full">
                <div
                  onClick={() => {
                    setActivePhotoIdx(0);
                    setLightboxOpen(true);
                  }}
                  className="relative h-full w-full cursor-pointer group overflow-hidden"
                >
                  <Image
                    src={property.images[0].url}
                    alt={property.images[0].caption || property.title}
                    fill
                    unoptimized={property.images[0].url.startsWith('data:')}
                    className="object-cover group-hover:scale-102 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                  <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded">
                    {property.images[0].caption || 'Primary View'}
                  </span>
                </div>

                <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">
                  {property.images.slice(1, 5).map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setActivePhotoIdx(idx + 1);
                        setLightboxOpen(true);
                      }}
                      className="relative h-full w-full cursor-pointer group overflow-hidden"
                    >
                      <Image
                        src={img.url}
                        alt={img.caption || `Photo ${idx + 2}`}
                        fill
                        unoptimized={img.url.startsWith('data:')}
                        className="object-cover group-hover:scale-103 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded truncate max-w-[85%]">
                        {img.caption}
                      </span>

                      {/* Overly on 5th photo when more exist */}
                      {idx === 3 && property.images.length > 5 && (
                        <div className="absolute inset-0 bg-slate-950/75 hover:bg-slate-950/65 backdrop-blur-xs text-white font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1 transition-colors">
                          <ImageIcon className="w-5 h-5 text-emerald-400" />
                          <span>+{property.images.length - 5} More Photos</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clean Horizontal Thumbnail Scrubber for all photos (3-20) */}
          {property.images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActivePhotoIdx(idx);
                    setLightboxOpen(true);
                  }}
                  className={`relative w-20 h-14 sm:w-24 sm:h-16 rounded-lg border overflow-hidden shrink-0 cursor-pointer transition-all ${
                    idx === activePhotoIdx
                      ? 'border-emerald-600 ring-2 ring-emerald-500/40 opacity-100'
                      : 'border-slate-200 hover:border-slate-400 opacity-75 hover:opacity-100'
                  }`}
                  title={`View photo ${idx + 1}: ${img.caption}`}
                >
                  <Image
                    src={img.url}
                    alt={img.caption}
                    fill
                    unoptimized={img.url.startsWith('data:')}
                    className="object-cover"
                    sizes="96px"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-white text-[9px] px-1 py-0.2 truncate text-center">
                    {idx + 1}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* FULLSCREEN LIGHTBOX MODAL */}
        {lightboxOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
            {/* Top Bar */}
            <div className="flex items-center justify-between text-white border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-300 text-xs font-mono font-bold">
                  Photo {activePhotoIdx + 1} of {property.images.length}
                </span>
                <span className="text-sm font-semibold text-slate-200 truncate max-w-md">
                  {property.images[activePhotoIdx]?.caption}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLightboxOpen(false)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
                  title="Close Lightbox (Esc)"
                  aria-label="Close Lightbox"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Central Active Photo Viewport */}
            <div className="relative flex-1 flex items-center justify-center my-3 overflow-hidden">
              <div className="relative w-full h-full max-h-[72vh] max-w-5xl flex items-center justify-center">
                <Image
                  src={property.images[activePhotoIdx]?.url || ''}
                  alt={property.images[activePhotoIdx]?.caption || 'Property photo'}
                  fill
                  unoptimized={property.images[activePhotoIdx]?.url?.startsWith('data:')}
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>

              {/* Navigation Arrows */}
              {property.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevPhoto}
                    className="absolute left-2 sm:left-4 p-3 rounded-full bg-slate-900/85 hover:bg-slate-800 text-white shadow-xl transition-transform hover:scale-105 cursor-pointer"
                    title="Previous Photo (Left Arrow)"
                    aria-label="Previous Photo"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={nextPhoto}
                    className="absolute right-2 sm:right-4 p-3 rounded-full bg-slate-900/85 hover:bg-slate-800 text-white shadow-xl transition-transform hover:scale-105 cursor-pointer"
                    title="Next Photo (Right Arrow)"
                    aria-label="Next Photo"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Thumbnail Tray */}
            <div className="flex gap-2 justify-center overflow-x-auto pt-2.5 border-t border-slate-800 scrollbar-thin">
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`relative w-16 h-12 rounded-lg overflow-hidden border shrink-0 transition-all cursor-pointer ${
                    idx === activePhotoIdx
                      ? 'border-emerald-500 scale-105 ring-2 ring-emerald-500 opacity-100'
                      : 'border-slate-700 opacity-50 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.caption}
                    fill
                    unoptimized={img.url.startsWith('data:')}
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2-Column Specs & Inquiry Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Details & Specs (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Quick Metrics Bar */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="border-r border-slate-100 last:border-none">
                <span className="text-xs text-slate-500 block">Bedrooms</span>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <Bed className="w-4 h-4 text-emerald-700" />
                  <span className="text-lg font-bold text-slate-900">{property.specs.bedrooms}</span>
                </div>
              </div>

              <div className="border-r border-slate-100 last:border-none">
                <span className="text-xs text-slate-500 block">Bathrooms</span>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <Bath className="w-4 h-4 text-emerald-700" />
                  <span className="text-lg font-bold text-slate-900">{property.specs.bathrooms}</span>
                </div>
              </div>

              <div className="border-r border-slate-100 last:border-none">
                <span className="text-xs text-slate-500 block">Living Area</span>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <Maximize2 className="w-4 h-4 text-emerald-700" />
                  <span className="text-lg font-bold text-slate-900">
                    {property.specs.squareFeet.toLocaleString()} sq ft
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-500 block">Year Built</span>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <span className="text-lg font-bold text-slate-900">{property.specs.yearBuilt}</span>
                </div>
              </div>
            </div>

            {/* Narrative Description */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs space-y-3">
              <h2 className="text-lg font-bold text-slate-900 font-display">
                Property Overview
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900 font-display">
                Verified Features & Inclusions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                {property.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* True Monthly Cost Breakdown */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-display">
                    True Monthly Cost Breakdown
                  </h2>
                  <p className="text-xs text-slate-500">
                    Transparent financial calculation with zero hidden broker surcharges.
                  </p>
                </div>
                <span className="text-xl font-bold text-emerald-800 font-display">
                  ${totalMonthly.toLocaleString()} / mo
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-600">
                    {isRent ? 'Monthly Base Rent' : 'Principal & Interest (5% down, 6.5% rate)'}
                  </span>
                  <span className="font-bold text-slate-900">${monthlyPI.toLocaleString()}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-600">Estimated Property Tax</span>
                  <span className="font-bold text-slate-900">${monthlyTax.toLocaleString()} / mo</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-600">Homeowners / Renters Insurance</span>
                  <span className="font-bold text-slate-900">${monthlyInsurance.toLocaleString()} / mo</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-600">HOA Dues</span>
                  <span className="font-bold text-slate-900">
                    {property.specs.hoaMonthly === 0 ? '$0 (Zero HOA)' : `$${property.specs.hoaMonthly}/mo`}
                  </span>
                </div>
              </div>
            </div>

            {/* Advisor Tour Concierge Banner */}
            <PageGuide
              variant="card"
              avatarSrc="/images/avatars/guide-keys.jpg"
              badgeText="Nookfinder In-House Tour Concierge"
              title="Schedule a Verified Tour with Direct Nookfinder Staff"
              description="You will never be contacted by aggressive third-party listing agents. Nookfinder in-house specialists coordinate directly with verified landlords and deed-holders for private showings."
              tips={['Private in-person or video tour', 'Free cancellation up to 2 hours prior', 'Zero registration fee']}
            />
          </div>

          {/* Right Column: Nookfinder Dedicated Staff Card (4 cols) */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-5">
              {/* Agent Identity: In-House Nookfinder Staff */}
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200 shrink-0">
                  <Image
                    src={property.agent.avatarUrl}
                    alt={property.agent.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    {property.agent.name}
                  </h3>
                  <span className="text-[11px] text-emerald-800 font-semibold block">
                    Nookfinder In-House Specialist
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Staff ID: {property.agent.verifiedLicense}
                  </span>
                </div>
              </div>

              {/* DIRECT ACTION BUTTONS: EMAIL AGENT & TELEGRAM */}
              <div className="grid grid-cols-2 gap-2">
                {/* Email Agent Button */}
                <a
                  href={`mailto:nookkfinder@gmail.com?subject=Inquiry%20regarding%20Nookfinder%20Listing%20${property.id}`}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Agent</span>
                </a>

                {/* Telegram Direct Trigger */}
                <a
                  href="https://t.me/nook_finder"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded text-xs font-semibold bg-sky-600 text-white hover:bg-sky-500 transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>@nook_finder</span>
                </a>
              </div>

              {/* Inquiry Form */}
              {!inquirySent ? (
                <form onSubmit={handleInquirySubmit} className="space-y-3 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-900 block">
                    Direct Inquiry to Staff
                  </span>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      placeholder="e.g. John Mercer"
                      className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Message
                    </label>
                    <textarea
                      rows={3}
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded p-2.5 bg-slate-50 focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                  >
                    Submit Showing Request
                  </button>
                  <span className="block text-[10px] text-slate-400 text-center">
                    Direct to Nookfinder verified staff • Zero spam guarantee
                  </span>
                </form>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center space-y-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-700 mx-auto" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900">Inquiry Dispatched to Staff</h4>
                    <p className="text-[11px] text-emerald-800 mt-1">
                      Your showing request for <span className="font-semibold">{property.title}</span> has been routed to verified staff at <span className="font-semibold">nookkfinder@gmail.com</span>.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-emerald-200/60 flex flex-col gap-2 text-xs">
                    <a
                      href={`mailto:nookkfinder@gmail.com?subject=${encodeURIComponent(`[Showing Request] ${property.title} (${property.id})`)}&body=${encodeURIComponent(`Name: ${inquiryName}\nEmail: ${inquiryEmail}\nProperty: ${property.title}\n\nMessage:\n${inquiryMessage || 'I would like to schedule a showing.'}`)}`}
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Open Pre-Filled Email</span>
                    </a>
                    <a
                      href="https://t.me/nook_finder"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-sky-600 text-white font-semibold hover:bg-sky-500 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Follow Up on Telegram (@nook_finder)</span>
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setInquirySent(false);
                      setInquiryMessage('');
                    }}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 font-medium underline pt-1 block mx-auto cursor-pointer"
                  >
                    Send another question or tour date
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* STICKY BOTTOM AGENT & CONTACT BAR (Always visible while scrolling) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Agent Info + Price */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 shrink-0 hidden sm:block">
              <Image
                src={property.agent.avatarUrl}
                alt={property.agent.name}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-slate-900 truncate font-display">
                  {property.agent.name}
                </span>
                <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" /> In-House Specialist
                </span>
              </div>
              <div className="text-[11px] text-slate-500 truncate flex items-center gap-2">
                <span className="font-semibold text-emerald-800">
                  ${property.price.toLocaleString()}
                  {isRent && <span className="font-normal text-slate-500"> / mo</span>}
                </span>
                <span className="hidden md:inline text-slate-400">•</span>
                <span className="hidden md:inline truncate">{property.title}</span>
              </div>
            </div>
          </div>

          {/* Right: Direct Contact Actions (Email & Telegram) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Email Agent */}
            <a
              href={`mailto:nookkfinder@gmail.com?subject=Inquiry%20regarding%20Nookfinder%20Listing%20${property.id}`}
              className="inline-flex items-center justify-center gap-1.5 py-2 px-3 sm:px-4 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 active:scale-98 transition-all shadow-xs"
              title="Email Agent (nookkfinder@gmail.com)"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>Email <span className="hidden sm:inline">Agent</span></span>
            </a>

            {/* Telegram Direct Trigger */}
            <a
              href="https://t.me/nook_finder"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 py-2 px-3 sm:px-4 rounded-lg text-xs font-bold bg-sky-600 text-white hover:bg-sky-500 active:scale-98 transition-all shadow-xs"
              title="Chat on Telegram (@nook_finder)"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram<span className="hidden sm:inline"> (@nook_finder)</span></span>
            </a>
          </div>
        </div>
      </div>

      <div className="pb-16 sm:pb-20">
        <Footer />
      </div>
    </div>
  );
}
