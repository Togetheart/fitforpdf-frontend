'use client';

import React from 'react';
import { PRICING_CARDS, PRICING_PAGE_COPY } from '../siteCopy.mjs';
import PricingCardsSection from '../components/PricingCardsSection.jsx';

export default function PricingPage() {
  const plans = PRICING_CARDS.filter((plan) => ['free', 'credits', 'proApi'].includes(plan.id));

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <section className="bg-white">
        <div className="mx-auto flex w-full max-w-[960px] flex-col gap-2 px-4 py-8 sm:px-6 sm:py-12">
          <a
            href={PRICING_PAGE_COPY.backToAppHref}
            className="mb-1 w-fit rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:opacity-80"
          >
            {PRICING_PAGE_COPY.backToApp}
          </a>
          <h1 className="text-[44px] font-[650] leading-tight tracking-tight sm:text-6xl">
            {PRICING_PAGE_COPY.pageTitle}
          </h1>
          <p className="max-w-[58ch] text-sm text-slate-500">
            {PRICING_PAGE_COPY.pageSubtitle}
          </p>
        </div>
      </section>

      <section className="bg-gray-50">
        <div className="mx-auto flex w-full max-w-[960px] flex-col gap-4 px-4 py-8 sm:px-6 sm:py-10">
          <PricingCardsSection plans={plans} />
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto flex w-full max-w-[960px] flex-col gap-3 px-4 py-8 sm:px-6 sm:py-10">
          <h2 className="text-2xl font-semibold">FAQ</h2>
          <div className="space-y-4 rounded-[12px] border border-slate-200 bg-white p-5">
            {PRICING_PAGE_COPY.faq.map((item) => (
              <div key={item.question} className="space-y-1">
                <p className="font-medium">{item.question}</p>
                <p className="text-sm text-slate-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
