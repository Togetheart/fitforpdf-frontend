'use client';

import React from 'react';
import { PRICING_CARDS, PRICING_PAGE_COPY } from '../siteCopy.mjs';

const CTA_BASE =
  'inline-flex h-11 items-center justify-center rounded-full border px-4 text-sm font-medium transition';
const CTA_PRIMARY =
  `${CTA_BASE} border-[#D92D2A] bg-[#D92D2A] text-white`;
const CTA_SECONDARY =
  `${CTA_BASE} border-slate-300 bg-white text-slate-900 hover:bg-slate-50`;

function isCorePlan(plan) {
  return ['free', 'credits', 'proApi'].includes(plan.id);
}

function renderAction(plan) {
  if (plan.actionType === 'link') {
    if (plan.disabled) {
      return (
        <a
          href={plan.actionHref}
          className={`${CTA_SECONDARY} opacity-70`}
          aria-disabled="true"
        >
          {plan.actionLabel}
        </a>
      );
    }

    return (
      <a href={plan.actionHref} className={CTA_SECONDARY}>
        {plan.actionLabel}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={plan.disabled ? `${CTA_SECONDARY} opacity-70` : `${CTA_PRIMARY}`}
      disabled={plan.disabled}
      title={plan.tooltip}
    >
      {plan.actionLabel}
    </button>
  );
}

export default function PricingPage() {
  const plans = PRICING_CARDS.filter(isCorePlan);

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
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3" data-testid="pricing-grid">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className={`rounded-[12px] border border-slate-200 bg-white p-5 ${plan.recommended ? 'border-[#D92D2A]/35 ring-1 ring-[#D92D2A]/20' : ''}`}
              >
                <h2 className="text-lg font-semibold">{plan.title}</h2>
                {plan.recommended ? (
                  <p className="mt-2 text-xs font-medium text-[#D92D2A]">Recommended</p>
                ) : null}
                <p className="mt-2 text-lg font-semibold text-[#D92D2A]">
                  {plan.priceLine}
                </p>
                {plan.points.length ? (
                  <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-600">
                    {plan.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                ) : null}
                <div className="mt-5">{renderAction(plan)}</div>
              </article>
            ))}
          </div>
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
