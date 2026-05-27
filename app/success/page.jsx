'use client';

import { useEffect } from 'react';
import { useState } from 'react';
import { trackPaymentCompleted } from '../lib/analytics.mjs';

const PROCESSING_MESSAGE = 'Processing payment';
const PROVISIONING_MESSAGE = 'Payment received, provisioning access';
const READY_MESSAGE = 'Payment received, entitlement ready';
const DELAYED_MESSAGE = 'Payment received, provisioning delayed';
const IDENTITY_MISMATCH_MESSAGE = 'Payment received, provisioning blocked: missing checkout identity';
const FAILED_MESSAGE = 'Payment failed';
const CANCELED_MESSAGE = 'Checkout expired or canceled';
const MISSING_SESSION_MESSAGE = 'Checkout session id is required';
const POLL_INTERVAL_MS = 2500;
const MAX_POLLING_ATTEMPTS = 18;

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
  const [paymentState, setPaymentState] = useState(PROCESSING_MESSAGE);
  let timeoutId;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const checkoutSessionId = params.get('session_id');
    const requestId = buildRequestId();
    const plan = params.get('plan') || 'credits';
    const pack = params.get('pack') || null;
    setPaymentState(PROCESSING_MESSAGE);

    let attempts = 0;
    let cancelled = false;

    if (!checkoutSessionId) {
      setPaymentState(MISSING_SESSION_MESSAGE);
      return () => {
        cancelled = true;
      };
    }

    async function refreshCheckoutStatus() {
      try {
        const response = await fetch(
          `/api/checkout/status?session_id=${encodeURIComponent(checkoutSessionId)}`,
          {
            headers: {
              'X-Request-Id': requestId,
              'X-Trace-Id': requestId,
            },
          },
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

    async function pollProvisioning() {
      if (cancelled) return;
      const checkout = await refreshCheckoutStatus();
      if (!checkout.payload) {
        setPaymentState(PROVISIONING_MESSAGE);
        attempts += 1;
        if (attempts > MAX_POLLING_ATTEMPTS) {
          setPaymentState(DELAYED_MESSAGE);
          return;
        }
        timeoutId = setTimeout(() => {
          void pollProvisioning();
        }, POLL_INTERVAL_MS);
        return;
      }

      const provisioning = checkout.payload?.provisioning;
      const isPaid = checkout.paymentStatus === 'paid' || checkout.paymentStatus === 'succeeded';
      const isComplete = checkout.status === 'complete';
      const isCanceled = checkout.status === 'expired' || checkout.status === 'canceled';
      const isDeclined = isComplete && !isPaid;

      if (isCanceled) {
        setPaymentState(CANCELED_MESSAGE);
        return;
      }
      if (isDeclined) {
        setPaymentState(FAILED_MESSAGE);
        return;
      }

      if (
        isPaid
        && isComplete
        && provisioning
        && provisioning.entitlementMismatch === 'missing_identity_for_provisioning_check'
      ) {
        setPaymentState(IDENTITY_MISMATCH_MESSAGE);
        return;
      }

      if (isPaid && isComplete && provisioning?.entitlementProvisioned === true) {
        setPaymentState(READY_MESSAGE);
        trackPaymentCompleted({ plan, pack });
        return;
      } else if (provisioning && provisioning.entitlementProvisioned === false) {
        setPaymentState(PROVISIONING_MESSAGE);
        attempts += 1;
        if (attempts > MAX_POLLING_ATTEMPTS) {
          setPaymentState(DELAYED_MESSAGE);
          return;
        }
        timeoutId = setTimeout(() => {
          void pollProvisioning();
        }, POLL_INTERVAL_MS);
        return;
      }

      setPaymentState(PROVISIONING_MESSAGE);
      attempts += 1;
      if (attempts > MAX_POLLING_ATTEMPTS) {
        setPaymentState(DELAYED_MESSAGE);
        return;
      }
      timeoutId = setTimeout(() => {
        void pollProvisioning();
      }, POLL_INTERVAL_MS);
    }

    void pollProvisioning();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '2rem',
        display: 'grid',
        placeItems: 'center',
        background: '#fff',
        color: '#111827',
        fontFamily: '"Avenir Next", "Avenir", "Segoe UI", sans-serif',
      }}
    >
      <section style={{
        maxWidth: '28rem',
        textAlign: 'center',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '1.25rem',
      }}>
        <h1 style={{ marginTop: 0, color: '#c81e1e' }}>Checkout status</h1>
        <p style={{ margin: '0 0 1rem' }}>{paymentState}</p>
        <a
          href="/"
          style={{
            display: 'inline-block',
            color: '#c81e1e',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Return to fitforpdf
        </a>
      </section>
    </div>
  );
}
