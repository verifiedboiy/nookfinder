'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageGuide from '@/components/guide/PageGuide';
import {
  Home,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileCheck,
  Building,
  DollarSign,
  User,
  Plus,
} from 'lucide-react';

export default function ListPropertyPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [listingType, setListingType] = useState<'sale' | 'rent'>('rent');
  const [propertyType, setPropertyType] = useState('apartment');
  const [price, setPrice] = useState('780');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('Atlanta');
  const [stateCode, setStateCode] = useState('GA');

  const [bedrooms, setBedrooms] = useState('1');
  const [bathrooms, setBathrooms] = useState('1');
  const [squareFeet, setSquareFeet] = useState('650');
  const [yearBuilt, setYearBuilt] = useState('2018');

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'In-Unit Laundry',
    'Central Climate Control',
    'Pet Friendly',
  ]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [deedConfirmed, setDeedConfirmed] = useState(false);

  const toggleAmenity = (name: string) => {
    if (selectedAmenities.includes(name)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== name));
    } else {
      setSelectedAmenities([...selectedAmenities, name]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Guide Avatar Banner */}
        <PageGuide
          variant="banner"
          avatarSrc="/images/avatars/guide-checklist.jpg"
          badgeText="Landlord & Seller Onboarding Concierge"
          title="List Your Property in 5 Structured Steps"
          description="Every listing on Nookfinder is verified for legal ownership and pricing integrity. Connect with pre-screened applicants looking for quality, accessible housing."
          tips={[
            'Zero upfront listing fee',
            'Deed verification in under 4 business hours',
            'Direct tenant & buyer messaging',
          ]}
        />

        {/* Wizard Card Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
          {!submitted ? (
            <>
              {/* Step Navigation Indicator */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span className="uppercase tracking-wider text-emerald-800">
                    Step {step} of 4:{' '}
                    {step === 1 && 'Basic Details & Location'}
                    {step === 2 && 'Specifications & Layout'}
                    {step === 3 && 'Amenities & Description'}
                    {step === 4 && 'Owner Verification & Contact'}
                  </span>
                  <span>{step * 25}% Complete</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-700 transition-all duration-300"
                    style={{ width: `${step * 25}%` }}
                  />
                </div>
              </div>

              {/* STEP 1: Basic Details & Location */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 font-display">
                      Property Category & Asking Terms
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Specify whether this home is available for purchase or long-term lease.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setListingType('rent');
                        setPrice('780');
                      }}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        listingType === 'rent'
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-900 font-semibold'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Building className="w-5 h-5 mb-1 text-emerald-700" />
                      <span className="block text-sm font-bold">For Rent</span>
                      <span className="text-xs text-slate-500">Monthly residential lease</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setListingType('sale');
                        setPrice('185000');
                      }}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        listingType === 'sale'
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-900 font-semibold'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Home className="w-5 h-5 mb-1 text-emerald-700" />
                      <span className="block text-sm font-bold">For Sale</span>
                      <span className="text-xs text-slate-500">Residential property title</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Property Type
                      </label>
                      <select
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 font-medium"
                      >
                        <option value="apartment">Apartment</option>
                        <option value="house">Single Family House</option>
                        <option value="townhouse">Townhome</option>
                        <option value="condo">Condominium</option>
                        <option value="studio">Studio</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {listingType === 'rent' ? 'Monthly Rent ($)' : 'Asking Price ($)'}
                      </label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 font-mono"
                        placeholder={listingType === 'rent' ? 'e.g. 780' : 'e.g. 185000'}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50"
                        placeholder="e.g. 542 Peachtree Street NE, Apt 3B"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          City / Metro
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={stateCode}
                          onChange={(e) => setStateCode(e.target.value)}
                          className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 uppercase"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Specifications */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 font-display">
                      Property Dimensions & Specifications
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Accurate measurements prevent tenant disputes and accelerate approvals.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Bedrooms
                      </label>
                      <select
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50"
                      >
                        <option value="0">0 (Studio)</option>
                        <option value="1">1 Bedroom</option>
                        <option value="2">2 Bedrooms</option>
                        <option value="3">3 Bedrooms</option>
                        <option value="4">4+ Bedrooms</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Bathrooms
                      </label>
                      <select
                        value={bathrooms}
                        onChange={(e) => setBathrooms(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50"
                      >
                        <option value="1">1 Bath</option>
                        <option value="1.5">1.5 Baths</option>
                        <option value="2">2 Baths</option>
                        <option value="2.5">2.5 Baths</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Living Area (sq ft)
                      </label>
                      <input
                        type="number"
                        value={squareFeet}
                        onChange={(e) => setSquareFeet(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Year Built
                      </label>
                      <input
                        type="number"
                        value={yearBuilt}
                        onChange={(e) => setYearBuilt(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Amenities & Description */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 font-display">
                      Amenities & Listing Narrative
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Highlight the quality features that distinguish this affordable home.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-2">
                      Select Included Amenities
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        'In-Unit Laundry',
                        'Central Climate Control',
                        'Pet Friendly (Zero Pet Rent)',
                        'Designated Parking Included',
                        'Transit Line Proximity',
                        'All Utilities Included',
                        'Private Yard / Patio',
                        'High-Speed WiFi Ready',
                        'FHA Loan Approved',
                      ].map((amenity) => (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => toggleAmenity(amenity)}
                          className={`p-2.5 rounded text-left text-xs transition-colors flex items-center gap-2 ${
                            selectedAmenities.includes(amenity)
                              ? 'bg-emerald-50 border border-emerald-600 text-emerald-900 font-semibold'
                              : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${
                              selectedAmenities.includes(amenity)
                                ? 'bg-emerald-700 border-emerald-700 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {selectedAmenities.includes(amenity) && <CheckCircle2 className="w-3 h-3" />}
                          </div>
                          <span>{amenity}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Listing Headline
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Sunlit Garden Apartment Near Transit"
                        className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Detailed Description
                      </label>
                      <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe neighborhood walkability, transit options, and recent updates..."
                        className="w-full text-xs border border-slate-200 rounded p-3 bg-slate-50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Owner Verification */}
              {step === 4 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 font-display">
                      Ownership Verification & Direct Contact
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Nookfinder requires verified ownership to safeguard tenants from unauthorized sub-leases.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Owner / Agent Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="Marcus Vance"
                        className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)}
                        placeholder="marcus@example.com"
                        className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Direct Phone / Telegram Handle
                      </label>
                      <input
                        type="tel"
                        required
                        value={ownerPhone}
                        onChange={(e) => setOwnerPhone(e.target.value)}
                        placeholder="+1 (404) 555-0199"
                        className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={deedConfirmed}
                        onChange={(e) => setDeedConfirmed(e.target.checked)}
                        className="mt-0.5 accent-emerald-700"
                      />
                      <span className="text-xs text-slate-700 leading-relaxed">
                        I attest under penalty of perjury that I am the legal owner, deed-holder, or state-licensed broker authorized to list this residential property on Nookfinder.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Wizard Navigation Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded bg-emerald-700 hover:bg-emerald-800 text-white transition-colors shadow-xs"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!deedConfirmed}
                    className={`inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded transition-colors shadow-xs ${
                      deedConfirmed
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit for Verification</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Submission Confirmation Screen */
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">
                Property Submitted for Title Audit
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you, <span className="font-semibold text-slate-900">{ownerName || 'Property Owner'}</span>. Your listing for <span className="font-semibold text-slate-900">{streetAddress || 'peachtree st'}</span> has been assigned reference <span className="font-mono text-emerald-800 font-semibold">NOOK-AUDIT-9921</span>. Our compliance team audits county assessor records and typically activates listings within 4 hours.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <Link
                  href="/listings"
                  className="px-5 py-2.5 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800"
                >
                  Return to Listings
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setStep(1);
                  }}
                  className="px-5 py-2.5 text-xs font-semibold rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Submit Another Property
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
