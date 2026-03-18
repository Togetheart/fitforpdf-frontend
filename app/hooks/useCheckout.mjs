import { useState } from 'react';
import { trackPaymentStarted } from '../lib/analytics.mjs';

/**
 * Shared checkout hook — use from any page to open a Stripe checkout session.
 * Extracted from useConversion so it can be used outside the home upload flow.
 */
export function useCheckout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const frontendOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  function buildReturnUrls(plan, details = {}) {
    const params = new URLSearchParams();
    params.set('plan', plan || 'credits');
    params.set('expected_plan', plan || 'credits');
    params.set('session_id', '{CHECKOUT_SESSION_ID}');
    if (details.pack) {
      params.set('pack', details.pack);
    }
    if (details.billing) {
      params.set('billing', details.billing);
    }
    return {
      success_url: frontendOrigin ? `${frontendOrigin}/success?${params.toString()}` : undefined,
      cancel_url: frontendOrigin ? `${frontendOrigin}/?checkout=cancelled` : undefined,
    };
  }

  async function _post(url, payload = {}) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 501) {
      const msg = 'Payments coming soon. Contact us.';
      setError(msg);
      return { ok: false, error: msg };
    }
    if (!response.ok) {
      const msg = data?.error || 'Checkout request failed.';
      setError(msg);
      return { ok: false, error: msg };
    }
    const checkoutUrl = data?.url;
    if (typeof checkoutUrl === 'string' && checkoutUrl) {
      if (typeof window !== 'undefined') window.location.assign(checkoutUrl);
    }
    return { ok: true, error: null };
  }

  async function openCreditsPack(pack) {
    if (!pack) return { ok: false, error: null };
    trackPaymentStarted({ plan: 'credits', pack });
    const returnUrls = buildReturnUrls('credits', { pack });
    setIsLoading(true);
    setError(null);
    try {
      return await _post('/api/credits/purchase/checkout', { pack, ...returnUrls });
    } finally {
      setIsLoading(false);
    }
  }

  /** For credits_100 / credits_500 packs (pricing page Starter & Pro) */
  async function openCheckout(pack) {
    if (!pack) return { ok: false, error: null };
    const returnUrls = buildReturnUrls('credits', { pack });
    setIsLoading(true);
    setError(null);
    try {
      return await _post('/api/checkout', { pack, ...returnUrls });
    } finally {
      setIsLoading(false);
    }
  }

  async function openProCheckout(billing = 'monthly') {
    trackPaymentStarted({ plan: 'pro', pack: billing });
    const returnUrls = buildReturnUrls('pro', { billing });
    setIsLoading(true);
    setError(null);
    try {
      return await _post('/api/plan/pro/checkout', { billing, ...returnUrls });
    } finally {
      setIsLoading(false);
    }
  }

  return { openCreditsPack, openCheckout, openProCheckout, isLoading, error };
}
