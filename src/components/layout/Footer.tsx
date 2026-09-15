import React from 'react';
import Link from 'next/link';
import { Home, ShieldCheck, FileCheck, Mail, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand & Purpose Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center text-white">
                <Home className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-display">
                Nookfinder
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Democratizing quality residential housing through transparent, 100% verified property listings. Dedicated to first-time homebuyers and renters seeking dignity, affordability, and zero junk fees.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> 100% Verified Listings
              </span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <FileCheck className="w-4 h-4" /> Zero Hidden Broker Fees
              </span>
            </div>
            {/* Direct Official Contact Credentials */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Official Support Channels
              </span>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <a
                  href="https://t.me/nook_finder"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-sky-950/80 border border-sky-800/60 text-sky-300 hover:text-white hover:bg-sky-900 transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-sky-400" />
                  <span className="font-semibold">Telegram: @nook_finder</span>
                </a>
                <a
                  href="mailto:nookkfinder@gmail.com"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold">nookkfinder@gmail.com</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Nav: Discover */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Explore Housing
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/listings?type=sale" className="hover:text-white transition-colors">
                  Homes Under $250k
                </Link>
              </li>
              <li>
                <Link href="/listings?type=sale" className="hover:text-white transition-colors">
                  FHA-Approved Properties
                </Link>
              </li>
              <li>
                <Link href="/listings?type=rent" className="hover:text-white transition-colors">
                  Rentals Under $800/mo
                </Link>
              </li>
              <li>
                <Link href="/listings?type=rent" className="hover:text-white transition-colors">
                  All-Utilities Included Units
                </Link>
              </li>
              <li>
                <Link href="/listings" className="hover:text-white transition-colors">
                  Interactive Metro Map
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools & Resources */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Financial Tools
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/calculator" className="hover:text-white transition-colors">
                  Mortgage Calculator
                </Link>
              </li>
              <li>
                <Link href="/calculator" className="hover:text-white transition-colors">
                  Down Payment Grants Guide
                </Link>
              </li>
              <li>
                <Link href="/calculator" className="hover:text-white transition-colors">
                  Rent vs. Buy Analysis
                </Link>
              </li>
              <li>
                <Link href="/start" className="hover:text-white transition-colors">
                  3-Step Match Quiz
                </Link>
              </li>
            </ul>
          </div>

          {/* For Landlords & Sellers */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Property Owners
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/list-property" className="hover:text-white transition-colors">
                  List Your Property
                </Link>
              </li>
              <li>
                <Link href="/list-property" className="hover:text-white transition-colors">
                  Landlord Verification Process
                </Link>
              </li>
              <li>
                <Link href="/list-property" className="hover:text-white transition-colors">
                  Fair Housing Standards
                </Link>
              </li>
              <li>
                <Link href="/list-property" className="hover:text-white transition-colors">
                  Standardized Digital Leases
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal & Equal Housing Statement */}
        <div className="mt-12 pt-8 border-t border-slate-800 text-xs text-slate-500 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <p>
              Equal Housing Opportunity. All real estate advertised herein is subject to the Federal Fair Housing Act, which makes it illegal to advertise any preference, limitation, or discrimination because of race, color, religion, sex, handicap, familial status, or national origin.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-2">
            <p>&copy; 2026 Nookfinder Technologies Inc. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-400 cursor-pointer">MLS / IDX Compliance</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
