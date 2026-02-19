'use client';

import React from 'react';
import { PRICING_CARDS, PRICING_PAGE_COPY } from '../siteCopy.mjs';
import PricingPlans from '../components/PricingPlans';
import Section from '../components/ui/Section';
import FaqAccordion from '../components/FaqAccordion';
import FeatureComparison from '../components/FeatureComparison';
import PageHero from '../components/PageHero';
import { useCheckout } from '../hooks/useCheckout.mjs';

export default function PricingPage() {
  const checkout = useCheckout();

  // Inject checkout handler into the credits card
  const plansWithHandlers = PRICING_CARDS.map((plan) =>
    plan.id === 'credits'
      ? { ...plan, onAction: () => checkout.openCreditsPack('credits_100') }
      : plan,
  );

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PageHero
        variant="pricing"
        align="center"
        contentClassName="space-y-5"
        className="py-16 sm:py-20 w-full"
      >
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Pricing
        </h1>
        <p className="text-[2.5rem] sm:text-5xl font-[650] leading-[1.06] tracking-tight text-center text-slate-900 max-w-[20ch]">
          {PRICING_PAGE_COPY.pageTitle}
        </p>
        <p className="text-sm text-slate-400">{PRICING_PAGE_COPY.pageMicro}</p>
      </PageHero>

      <Section id="pricing-plans" index={1} bg="bg-gray-50" className="py-16 sm:py-24">
        <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl sm:text-left">Simple pricing</h2>
        <p className="text-center text-base text-slate-500 sm:text-left max-w-[65ch]">{PRICING_PAGE_COPY.pageSubtitle}</p>
        <PricingPlans
          plans={plansWithHandlers}
          headingTag="h3"
          featuredScaleClass="scale-105"
          gridTestId="pricing-grid"
          variant="pricing"
        />
        {checkout.error ? (
          <p className="text-center text-sm text-red-500">{checkout.error}</p>
        ) : null}
        <p className="text-center text-sm text-slate-500 sm:text-left">
          Need higher limits, API access, or team plans? <a href="mailto:hello@fitforpdf.com" className="underline hover:text-accent transition-colors">Contact us</a>.
        </p>
      </Section>

      <Section id="pricing-comparison" index={2} className="py-16 sm:py-24">
        <FeatureComparison
          title={PRICING_PAGE_COPY.comparisonTitle}
          columns={['Free', 'Credits']}
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
