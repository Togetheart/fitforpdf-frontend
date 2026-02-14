'use client';

import React from 'react';
import { PRICING_CARDS, PRICING_PAGE_COPY } from '../siteCopy.mjs';
import PricingCards from '../components/PricingCards';
import Section from '../components/Section';

const LINK_CLASS = 'inline-flex h-10 items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50';

export default function PricingPage() {
  const cards = PRICING_CARDS;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Section id="pricing-hero" index={0}>
        <p className="text-sm text-slate-500">Pricing</p>
        <h1 className="text-[44px] font-[650] leading-tight tracking-tight sm:text-6xl">{PRICING_PAGE_COPY.pageTitle}</h1>
        <p className="max-w-[58ch] text-sm text-slate-600">{PRICING_PAGE_COPY.pageSubtitle}</p>
      </Section>

      <Section id="pricing-cards" index={1} bg="bg-gray-50">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Plans</h2>
          <PricingCards plans={cards} headingTag="h2" showActions />
        </div>
      </Section>

      <Section id="pricing-faq" index={2}>
        <h2 className="text-2xl font-semibold">FAQ</h2>
        <div className="space-y-4 rounded-[12px] border border-slate-200 bg-white p-5">
          {PRICING_PAGE_COPY.faq.map((item) => (
            <div key={item.question} className="space-y-1">
              <p className="font-medium">{item.question}</p>
              <p className="text-sm text-slate-600">
                {item.answer}{' '}
                {item.link ? <a className="text-slate-900 underline" href={item.link}>Read more</a> : null}
              </p>
            </div>
          ))}
        </div>
        <a className={`${LINK_CLASS} mt-2 w-fit`} href={PRICING_PAGE_COPY.backToAppHref}>
          {PRICING_PAGE_COPY.backToApp}
        </a>
      </Section>
    </div>
  );
}
