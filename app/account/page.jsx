'use client';

import React, { useEffect, useState } from 'react';
import useSession from '../hooks/useSession.mjs';

export default function AccountPage() {
  const { account, quota, loading, logout } = useSession();
  const [billingError, setBillingError] = useState('');
  const [retainedItems, setRetainedItems] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [contactsTotal, setContactsTotal] = useState(0);

  useEffect(() => {
    if (!loading && !account) window.location.assign('/login');
  }, [loading, account]);

  useEffect(() => {
    if (!account) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/account/retained-sources', { method: 'GET', credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setRetainedItems(Array.isArray(data && data.items) ? data.items : []);
      } catch {
        /* ignore — leave list empty */
      }
    })();
    return () => { cancelled = true; };
  }, [account]);

  async function deleteRetained(id) {
    try {
      await fetch('/api/account/retained-sources/' + id, { method: 'DELETE', credentials: 'include' });
      setRetainedItems((prev) => prev.filter((it) => it.id !== id));
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    if (!account) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/account/contacts', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setContacts(Array.isArray(data && data.items) ? data.items : []);
          setContactsTotal((data && data.total) || 0);
        }
      } catch {
        /* ignore — leave list empty */
      }
    })();
    return () => { cancelled = true; };
  }, [account]);

  async function deleteContact(id) {
    try {
      await fetch('/api/account/contacts/' + id, { method: 'DELETE', credentials: 'include' });
      setContacts((c) => c.filter((x) => x.id !== id));
      setContactsTotal((t) => Math.max(0, t - 1));
    } catch {
      /* ignore */
    }
  }

  async function clearContacts() {
    try {
      await fetch('/api/account/contacts', { method: 'DELETE', credentials: 'include' });
      setContacts([]);
      setContactsTotal(0);
    } catch {
      /* ignore */
    }
  }

  function formatExpiry(value) {
    if (!value) return null;
    try {
      return new Date(value).toLocaleDateString('fr-FR');
    } catch {
      return null;
    }
  }

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

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">Your stored files</h2>
        {retainedItems.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--color-muted)]">No stored files.</p>
        ) : (
          <ul className="mt-3 space-y-3 text-sm">
            {retainedItems.map((item) => {
              const expiry = formatExpiry(item.expires_at);
              return (
                <li key={item.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[var(--color-text)]">{item.original_name}</p>
                    {expiry ? (
                      <p className="text-xs text-[var(--color-muted)]">expires {expiry}</p>
                    ) : (
                      <p className="text-xs text-[var(--color-muted)]">Kept until deleted</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <a
                      className="underline text-[var(--color-text)] hover:text-[var(--color-muted)]"
                      href={'/api/account/retained-sources/' + item.id}
                    >
                      Download
                    </a>
                    <button
                      type="button"
                      data-testid={'retained-delete-' + item.id}
                      onClick={() => deleteRetained(item.id)}
                      className="text-[var(--color-muted)] underline hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">My contacts ({contactsTotal})</h2>
        {contactsTotal === 0 ? (
          <p className="mt-3 text-sm text-[var(--color-muted)]">No contacts.</p>
        ) : (
          <>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[var(--color-muted)]">
                    <th className="py-1 pr-3 font-medium">Name</th>
                    <th className="py-1 pr-3 font-medium">Email</th>
                    <th className="py-1 pr-3 font-medium">Phone</th>
                    <th className="py-1 pr-3 font-medium">Company</th>
                    <th className="py-1 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c) => (
                    <tr key={c.id} data-testid={'contact-row-' + c.id} className="border-t border-[var(--color-border)]">
                      <td className="py-1 pr-3 text-[var(--color-text)]">{c.name || '—'}</td>
                      <td className="py-1 pr-3 text-[var(--color-text)]">{c.email || '—'}</td>
                      <td className="py-1 pr-3 text-[var(--color-text)]">{c.phone || '—'}</td>
                      <td className="py-1 pr-3 text-[var(--color-text)]">{c.company || '—'}</td>
                      <td className="py-1">
                        <button
                          type="button"
                          data-testid={'contact-delete-' + c.id}
                          onClick={() => deleteContact(c.id)}
                          className="text-[var(--color-muted)] underline hover:text-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {contactsTotal > contacts.length ? (
              <p className="mt-2 text-xs text-[var(--color-muted)]">Showing the first {contacts.length} of {contactsTotal} — export to get them all.</p>
            ) : null}
            <div className="mt-3 flex items-center gap-3 text-sm">
              <a
                className="underline text-[var(--color-text)] hover:text-[var(--color-muted)]"
                href="/api/account/contacts/export"
                data-testid="contacts-export"
              >
                Export CSV
              </a>
              <button
                type="button"
                data-testid="contacts-clear"
                onClick={clearContacts}
                className="text-[var(--color-muted)] underline hover:text-red-600"
              >
                Delete all
              </button>
            </div>
          </>
        )}
      </section>

      <div className="mt-8">
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
