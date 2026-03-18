'use client';

import React, { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setStatus('submitting');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        setStatus('error');
        return;
      }

      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <p className="text-sm font-medium text-emerald-600">
        Thanks for subscribing! We&apos;ll keep you posted.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm items-center gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        required
        aria-label="Email for newsletter"
        className="flex-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-muted)] transition"
      />
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="shrink-0 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover active:scale-[0.98] disabled:opacity-50"
      >
        {status === 'submitting' ? 'Sending…' : 'Subscribe'}
      </button>
      {status === 'error' && (
        <p className="text-xs text-red-500">Try again</p>
      )}
    </form>
  );
}
