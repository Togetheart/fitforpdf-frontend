'use client';

import React from 'react';
import { PRICING_PAGE_COPY } from '../siteCopy.mjs';
import Section from '../components/ui/Section';
import FaqAccordion from '../components/FaqAccordion';
import FeatureComparison from '../components/FeatureComparison';
import PricingToggleSection from '../components/PricingToggleSection';

/* ── Main page ─────────────────────────────────────────── */
export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-white pt-20 pb-6 sm:pt-28 sm:pb-8">
        {/* Subtle blue top glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(0,113,227,0.07) 0%, transparent 70%),' +
              'radial-gradient(ellipse 40% 30% at 80% 60%, rgba(0,113,227,0.025) 0%, transparent 60%)',
          }}
        />
        <div className="relative mx-auto flex max-w-[960px] flex-col items-center gap-4 px-4 text-center sm:px-6">
          {/* Page label */}
          <p className="text-2xl font-semibold tracking-tight text-slate-900">Pricing</p>
          {/* Headline */}
          <h1 className="max-w-[20ch] text-[2rem] font-[700] leading-[1.1] tracking-[-0.022em] text-slate-900 sm:text-[2.5rem]">
            {PRICING_PAGE_COPY.pageTitle}
          </h1>
          {/* Subtitle */}
          <p className="max-w-[44ch] text-[1.0625rem] leading-relaxed text-slate-500">
            {PRICING_PAGE_COPY.pageSubtitle}
          </p>
        </div>
      </section>

      {/* ── Plans ── */}
      <Section id="pricing-plans" index={1} bg="bg-[#f5f5f7]" className="py-14 sm:py-20">
        <PricingToggleSection showFreeTier />
      </Section>

      {/* ── Feature comparison ── */}
      <Section id="pricing-comparison" index={2} bg="bg-white" className="py-16 sm:py-24">
        <FeatureComparison
          title={PRICING_PAGE_COPY.comparisonTitle}
          columns={['Free', 'Single', 'Starter', 'Pro Sub']}
          rows={PRICING_PAGE_COPY.comparison}
        />
      </Section>

      {/* ── FAQ ── */}
      <Section id="pricing-faq" index={3} bg="bg-[#f5f5f7]" className="py-16 sm:py-24">
        <h2 className="text-center text-[1.75rem] font-[700] tracking-[-0.018em] text-slate-900">
          {PRICING_PAGE_COPY.faqTitle}
        </h2>
        <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
          <FaqAccordion
            items={PRICING_PAGE_COPY.faq}
            testId="pricing-faq"
            itemClassName="py-4 px-6"
          />
        </div>
      </Section>
    </div>
  );
}
