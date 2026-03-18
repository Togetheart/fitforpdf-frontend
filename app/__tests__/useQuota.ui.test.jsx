import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, test, vi } from 'vitest';
import React from 'react';

import useQuota from '../hooks/useQuota.mjs';

function createQuotaPayload() {
  return new Response(JSON.stringify({
    plan_type: 'free',
    free_exports_left: 3,
    free: {
      remaining: 3,
      limit: 3,
    },
  }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

function mockFetch() {
  const calls = [];
  const originalFetch = global.fetch;
  global.fetch = vi.fn((url, options = {}) => {
    calls.push({ url: String(url), options });
    return Promise.resolve(createQuotaPayload());
  });

  return {
    calls,
    restore: () => {
      global.fetch = originalFetch;
    },
  };
}

function UseQuotaProbe() {
  const quota = useQuota();
  return <div data-testid="plan-type">{quota.planType}</div>;
}

function setVisibilityState(value) {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    value,
    writable: true,
  });
}

let originalVisibility;

beforeEach(() => {
  originalVisibility = Object.getOwnPropertyDescriptor(document, 'visibilityState');
});

afterEach(() => {
  if (originalVisibility) {
    Object.defineProperty(document, 'visibilityState', originalVisibility);
  } else {
    // eslint-disable-next-line no-prototype-builtins
    delete document.visibilityState;
  }
  cleanup();
  vi.restoreAllMocks();
});

describe('useQuota sync behavior', () => {
  test('re-syncs quota when window regains focus', async () => {
    const mock = mockFetch();
    render(<UseQuotaProbe />);

    await waitFor(() => {
      expect(mock.calls.length).toBeGreaterThan(0);
    });
    expect(mock.calls).toHaveLength(1);

    window.dispatchEvent(new Event('focus'));

    await waitFor(() => {
      expect(mock.calls.length).toBe(2);
    });

    mock.restore();
  });

  test('re-syncs quota when tab becomes visible', async () => {
    const mock = mockFetch();
    render(<UseQuotaProbe />);

    await waitFor(() => {
      expect(mock.calls.length).toBeGreaterThan(0);
    });
    expect(mock.calls).toHaveLength(1);

    setVisibilityState('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    expect(mock.calls).toHaveLength(1);

    setVisibilityState('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    await waitFor(() => {
      expect(mock.calls.length).toBe(2);
    });

    mock.restore();
  });
});
