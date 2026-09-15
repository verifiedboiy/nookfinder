'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Calculator, PlusCircle, Menu, X, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Highlight active path
  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/95 border-b border-slate-200 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded bg-emerald-700 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-800 transition-colors">
              <Home className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 font-display">
                Nookfinder
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-emerald-700 -mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 inline" /> Verified Housing
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              href="/listings?type=sale"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                pathname === '/listings' && !pathname.includes('rent')
                  ? 'text-emerald-800 bg-emerald-50'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Buy a Home
            </Link>

            <Link
              href="/listings?type=rent"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                pathname.includes('rent')
                  ? 'text-emerald-800 bg-emerald-50'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Rentals Under $800+
            </Link>

            <Link
              href="/listings"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                isActive('/listings')
                  ? 'text-emerald-800 bg-emerald-50'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Compass className="w-4 h-4" strokeWidth={1.5} />
              <span>Explore Map</span>
            </Link>

            <Link
              href="/calculator"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                isActive('/calculator')
                  ? 'text-emerald-800 bg-emerald-50'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calculator className="w-4 h-4" strokeWidth={1.5} />
              <span>Affordability Calculator</span>
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/start"
              className="text-xs font-semibold uppercase tracking-wider text-slate-600 hover:text-slate-900 px-3 py-2"
            >
              Quick Quiz
            </Link>

            <Link
              href="/list-property"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md bg-emerald-700 text-white hover:bg-emerald-800 transition-colors shadow-xs"
            >
              <PlusCircle className="w-4 h-4" strokeWidth={1.5} />
              <span>List Your Property</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-700 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" strokeWidth={1.5} />
              ) : (
                <Menu className="w-6 h-6" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          <Link
            href="/start"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-semibold text-emerald-800 bg-emerald-50"
          >
            Find Homes (3-Step Guided Quiz)
          </Link>
          <Link
            href="/listings?type=sale"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-800 hover:bg-slate-50"
          >
            Buy a Home ($150k - $500k)
          </Link>
          <Link
            href="/listings?type=rent"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-800 hover:bg-slate-50"
          >
            Rentals (Starting Under $800/mo)
          </Link>
          <Link
            href="/listings"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-800 hover:bg-slate-50"
          >
            Explore Map
          </Link>
          <Link
            href="/calculator"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-800 hover:bg-slate-50"
          >
            Mortgage & Affordability Calculator
          </Link>
          <div className="pt-2">
            <Link
              href="/list-property"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center px-4 py-2.5 rounded-md bg-emerald-700 text-white font-medium hover:bg-emerald-800"
            >
              List Your Property
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
