'use client';

import React, { useEffect, useState } from 'react';
import useSession from '../hooks/useSession.mjs';

export default function AccountPage() {
  const { account, quota, loading, logout } = useSession();
  const [billingError, setBillingError] = useState('');

  useEffect(() => {
    if (!loading && !account) window.location.assign('/login');
  }, [loading, account]);

  if (loading || !account) {
    return <main className="mx-auto w-full max-w-md px-6 py-16 text-sm text-[var(--color-muted)]">Loading…</main>;
  }

  const plan = (quota && quota.plan) || 'free';
  const isUnlimited = plan === 'api_enterprise' || (quota && quota.apiEnterprise && quota.apiEnterprise.unlimited);
  function remainingFor() {
    if (!quota) return { label: 'Credits left', value: 0 };
    if (plan === 'pro') return { label: 'Exports left this month', value: Number.isFinite(quota.pro?.remainingInPeriod) ? quota.pro.remainingInPeriod : 0 };
    if (plan === 'api_starter') return { label: 'Calls left this month', value: Number.isFinite(quota.apiStarter?.remainingInPeriod) ? quota.apiStarter.remainingInPeriod : 0 };
    if (plan === 'api_scale') return { label: 'Calls left this month', value: Number.isFinite(quota.apiScale?.remainingInPeriod) ? quota.apiScale.remainingInPeriod : 0 };
    if (plan === 'credits') return { label: 'Credits left', value: Number.isFinite(quota.credits?.remaining) ? quota.credits.remaining : 0 };
    return { label: 'Free exports left', value: Number.isFinite(quota.free?.remaining) ? quota.free.remaining : 0 };
  }
  const remaining = remainingFor();

  async function openBilling() {
    setBillingError('');
    try {
      const res = await fetch('/api/account/billing-portal', { method: 'POST', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.url) { window.location.assign(data.url); return; }
      }
      setBillingError('Billing is unavailable right now.');
    } catch {
      setBillingError('Billing is unavailable right now.');
    }
  }

  return (
    <main className="mx-auto w-full max-w-md px-6 py-16">
      <h1 className="text-2xl font-black tracking-tight text-[var(--color-text)]">My account</h1>
      <dl className="mt-8 space-y-3 text-sm">
        <div className="flex justify-between"><dt className="text-[var(--color-muted)]">Email</dt><dd className="font-medium text-[var(--color-text)]">{account.email}</dd></div>
        <div className="flex justify-between"><dt className="text-[var(--color-muted)]">Plan</dt><dd className="font-medium text-[var(--color-text)]">{isUnlimited ? 'Unlimited (admin)' : plan}</dd></div>
        {!isUnlimited ? (
          <div className="flex justify-between"><dt className="text-[var(--color-muted)]">{remaining.label}</dt><dd className="font-medium text-[var(--color-text)]">{remaining.value}</dd></div>
        ) : null}
      </dl>

      <div className="mt-10">
        {account.hasBilling ? (
          <button
            type="button"
            onClick={openBilling}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg)]"
          >
            Manage billing
          </button>
        ) : (
          <p className="text-sm text-[var(--color-muted)]">No invoices yet. <a className="underline" href="/pricing">See pricing</a></p>
        )}
        {billingError ? <p role="alert" className="mt-2 text-sm text-red-600">{billingError}</p> : null}
      </div>

      <button
        type="button"
        onClick={() => { logout(); window.location.assign('/'); }}
        className="mt-10 text-sm text-[var(--color-muted)] underline hover:text-[var(--color-text)]"
      >
        Log out
      </button>
    </main>
  );
}
