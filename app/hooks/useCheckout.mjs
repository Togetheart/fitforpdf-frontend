import { useState } from 'react';

/**
 * Shared checkout hook — use from any page to open a Stripe checkout session.
 * Extracted from useConversion so it can be used outside the home upload flow.
 */
export function useCheckout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
    setIsLoading(true);
    setError(null);
    try {
      return await _post('/api/credits/purchase/checkout', { pack });
    } finally {
      setIsLoading(false);
    }
  }

  async function openProCheckout() {
    setIsLoading(true);
    setError(null);
    try {
      return await _post('/api/plan/pro/checkout', {});
    } finally {
      setIsLoading(false);
    }
  }

  return { openCreditsPack, openProCheckout, isLoading, error };
}
