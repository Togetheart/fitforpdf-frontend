'use client';

import React from 'react';
import { PRICING_CARDS, PRICING_PAGE_COPY } from '../siteCopy.mjs';
import PricingCards from '../components/PricingCards';
import Section from '../components/Section';

const LINK_CLASS = 'inline-flex h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Section id="pricing-hero" index={0}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Pricing
        </p>
        <h1 className="text-4xl font-[650] leading-tight tracking-tight sm:text-[56px]">
          {PRICING_PAGE_COPY.pageTitle}
        </h1>
        <p className="max-w-[56ch] text-sm text-slate-600">{PRICING_PAGE_COPY.pageSubtitle}</p>
        <p className="text-sm text-slate-700">{PRICING_PAGE_COPY.pageMicro}</p>
      </Section>

      <Section id="pricing-plans" index={1} bg="bg-gray-50">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Plans</h2>
          <p className="max-w-[60ch] text-sm text-slate-600">
            Three clean paths for every delivery need.
          </p>
          <div>
            <PricingCards
              plans={PRICING_CARDS}
              headingTag="h3"
              showActions
              featuredScaleClass="scale-105"
            />
          </div>
        </div>
      </Section>

      <Section id="pricing-comparison" index={2}>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Feature comparison</h2>
          <div className="overflow-x-auto rounded-[14px] border border-slate-200 bg-white">
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
                {PRICING_PAGE_COPY.comparison.map((row) => (
                  <tr key={row[0]} className="border-b border-slate-100 last:border-0">
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

      <Section id="pricing-faq" index={3} bg="bg-gray-50">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">FAQ</h2>
          <div className="space-y-3">
            {PRICING_PAGE_COPY.faq.map((item) => (
              <details key={item.question} className="rounded-[14px] border border-slate-200 bg-white p-4">
                <summary className="cursor-pointer text-sm font-medium text-slate-900">{item.question}</summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {item.answer}
                  {item.link ? (
                    <>
                      {' '}
                      <a href={item.link} className="underline">
                        Read more
                      </a>
                    </>
                  ) : null}
                </p>
              </details>
            ))}
          </div>
          <a className={LINK_CLASS} href={PRICING_PAGE_COPY.backToAppHref}>
            {PRICING_PAGE_COPY.backToApp}
          </a>
        </div>
      </Section>
    </div>
  );
}
