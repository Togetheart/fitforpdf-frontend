'use client';

import React from 'react';
import { PRICING_CARDS, PRICING_PAGE_COPY } from '../siteCopy.mjs';
import PricingCards from '../components/PricingCards';
import Section from '../components/Section';
import FaqAccordion from '../components/FaqAccordion';

export default function PricingPage() {
  const backlinkClass =
    'inline-flex h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 transition duration-150 ease-out hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50 focus-visible:ring-offset-2';

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Section id="pricing-hero" index={0} bg="bg-white" className="py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Pricing</p>
          <h1 className="mt-4 text-4xl font-[650] leading-tight tracking-tight sm:text-[56px]">
            {PRICING_PAGE_COPY.pageTitle}
          </h1>
          <p className="mt-4 text-sm text-slate-700 sm:text-base">{PRICING_PAGE_COPY.pageSubtitle}</p>
          <p className="mt-3 text-sm text-slate-500">{PRICING_PAGE_COPY.pageMicro}</p>
        </div>
      </Section>

      <Section id="pricing-plans" index={1} bg="bg-gray-50" className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl space-y-4">
          <h2 className="text-2xl font-semibold">Plans</h2>
          <p className="max-w-[60ch] text-sm text-slate-600">
            Three clean paths. No subscriptions. No lock-in.
          </p>
          <PricingCards
            plans={PRICING_CARDS}
            headingTag="h3"
            showActions
            featuredScaleClass="scale-105"
            gridTestId="pricing-grid"
          />
          <p className="text-sm text-slate-500">{PRICING_PAGE_COPY.socialProof}</p>
        </div>
      </Section>

      <Section id="pricing-comparison" index={2} className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl space-y-4">
          <h2 className="text-2xl font-semibold">Feature comparison</h2>
          <div className="overflow-x-auto rounded-[14px] border border-slate-200">
            <table className="min-w-full text-sm" data-testid="pricing-comparison-table">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-[0.06em] text-slate-500">
                  <th className="px-4 py-3">Feature</th>
                  <th className="px-4 py-3">Free</th>
                  <th className="px-4 py-3">Credits</th>
                  <th className="px-4 py-3">Pro / API</th>
                </tr>
              </thead>
              <tbody>
                {PRICING_PAGE_COPY.comparison.map((row, rowIndex) => (
                  <tr
                    key={row[0]}
                    className={`border-b border-slate-100 last:border-0 ${
                      rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                    }`}
                  >
                    <th className="px-4 py-3 text-left font-medium text-slate-700">{row[0]}</th>
                    <td className="px-4 py-3 text-slate-600">{row[1]}</td>
                    <td className="px-4 py-3 text-slate-600">{row[2]}</td>
                    <td className="px-4 py-3 text-slate-600">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <Section id="pricing-faq" index={3} bg="bg-gray-50" className="py-20 sm:py-24">
        <div className="mx-auto max-w-3xl space-y-4">
          <FaqAccordion title="Frequently asked questions" items={PRICING_PAGE_COPY.faq} />
          <a className={backlinkClass} href={PRICING_PAGE_COPY.backToAppHref}>
            {PRICING_PAGE_COPY.backToApp}
          </a>
        </div>
      </Section>
    </div>
  );
}
