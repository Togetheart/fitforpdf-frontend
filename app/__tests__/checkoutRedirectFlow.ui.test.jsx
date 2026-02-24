/**
 * TDD — checkout happy path: when the API returns 200 + { url }, the browser
 * must redirect to the Stripe checkout URL via window.location.assign.
 *
 * Also covers post-payment quota state: a credits plan returned by /api/quota
 * must clear the paywall and show the correct badge.
 *
 * RED → GREEN: tests verify existing useCheckout.mjs behaviour that was
 * previously untested (all mocks in other tests return 501, never 200+URL).
 */

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';

import LandingPage from '../page.jsx';

// ── helpers ────────────────────────────────────────────────────────────────

function configureMatchMedia() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: () => ({
      matches: false,
      media: '',
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => {},
    }),
  });
}

function makeResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function mockFetch(handler) {
  const originalFetch = global.fetch;
  const calls = [];
  global.fetch = vi.fn((url, options = {}) => {
    calls.push({ url: String(url), options });
    return Promise.resolve(handler(String(url), options));
  });
  return {
    calls,
    restore: () => { global.fetch = originalFetch; },
  };
}

const STRIPE_CHECKOUT_URL = 'https://checkout.stripe.com/c/pay/session_test_abc123';

// ── setup ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  configureMatchMedia();

  // Replace window.location with a spy-friendly stub.
  // jsdom does not support real navigation; assign() would throw otherwise.
  Object.defineProperty(window, 'location', {
    writable: true,
    configurable: true,
    value: { assign: vi.fn(), href: 'http://localhost/', search: '' },
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// ── tests ──────────────────────────────────────────────────────────────────

describe('checkout redirect flow', () => {
  test('credits pack checkout redirects browser to Stripe URL on 200 success', async () => {
    const mock = mockFetch((url) => {
      if (url.includes('/api/quota')) {
        return makeResponse(200, { plan_type: 'free', free_exports_left: 1 });
      }
      if (url.includes('/api/credits/purchase/checkout')) {
        return makeResponse(200, { url: STRIPE_CHECKOUT_URL });
      }
      return makeResponse(500, { error: 'unexpected' });
    });

    render(<LandingPage />);

    // Wait for quota badge to load, then open the buy-credits panel
    await waitFor(() =>
      expect(screen.getByTestId('quota-pill').textContent).toContain('Free · 1 exports left'),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Buy credits' }));

    const panel = await screen.findByTestId('credits-purchase-panel');

    // Click the first pack button (1 export / $2.90)
    const packButtons = within(panel)
      .getAllByRole('button')
      .filter((btn) => /exports?/i.test(btn.textContent));
    expect(packButtons.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(packButtons[0]);

    await waitFor(() => {
      expect(window.location.assign).toHaveBeenCalledWith(STRIPE_CHECKOUT_URL);
    });

    mock.restore();
  });

  test('Go Pro checkout redirects browser to Stripe URL on 200 success', async () => {
    const mock = mockFetch((url) => {
      if (url.includes('/api/quota')) {
        return makeResponse(200, { plan_type: 'free', free_exports_left: 3 });
      }
      if (url.includes('/api/plan/pro/checkout')) {
        return makeResponse(200, { url: STRIPE_CHECKOUT_URL });
      }
      return makeResponse(500, { error: 'unexpected' });
    });

    render(<LandingPage />);
    await waitFor(() => expect(screen.getByTestId('quota-pill')).toBeTruthy());

    // Open Advanced options → click Branding title → upgrade nudge appears
    fireEvent.click(screen.getByRole('button', { name: 'Advanced options' }));
    const brandingRow = screen.getByTestId('setting-row-branding');
    fireEvent.click(within(brandingRow).getByText('Branding'));

    expect(screen.getByTestId('branding-upgrade-nudge')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Go Pro' }));

    await waitFor(() => {
      expect(window.location.assign).toHaveBeenCalledWith(STRIPE_CHECKOUT_URL);
    });

    mock.restore();
  });

  test('after payment, credits plan quota shows badge and no paywall', async () => {
    // Simulates the page load after a successful credits purchase:
    // the server now returns plan_type=credits with N exports left.
    const mock = mockFetch((url) => {
      if (url.includes('/api/quota')) {
        return makeResponse(200, { plan_type: 'credits', free_exports_left: 10 });
      }
      return makeResponse(500, { error: 'unexpected' });
    });

    render(<LandingPage />);

    await waitFor(() => {
      expect(screen.getByTestId('quota-pill').textContent).toMatch(/Credits\s*·\s*10\s*exports\s*left/i);
    });

    // No paywall shown
    expect(screen.queryByTestId('upload-paywall')).toBeNull();

    // Generate PDF button present (with file selected it would be enabled)
    expect(screen.getByRole('button', { name: 'Generate PDF' })).toBeTruthy();

    mock.restore();
  });
});
