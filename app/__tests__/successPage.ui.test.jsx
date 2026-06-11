import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';

import SuccessPage from '../success/page.jsx';

function setupLocation(search) {
  Object.defineProperty(window, 'location', {
    writable: true,
    configurable: true,
    value: {
      href: `https://www.fitforpdf.com/success${search}`,
      search,
    },
  });
}

function makeResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function mockFetch(handler) {
  const calls = [];
  const original = global.fetch;
  global.fetch = vi.fn((url, options = {}) => {
    calls.push({ url: String(url), options });
    return Promise.resolve(handler({ url: String(url), options }));
  });
  return {
    calls,
    restore: () => {
      global.fetch = original;
    },
  };
}

// Matchers target apostrophe-free fragments of the redesigned /success copy
// (ink-on-paper restyle, human messages, /app-first CTAs). One unique fragment
// per resolved view so each state stays unambiguous.
const READY_MESSAGE = /Your exports are unlocked/;
const PROVISIONING_MESSAGE = /unlocking your exports/;
const IDENTITY_MISMATCH_MESSAGE = /finalizing your access/;
const MISSING_SESSION_MESSAGE = /find that checkout/;
const FAILED_MESSAGE = /card was declined/;
const CANCELED_MESSAGE = /Checkout cancelled/;

beforeEach(() => {
  if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: () => ({
        matches: false,
        addEventListener: () => {},
        removeEventListener: () => {},
      }),
    });
  }
  Object.defineProperty(window, 'posthog', {
    writable: true,
    configurable: true,
    value: { capture: vi.fn() },
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('success page', () => {
  test('waits for explicit entitlement provisioning before showing ready', async () => {
    const fetchMock = mockFetch(({ url }) => {
      expect(url.includes('/api/checkout/status')).toBe(true);
      return makeResponse(200, {
        status: 'complete',
        paymentStatus: 'paid',
        provisioning: {
          entitlementProvisioned: true,
        },
      });
    });

    setupLocation('?session_id=cs_test_123');
    render(<SuccessPage />);

    await waitFor(() => {
      expect(screen.getByText(READY_MESSAGE)).toBeTruthy();
    });
    expect(window.posthog.capture).toHaveBeenCalledTimes(1);
    expect(window.posthog.capture).toHaveBeenCalledWith('payment_completed', {
      plan: 'credits',
      pack: null,
    });

    expect(fetchMock.calls.length).toBeGreaterThan(0);
    const headers = fetchMock.calls[0].options.headers || {};
    expect(headers['X-Request-Id']).toContain('success-');
    expect(headers['X-Trace-Id']).toBe(headers['X-Request-Id']);

    fetchMock.restore();
  });

  test('does not mark ready when entitlement is not yet provisioned', async () => {
    const fetchMock = mockFetch(({ url }) => {
      expect(url.includes('/api/checkout/status')).toBe(true);
      return makeResponse(200, {
        status: 'complete',
        paymentStatus: 'paid',
        provisioning: {
          entitlementProvisioned: false,
        },
      });
    });

    setupLocation('?session_id=cs_test_124');
    render(<SuccessPage />);

    await waitFor(() => {
      expect(screen.getByText(PROVISIONING_MESSAGE)).toBeTruthy();
    });
    expect(screen.queryByText(READY_MESSAGE)).toBeNull();

    fetchMock.restore();
  });

  test('supports snake_case payment_status and session_status fields', async () => {
    const fetchMock = mockFetch(() => {
      expect(window.location.search.includes('session_id=cs_test_case')).toBe(true);
      return makeResponse(200, {
        session_status: 'complete',
        payment_status: 'paid',
        provisioning: {
          entitlementProvisioned: true,
        },
      });
    });

    setupLocation('?session_id=cs_test_case');
    render(<SuccessPage />);

    await waitFor(() => {
      expect(screen.getByText(READY_MESSAGE)).toBeTruthy();
    });

    expect(window.posthog.capture).toHaveBeenCalledTimes(1);
    fetchMock.restore();
  });

  test('marks payment as failed when checkout is complete but unpaid', async () => {
    const fetchMock = mockFetch(() => {
      return makeResponse(200, {
        status: 'complete',
        paymentStatus: 'unpaid',
        provisioning: { entitlementProvisioned: false },
      });
    });

    setupLocation('?session_id=cs_test_failed');
    render(<SuccessPage />);

    await waitFor(() => {
      expect(screen.getByText(FAILED_MESSAGE)).toBeTruthy();
    });

    expect(fetchMock.calls.length).toBe(1);
    fetchMock.restore();
  });

  test('marks payment as failed when checkout is complete but failed', async () => {
    const fetchMock = mockFetch(() => {
      return makeResponse(200, {
        status: 'complete',
        paymentStatus: 'failed',
        provisioning: { entitlementProvisioned: false },
      });
    });

    setupLocation('?session_id=cs_test_failed_status');
    render(<SuccessPage />);

    await waitFor(() => {
      expect(screen.getByText(FAILED_MESSAGE)).toBeTruthy();
    });

    expect(fetchMock.calls.length).toBe(1);
    fetchMock.restore();
  });

  test('does not emit payment_completed event when payment fails', async () => {
    const fetchMock = mockFetch(() => {
      return makeResponse(200, {
        status: 'complete',
        paymentStatus: 'unpaid',
      });
    });

    setupLocation('?session_id=cs_test_failed_event');
    render(<SuccessPage />);

    await waitFor(() => {
      expect(screen.getByText(FAILED_MESSAGE)).toBeTruthy();
    });

    expect(window.posthog.capture).toHaveBeenCalledTimes(0);
    expect(fetchMock.calls.length).toBe(1);
    fetchMock.restore();
  });

  test('marks checkout canceled when status is expired', async () => {
    const fetchMock = mockFetch(() => {
      return makeResponse(200, {
        status: 'expired',
        paymentStatus: 'unpaid',
      });
    });

    setupLocation('?session_id=cs_test_canceled');
    render(<SuccessPage />);

    await waitFor(() => {
      expect(screen.getByText(CANCELED_MESSAGE)).toBeTruthy();
    });

    expect(fetchMock.calls.length).toBe(1);
    fetchMock.restore();
  });

  test('shows explicit error when session id is missing', async () => {
    setupLocation('');
    const fetchMock = mockFetch(() => makeResponse(200, {}));

    render(<SuccessPage />);

    expect(screen.getByText(MISSING_SESSION_MESSAGE)).toBeTruthy();
    expect(fetchMock.calls.length).toBe(0);
    expect(window.posthog.capture).toHaveBeenCalledTimes(0);

    fetchMock.restore();
  });

  test('shows explicit paid-without-identity mismatch state', async () => {
    const fetchMock = mockFetch(() => {
      return makeResponse(200, {
        status: 'complete',
        paymentStatus: 'paid',
        provisioning: {
          expectedPlan: 'pro',
          entitlementProvisioned: null,
          entitlementMismatch: 'missing_identity_for_provisioning_check',
          state: 'payment_received_provisioning_unknown',
          accessReady: false,
        },
      });
    });

    setupLocation('?session_id=cs_test_missing_identity');
    render(<SuccessPage />);

    await waitFor(() => {
      expect(screen.getByText(IDENTITY_MISMATCH_MESSAGE)).toBeTruthy();
    });

    expect(fetchMock.calls.length).toBe(1);
    expect(window.posthog.capture).toHaveBeenCalledTimes(0);
    fetchMock.restore();
  });
});
