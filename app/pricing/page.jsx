'use client';

import React from 'react';
import { PRICING_CARDS, PRICING_PAGE_COPY } from '../siteCopy.mjs';
import PricingPlans from '../components/PricingPlans';
import Section from '../components/ui/Section';
import FaqAccordion from '../components/FaqAccordion';
import FeatureComparison from '../components/FeatureComparison';
import PageHero from '../components/PageHero';

export default function PricingPage() {
  const badgeClass =
    'inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-accent-hover';
  const sectionClass = 'mx-auto max-w-6xl';

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PageHero
        variant="pricing"
        align="center"
        eyebrow={PRICING_PAGE_COPY.plansEyebrow}
        title={PRICING_PAGE_COPY.pageTitle}
        subtitle={PRICING_PAGE_COPY.pageSubtitle}
        trustLine={PRICING_PAGE_COPY.pageMicro}
        contentClassName="space-y-6"
        titleClassName="mt-4 text-center text-4xl md:text-6xl font-[650] leading-tight tracking-tight"
        className="py-24 sm:py-28 w-full"
      >
        <span className={badgeClass}>{PRICING_PAGE_COPY.pageTagline}</span>
      </PageHero>

      <Section id="pricing-plans" index={1} bg="bg-gray-50" className="py-16 sm:py-20">
        <div className={`${sectionClass} space-y-4`}>
          <p className="text-xs font-semibold tracking-[0.18em] text-black/55">PRICING</p>
          <h2 className="text-2xl font-semibold sm:text-3xl">Simple pricing</h2>
          <p className="max-w-[65ch] text-sm text-slate-600">{PRICING_PAGE_COPY.pageSubtitle}</p>
          <PricingPlans
            plans={PRICING_CARDS}
            headingTag="h3"
            featuredScaleClass="scale-105"
            gridTestId="pricing-grid"
            variant="pricing"
          />
          <p className="text-sm text-slate-700">
            Need higher limits, API access, or team plans? <a href="mailto:hello@fitforpdf.com" className="underline">Contact us</a>.
          </p>
        </div>
      </Section>

      <Section id="pricing-comparison" index={2} className="py-16 sm:py-20">
        <div className={sectionClass}>
          <FeatureComparison
            title={PRICING_PAGE_COPY.comparisonTitle}
            columns={['Free', 'Credits']}
            rows={PRICING_PAGE_COPY.comparison}
          />
        </div>
      </Section>

      <Section id="pricing-faq" index={3} bg="bg-gray-50" className="py-16 sm:py-20">
        <div className={`${sectionClass} max-w-3xl space-y-4`}>
          <FaqAccordion
            title={PRICING_PAGE_COPY.faqTitle}
            items={PRICING_PAGE_COPY.faq}
            testId="pricing-faq"
          />
        </div>
      </Section>
    </div>
  );
}
