'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { PAYG_PACKS, PRICING_PAGE_COPY } from '../siteCopy.mjs';
import Card from './Card';
import { useCheckout } from '../hooks/useCheckout.mjs';
import { cn } from '../lib/cn.mjs';

/* ── Pill toggle ───────────────────────────────────────── */
export function PillToggle({ options, value, onChange, size = 'md' }) {
  const activeIndex = options.findIndex((o) => o.value === value);
  const hasSub = options.some((o) => o.sub);

  return (
    <div
      className="relative inline-grid grid-cols-2 rounded-full bg-[#3a3a3c] p-1"
    >
      {/* Sliding indicator */}
      <div
        aria-hidden="true"
        className="absolute inset-1 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out"
        style={{
          left: activeIndex === 0 ? '4px' : '50%',
          right: activeIndex === 0 ? '50%' : '4px',
        }}
      />
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'relative z-10 flex flex-col items-center justify-center text-center rounded-full transition-colors duration-200 select-none',
              size === 'sm'
                ? 'px-5 py-2'
                : 'px-6 py-2.5 sm:px-8',
              isActive ? 'text-slate-900' : 'text-slate-300 hover:text-white',
            )}
          >
            <span className="text-sm font-semibold leading-tight">
              {opt.label}
            </span>
            {opt.sub ? (
              <span className={cn(
                'text-[10px] font-medium leading-tight mt-0.5',
                isActive ? 'text-amber-400' : 'text-amber-500',
              )}>
                {opt.sub}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/* ── PAYG card ─────────────────────────────────────────── */
export function PaygCard({ pack, onBuy }) {
  const isFeatured = Boolean(pack.recommended);

  return (
    <Card
      as="article"
      data-testid="payg-plan-card"
      className={cn(
        'relative flex flex-col overflow-visible transition-all duration-200',
        isFeatured
          ? 'md:scale-[1.04] bg-white p-7'
          : 'hover:-translate-y-1 p-6',
      )}
      style={isFeatured ? { border: '1px solid rgba(0,0,0,0.10)' } : {}}
    >

      {/* Badge — centered above */}
      {pack.badge ? (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-flex items-center rounded-full bg-[#1A1A1A] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.07em] text-white shadow-sm whitespace-nowrap">
            {pack.badge}
          </span>
        </div>
      ) : null}

      {/* Header */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
          {pack.priceLine}
        </p>
        <h3 className={cn(
          'mt-1 font-bold tracking-tight',
          isFeatured ? 'text-2xl text-slate-900' : 'text-xl text-slate-800',
        )}>
          {pack.title}
        </h3>
      </div>

      {/* Price block */}
      <div className="mt-5">
        <div className="flex items-baseline gap-1.5">
          <span className={cn(
            'font-bold tracking-tight leading-none tabular-nums',
            isFeatured ? 'text-4xl text-slate-900' : 'text-[2.2rem] text-slate-800',
          )}>
            {pack.priceDisplay}
          </span>
          <span className="text-sm font-medium text-slate-400">{pack.exportsLabel}</span>
        </div>
        {pack.perExport ? (
          <p className="mt-1.5 inline-block rounded-full bg-[#FEF3C7] px-2 py-0.5 text-xs font-semibold text-amber-700">
            {pack.perExport}
          </p>
        ) : (
          <div className="mt-1.5 h-5" />
        )}
      </div>

      {/* Description */}
      <p className={cn(
        'mt-3 text-sm leading-relaxed',
        isFeatured ? 'text-slate-600' : 'text-slate-500',
      )}>
        {pack.description}
      </p>

      {/* Divider */}
      <div className="my-5 h-px bg-slate-200/70" />

      {/* Features */}
      <ul className="flex-1 space-y-2 text-sm">
        {pack.points.map((point) => (
          <li key={point} className="flex items-center gap-2.5">
            <span className={cn(
              'flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
              'bg-[#F3F4F6]',
            )}>
              <Check
                className="h-2.5 w-2.5 text-[#1A1A1A]"
                strokeWidth={3}
              />
            </span>
            <span className={isFeatured ? 'text-slate-700 font-medium' : 'text-slate-600'}>
              {point}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="mt-6">
        {pack.disabled ? (
          <button
            type="button"
            disabled
            className={cn(
              'w-full rounded-full py-2.5 text-sm font-semibold tracking-tight cursor-not-allowed',
              isFeatured
                ? 'bg-accent/15 text-accent/55'
                : 'border border-slate-200 bg-slate-50 text-slate-400',
            )}
          >
            {pack.actionLabel}
          </button>
        ) : (
          <button
            type="button"
            onClick={onBuy}
            className={cn(
              'w-full rounded-full py-2.5 text-sm font-semibold tracking-tight transition-all duration-150 active:scale-[0.98]',
              isFeatured
                ? 'bg-accent text-white hover:bg-accent-hover shadow-sm hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]'
                : 'border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50',
            )}
          >
            {pack.actionLabel}
          </button>
        )}
      </div>
    </Card>
  );
}

/* ── Pro subscription card ─────────────────────────────── */
export function ProSubscriptionCard({ billing, onSubscribe }) {
  const isYearly = billing === 'yearly';
  const price = isYearly ? PRICING_PAGE_COPY.proYearlyPrice : PRICING_PAGE_COPY.proMonthlyPrice;
  const period = isYearly ? PRICING_PAGE_COPY.proYearlyPeriod : PRICING_PAGE_COPY.proMonthlyPeriod;

  return (
    <Card
      as="article"
      className="relative flex w-full flex-col overflow-visible p-8 bg-white"
      style={{ border: '1px solid rgba(0,0,0,0.10)' }}
    >

      {/* Title */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
          Pro Subscription
        </p>
        <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          {PRICING_PAGE_COPY.proSubscriptionTitle}
        </h3>
      </div>

      {/* Price */}
      <div className="mt-5 flex items-baseline gap-1.5">
        <span className="text-4xl font-bold tracking-tight leading-none text-slate-900 tabular-nums">{price}</span>
        <span className="text-base font-medium text-slate-400">{period}</span>
        {isYearly ? (
          <span className="ml-1 rounded-full border border-amber-200 bg-[#FEF3C7] px-2.5 py-0.5 text-xs font-semibold text-amber-700">
            {PRICING_PAGE_COPY.proYearlySaving}
          </span>
        ) : null}
      </div>

      {/* Divider */}
      <div className="my-6 h-px bg-slate-200/70" />

      {/* Features */}
      <ul className="flex-1 space-y-2.5 text-sm">
        {PRICING_PAGE_COPY.proFeatures.map((feat) => (
          <li key={feat} className="flex items-center gap-2.5">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6]">
              <Check className="h-2.5 w-2.5 text-[#1A1A1A]" strokeWidth={3} />
            </span>
            <span className="text-slate-700 font-medium">{feat}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="mt-8">
        <button
          type="button"
          onClick={onSubscribe}
          className="w-full rounded-full py-2.5 text-sm font-semibold tracking-tight transition-all duration-150 active:scale-[0.98] bg-accent text-white hover:bg-accent-hover shadow-sm hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
        >
          {PRICING_PAGE_COPY.proCtaLabel}
        </button>
      </div>
    </Card>
  );
}

/* ── Team / API card ────────────────────────────────────── */
export function ProApiCard() {
  return (
    <Card
      as="article"
      className="relative flex w-full flex-col overflow-visible p-8 border border-slate-200/80 bg-white/70"
    >
      {/* Title */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
          Enterprise
        </p>
        <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          {PRICING_PAGE_COPY.proApiTitle}
        </h3>
      </div>

      {/* Tagline */}
      <p className="mt-2 text-sm text-slate-500 leading-relaxed">{PRICING_PAGE_COPY.proApiTagline}</p>

      {/* Price placeholder */}
      <div className="mt-5">
        <span className="text-4xl font-bold tracking-tight leading-none text-slate-800">Custom</span>
      </div>

      {/* Divider */}
      <div className="my-6 h-px bg-slate-200/70" />

      {/* Features */}
      <ul className="flex-1 space-y-2.5 text-sm">
        {PRICING_PAGE_COPY.proApiFeatures.map((feat) => (
          <li key={feat} className="flex items-center gap-2.5">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6]">
              <Check className="h-2.5 w-2.5 text-[#1A1A1A]" strokeWidth={3} />
            </span>
            <span className="text-slate-600">{feat}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="mt-8">
        <a
          href={PRICING_PAGE_COPY.proApiCtaHref}
          className="flex w-full items-center justify-center rounded-full border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-all duration-150 active:scale-[0.98]"
        >
          {PRICING_PAGE_COPY.proApiCtaLabel}
        </a>
        <p className="mt-3 text-center text-xs text-slate-400">
          We'll get back to you within 24 hours.
        </p>
      </div>
    </Card>
  );
}

/* ── Free tier safety net ──────────────────────────────── */
export function FreeTierCTA() {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-white/50 px-6 py-5 text-center">
      <p className="text-sm font-semibold text-slate-600">
        {PRICING_PAGE_COPY.freeSafetyTitle}
      </p>
      <p className="mt-1 text-xs text-slate-400">{PRICING_PAGE_COPY.freeSafetyDesc}</p>
      <a
        href={PRICING_PAGE_COPY.freeSafetyCtaHref}
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline transition-colors"
      >
        {PRICING_PAGE_COPY.freeSafetyCtaLabel}
      </a>
    </div>
  );
}

/* ── Full pricing toggle section ───────────────────────── */
export default function PricingToggleSection({ showFreeTier = true }) {
  const [mode, setMode] = useState('payg');
  const [billing, setBilling] = useState('monthly');
  const checkout = useCheckout();

  const modeOptions = [
    { value: 'payg', label: PRICING_PAGE_COPY.togglePayg },
    { value: 'pro', label: PRICING_PAGE_COPY.togglePro },
  ];

  const billingOptions = [
    { value: 'monthly', label: PRICING_PAGE_COPY.billingMonthly, sub: null },
    { value: 'yearly', label: PRICING_PAGE_COPY.billingYearly, sub: PRICING_PAGE_COPY.proYearlySaving },
  ];

  function handlePackBuy(pack) {
    if (pack.id === 'single') checkout.openCheckout('credits_1');
    else if (pack.id === 'payg-starter') checkout.openCheckout('credits_10');
    else if (pack.id === 'volume') checkout.openCheckout('credits_100');
  }

  return (
    <div className="space-y-10">
      {/* Main toggle + social proof pill */}
      <div className="flex flex-col items-center gap-3">
        <PillToggle options={modeOptions} value={mode} onChange={setMode} />
        <p className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/60 bg-[#FEF3C7]/80 px-4 py-1.5 text-xs font-medium text-amber-700">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Saves <span className="font-bold">30–45 min</span> of manual formatting per export.
        </p>
      </div>

      {/* ── Pay-as-you-go view ── */}
      {mode === 'payg' ? (
        <div className="space-y-8">
          {/* PAYG tagline — rule divider style */}
          <div className="flex items-center justify-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200 max-w-[80px]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
              {PRICING_PAGE_COPY.paygTagline}
            </p>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200 max-w-[80px]" />
          </div>

          {/* 3 cards */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:items-start">
            {PAYG_PACKS.map((pack) => (
              <PaygCard
                key={pack.id}
                pack={pack}
                onBuy={() => handlePackBuy(pack)}
              />
            ))}
          </div>

          {checkout.error ? (
            <p className="text-center text-sm text-red-500">{checkout.error}</p>
          ) : null}

          <p className="text-center text-sm text-slate-400">
            Need higher volume, API access, or team plans?{' '}
            <a href="mailto:hello@fitforpdf.com" className="text-slate-600 underline decoration-dotted hover:text-accent transition-colors">
              Contact us
            </a>.
          </p>

          {showFreeTier ? <FreeTierCTA /> : null}
        </div>
      ) : null}

      {/* ── Pro subscription view ── */}
      {mode === 'pro' ? (
        <div className="space-y-8">
          {/* Taglines */}
          <div className="text-center space-y-1">
            <p className="text-base font-semibold text-slate-900">{PRICING_PAGE_COPY.proTagline}</p>
            <p className="text-sm text-slate-400">{PRICING_PAGE_COPY.proSubTagline}</p>
          </div>

          {/* Billing toggle — dark pill variant */}
          <div className="flex justify-center">
            <PillToggle options={billingOptions} value={billing} onChange={setBilling} size="sm" />
          </div>

          {/* Pro + API cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-stretch max-w-3xl mx-auto">
            <ProSubscriptionCard billing={billing} onSubscribe={() => checkout.openProCheckout(billing)} />
            <ProApiCard />
          </div>

          {showFreeTier ? <FreeTierCTA /> : null}
        </div>
      ) : null}
    </div>
  );
}
