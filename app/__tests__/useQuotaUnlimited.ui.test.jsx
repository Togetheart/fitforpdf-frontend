import { cleanup, render, screen, waitFor, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import React from 'react';

import useQuota from '../hooks/useQuota.mjs';

let originalFetch;
function mockQuota(raw) {
  originalFetch = global.fetch;
  global.fetch = vi.fn(async (url) => {
    if (String(url).includes('/api/quota')) {
      return new Response(JSON.stringify(raw), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } });
  });
}

afterEach(() => {
  cleanup();
  if (originalFetch) { global.fetch = originalFetch; originalFetch = undefined; }
  vi.restoreAllMocks();
});

function Harness() {
  const q = useQuota();
  return (
    <div>
      <div data-testid="unlimited">{String(q.isUnlimited)}</div>
      <div data-testid="locked">{String(q.isQuotaLocked)}</div>
      <div data-testid="plan">{q.planType}</div>
      <button type="button" onClick={() => q.applyQuotaExhaustion('free_quota_exhausted')}>exhaust</button>
    </div>
  );
}

describe('useQuota — an unlimited account is never paywalled', () => {
  test('applyQuotaExhaustion does NOT lock or downgrade an api_enterprise user (even on a stray 402)', async () => {
    // Backend says unlimited but free.remaining=0 (the always-computed field).
    mockQuota({ plan: 'api_enterprise', apiEnterprise: { unlimited: true }, free: { remaining: 0 } });
    render(<Harness />);
    await waitFor(() => expect(screen.getByTestId('unlimited').textContent).toBe('true'));
    expect(screen.getByTestId('locked').textContent).toBe('false');

    fireEvent.click(screen.getByText('exhaust')); // simulate a spurious render 402

    expect(screen.getByTestId('unlimited').textContent).toBe('true');
    expect(screen.getByTestId('locked').textContent).toBe('false');
    expect(screen.getByTestId('plan').textContent).toBe('api_enterprise');
  });

  test('applyQuotaExhaustion DOES lock a genuine free user (regression)', async () => {
    mockQuota({ plan: 'free', free: { remaining: 2 } });
    render(<Harness />);
    await waitFor(() => expect(screen.getByTestId('plan').textContent).toBe('free'));
    expect(screen.getByTestId('locked').textContent).toBe('false');

    fireEvent.click(screen.getByText('exhaust'));

    await waitFor(() => expect(screen.getByTestId('locked').textContent).toBe('true'));
  });
});
