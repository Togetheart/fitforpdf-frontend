import { useRef, useState } from 'react';
import { trackPaymentStarted } from '../lib/analytics.mjs';

/**
 * Shared checkout hook — use from any page to open a Stripe checkout session.
 * Extracted from useConversion so it can be used outside the home upload flow.
 */
export function useCheckout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const pendingRef = useRef(false);
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
    // Surface-aware cancel: send a bailing buyer back where they were — the
    // workbench keeps their preview, /pricing keeps the grid — instead of the
    // marketing home. Callers pass details.cancelPath; default stays '/'.
    const cancelPath = typeof details.cancelPath === 'string' && details.cancelPath.startsWith('/')
      ? details.cancelPath
      : '/';
    return {
      success_url: frontendOrigin ? `${frontendOrigin}/success?${params.toString()}` : undefined,
      cancel_url: frontendOrigin ? `${frontendOrigin}${cancelPath}?checkout=cancelled` : undefined,
    };
  }

  async function _post(url, payload = {}) {
    if (pendingRef.current) {
      const msg = 'Checkout request already in progress.';
      setError(msg);
      return { ok: false, error: msg };
    }

    pendingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
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
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Checkout request failed.';
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      pendingRef.current = false;
      setIsLoading(false);
    }
  }

  async function openCreditsPack(pack, options = {}) {
    if (!pack) return { ok: false, error: null };
    trackPaymentStarted({ plan: 'credits', pack });
    const returnUrls = buildReturnUrls('credits', { pack, cancelPath: options.cancelPath });
    const idem = options?.idempotencyKey;
    return _post('/api/credits/purchase/checkout', {
      pack,
      ...returnUrls,
      ...(idem ? { idempotencyKey: idem } : {}),
    });
  }

  /** For credits_100 / credits_500 packs (pricing page Starter & Pro) */
  async function openCheckout(pack, options = {}) {
    if (!pack) return { ok: false, error: null };
    const returnUrls = buildReturnUrls('credits', { pack, cancelPath: options.cancelPath });
    const idem = options?.idempotencyKey;
    return _post('/api/checkout', {
      pack,
      ...returnUrls,
      ...(idem ? { idempotencyKey: idem } : {}),
    });
  }

  async function openProCheckout(billing = 'monthly', options = {}) {
    trackPaymentStarted({ plan: 'pro', pack: billing });
    const returnUrls = buildReturnUrls('pro', { billing, cancelPath: options.cancelPath });
    const idem = options?.idempotencyKey;
    return _post('/api/plan/pro/checkout', {
      billing,
      ...returnUrls,
      ...(idem ? { idempotencyKey: idem } : {}),
    });
  }

  return { openCreditsPack, openCheckout, openProCheckout, isLoading, error };
}
