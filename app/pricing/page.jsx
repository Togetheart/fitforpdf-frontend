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
    <div className="min-h-screen bg-white text-[#1A1A1A]">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-hero pt-20 pb-6 sm:pt-28 sm:pb-8">
        {/* Subtle warm top glow */}
        <div className="relative mx-auto flex max-w-[960px] flex-col items-center gap-4 px-4 text-center sm:px-6">
          {/* Page label */}
          <p className="text-2xl font-semibold tracking-tight text-[#1A1A1A]">Pricing</p>
          {/* Headline */}
          <h1 className="max-w-[20ch] text-[2rem] font-[700] leading-[1.1] tracking-[-0.022em] text-[#1A1A1A] sm:text-[2.5rem]">
            {PRICING_PAGE_COPY.pageTitle}
          </h1>
          {/* Subtitle */}
          <p className="max-w-[44ch] text-[1.0625rem] leading-relaxed text-[#6B6B6B]">
            {PRICING_PAGE_COPY.pageSubtitle}
          </p>
        </div>
      </section>

      {/* ── Plans ── */}
      <Section id="pricing-plans" index={1} bg="bg-hero" className="py-14 sm:py-20">
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
      <Section id="pricing-faq" index={3} bg="bg-hero" className="py-16 sm:py-24">
        <h2 className="text-center text-[1.75rem] font-[700] tracking-[-0.018em] text-[#1A1A1A]">
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
