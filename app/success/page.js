'use client';

import { useEffect } from 'react';
import { useState } from 'react';
import { trackPaymentCompleted } from '../lib/analytics.mjs';

const PROCESSING_MESSAGE = 'Processing payment';
const PROVISIONING_MESSAGE = 'Payment received, provisioning access';
const READY_MESSAGE = 'Payment received, entitlement ready';
const DELAYED_MESSAGE = 'Payment received, provisioning access';

function normalizeQuotaSnapshot(raw = {}) {
  return {
    plan: String(raw?.plan || raw?.planType || 'free'),
    freeRemaining: raw?.free?.remaining ?? null,
    creditsRemaining: raw?.credits?.remaining ?? null,
    proRemaining: raw?.pro?.remainingInPeriod ?? null,
    apiStarterRemaining: raw?.apiStarter?.remainingInPeriod ?? null,
    apiScaleRemaining: raw?.apiScale?.remainingInPeriod ?? null,
  };
}

function hasPlanStateChanged(before, after) {
  if (!before || !after) return false;
  if (after.plan !== before.plan) return true;
  if (before.creditsRemaining !== null && after.creditsRemaining !== null && after.creditsRemaining !== before.creditsRemaining) return true;
  if (before.proRemaining !== null && after.proRemaining !== null && after.proRemaining !== before.proRemaining) return true;
  if (before.apiStarterRemaining !== null && after.apiStarterRemaining !== null && after.apiStarterRemaining !== before.apiStarterRemaining) return true;
  if (before.apiScaleRemaining !== null && after.apiScaleRemaining !== null && after.apiScaleRemaining !== before.apiScaleRemaining) return true;
  if (before.freeRemaining !== null && after.freeRemaining !== null && after.freeRemaining !== before.freeRemaining) return true;
  return false;
}

export default function SuccessPage() {
  const [paymentState, setPaymentState] = useState(PROCESSING_MESSAGE);
  let timeoutId;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const plan = params.get('plan') || 'credits';
    const expectedPlan = params.get('expected_plan');
    const pack = params.get('pack') || null;
    const checkoutSessionId = params.get('session_id');
    trackPaymentCompleted({ plan, pack });
    setPaymentState(PROCESSING_MESSAGE);

    const maxAttempts = 18;
    let attempts = 0;
    let cancelled = false;
    let baseline = null;

    async function refreshCheckoutStatus() {
      if (!checkoutSessionId) return { confirmed: true, payload: null };
      try {
        const response = await fetch(
          `/api/checkout/status?session_id=${encodeURIComponent(checkoutSessionId)}`
        );
        if (!response.ok) return { confirmed: null, payload: null };
        const payload = await response.json().catch(() => null);
        if (!payload || typeof payload !== 'object') return { confirmed: null, payload: null };
        const paymentStatus = String(payload.paymentStatus || '').trim().toLowerCase();
        const status = String(payload.status || '').trim().toLowerCase();
        const confirmed = status === 'complete' && paymentStatus === 'paid';
        return { confirmed, payload };
      } catch {
        return { confirmed: null, payload: null };
      }
    }

    async function refreshQuota() {
      try {
        const response = await fetch('/api/quota', { method: 'GET' });
        if (!response.ok) return false;
        const raw = await response.json().catch(() => null);
        if (!raw) return false;
        const snapshot = normalizeQuotaSnapshot(raw);

        if (!baseline) {
          baseline = snapshot;
          if (expectedPlan && snapshot.plan === expectedPlan) {
            return true;
          }
          return false;
        }

        if (expectedPlan && snapshot.plan === expectedPlan) {
          if (snapshot.plan !== baseline.plan || hasPlanStateChanged(baseline, snapshot)) {
            return true;
          }
          return false;
        }

        return hasPlanStateChanged(baseline, snapshot);
      } catch (error) {
        return false;
      }
    }

    async function pollProvisioning() {
      if (cancelled) return;
      const checkout = await refreshCheckoutStatus();
      if (checkout.confirmed === false) {
        setPaymentState(PROVISIONING_MESSAGE);
        attempts += 1;
        if (attempts > maxAttempts) {
          setPaymentState(DELAYED_MESSAGE);
          return;
        }
        timeoutId = setTimeout(() => {
          void pollProvisioning();
        }, 2500);
        return;
      }
      const ready = await refreshQuota();
      if (cancelled) return;
      if (ready) {
        setPaymentState(READY_MESSAGE);
        return;
      }

      attempts += 1;
      if (attempts > maxAttempts) {
        setPaymentState(DELAYED_MESSAGE);
        return;
      }

      setPaymentState(PROVISIONING_MESSAGE);

      timeoutId = setTimeout(() => {
        void pollProvisioning();
      }, 2500);
    }

    void pollProvisioning();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <main
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
        <h1 style={{ marginTop: 0, color: '#c81e1e' }}>Payment received.</h1>
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
    </main>
  );
}
