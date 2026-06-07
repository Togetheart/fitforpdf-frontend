'use client';

import React from 'react';

/*
 * PlanBadge — the single, shared plan/credits chip.
 *
 * Used by BOTH the marketing header (SiteHeader) and the app workbench toolbar
 * (AppToolbar) so "account / credits" reads identically across the product.
 * Presentational: pass the `quota` object from useQuota(); it derives the
 * label + status dot. Themed via CSS tokens so it works in light and dark.
 */

// Mirror of the fallback logic used elsewhere for "exports left".
function exportsLeftOf(quota) {
  if (Number.isFinite(quota?.freeExportsLeft)) return quota.freeExportsLeft;
  if (Number.isFinite(quota?.freeExportsLimit)) return quota.freeExportsLimit;
  return 3;
}

function describe(quota) {
  const planType = quota?.planType;
  const isUnlimited = planType === 'api_enterprise' || quota?.isUnlimited === true;
  if (isUnlimited) return { dot: 'var(--color-text)', label: 'Admin · unlimited' };
  if (planType === 'pro') return { dot: 'var(--color-cta-bg)', label: 'Pro · 500/mo' };
  if (planType === 'credits') {
    const n = exportsLeftOf(quota);
    return { dot: 'var(--color-success-text)', label: `${n} credit${n === 1 ? '' : 's'}` };
  }
  const n = exportsLeftOf(quota);
  return { dot: 'var(--color-text-subtle)', label: `Free · ${n} export${n === 1 ? '' : 's'}` };
}

export default function PlanBadge({ quota, className = '', ...props }) {
  if (!quota) return null;
  const { dot, label } = describe(quota);
  return (
    <a
      href="/pricing"
      data-testid="plan-badge"
      className={
        'inline-flex h-8 items-center gap-2 rounded-full bg-[var(--color-chip-bg)] px-3 ' +
        'text-xs font-semibold text-[var(--color-muted)] transition hover:text-[var(--color-text)] ' +
        className
      }
      {...props}
    >
      <span
        aria-hidden="true"
        className="h-[7px] w-[7px] rounded-full"
        style={{ backgroundColor: dot }}
      />
      {label}
    </a>
  );
}
