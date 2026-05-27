'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { PAYG_PACKS, PRICING_PAGE_COPY } from '../siteCopy.mjs';
import StatPill from './ui/StatPill';
import Card from './Card';
import { useCheckout } from '../hooks/useCheckout.mjs';
import { cn } from '../lib/cn.mjs';
import PromoCodeInput from './PromoCodeInput';

/* ── Pill toggle ───────────────────────────────────────── */
export function PillToggle({ options, value, onChange, size = 'md' }) {
  const activeIndex = options.findIndex((o) => o.value === value);
  const hasSub = options.some((o) => o.sub);

  return (
    <div
      className="relative inline-grid grid-cols-2 rounded-full bg-accent p-1"
    >
      {/* Sliding indicator */}
      <div
        aria-hidden="true"
        className="absolute inset-1 rounded-full bg-[var(--color-bg)] shadow-[0_1px_4px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out"
        style={{
          left: activeIndex === 0 ? '4px' : '50%',
          right: activeIndex === 0 ? '50%' : '4px',
        }}
      />
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'relative z-10 flex flex-col items-center justify-center text-center rounded-full transition-colors duration-200 select-none',
              size === 'sm'
                ? 'px-5 py-2'
                : 'px-6 py-2.5 sm:px-8',
              isActive ? 'text-[var(--color-text)]' : 'text-white/55 hover:text-white',
            )}
          >
            <span className="text-sm font-semibold leading-tight">
              {opt.label}
            </span>
            {opt.sub ? (
              <span className={cn(
                'text-xs font-medium leading-tight mt-0.5',
                isActive ? 'text-blue-300' : 'text-blue-500',
              )}>
                {opt.sub}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/* ── PAYG card ─────────────────────────────────────────── */
export function PaygCard({ pack, onBuy, isLoading }) {
  const isDisabled = pack?.disabled === true;
  const isFeatured = Boolean(pack.recommended);

  return (
    <Card
      as="article"
      data-testid="payg-plan-card"
      className={cn(
        'feature-card-hover relative flex flex-col overflow-visible',
        // Whole-card click target (stretched-link pattern on the CTA button).
        // Skipped for disabled packs to avoid "click does nothing" frustration.
        !isDisabled && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-150',
        isFeatured
          ? 'md:scale-[1.04] bg-[var(--color-bg)] p-7'
          : 'p-6',
      )}
      style={isFeatured ? { border: '1px solid rgba(0,0,0,0.10)' } : {}}
    >

      {/* Badge — centered above */}
      {pack.badge ? (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white shadow-sm whitespace-nowrap">
            {pack.badge}
          </span>
        </div>
      ) : null}

      {/* Header */}
      <div className="text-center sm:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
          {pack.priceLine}
        </p>
        <h3 className={cn(
          'mt-1 font-bold tracking-tight',
          isFeatured ? 'text-2xl text-[var(--color-text)]' : 'text-xl text-[var(--color-text)]',
        )}>
          {pack.title}
        </h3>
      </div>

      {/* Price block */}
      <div className="mt-5 text-center sm:text-left">
        <div className="flex items-baseline gap-1.5 justify-center sm:justify-start">
          <span className={cn(
            'font-bold tracking-tight leading-none tabular-nums',
            isFeatured ? 'text-4xl text-[var(--color-text)]' : 'text-4xl text-[var(--color-text)]',
          )}>
            {pack.priceDisplay}
          </span>
          <span className="text-sm font-medium text-muted">{pack.exportsLabel}</span>
        </div>
        {pack.perExport ? (
          <p className="mt-1.5 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
            {pack.perExport}
          </p>
        ) : (
          <div className="mt-1.5 h-5" />
        )}
      </div>

      {/* Description */}
      <p className={cn(
        'mt-3 text-sm leading-relaxed text-center sm:text-left',
        isFeatured ? 'text-muted' : 'text-muted',
      )}>
        {pack.description}
      </p>

      {/* Divider */}
      <div className="my-5 h-px bg-[var(--color-border)]" />

      {/* Features */}
      <ul className="flex-1 space-y-2 text-sm">
        {pack.points.map((point) => (
          <li key={point} className="flex items-center gap-2.5 justify-center sm:justify-start">
            <span className={cn(
              'flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
              'bg-[var(--color-bg-hero)]',
            )}>
              <Check
                className="h-2.5 w-2.5 text-cta"
                strokeWidth={3}
              />
            </span>
            <span className={isFeatured ? 'text-[var(--color-text)] font-medium' : 'text-muted'}>
              {point}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA — visible button, z-10 so it stays clickable above the
          full-card overlay below. */}
      <div className="relative z-10 mt-6">
        <button
          type="button"
          onClick={onBuy}
          disabled={Boolean(isDisabled) || Boolean(isLoading)}
          className={cn(
            'w-full rounded-full py-2.5 text-sm font-semibold tracking-tight transition-all duration-150 active:scale-[0.98]',
            isFeatured
              ? 'bg-accent text-white hover:bg-accent-hover shadow-sm hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] disabled:cursor-not-allowed disabled:opacity-50'
              : 'border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-muted)] hover:bg-[var(--color-bg)] disabled:cursor-not-allowed disabled:opacity-50',
            isDisabled ? 'bg-cta/15 text-cta/55 cursor-not-allowed' : '',
          )}
        >
          {pack.actionLabel}
        </button>
      </div>

      {/* Full-card click intercept. Last in DOM so it stacks above static
          content (price, features, etc.) without needing z-index. The
          visible CTA above gets `relative z-10` to stay clickable on top.
          tabIndex=-1 keeps only one tab stop on the visible button.
          Replaces the previous after:absolute pseudo-element pattern, which
          is unreliable on <button> across browsers (replaced-element quirk). */}
      {!isDisabled && !isLoading ? (
        <button
          type="button"
          onClick={onBuy}
          tabIndex={-1}
          aria-hidden="true"
          data-testid="card-stretched-overlay"
          className="absolute inset-0 cursor-pointer rounded-2xl bg-transparent"
        />
      ) : null}
    </Card>
  );
}

/* ── Pro subscription card ─────────────────────────────── */
export function ProSubscriptionCard({ billing, onSubscribe, isLoading }) {
  const isYearly = billing === 'yearly';
  const price = isYearly ? PRICING_PAGE_COPY.proYearlyPrice : PRICING_PAGE_COPY.proMonthlyPrice;
  const period = isYearly ? PRICING_PAGE_COPY.proYearlyPeriod : PRICING_PAGE_COPY.proMonthlyPeriod;

  return (
    <Card
      as="article"
      className={cn(
        'relative flex w-full flex-col overflow-visible p-8 bg-[var(--color-bg)]',
        // Whole-card click via stretched-link on CTA below.
        'cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-150',
      )}
      style={{ border: '1px solid var(--color-border)' }}
    >

      {/* Title */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
          {PRICING_PAGE_COPY.togglePro}
        </p>
        <h3 className="mt-1 text-2xl font-bold tracking-tight text-[var(--color-text)]">
          {PRICING_PAGE_COPY.proSubscriptionTitle}
        </h3>
      </div>

      {/* Price */}
      <div className="mt-5 flex items-baseline gap-1.5">
        <span className="text-4xl font-bold tracking-tight leading-none text-[var(--color-text)] tabular-nums">{price}</span>
        <span className="text-base font-medium text-muted">{period}</span>
        {isYearly ? (
          <span className="ml-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            {PRICING_PAGE_COPY.proYearlySaving}
          </span>
        ) : null}
      </div>

      {/* Divider */}
      <div className="my-6 h-px bg-[var(--color-border)]" />

      {/* Features */}
      <ul className="flex-1 space-y-2.5 text-sm">
        {PRICING_PAGE_COPY.proFeatures.map((feat) => (
          <li key={feat} className="flex items-center gap-2.5">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-hero)]">
              <Check className="h-2.5 w-2.5 text-cta" strokeWidth={3} />
            </span>
            <span className="text-[var(--color-text)] font-medium">{feat}</span>
          </li>
        ))}
      </ul>

      {/* CTA — visible button, z-10 above the overlay below. */}
      <div className="relative z-10 mt-auto pt-8">
        <button
          type="button"
          onClick={onSubscribe}
          disabled={isLoading}
          className="w-full rounded-full py-2.5 text-sm font-semibold tracking-tight transition-all duration-150 active:scale-[0.98] bg-accent text-white hover:bg-accent-hover shadow-sm hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {PRICING_PAGE_COPY.proCtaLabel}
        </button>
      </div>

      {/* Full-card click intercept (see PaygCard for rationale). */}
      {!isLoading ? (
        <button
          type="button"
          onClick={onSubscribe}
          tabIndex={-1}
          aria-hidden="true"
          className="absolute inset-0 cursor-pointer rounded-2xl bg-transparent"
        />
      ) : null}
    </Card>
  );
}

/* ── Team / API card ────────────────────────────────────── */
export function ProApiCard() {
  return (
    <Card
      as="article"
      className={cn(
        'relative flex w-full flex-col overflow-visible p-8 border border-[var(--color-border)] bg-[var(--color-bg)]/70',
        'cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-150',
      )}
    >
      {/* Title */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
          API
        </p>
        <h3 className="mt-1 text-2xl font-bold tracking-tight text-[var(--color-text)]">
          {PRICING_PAGE_COPY.proApiTitle}
        </h3>
      </div>

      {/* Tagline */}
      <p className="mt-2 text-sm text-muted leading-relaxed">{PRICING_PAGE_COPY.proApiTagline}</p>
      <p className="mt-0.5 text-xs text-muted">{PRICING_PAGE_COPY.proApiSubTagline}</p>

      {/* Price placeholder */}
      <div className="mt-5">
        <span className="text-4xl font-bold tracking-tight leading-none text-[var(--color-text)]">{PRICING_PAGE_COPY.proApiPricePlaceholder}</span>
      </div>

      {/* Divider */}
      <div className="my-6 h-px bg-[var(--color-border)]" />

      {/* Features */}
      <ul className="flex-1 space-y-2.5 text-sm">
        {PRICING_PAGE_COPY.proApiFeatures.map((feat) => (
          <li key={feat} className="flex items-center gap-2.5">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-hero)]">
              <Check className="h-2.5 w-2.5 text-cta" strokeWidth={3} />
            </span>
            <span className="text-muted">{feat}</span>
          </li>
        ))}
      </ul>

      {/* CTA — visible link, z-10 above the overlay below. */}
      <div className="relative z-10 mt-auto pt-8">
        <p className="mb-0.5 text-center text-xs text-muted/60">{PRICING_PAGE_COPY.proApiSocialProof}</p>
        <p className="mb-3 text-center text-xs text-muted/60">{PRICING_PAGE_COPY.proApiSocialProof2}</p>
        <a
          href={PRICING_PAGE_COPY.proApiCtaHref}
          className="flex w-full items-center justify-center rounded-full border border-[var(--color-border)] py-2.5 text-sm font-semibold text-[var(--color-text)] hover:border-[var(--color-muted)] hover:bg-[var(--color-bg)] transition-all duration-150 active:scale-[0.98]"
        >
          {PRICING_PAGE_COPY.proApiCtaLabel}
        </a>
      </div>

      {/* Full-card click overlay. Use <a> so a plain click + new-tab
          modifiers (cmd/ctrl-click, middle-click) work as expected. */}
      <a
        href={PRICING_PAGE_COPY.proApiCtaHref}
        tabIndex={-1}
        aria-hidden="true"
        className="absolute inset-0 cursor-pointer rounded-2xl"
      />
    </Card>
  );
}

/* ── Enterprise card ──────────────────────────────────── */
export function EnterpriseCard() {
  const features = [
    'Custom volume',
    'SLA',
    'SSO',
    'Dedicated support',
    'Custom branding',
  ];

  return (
    <Card
      as="article"
      className={cn(
        'relative flex w-full flex-col overflow-visible p-8 border border-[var(--color-border)] bg-[var(--color-bg)]/70',
        'cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-150',
      )}
    >
      {/* Title */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
          Enterprise
        </p>
        <h3 className="mt-1 text-2xl font-bold tracking-tight text-[var(--color-text)]">
          Enterprise
        </h3>
      </div>

      {/* Description */}
      <p className="mt-2 text-sm text-muted leading-relaxed">For teams with high-volume needs.</p>

      {/* Price */}
      <div className="mt-5">
        <span className="text-4xl font-bold tracking-tight leading-none text-[var(--color-text)]">Custom</span>
      </div>

      {/* Divider */}
      <div className="my-6 h-px bg-[var(--color-border)]" />

      {/* Features */}
      <ul className="flex-1 space-y-2.5 text-sm">
        {features.map((feat) => (
          <li key={feat} className="flex items-center gap-2.5">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-hero)]">
              <Check className="h-2.5 w-2.5 text-cta" strokeWidth={3} />
            </span>
            <span className="text-muted">{feat}</span>
          </li>
        ))}
      </ul>

      {/* CTA — visible link, z-10 above the overlay below. */}
      <div className="relative z-10 mt-auto pt-8">
        <a
          href="/contact"
          className="flex w-full items-center justify-center rounded-full border border-[var(--color-border)] py-2.5 text-sm font-semibold text-[var(--color-text)] hover:border-[var(--color-muted)] hover:bg-[var(--color-bg)] transition-all duration-150 active:scale-[0.98]"
        >
          Contact us
        </a>
      </div>

      {/* Full-card click overlay (see ProApiCard). */}
      <a
        href="/contact"
        tabIndex={-1}
        aria-hidden="true"
        className="absolute inset-0 cursor-pointer rounded-2xl"
      />
    </Card>
  );
}

/* ── Free tier safety net ──────────────────────────────── */
export function FreeTierCTA() {
  return (
    <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg)]/50 px-6 py-5 text-center">
      <p className="text-sm font-semibold text-muted">
        {PRICING_PAGE_COPY.freeSafetyTitle}
      </p>
      <p className="mt-1 text-xs text-muted">{PRICING_PAGE_COPY.freeSafetyDesc}</p>
      <a
        href={PRICING_PAGE_COPY.freeSafetyCtaHref}
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-text)] hover:underline transition-colors"
      >
        {PRICING_PAGE_COPY.freeSafetyCtaLabel}
      </a>
    </div>
  );
}

/* ── Full pricing toggle section ───────────────────────── */
export default function PricingToggleSection({ showFreeTier = true, promoCode = null }) {
  const [mode, setMode] = useState('payg');
  const [billing, setBilling] = useState('monthly');
  const checkout = useCheckout();

  const modeOptions = [
    { value: 'payg', label: PRICING_PAGE_COPY.togglePayg },
    { value: 'pro', label: PRICING_PAGE_COPY.togglePro },
  ];

  const billingOptions = [
    { value: 'monthly', label: PRICING_PAGE_COPY.billingMonthly, sub: null },
    { value: 'yearly', label: PRICING_PAGE_COPY.billingYearly, sub: PRICING_PAGE_COPY.proYearlySaving },
  ];

  function handlePackBuy(pack) {
    const fallbackPackId = pack?.id === 'single'
      ? 'credits_1'
      : pack?.id === 'payg-starter'
        ? 'credits_10'
        : pack?.id === 'volume'
          ? 'credits_100'
          : null;
    const packId = pack?.stripePackId || fallbackPackId;
    if (!packId) return;
    checkout.openCreditsPack(packId);
  }

  return (
    <div className="space-y-10">
      {/* Main toggle + social proof pill */}
      <div className="flex flex-col items-center gap-3">
        <PillToggle options={modeOptions} value={mode} onChange={setMode} />
        <StatPill>
          Saves <span className="font-bold">45 min</span> of manual formatting per export.
        </StatPill>
      </div>

      {/* ── Pay-as-you-go view ── */}
      {mode === 'payg' ? (
        <div className="space-y-8">
          {/* PAYG tagline — rule divider style */}
          <div className="flex items-center justify-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--color-border)] max-w-[80px]" />
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
              {PRICING_PAGE_COPY.paygTagline}
            </p>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-black/10 max-w-[80px]" />
          </div>

          {/* 3 cards */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:items-start xl:gap-6">
            {PAYG_PACKS.map((pack) => (
              <PaygCard
                key={pack.id}
                isLoading={checkout.isLoading}
                pack={pack}
                onBuy={() => handlePackBuy(pack)}
              />
            ))}
          </div>

          {checkout.error ? (
            <p className="text-center text-sm text-red-600">{checkout.error}</p>
          ) : null}

          <p className="text-center text-sm text-muted">
            Need higher volume, API access, or team plans?{' '}
            <a href="/contact" className="text-muted underline decoration-dotted hover:text-[var(--color-text)] transition-colors">
              Contact us
            </a>.
          </p>

          {showFreeTier ? <FreeTierCTA /> : null}

          {/* Promo code */}
          <div id="promo" className="flex flex-col items-center gap-2 pt-2 scroll-mt-24">
            <p className="text-xs font-medium text-muted/60 uppercase tracking-[0.06em]">Have a promo code?</p>
            <PromoCodeInput initialCode={promoCode} />
          </div>
        </div>
      ) : null}

      {/* ── Pro subscription view ── */}
      {mode === 'pro' ? (
        <div className="space-y-8">
          {/* Taglines */}
          <div className="text-center space-y-1">
            <p className="text-base font-semibold text-[var(--color-text)]">{PRICING_PAGE_COPY.proTagline}</p>
            <p className="text-sm text-muted">{PRICING_PAGE_COPY.proSubTagline}</p>
          </div>

          {/* Billing toggle — dark pill variant */}
          <div className="flex justify-center">
            <PillToggle options={billingOptions} value={billing} onChange={setBilling} size="sm" />
          </div>

          {/* Pro + API + Enterprise cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-stretch lg:gap-8">
            <ProSubscriptionCard
              billing={billing}
              isLoading={checkout.isLoading}
              onSubscribe={() => checkout.openProCheckout(billing)}
            />
            <ProApiCard />
            <EnterpriseCard />
          </div>

          {showFreeTier ? <FreeTierCTA /> : null}

          {/* Promo code */}
          <div id="promo" className="flex flex-col items-center gap-2 pt-2 scroll-mt-24">
            <p className="text-xs font-medium text-muted/60 uppercase tracking-[0.06em]">Have a promo code?</p>
            <PromoCodeInput initialCode={promoCode} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
