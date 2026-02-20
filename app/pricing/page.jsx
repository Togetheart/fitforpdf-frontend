'use client';

import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { PAYG_PACKS, PRICING_PAGE_COPY } from '../siteCopy.mjs';
import Section from '../components/ui/Section';
import FaqAccordion from '../components/FaqAccordion';
import FeatureComparison from '../components/FeatureComparison';
import PageHero from '../components/PageHero';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/ui/Button';
import { useCheckout } from '../hooks/useCheckout.mjs';
import { cn } from '../lib/cn.mjs';

/* ── Pill toggle ───────────────────────────────────────── */
function PillToggle({ options, value, onChange }) {
  const activeIndex = options.findIndex((o) => o.value === value);
  return (
    <div className="relative inline-flex rounded-full bg-slate-100 p-1">
      {/* Sliding indicator */}
      <div
        aria-hidden="true"
        className="absolute top-1 bottom-1 rounded-full bg-white shadow-sm transition-all duration-300 ease-out"
        style={{
          left: `calc(${activeIndex} * 50% + 4px)`,
          width: 'calc(50% - 4px)',
        }}
      />
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'relative z-10 min-w-[130px] rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-200 sm:min-w-[160px]',
            value === opt.value ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ── PAYG card ─────────────────────────────────────────── */
function PaygCard({ pack, onBuy }) {
  const isFeatured = Boolean(pack.recommended);

  return (
    <Card
      as="article"
      data-testid="payg-plan-card"
      className={cn(
        'relative flex flex-col overflow-visible p-6 transition-all duration-150',
        isFeatured
          ? 'md:scale-105 border-2 border-accent/30 shadow-lg'
          : 'hover:-translate-y-0.5 hover:shadow-md',
      )}
    >
      {/* Badge */}
      {pack.badge ? (
        <div className="absolute -top-3 right-4 z-10">
          <Badge variant={isFeatured ? 'popular' : 'default'}>{pack.badge}</Badge>
        </div>
      ) : null}

      {/* Title */}
      <h3 className="text-xl font-semibold tracking-tight">{pack.title}</h3>

      {/* Price block */}
      <div className="mt-4">
        <p className="text-sm text-slate-500">{pack.priceLine}</p>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-3xl font-bold tracking-tight text-slate-900">{pack.priceDisplay}</span>
          <span className="text-sm text-slate-500">{pack.exportsLabel}</span>
        </div>
        {pack.perExport ? (
          <p className="mt-1 text-xs font-medium text-emerald-600">{pack.perExport}</p>
        ) : null}
      </div>

      {/* Description */}
      <p className="mt-3 text-sm text-slate-500">{pack.description}</p>

      {/* Divider */}
      <div className="my-5 h-px bg-slate-200/80" />

      {/* Features */}
      <ul className="flex-1 space-y-2.5 text-sm text-slate-700">
        {pack.points.map((point) => (
          <li key={point} className="flex items-start gap-2.5">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <span>{point}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="mt-6">
        {pack.disabled ? (
          <Button
            type="button"
            variant={isFeatured ? 'primary' : 'outline'}
            disabled
            className="w-full opacity-60"
          >
            {pack.actionLabel}
          </Button>
        ) : (
          <Button
            type="button"
            variant={isFeatured ? 'primary' : 'outline'}
            onClick={onBuy}
            className="w-full"
          >
            {pack.actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
}

/* ── Pro subscription card ─────────────────────────────── */
function ProSubscriptionCard({ billing }) {
  const isYearly = billing === 'yearly';
  const price = isYearly ? PRICING_PAGE_COPY.proYearlyPrice : PRICING_PAGE_COPY.proMonthlyPrice;
  const period = isYearly ? PRICING_PAGE_COPY.proYearlyPeriod : PRICING_PAGE_COPY.proMonthlyPeriod;

  return (
    <Card
      as="article"
      className="relative mx-auto flex w-full max-w-md flex-col overflow-visible p-8 border-2 border-accent/30 shadow-xl"
    >
      {/* Coming soon badge */}
      <div className="absolute -top-3 right-4 z-10">
        <Badge variant="popular">Coming soon</Badge>
      </div>

      {/* Title */}
      <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
        {PRICING_PAGE_COPY.proSubscriptionTitle}
      </h3>

      {/* Price */}
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight text-slate-900">{price}</span>
        <span className="text-base text-slate-500">{period}</span>
        {isYearly ? (
          <span className="ml-2 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            {PRICING_PAGE_COPY.proYearlySaving}
          </span>
        ) : null}
      </div>

      {/* Divider */}
      <div className="my-6 h-px bg-slate-200/80" />

      {/* Features */}
      <ul className="flex-1 space-y-3 text-sm text-slate-700">
        {PRICING_PAGE_COPY.proFeatures.map((feat) => (
          <li key={feat} className="flex items-start gap-2.5">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <span>{feat}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="mt-8">
        <Button
          type="button"
          variant="primary"
          disabled
          className="w-full opacity-60"
        >
          {PRICING_PAGE_COPY.proCtaLabel}
        </Button>
        <p className="mt-3 text-center text-xs text-slate-400">
          Interested?{' '}
          <a href="mailto:hello@fitforpdf.com" className="underline hover:text-accent transition-colors">
            Contact us
          </a>{' '}
          to be notified first.
        </p>
      </div>
    </Card>
  );
}

/* ── Free tier safety net ──────────────────────────────── */
function FreeTierCTA() {
  return (
    <div className="mt-8 rounded-xl border border-slate-200 bg-white/60 px-6 py-5 text-center">
      <p className="text-sm font-semibold text-slate-700">
        {PRICING_PAGE_COPY.freeSafetyTitle}
      </p>
      <p className="mt-1 text-xs text-slate-500">{PRICING_PAGE_COPY.freeSafetyDesc}</p>
      <a
        href={PRICING_PAGE_COPY.freeSafetyCtaHref}
        className="mt-3 inline-flex items-center text-sm font-medium text-accent hover:underline transition-colors"
      >
        {PRICING_PAGE_COPY.freeSafetyCtaLabel}
      </a>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────── */
export default function PricingPage() {
  const [mode, setMode] = useState('payg'); // 'payg' | 'pro'
  const [billing, setBilling] = useState('monthly'); // 'monthly' | 'yearly'
  const checkout = useCheckout();

  const modeOptions = [
    { value: 'payg', label: PRICING_PAGE_COPY.togglePayg },
    { value: 'pro', label: PRICING_PAGE_COPY.togglePro },
  ];

  const billingOptions = [
    { value: 'monthly', label: PRICING_PAGE_COPY.billingMonthly },
    { value: 'yearly', label: `${PRICING_PAGE_COPY.billingYearly} (${PRICING_PAGE_COPY.proYearlySaving})` },
  ];

  function handlePackBuy(pack) {
    if (pack.id === 'volume') {
      checkout.openCheckout('credits_100');
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PageHero
        variant="pricing"
        align="center"
        contentClassName="space-y-5"
        className="py-16 sm:py-20 w-full"
      >
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Pricing</h1>
        <p className="text-[2.5rem] sm:text-5xl font-[650] leading-[1.06] tracking-tight text-center text-slate-900 max-w-[22ch]">
          {PRICING_PAGE_COPY.pageTitle}
        </p>
        <p className="text-sm text-slate-400">{PRICING_PAGE_COPY.pageSubtitle}</p>
      </PageHero>

      <Section id="pricing-plans" index={1} bg="bg-gray-50" className="py-16 sm:py-24">
        {/* Main toggle */}
        <div className="flex flex-col items-center gap-4">
          <PillToggle options={modeOptions} value={mode} onChange={setMode} />
        </div>

        {/* ── Pay-as-you-go view ── */}
        {mode === 'payg' ? (
          <div className="space-y-8">
            {/* Tagline */}
            <p className="text-center text-sm font-semibold text-emerald-600">
              ✓ {PRICING_PAGE_COPY.paygTagline}
            </p>

            {/* 3 cards */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
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

            <p className="text-center text-sm text-slate-500">
              Need higher volume, API access, or team plans?{' '}
              <a href="mailto:hello@fitforpdf.com" className="underline hover:text-accent transition-colors">
                Contact us
              </a>.
            </p>

            <FreeTierCTA />
          </div>
        ) : null}

        {/* ── Pro subscription view ── */}
        {mode === 'pro' ? (
          <div className="space-y-8">
            {/* Taglines */}
            <div className="text-center space-y-1">
              <p className="text-base font-semibold text-slate-900">{PRICING_PAGE_COPY.proTagline}</p>
              <p className="text-sm text-slate-500">{PRICING_PAGE_COPY.proSubTagline}</p>
            </div>

            {/* Billing toggle */}
            <div className="flex justify-center">
              <PillToggle options={billingOptions} value={billing} onChange={setBilling} />
            </div>

            {/* Pro card */}
            <ProSubscriptionCard billing={billing} />

            <FreeTierCTA />
          </div>
        ) : null}
      </Section>

      <Section id="pricing-comparison" index={2} className="py-16 sm:py-24">
        <FeatureComparison
          title={PRICING_PAGE_COPY.comparisonTitle}
          columns={['Free', 'Single', 'Starter', 'Pro Sub']}
          rows={PRICING_PAGE_COPY.comparison}
        />
      </Section>

      <Section id="pricing-faq" index={3} bg="bg-gray-50" className="py-16 sm:py-24">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {PRICING_PAGE_COPY.faqTitle}
        </h2>
        <div className="divide-y divide-slate-200 rounded-xl glass-elevated">
          <FaqAccordion
            items={PRICING_PAGE_COPY.faq}
            testId="pricing-faq"
            itemClassName="py-3"
          />
        </div>
      </Section>
    </div>
  );
}
