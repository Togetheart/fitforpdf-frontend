/**
 * TDD — checkout concurrency hardening:
 * - a second checkout call while one is in-flight is rejected immediately;
 * - retries after settlement are allowed.
 */

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';

import { useCheckout } from '../hooks/useCheckout.mjs';

function makeCheckoutResponse(status, body) {
  return {
    status,
    ok: status >= 200 && status < 300,
    async json() {
      return body;
    },
  };
}

function createDeferredResponse() {
  let resolve;
  const promise = new Promise((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

function CheckoutButtonHarness() {
  const checkout = useCheckout();
  const [lastResult, setLastResult] = React.useState('');

  const onCheckout = async () => {
    const result = await checkout.openCheckout('credits_10');
    setLastResult(result?.ok ? 'ok' : (result?.error || 'error'));
  };

  return (
    <div>
      <button type="button" onClick={onCheckout}>Checkout</button>
      <span data-testid="checkout-loading">{String(checkout.isLoading)}</span>
      <span data-testid="checkout-error">{checkout.error || ''}</span>
      <span data-testid="checkout-result">{lastResult}</span>
    </div>
  );
}

const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = originalFetch;
  Object.defineProperty(window, 'location', {
    writable: true,
    configurable: true,
    value: {
      assign: vi.fn(),
      href: 'http://localhost/',
      search: '',
    },
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  global.fetch = originalFetch;
});

describe('useCheckout concurrency', () => {
  test('blocks concurrent openCheckout requests while in-flight', async () => {
    const deferred = createDeferredResponse();
    global.fetch = vi.fn(() => deferred.promise);

    render(<CheckoutButtonHarness />);
    fireEvent.click(screen.getByRole('button', { name: 'Checkout' }));
    fireEvent.click(screen.getByRole('button', { name: 'Checkout' }));

    expect(global.fetch).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.getByTestId('checkout-error').textContent).toContain('Checkout request already in progress.');
      expect(screen.getByTestId('checkout-loading').textContent).toBe('true');
    });

    deferred.resolve(makeCheckoutResponse(200, { url: 'https://checkout.stripe.com/c/pay/ok' }));
    await waitFor(() => {
      expect(screen.getByTestId('checkout-loading').textContent).toBe('false');
      expect(screen.getByTestId('checkout-result').textContent).toBe('ok');
      expect(window.location.assign).toHaveBeenCalledWith('https://checkout.stripe.com/c/pay/ok');
    });
  });

  test('allows a new checkout request after the prior request settles', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(makeCheckoutResponse(200, { url: 'https://checkout.stripe.com/c/pay/first' }))
      .mockResolvedValueOnce(makeCheckoutResponse(200, { url: 'https://checkout.stripe.com/c/pay/second' }));

    render(<CheckoutButtonHarness />);

    fireEvent.click(screen.getByRole('button', { name: 'Checkout' }));
    await waitFor(() => expect(screen.getByTestId('checkout-loading').textContent).toBe('false'));
    expect(screen.getByTestId('checkout-result').textContent).toBe('ok');

    fireEvent.click(screen.getByRole('button', { name: 'Checkout' }));
    await waitFor(() => expect(screen.getByTestId('checkout-result').textContent).toBe('ok'));

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(window.location.assign).toHaveBeenCalledTimes(2);
  });
});
