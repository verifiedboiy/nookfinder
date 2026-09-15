'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageGuide from '@/components/guide/PageGuide';
import {
  DollarSign,
  Percent,
  Calendar,
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function CalculatorPage() {
  const [homePrice, setHomePrice] = useState(245000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(5); // 5% down default
  const [loanTermYears, setLoanTermYears] = useState(30);
  const [interestRate, setInterestRate] = useState(6.5);
  const [annualPropertyTaxRate, setAnnualPropertyTaxRate] = useState(1.1);
  const [annualInsurance, setAnnualInsurance] = useState(1100);
  const [monthlyHOA, setMonthlyHOA] = useState(40);

  // Financial calculations
  const downPaymentAmount = Math.round((homePrice * downPaymentPercent) / 100);
  const loanPrincipal = homePrice - downPaymentAmount;

  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = loanTermYears * 12;

  const monthlyPI =
    monthlyRate === 0
      ? loanPrincipal / totalMonths
      : Math.round(
          (loanPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
            (Math.pow(1 + monthlyRate, totalMonths) - 1)
        );

  const monthlyPropertyTax = Math.round(((homePrice * annualPropertyTaxRate) / 100) / 12);
  const monthlyInsurance = Math.round(annualInsurance / 12);
  // PMI (Private Mortgage Insurance if down payment < 20%)
  const monthlyPMI = downPaymentPercent < 20 ? Math.round((loanPrincipal * 0.007) / 12) : 0;

  const totalMonthlyPayment = monthlyPI + monthlyPropertyTax + monthlyInsurance + monthlyHOA + monthlyPMI;

  // Pie chart calculation
  const total = totalMonthlyPayment || 1;
  const piPct = (monthlyPI / total) * 100;
  const taxPct = (monthlyPropertyTax / total) * 100;
  const insPct = (monthlyInsurance / total) * 100;
  const hoaPct = (monthlyHOA / total) * 100;
  const pmiPct = (monthlyPMI / total) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Guide Avatar Banner */}
        <PageGuide
          variant="banner"
          avatarSrc="/images/avatars/guide-calculator.jpg"
          badgeText="Financial Readiness Advisor"
          title="Affordable Homeownership & Mortgage Estimator"
          description="Understand your true, all-inclusive monthly obligations before you submit an offer. We include property taxes, insurance, PMI, and HOA fees so there are zero financial blind spots."
          tips={[
            'FHA 3.5% down payment options calculated',
            'Estimated closing costs: 2-3% of loan',
            'First-time buyer grant eligibility checks',
          ]}
        />

        {/* Main 2-Column Calculator Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Input Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Loan Parameters
              </h2>
              <p className="text-xs text-slate-500">
                Adjust figures to model your monthly budget against verified affordable homes.
              </p>
            </div>

            {/* Home Price Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-700">Home Purchase Price</label>
                <span className="font-bold text-base text-slate-900 font-mono">
                  ${homePrice.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="100000"
                max="500000"
                step="5000"
                value={homePrice}
                onChange={(e) => setHomePrice(Number(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>$100k (Starter Unit)</span>
                <span>$300k (Average Nook)</span>
                <span>$500k (Max Range)</span>
              </div>
            </div>

            {/* Down Payment Input */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-700">
                  Down Payment ({downPaymentPercent}%)
                </label>
                <span className="font-bold text-slate-900 font-mono">
                  ${downPaymentAmount.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="25"
                step="0.5"
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
              {/* Quick Down Payment Presets */}
              <div className="flex gap-2 pt-1">
                {[
                  { pct: 3.5, label: '3.5% (FHA Loan)' },
                  { pct: 5, label: '5% (Standard Starter)' },
                  { pct: 10, label: '10%' },
                  { pct: 20, label: '20% (No PMI)' },
                ].map((preset) => (
                  <button
                    key={preset.pct}
                    type="button"
                    onClick={() => setDownPaymentPercent(preset.pct)}
                    className={`px-2.5 py-1 text-[11px] rounded font-medium transition-colors ${
                      downPaymentPercent === preset.pct
                        ? 'bg-emerald-800 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Loan Term & Interest Rate Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Loan Term
                </label>
                <select
                  value={loanTermYears}
                  onChange={(e) => setLoanTermYears(Number(e.target.value))}
                  className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:outline-hidden focus:border-emerald-600 font-medium"
                >
                  <option value="30">30-Year Fixed Mortgage</option>
                  <option value="15">15-Year Fixed Mortgage</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:outline-hidden focus:border-emerald-600 font-mono"
                />
              </div>
            </div>

            {/* Taxes, Insurance & HOA Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Property Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={annualPropertyTaxRate}
                  onChange={(e) => setAnnualPropertyTaxRate(Number(e.target.value))}
                  className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Annual Insurance ($)
                </label>
                <input
                  type="number"
                  value={annualInsurance}
                  onChange={(e) => setAnnualInsurance(Number(e.target.value))}
                  className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Monthly HOA ($)
                </label>
                <input
                  type="number"
                  value={monthlyHOA}
                  onChange={(e) => setMonthlyHOA(Number(e.target.value))}
                  className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Monthly Breakdown Card (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 text-white rounded-xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Estimated Total Monthly Payment
                </span>
                <div className="text-4xl font-bold font-display tracking-tight text-white mt-1">
                  ${totalMonthlyPayment.toLocaleString()}
                  <span className="text-sm font-normal text-slate-400"> / month</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Includes principal, interest, taxes, insurance, and HOA dues.
                </p>
              </div>

              {/* Stacked Payment Bar Visualizer */}
              <div className="space-y-1.5">
                <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-800">
                  <div style={{ width: `${piPct}%` }} className="bg-emerald-500" title="Principal & Interest" />
                  <div style={{ width: `${taxPct}%` }} className="bg-sky-500" title="Property Taxes" />
                  <div style={{ width: `${insPct}%` }} className="bg-amber-500" title="Insurance" />
                  <div style={{ width: `${hoaPct}%` }} className="bg-purple-500" title="HOA" />
                  <div style={{ width: `${pmiPct}%` }} className="bg-rose-500" title="PMI" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>P&I: {Math.round(piPct)}%</span>
                  <span>Taxes: {Math.round(taxPct)}%</span>
                  <span>Ins: {Math.round(insPct)}%</span>
                  {pmiPct > 0 && <span>PMI: {Math.round(pmiPct)}%</span>}
                </div>
              </div>

              {/* Granular Breakdown Rows */}
              <div className="space-y-2.5 text-xs border-t border-slate-800 pt-4">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Principal & Interest
                  </span>
                  <span className="font-mono font-bold">${monthlyPI.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    Property Taxes
                  </span>
                  <span className="font-mono font-bold">${monthlyPropertyTax.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Homeowners Insurance
                  </span>
                  <span className="font-mono font-bold">${monthlyInsurance.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    HOA Fees
                  </span>
                  <span className="font-mono font-bold">${monthlyHOA.toLocaleString()}</span>
                </div>

                {monthlyPMI > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      PMI (Down payment &lt; 20%)
                    </span>
                    <span className="font-mono font-bold">${monthlyPMI.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* View Matching Homes CTA */}
              <div className="pt-2">
                <Link
                  href={`/listings?type=sale&price=350k-500k`}
                  className="block w-full text-center py-3 px-4 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs uppercase tracking-wider transition-colors shadow-xs"
                >
                  Browse Homes Under ${homePrice.toLocaleString()}
                </Link>
              </div>
            </div>

            {/* First-Time Homebuyer Assistance Notice */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Down Payment Assistance Available</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Many states offer up to $15,000 in forgivable down payment assistance grants for buyers purchasing below median local limits. Contact an advisor for eligible programs.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
