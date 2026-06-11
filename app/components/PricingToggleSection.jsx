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
export function PaygCard({ pack, onBuy, isLoading, orderClassName }) {
  const isDisabled = pack?.disabled === true;
  const isFeatured = Boolean(pack.recommended);

  return (
    <Card
      as="article"
      data-testid="payg-plan-card"
      className={cn(
        'feature-card-hover relative flex flex-col overflow-visible',
        orderClassName,
        // Subtle hover lift; the visible CTA is the only click target now (the
        // whole-card stretched overlay fired a surprise navigation to Stripe).
        !isDisabled && 'hover:-translate-y-0.5 hover:shadow-md transition-all duration-150',
        isFeatured
          // Featured = a real ring + shadow. The old 1px border was byte-identical
          // to the default card, so "most popular" never actually popped — and it
          // works on mobile too, where md:scale does not apply.
          ? 'md:scale-[1.04] bg-[var(--color-bg)] p-7 ring-2 ring-[var(--color-text)] shadow-md'
          : 'p-6',
      )}
    >

      {/* Badge, centered above */}
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

      {/* CTA — the only click target now. The featured pack gets the single blue
          primary action; the others stay outline so one action leads the eye. */}
      <div className="relative z-10 mt-6">
        <button
          type="button"
          onClick={onBuy}
          disabled={Boolean(isDisabled) || Boolean(isLoading)}
          className={cn(
            'w-full rounded-full py-2.5 text-sm font-semibold tracking-tight transition-all duration-150 active:scale-[0.98]',
            isFeatured
              ? 'bg-cta text-cta-text hover:bg-cta-hover shadow-sm hover:shadow-[0_4px_16px_rgba(37,99,235,0.28)] disabled:cursor-not-allowed disabled:opacity-50'
              : 'border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-muted)] hover:bg-[var(--color-bg)] disabled:cursor-not-allowed disabled:opacity-50',
            isDisabled ? 'bg-cta/15 text-cta/55 cursor-not-allowed' : '',
          )}
        >
          {isLoading ? 'Opening secure checkout…' : pack.actionLabel}
        </button>
        <p className="mt-2 text-center text-[11px] leading-4 text-muted">
          Secure checkout via Stripe · One-time, never auto-charged
        </p>
      </div>
    </Card>
  );
}

/* ── Pro subscription card ─────────────────────────────── */
export function ProSubscriptionCard({ billing, onBillingChange, onSubscribe, isLoading, orderClassName }) {
  const isYearly = billing === 'yearly';
  const price = isYearly ? PRICING_PAGE_COPY.proYearlyPrice : PRICING_PAGE_COPY.proMonthlyPrice;
  const period = isYearly ? PRICING_PAGE_COPY.proYearlyPeriod : PRICING_PAGE_COPY.proMonthlyPeriod;

  const billingOptions = [
    { value: 'monthly', label: PRICING_PAGE_COPY.billingMonthly, sub: null },
    { value: 'yearly', label: PRICING_PAGE_COPY.billingYearly, sub: PRICING_PAGE_COPY.proYearlySaving },
  ];

  return (
    <Card
      as="article"
      className={cn(
        'relative flex w-full flex-col overflow-visible p-8 bg-[var(--color-bg)]',
        orderClassName,
        'hover:-translate-y-0.5 hover:shadow-md transition-all duration-150',
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

      {/* Billing period toggle — scoped to this card, the only subscription
          option on the page. z-10 keeps it above the stretched-link overlay. */}
      {onBillingChange ? (
        <div className="relative z-10 mt-4">
          <PillToggle options={billingOptions} value={billing} onChange={onBillingChange} size="sm" />
        </div>
      ) : null}

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

      {/* CTA — outline style; the blue primary is reserved for the featured
          Starter pack so a single action draws the eye across the grid. */}
      <div className="relative z-10 mt-auto pt-8">
        <button
          type="button"
          onClick={onSubscribe}
          disabled={isLoading}
          className="w-full rounded-full border border-[var(--color-border)] py-2.5 text-sm font-semibold tracking-tight text-[var(--color-text)] transition-all duration-150 hover:border-[var(--color-muted)] hover:bg-[var(--color-bg)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Opening secure checkout…' : PRICING_PAGE_COPY.proCtaLabel}
        </button>
        <p className="mt-2 text-center text-[11px] leading-4 text-muted">
          Secure checkout via Stripe · Cancel anytime · Receipt &amp; invoice included
        </p>
      </div>
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

/* ── Full pricing section ──────────────────────────────────
 * One grid, no format tab-split. Packs (one-time, never-expire) and the Pro
 * subscription sit side by side so the buyer can compare the two formats —
 * the exact decision a subscription-averse freelance ICP needs to make.
 * The packs vs subscription distinction lives inline in each card's topline.
 * API tiers live on /developers (a separate audience), not here. */
export default function PricingToggleSection({ showFreeTier = true, promoCode = null }) {
  const [billing, setBilling] = useState('monthly');
  const checkout = useCheckout();

  function handlePackBuy(pack) {
    const fallbackPackId = pack?.id === 'single'
      ? 'credits_1'
      : pack?.id === 'payg-starter'
        ? 'credits_10'
        : null;
    const packId = pack?.stripePackId || fallbackPackId;
    if (!packId) return;
    checkout.openCreditsPack(packId);
  }

  return (
    <div className="space-y-10">
      {/* Social proof pill */}
      <div className="flex flex-col items-center gap-3">
        <StatPill>
          Saves <span className="font-bold">45 min</span> of manual formatting per export.
        </StatPill>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
          {PRICING_PAGE_COPY.paygTagline}
        </p>
      </div>

      {/* Single unified grid: Single · Starter (featured) · Pro */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:items-stretch xl:gap-6">
        {PAYG_PACKS.map((pack) => (
          <PaygCard
            key={pack.id}
            isLoading={checkout.isLoading}
            pack={pack}
            onBuy={() => handlePackBuy(pack)}
            // Mobile leads with the featured Starter, then Pro, then the cheapest
            // Single last — desktop keeps the DOM order via the unprefixed grid.
            orderClassName={pack.recommended ? 'max-md:order-1' : 'max-md:order-3'}
          />
        ))}
        <ProSubscriptionCard
          billing={billing}
          onBillingChange={setBilling}
          isLoading={checkout.isLoading}
          onSubscribe={() => checkout.openProCheckout(billing)}
          orderClassName="max-md:order-2"
        />
      </div>

      {checkout.error ? (
        <p className="text-center text-sm text-red-600">{checkout.error}</p>
      ) : null}

      {/* Other audiences routed out, not shown as cards */}
      <p className="text-center text-sm text-muted">
        Building a product?{' '}
        <a href="/developers" className="text-muted underline decoration-dotted hover:text-[var(--color-text)] transition-colors">
          API plans from $15/mo
        </a>
        {' '}· Teams &amp; high volume?{' '}
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
  );
}
