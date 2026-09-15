import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Check, ArrowRight } from 'lucide-react';

interface PageGuideProps {
  avatarSrc: string;
  badgeText?: string;
  title: string;
  description: string;
  tips?: string[];
  actionLabel?: string;
  actionHref?: string;
  variant?: 'card' | 'banner' | 'sidebar';
}

export default function PageGuide({
  avatarSrc,
  badgeText = 'Nookfinder Housing Advisor',
  title,
  description,
  tips = [],
  actionLabel,
  actionHref,
  variant = 'card',
}: PageGuideProps) {
  if (variant === 'banner') {
    return (
      <div className="w-full bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-5 sm:p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-lg overflow-hidden border border-emerald-300 shrink-0 bg-white shadow-xs">
            <Image
              src={avatarSrc}
              alt="Nookfinder Housing Advisor"
              fill
              className="object-cover object-top"
              sizes="128px"
              priority
            />
          </div>
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{badgeText}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">
              {title}
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed max-w-2xl">
              {description}
            </p>
            {tips.length > 0 && (
              <div className="pt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                {tips.map((tip, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{tip}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
          {actionLabel && actionHref && (
            <div className="shrink-0 mt-3 sm:mt-0">
              <Link
                href={actionHref}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md bg-emerald-700 text-white hover:bg-emerald-800 transition-colors shadow-xs"
              >
                <span>{actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-600 shrink-0 bg-emerald-50">
            <Image
              src={avatarSrc}
              alt="Nookfinder Advisor"
              fill
              className="object-cover object-top"
              sizes="56px"
            />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
              {badgeText}
            </span>
            <h4 className="text-sm font-bold text-slate-900 font-display">
              {title}
            </h4>
          </div>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          {description}
        </p>
        {tips.length > 0 && (
          <ul className="space-y-1.5 text-xs text-slate-700 border-t border-slate-100 pt-3">
            {tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        )}
        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="block text-center w-full py-2 px-3 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            {actionLabel}
          </Link>
        )}
      </div>
    );
  }

  // Default 'card' variant
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 flex flex-col md:flex-row items-center gap-6">
      <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-white shadow-xs">
        <Image
          src={avatarSrc}
          alt="Nookfinder Advisor"
          fill
          className="object-cover object-top"
          sizes="144px"
        />
      </div>
      <div className="flex-1 space-y-2 text-center md:text-left">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{badgeText}</span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 font-display">
          {title}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
          {description}
        </p>
        {tips.length > 0 && (
          <div className="pt-2 flex flex-wrap gap-3 text-xs text-slate-700 justify-center md:justify-start">
            {tips.map((tip, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded border border-slate-200">
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span>{tip}</span>
              </span>
            ))}
          </div>
        )}
      </div>
      {actionLabel && actionHref && (
        <div className="shrink-0">
          <Link
            href={actionHref}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-md bg-emerald-700 text-white hover:bg-emerald-800 transition-colors shadow-xs"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
