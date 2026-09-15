'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MAJOR_US_STATES } from '@/data/states';
import {
  Home,
  Building,
  Eye,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Calendar,
  AlertCircle,
} from 'lucide-react';

type FlowType = 'initial' | 'buy' | 'rent';

export default function StartPage() {
  const [flow, setFlow] = useState<FlowType>('initial');
  const [currentStep, setCurrentStep] = useState(1);

  // Form selections - start EMPTY so user is strictly required to pick!
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [financingStatus, setFinancingStatus] = useState('');
  const [timeline, setTimeline] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [validationError, setValidationError] = useState('');

  // Handle Initial 3 Buttons
  const handleInitialChoice = (choice: 'buy' | 'rent' | 'looking') => {
    if (choice === 'looking') {
      window.location.assign('/listings');
      return;
    }
    setFlow(choice);
    setCurrentStep(1);
    setValidationError('');
  };

  // Step advancement validation
  const handleNextStep = () => {
    setValidationError('');
    if (currentStep === 1) {
      if (!selectedState) {
        setValidationError('Please select a target housing state or click "All 25+ States" to proceed.');
        return;
      }
    } else if (currentStep === 2) {
      if (!selectedPrice) {
        setValidationError('Please select your target budget bracket to proceed.');
        return;
      }
      if (flow === 'buy' && !financingStatus) {
        setValidationError('Please select your financing preference (FHA, Conventional, or Cash) to proceed.');
        return;
      }
      if (flow === 'rent' && !bedrooms) {
        setValidationError('Please select your bedroom preference to proceed.');
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  // Final step completion validation
  const handleComplete = () => {
    setValidationError('');
    if (!timeline) {
      setValidationError('Please select your move-in or purchase timeline to see matching properties.');
      return;
    }

    const params = new URLSearchParams();
    params.set('type', flow === 'buy' ? 'sale' : 'rent');
    if (selectedLocation && selectedLocation !== 'all') params.set('location', selectedLocation);
    if (selectedState && selectedState !== 'all') params.set('state', selectedState);
    if (selectedPrice && selectedPrice !== 'all') params.set('price', selectedPrice);
    if (bedrooms && bedrooms !== 'any') params.set('bedrooms', bedrooms);

    window.location.assign(`/listings?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Distraction-Free Header */}
      <header className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-emerald-700 flex items-center justify-center text-white">
              <Home className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 font-display">
              Nookfinder
            </span>
          </Link>

          <Link
            href="/listings"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline underline-offset-4"
          >
            Skip to All Listings
          </Link>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl w-full">
          {/* SCREEN 1: Initial 3 Options */}
          {flow === 'initial' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
              {/* Top Guide Avatar & Intro */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-lg overflow-hidden border-2 border-emerald-600 shrink-0 bg-emerald-50 shadow-xs">
                  <Image
                    src="/images/avatars/guide-welcome.jpg"
                    alt="Nookfinder Housing Advisor"
                    fill
                    className="object-cover object-top"
                    sizes="128px"
                    priority
                  />
                </div>
                <div className="text-center sm:text-left space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Nookfinder Housing Advisor</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
                    What are you looking for?
                  </h1>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-lg">
                    Welcome to Nookfinder. We specialize in verified, affordable homes and rentals. Select your goal to unlock pre-qualified properties.
                  </p>
                </div>
              </div>

              {/* The 3 Core Option Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Option 1: Buy a home */}
                <button
                  type="button"
                  onClick={() => handleInitialChoice('buy')}
                  className="group relative p-6 rounded-lg border-2 border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/40 text-left transition-all duration-200 flex flex-col justify-between space-y-4 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                    <Home className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 font-display group-hover:text-emerald-900">
                      Buy a Home
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Starter houses & condos from $140,000 with FHA and down payment assistance.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 group-hover:translate-x-1 transition-transform">
                    <span>Continue (3 Steps)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>

                {/* Option 2: Rent a home */}
                <button
                  type="button"
                  onClick={() => handleInitialChoice('rent')}
                  className="group relative p-6 rounded-lg border-2 border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/40 text-left transition-all duration-200 flex flex-col justify-between space-y-4 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                    <Building className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 font-display group-hover:text-emerald-900">
                      Rent a Home
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Accessible rentals starting under $800/mo with verified landlords and zero junk fees.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 group-hover:translate-x-1 transition-transform">
                    <span>Continue (3 Steps)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>

                {/* Option 3: Just looking */}
                <button
                  type="button"
                  onClick={() => handleInitialChoice('looking')}
                  className="group relative p-6 rounded-lg border-2 border-slate-200 hover:border-slate-800 hover:bg-slate-50 text-left transition-all duration-200 flex flex-col justify-between space-y-4 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-colors">
                    <Eye className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 font-display group-hover:text-slate-900">
                      Just Looking
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Browse all listings freely without answering any questionnaire first.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 group-hover:translate-x-1 transition-transform">
                    <span>Explore Directly</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              </div>

              {/* Trust Subtext */}
              <div className="pt-2 text-center text-xs text-slate-500 flex items-center justify-center gap-4">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> 100% Verified Inventory
                </span>
                <span>•</span>
                <span>Zero Broker Upfront Fees</span>
                <span>•</span>
                <span>No Credit Card Required</span>
              </div>
            </div>
          )}

          {/* SCREEN 2: 3-Step Guided Funnel */}
          {flow !== 'initial' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span className="uppercase tracking-wider text-emerald-800">
                    {flow === 'buy' ? 'Homebuyer Match' : 'Renter Match'} — Step {currentStep} of 3
                  </span>
                  <span>{currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : '100%'} Completed</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-700 transition-all duration-300"
                    style={{
                      width: currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : '100%',
                    }}
                  />
                </div>
              </div>

              {/* STEP 1: Major States & Metros (20+ States Supported) */}
              {currentStep === 1 && (
                <div className="space-y-5 py-2">
                  <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-600 shrink-0 bg-emerald-50 shadow-xs">
                      <Image
                        src="/images/avatars/guide-map.jpg"
                        alt="Nookfinder Regional Specialist"
                        fill
                        className="object-cover object-top"
                        sizes="64px"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                        Step 1 of 3 • Location Match
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                        {flow === 'buy'
                          ? 'Where are you planning to purchase?'
                          : 'Where are you looking to rent?'}
                      </h2>
                      <p className="text-xs text-slate-500">
                        Select your state and target metro (over 20+ major housing states available).
                      </p>
                    </div>
                  </div>

                  {/* Major State Selector Grid */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-2">
                      Popular Housing States:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1 border border-slate-100 rounded-lg">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedState('all');
                          setValidationError('');
                        }}
                        className={`p-2 rounded text-left text-xs transition-colors ${
                          selectedState === 'all'
                            ? 'bg-emerald-700 text-white font-bold'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        All 25+ States
                      </button>
                      {MAJOR_US_STATES.map((st) => (
                        <button
                          key={st.code}
                          type="button"
                          onClick={() => {
                            setSelectedState(st.code);
                            setValidationError('');
                          }}
                          className={`p-2 rounded text-left text-xs transition-colors ${
                            selectedState === st.code
                              ? 'bg-emerald-700 text-white font-bold'
                              : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="font-semibold block">{st.name} ({st.code})</span>
                          <span className="text-[10px] opacity-80 block truncate">{st.primaryCity}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Affordable Budget */}
              {currentStep === 2 && (
                <div className="space-y-5 py-2">
                  <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-600 shrink-0 bg-emerald-50 shadow-xs">
                      <Image
                        src="/images/avatars/guide-calculator.jpg"
                        alt="Nookfinder Affordability Specialist"
                        fill
                        className="object-cover object-top"
                        sizes="64px"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                        Step 2 of 3 • Budget & Financing
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                        {flow === 'buy'
                          ? 'What is your target investment budget?'
                          : 'What is your target monthly rental budget?'}
                      </h2>
                      <p className="text-xs text-slate-500">
                        All Nookfinder figures represent true, transparent costs without surprise add-on fees.
                      </p>
                    </div>
                  </div>

                  {flow === 'buy' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {[
                        { id: 'under150k', label: 'Under $150,000', desc: 'Starter Condos & Modular Units' },
                        { id: '150k-250k', label: '$150,000 – $250,000', desc: 'First-Time Single Family & Townhomes' },
                        { id: '250k-350k', label: '$250,000 – $350,000', desc: 'Suburban Residences & Duplexes' },
                        { id: '350k-500k', label: '$350,000 – $500,000', desc: 'Family Homes & Renovated Properties' },
                      ].map((tier) => (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => {
                            setSelectedPrice(tier.id);
                            setValidationError('');
                          }}
                          className={`p-4 rounded-lg border text-left transition-all ${
                            selectedPrice === tier.id
                              ? 'border-emerald-700 bg-emerald-50'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <span className="block text-base font-bold text-slate-900">{tier.label}</span>
                          <span className="block text-xs text-slate-500 mt-0.5">{tier.desc}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {[
                        { id: 'under800', label: 'Under $800 / month', desc: 'Studios & All-Inclusive Units' },
                        { id: '800-1200', label: '$800 – $1,200 / month', desc: '1-Bedroom Garden Apartments' },
                        { id: '1200-1600', label: '$1,200 – $1,600 / month', desc: '2-Bedroom Flats & Townhomes' },
                        { id: 'all', label: 'Any Affordable Rent', desc: 'Show all audited rentals' },
                      ].map((tier) => (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => {
                            setSelectedPrice(tier.id);
                            setValidationError('');
                          }}
                          className={`p-4 rounded-lg border text-left transition-all ${
                            selectedPrice === tier.id
                              ? 'border-emerald-700 bg-emerald-50'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <span className="block text-base font-bold text-slate-900">{tier.label}</span>
                          <span className="block text-xs text-slate-500 mt-0.5">{tier.desc}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-700 block mb-2">
                      {flow === 'buy' ? 'Financing Preference:' : 'Minimum Bedrooms:'}
                    </label>
                    {flow === 'buy' ? (
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'fha', label: 'FHA Loan / Down Payment Assistance' },
                          { id: 'preapproved', label: 'Conventional Pre-Approval' },
                          { id: 'cash', label: 'Cash / Other' },
                        ].map((fin) => (
                          <button
                            key={fin.id}
                            type="button"
                            onClick={() => {
                              setFinancingStatus(fin.id);
                              setValidationError('');
                            }}
                            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                              financingStatus === fin.id
                                ? 'bg-emerald-800 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {fin.label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'any', label: 'Any Size' },
                          { id: '0', label: 'Studio' },
                          { id: '1', label: '1+ Bed' },
                          { id: '2', label: '2+ Beds' },
                        ].map((bed) => (
                          <button
                            key={bed.id}
                            type="button"
                            onClick={() => {
                              setBedrooms(bed.id);
                              setValidationError('');
                            }}
                            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                              bedrooms === bed.id
                                ? 'bg-emerald-800 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {bed.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: Timeline & Urgency */}
              {currentStep === 3 && (
                <div className="space-y-5 py-2">
                  <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-600 shrink-0 bg-emerald-50 shadow-xs">
                      <Image
                        src="/images/avatars/guide-checklist.jpg"
                        alt="Nookfinder Transition Coordinator"
                        fill
                        className="object-cover object-top"
                        sizes="64px"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                        Step 3 of 3 • Move-in Timeline
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                        What is your move-in or purchase timeline?
                      </h2>
                      <p className="text-xs text-slate-500">
                        We prioritize properties with immediate availability or pending lease cycles.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {[
                      { id: '30days', label: 'Immediate (Within 30 Days)', desc: 'Prioritize available move-in ready homes' },
                      { id: '60days', label: '1 to 3 Months', desc: 'Standard transition and closing window' },
                      { id: '90days', label: '3 to 6 Months', desc: 'Planning ahead and saving for closing costs' },
                      { id: 'exploring', label: 'Flexible / Just Exploring', desc: 'Keep me informed of affordable drops' },
                    ].map((time) => (
                      <button
                        key={time.id}
                        type="button"
                        onClick={() => {
                          setTimeline(time.id);
                          setValidationError('');
                        }}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          timeline === time.id
                            ? 'border-emerald-700 bg-emerald-50'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <Calendar className="w-4 h-4 mb-1 text-slate-400" />
                        <span className="block text-sm font-bold text-slate-900">{time.label}</span>
                        <span className="block text-xs text-slate-500 mt-0.5">{time.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Validation Warning Alert */}
              {validationError && (
                <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Navigation Controls between Steps */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setValidationError('');
                    if (currentStep === 1) {
                      setFlow('initial');
                    } else {
                      setCurrentStep(currentStep - 1);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded bg-emerald-700 hover:bg-emerald-800 text-white transition-colors shadow-xs cursor-pointer"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleComplete}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded bg-emerald-700 hover:bg-emerald-800 text-white transition-colors shadow-xs cursor-pointer"
                  >
                    <span>Show Matching Properties</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        &copy; 2026 Nookfinder Housing. Equal Housing Opportunity.
      </footer>
    </div>
  );
}
