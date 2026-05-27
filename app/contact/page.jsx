'use client';

import React, { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        const msg = data?.error?.message || 'Something went wrong. Please try again.';
        setErrorMsg(msg);
        setStatus('error');
        return;
      }

      setStatus('success');
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-hero)]">
      <div className="mx-auto max-w-[520px] px-4 py-20 sm:px-6">

        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-blue-600">
          Contact
        </p>
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-[var(--color-text)] sm:text-4xl">
          Get in touch
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--color-muted)]">
          Questions about pricing, API access, enterprise plans, or anything else?
          We typically respond within a few hours.
        </p>

        {status === 'success' ? (
          <div className="mt-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-6 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-6 w-6 text-emerald-700" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[var(--color-text)]">Message sent</h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              We&apos;ll get back to you at{' '}
              <strong className="font-semibold text-[var(--color-text)]">{form.email}</strong>{' '}
              as soon as possible.
            </p>
            <a
              href="/"
              className="mt-6 inline-block rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-6 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg-hero)]"
            >
              Back to fitforpdf
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-4">
            <div>
              <label htmlFor="contact-name" className="block text-xs font-semibold text-[var(--color-text)]">
                Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                minLength={2}
                value={form.name}
                onChange={handleChange}
                placeholder="Jane Smith"
                className="mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)]/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-xs font-semibold text-[var(--color-text)]">
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="jane@company.com"
                className="mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)]/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-xs font-semibold text-[var(--color-text)]">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                required
                minLength={10}
                value={form.message}
                onChange={handleChange}
                placeholder="How can we help?"
                className="mt-1.5 w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)]/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {errorMsg && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full rounded-full bg-cta px-6 py-3.5 text-sm font-semibold text-cta-text transition hover:bg-cta-hover active:scale-[0.98] disabled:opacity-50"
            >
              {status === 'submitting' ? 'Sending\u2026' : 'Send message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
