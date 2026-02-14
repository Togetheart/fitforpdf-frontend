'use client';

import React from 'react';
import { PRICING_CARDS, PRICING_PAGE_COPY } from '../siteCopy.mjs';
import HeroBackground from '../components/HeroBackground';
import PricingPlans from '../components/PricingPlans';
import Section from '../components/Section';
import Accordion from '../components/Accordion';
import PricingComparisonTable from '../components/PricingComparisonTable';

export default function PricingPage() {
  const backlinkClass =
    'inline-flex h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 transition duration-150 ease-out hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50 focus-visible:ring-offset-2';
  const badgeClass =
    'inline-flex items-center rounded-full border border-[#D92D2A]/20 bg-[#D92D2A]/8 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[#B62622]';

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Section id="pricing-hero" index={0} bg="bg-white" className="py-24 sm:py-28">
        <div className="relative">
          <HeroBackground variant="pricing" />
          <div className="relative z-10 mx-auto max-w-3xl text-center space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{PRICING_PAGE_COPY.plansEyebrow}</p>
            <h1 className="mt-4 text-4xl font-[650] leading-tight tracking-tight sm:text-[56px]">
              {PRICING_PAGE_COPY.pageTitle}
            </h1>
            <p className="mt-4 text-sm text-slate-700 sm:text-base">{PRICING_PAGE_COPY.pageSubtitle}</p>
            <p className="mt-3 text-sm text-slate-500">{PRICING_PAGE_COPY.pageMicro}</p>
            <span className={badgeClass}>{PRICING_PAGE_COPY.pageTagline}</span>
          </div>
        </div>
      </Section>

      <Section id="pricing-plans" index={1} bg="bg-gray-50" className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl space-y-4">
          <p className={badgeClass}>{PRICING_PAGE_COPY.plansEyebrow}</p>
          <h2 className="text-2xl font-semibold">{PRICING_PAGE_COPY.plansTitle}</h2>
          <p className="max-w-[60ch] text-sm text-slate-600">{PRICING_PAGE_COPY.plansCopy}</p>
          <PricingPlans
            plans={PRICING_CARDS}
            headingTag="h3"
            featuredScaleClass="scale-105"
            gridTestId="pricing-grid"
            variant="pricing"
          />
          <p className="text-sm text-slate-500">{PRICING_PAGE_COPY.socialProof}</p>
        </div>
      </Section>

      <Section id="pricing-comparison" index={2} className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <PricingComparisonTable
            title={PRICING_PAGE_COPY.comparisonTitle}
            columns={['Free', 'Credits', 'Pro + API']}
            rows={PRICING_PAGE_COPY.comparison}
          />
        </div>
      </Section>

      <Section id="pricing-faq" index={3} bg="bg-gray-50" className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl space-y-4">
          <Accordion
            title={PRICING_PAGE_COPY.faqTitle}
            items={PRICING_PAGE_COPY.faq}
            testId="pricing-faq"
          />
          <a className={backlinkClass} href={PRICING_PAGE_COPY.backToAppHref}>
            {PRICING_PAGE_COPY.backToApp}
          </a>
        </div>
      </Section>
    </div>
  );
}
