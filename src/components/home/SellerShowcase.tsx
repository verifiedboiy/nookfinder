import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, ArrowRight, FileCheck, DollarSign } from 'lucide-react';

export default function SellerShowcase() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-xl overflow-hidden text-white border border-slate-800 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>For Sellers & Ethical Housing Providers</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-display leading-tight">
                List your property. Reach pre-qualified buyers and renters directly.
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                Whether you have a starter home for sale or a rental property under $1,200/mo, Nookfinder connects you with verified applicants without exorbitant listing fees or predatory broker commissions.
              </p>

              {/* Value Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-sm text-slate-200">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Verified buyer pre-qualification checks</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Standardized digital lease generator</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Direct staff communication (Telegram / Email)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>$0 platform commission for affordable rentals</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  href="/list-property"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors shadow-xs"
                >
                  <span>List Your Property in 5 Steps</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/calculator"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-colors border border-slate-700"
                >
                  <span>Estimate Rental Yields</span>
                </Link>
              </div>
            </div>

            {/* Right Vector Illustration Column */}
            <div className="lg:col-span-5 relative h-72 sm:h-96 lg:h-full min-h-[380px] bg-slate-800 flex items-center justify-center p-6">
              <div className="relative w-full h-full max-h-[360px] rounded-lg overflow-hidden border border-slate-700 shadow-md">
                <Image
                  src="/images/avatars/guide-checklist.jpg"
                  alt="Nookfinder Landlord & Seller Advisor"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
