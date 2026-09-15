import React from 'react';
import { ShieldCheck, DollarSign, Award, Users } from 'lucide-react';
import PageGuide from '@/components/guide/PageGuide';

export default function AffordablePillars() {
  const pillars = [
    {
      icon: ShieldCheck,
      title: 'Anti-Scam Verification',
      description:
        'Every landlord deed, property title, and rental authorization is audited before appearing on Nookfinder. Zero ghost listings or upfront wire deposit scams.',
    },
    {
      icon: DollarSign,
      title: 'True Cost Transparency',
      description:
        'We require full disclosure of all monthly costs. Estimated property taxes, HOA fees, and anticipated utilities are broken down upfront with no surprises.',
    },
    {
      icon: Award,
      title: 'FHA & Grant Compatibility',
      description:
        'Specialized filtering for first-time homebuyer down payment grants, state bond programs, and FHA-eligible starter residences under $350k.',
    },
    {
      icon: Users,
      title: 'Direct Staff & Agent Line',
      description:
        'Connect directly with our in-house staff via verified Telegram channel or dedicated email. No lead reselling or aggressive third-party marketing calls.',
    },
  ];

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Platform Principles
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1 font-display">
            Built for Real People with Real Budgets
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Traditional real estate portals prioritize luxury commissions. Nookfinder is built to protect and empower everyday buyers and renters.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Embedded Advisor Guide Banner */}
        <PageGuide
          variant="banner"
          avatarSrc="/images/avatars/guide-home.jpg"
          badgeText="Nookfinder Housing Advisor"
          title="Looking for guidance on buying your first home or finding an affordable rental?"
          description="Try our 3-Step Guided Quiz to receive personalized property recommendations filtered by your target city, budget bracket, and down payment readiness."
          tips={['No credit check required', 'Instant results in 60 seconds', '100% verified listings']}
          actionLabel="Take 3-Step Quiz"
          actionHref="/start"
        />
      </div>
    </section>
  );
}
