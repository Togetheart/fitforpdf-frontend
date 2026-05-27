'use client';

import React, { useEffect, useRef, useState } from 'react';
import { trackLeadModalShown, trackLeadCaptured, trackLeadSkipped } from '../lib/analytics.mjs';

const SUPPRESSION_KEY = 'fitforpdf_lead_modal_suppressed_until';
const SUPPRESSION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Soft email capture modal — shown ONCE after the first successful render
 * of a session, unless the user has dismissed it within the last 30 days.
 *
 * Why this exists:
 *   PostHog cohort retention is at ~0.5% returning visitors / 2.6% week-1.
 *   Once a visitor closes the tab, we lose them — there's no way to follow
 *   up. Capturing an email at the high-intent moment (just got a successful
 *   PDF) gives us a J+1/J+7 retention loop opportunity.
 *
 * Soft gate design:
 *   - Skip is always available (no dark patterns).
 *   - We frame the ask as a benefit ("send your future renders") not a tax.
 *   - Suppression: 30 days post submit OR dismiss → no spam.
 *   - Backend POST stub /api/leads — actual storage + cron J+1/J+7 to come.
 */

function safeStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getSuppressedUntil() {
  const storage = safeStorage();
  if (!storage) return 0;
  try {
    const raw = storage.getItem(SUPPRESSION_KEY);
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

function setSuppressedUntil(ms) {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.setItem(SUPPRESSION_KEY, String(ms));
  } catch {
    // ignore quota/private-mode errors
  }
}

/**
 * @param {object} props
 * @param {boolean} props.trigger — set true after a render success to attempt to open the modal
 * @param {string|null} props.renderId — optional render correlation id
 * @param {string} [props.source='render_success'] — analytic surface tag
 * @param {number} [props.openDelayMs=1200] — delay before showing modal (so user sees success state first). 0 in tests.
 */
export default function LeadCaptureModal({
  trigger,
  renderId = null,
  source = 'render_success',
  openDelayMs = 1200,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const hasBeenShownRef = useRef(false);
  const inputRef = useRef(null);

  // Open the modal once per session, only if not suppressed
  useEffect(() => {
    if (!trigger) return;
    if (hasBeenShownRef.current) return;
    if (typeof window === 'undefined') return;

    if (getSuppressedUntil() > Date.now()) return; // user already dismissed in last 30d

    hasBeenShownRef.current = true;
    // small delay so user sees the success state for a beat before the modal appears
    const timer = window.setTimeout(() => {
      setIsOpen(true);
      trackLeadModalShown({ source, renderId });
    }, openDelayMs);
    return () => window.clearTimeout(timer);
  }, [trigger, source, renderId, openDelayMs]);

  // Autofocus the email input when opening
  useEffect(() => {
    if (!isOpen) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [isOpen]);

  // ESC to dismiss
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e) {
      if (e.key === 'Escape') handleSkip();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function close() {
    setIsOpen(false);
  }

  function handleSkip() {
    setSuppressedUntil(Date.now() + SUPPRESSION_MS);
    trackLeadSkipped({ source, renderId });
    close();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (status === 'submitting') return;

    const trimmed = email.trim();
    if (!isLikelyEmail(trimmed)) {
      setErrorMsg('Please enter a valid email address.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: trimmed, source, renderId }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = body?.error?.message || body?.message || 'Something went wrong. Please try again.';
        setErrorMsg(msg);
        setStatus('error');
        return;
      }

      // Success: suppress modal for 30d and show a brief thank-you
      setSuppressedUntil(Date.now() + SUPPRESSION_MS);
      trackLeadCaptured({ source, renderId });
      setStatus('success');
      // auto-close after a short beat so the user can keep using the app
      window.setTimeout(close, 1800);
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  }

  if (!isOpen) return null;

  return (
    <div
      data-testid="lead-capture-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-capture-title"
      className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/35 backdrop-blur-sm sm:items-center"
      onClick={handleSkip}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-2xl bg-[var(--color-bg)] p-6 shadow-2xl sm:rounded-2xl sm:p-7"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-600">
              PDF ready ✓
            </p>
            <h2
              id="lead-capture-title"
              className="mt-2 text-lg font-bold leading-snug text-[var(--color-text)]"
            >
              Want us to send your next renders by email?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              Drop your email and we&apos;ll deliver your future PDFs straight to
              your inbox. No spam, no account, unsubscribe anytime.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSkip}
            aria-label="Skip"
            data-testid="lead-capture-skip"
            className="ml-3 -mt-1 -mr-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[var(--color-muted)] transition hover:bg-[var(--color-bg-hero)] hover:text-[var(--color-text)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        {status === 'success' ? (
          <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-4 text-center text-sm text-emerald-800">
            ✓ Thanks — we&apos;ll keep in touch.
          </div>
        ) : (
          <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
            <label htmlFor="lead-capture-email" className="sr-only">
              Email address
            </label>
            <input
              id="lead-capture-email"
              ref={inputRef}
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === 'error') setStatus('idle');
              }}
              placeholder="you@company.com"
              data-testid="lead-capture-email"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-hero)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)]/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />

            {errorMsg ? (
              <p
                data-testid="lead-capture-error"
                role="alert"
                className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700"
              >
                {errorMsg}
              </p>
            ) : null}

            <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleSkip}
                data-testid="lead-capture-skip-cta"
                className="text-sm font-medium text-[var(--color-muted)] underline underline-offset-4 decoration-1 transition hover:text-[var(--color-text)]"
              >
                Skip
              </button>
              <button
                type="submit"
                disabled={status === 'submitting'}
                data-testid="lead-capture-submit"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 sm:h-10"
              >
                {status === 'submitting' ? 'Sending…' : 'Send me my next renders'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Basic email format check — kept minimal, real validation happens server-side.
function isLikelyEmail(value) {
  if (typeof value !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

// Exported for tests + manual suppression toggle.
export { getSuppressedUntil, setSuppressedUntil, SUPPRESSION_KEY, SUPPRESSION_MS };
