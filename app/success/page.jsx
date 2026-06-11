'use client';

import { useEffect, useState } from 'react';
import Button from '../components/ui/Button';
import { trackPaymentCompleted } from '../lib/analytics.mjs';

const POLL_INTERVAL_MS = 2500;
const MAX_POLLING_ATTEMPTS = 18;

// Human-facing copy per resolved state. No backend vocabulary, no raw status
// strings, and the primary next action always points back into the product
// (the workbench restores the user's last job), never the marketing home.
const VIEWS = {
  processing: {
    tone: 'progress',
    title: 'Finishing up…',
    body: 'Your payment went through — we’re unlocking your exports now. This usually takes a few seconds.',
    cta: null,
  },
  ready: {
    tone: 'success',
    title: 'You’re all set',
    body: 'Your exports are unlocked. Head back to pick up exactly where you left off.',
    cta: { href: '/app', label: 'Back to your document' },
  },
  delayed: {
    tone: 'progress',
    title: 'Payment received',
    body: 'We’re finishing setting up your access — this can take a minute. You can head back to the app; your credits will appear there shortly.',
    cta: { href: '/app', label: 'Back to the app' },
  },
  identity: {
    tone: 'progress',
    title: 'Payment received',
    body: 'We’re finalizing your access. If it hasn’t shown up in a couple of minutes, email support@fitforpdf.com and we’ll sort it right away.',
    cta: { href: '/app', label: 'Back to the app' },
  },
  failed: {
    tone: 'error',
    title: 'That payment didn’t go through',
    body: 'Your card was declined and you weren’t charged. You can try again from the pricing page.',
    cta: { href: '/pricing', label: 'Back to pricing' },
  },
  canceled: {
    tone: 'error',
    title: 'Checkout cancelled',
    body: 'No worries — nothing was charged. Your work is still waiting for you in the app.',
    cta: { href: '/app', label: 'Back to your document' },
  },
  missing: {
    tone: 'error',
    title: 'We couldn’t find that checkout',
    body: 'This page needs a valid checkout session. If you just paid and landed here, email support@fitforpdf.com.',
    cta: { href: '/app', label: 'Back to the app' },
  },
};

function buildRequestId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `success-${crypto.randomUUID()}`;
  }
  return `success-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeString(value) {
  return String(value || '').trim().toLowerCase();
}

export default function SuccessPage() {
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const params = new URLSearchParams(window.location.search);
    const checkoutSessionId = params.get('session_id');
    const requestId = buildRequestId();
    const plan = params.get('plan') || 'credits';
    const pack = params.get('pack') || null;

    let attempts = 0;
    let cancelled = false;
    let timeoutId;

    if (!checkoutSessionId) {
      setStatus('missing');
      return () => { cancelled = true; };
    }

    async function refreshCheckoutStatus() {
      try {
        const response = await fetch(
          `/api/checkout/status?session_id=${encodeURIComponent(checkoutSessionId)}`,
          { headers: { 'X-Request-Id': requestId, 'X-Trace-Id': requestId } },
        );
        if (!response.ok) return { payload: null };
        const payload = await response.json().catch(() => null);
        if (!payload || typeof payload !== 'object') return { payload: null };
        return {
          payload,
          status: normalizeString(payload.status ?? payload.sessionStatus ?? payload.session_status),
          paymentStatus: normalizeString(
            payload.paymentStatus ?? payload.payment_status ?? payload.paymentState ?? payload.payment_state,
          ),
        };
      } catch {
        return { payload: null };
      }
    }

    function scheduleRetry() {
      attempts += 1;
      if (attempts > MAX_POLLING_ATTEMPTS) {
        setStatus('delayed');
        return;
      }
      setStatus('processing');
      timeoutId = setTimeout(() => { void pollProvisioning(); }, POLL_INTERVAL_MS);
    }

    async function pollProvisioning() {
      if (cancelled) return;
      const checkout = await refreshCheckoutStatus();
      if (!checkout.payload) {
        scheduleRetry();
        return;
      }

      const provisioning = checkout.payload?.provisioning;
      const isPaid = checkout.paymentStatus === 'paid' || checkout.paymentStatus === 'succeeded';
      const isComplete = checkout.status === 'complete';
      const isCanceled = checkout.status === 'expired' || checkout.status === 'canceled';
      const isDeclined = isComplete && !isPaid;

      if (isCanceled) { setStatus('canceled'); return; }
      if (isDeclined) { setStatus('failed'); return; }

      if (
        isPaid && isComplete && provisioning
        && provisioning.entitlementMismatch === 'missing_identity_for_provisioning_check'
      ) {
        setStatus('identity');
        return;
      }

      if (isPaid && isComplete && provisioning?.entitlementProvisioned === true) {
        setStatus('ready');
        trackPaymentCompleted({ plan, pack });
        return;
      }

      scheduleRetry();
    }

    void pollProvisioning();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const view = VIEWS[status] || VIEWS.processing;

  return (
    <main className="bg-paper flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <a href="/" className="mb-10 inline-flex items-center" aria-label="FitForPDF home">
        <img
          src="/fitforpdf@2x.webp"
          alt="fitforpdf"
          width={2990}
          height={790}
          className="dark-invert h-7 w-auto object-contain"
        />
      </a>

      <section className="w-full max-w-md rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] p-8 text-center shadow-sm">
        <StatusMark tone={view.tone} />
        <h1 className="mt-5 text-xl font-semibold tracking-tight text-[var(--color-text)]">
          {view.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{view.body}</p>
        {view.cta ? (
          <Button variant="primary" href={view.cta.href} className="mt-6 w-full">
            {view.cta.label}
          </Button>
        ) : null}
      </section>
    </main>
  );
}

function StatusMark({ tone }) {
  if (tone === 'progress') {
    return (
      <span
        className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-line)] border-t-[var(--color-text)]"
        role="status"
        aria-label="Processing"
      />
    );
  }
  const isSuccess = tone === 'success';
  return (
    <span
      className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full ${
        isSuccess ? 'bg-cta/10 text-cta' : 'bg-[var(--color-surface-sunken)] text-[var(--color-muted)]'
      }`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
        {isSuccess ? (
          <path d="M5 10.5l3.2 3.2L15 7" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M10 6v5M10 14h.01" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </span>
  );
}
