'use client';

import React, { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await fetch('/api/auth/request-link', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
    } catch {
      /* ignore — neutral UX regardless */
    }
    setSent(true);
    setSubmitting(false);
  }

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-black tracking-tight text-[var(--color-text)]">Log in</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        No password needed. Enter your email and we&apos;ll send you a sign-in link.
      </p>

      {sent ? (
        <div data-testid="login-sent" className="mt-8 rounded-xl border border-[var(--color-border)] p-5 text-sm text-[var(--color-text)]">
          <p className="font-semibold">Check your email</p>
          <p className="mt-1 text-[var(--color-muted)]">
            If an account exists for <strong>{email}</strong>, a sign-in link is on its way. It expires in 15 minutes.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3">
          <label htmlFor="login-email" className="text-sm font-medium text-[var(--color-text)]">Email</label>
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--accent)]"
          />
          <button
            type="submit"
            disabled={submitting}
            className="mt-1 inline-flex h-11 items-center justify-center rounded-lg bg-[var(--color-text)] px-4 text-sm font-semibold text-[var(--color-bg)] transition hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? 'Sending…' : 'Send the link'}
          </button>
        </form>
      )}

      <p className="mt-6 text-xs text-[var(--color-muted)]">
        You can also continue without an account, guest mode stays available.
      </p>
    </main>
  );
}
