import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';

import useConversion from '../hooks/useConversion.mjs';

/**
 * The web app proxies the upload through Vercel, which hard-caps the request
 * body at ~4.5 MB. handleFileSelect must reject a source file over the
 * WEB_UPLOAD_MAX_BYTES (4 MB) threshold with a clear message instead of letting
 * it become the active file (which would later 413), and must fire a PostHog
 * event so we can measure how often this happens.
 */

function makeQuota() {
  return {
    isQuotaLocked: false,
    syncQuotaState: vi.fn(async () => ({ planType: 'free', freeExportsLeft: 9, remainingInPeriod: null })),
    applyQuotaExhaustion: vi.fn(), setPaywallReason: vi.fn(), setPurchaseMessage: vi.fn(),
    planType: 'free', freeExportsLeft: 9, remainingInPeriod: 0, freeExportsLimit: 3,
  };
}

function Harness({ onReady }) {
  const conversion = useConversion({ quota: makeQuota() });
  onReady(conversion);
  return <div data-testid="err">{conversion.error || ''}</div>;
}

function sizedFile(bytes, name = 'big.csv') {
  const f = new File(['x'], name, { type: 'text/csv' });
  Object.defineProperty(f, 'size', { value: bytes });
  return f;
}

let captureCalls;
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true, configurable: true,
    value: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
  });
  captureCalls = [];
  globalThis.window.posthog = { capture: (event, properties) => { captureCalls.push({ event, properties }); } };
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); delete globalThis.window.posthog; });

describe('client-side upload size guard', () => {
  test('a file over 4MB is rejected with an error, not accepted, and fires PostHog', () => {
    let conv;
    render(<Harness onReady={(c) => { conv = c; }} />);
    act(() => conv.handleFileSelect(sizedFile(9 * 1024 * 1024)));

    expect(conv.file).toBeFalsy(); // not accepted as the active file
    expect(screen.getByTestId('err').textContent).toMatch(/too large|4 ?MB/i);

    const tooLarge = captureCalls.filter((c) => c.event === 'upload_file_too_large');
    expect(tooLarge.length).toBe(1);
    expect(tooLarge[0].properties.limit_bytes).toBe(4 * 1024 * 1024);
    expect(tooLarge[0].properties.file_size).toBe(9 * 1024 * 1024);
  });

  test('a small file is accepted (no error, no event)', () => {
    let conv;
    render(<Harness onReady={(c) => { conv = c; }} />);
    act(() => conv.handleFileSelect(sizedFile(1 * 1024 * 1024, 'small.csv')));

    expect(conv.file).toBeTruthy();
    expect(screen.getByTestId('err').textContent).toBe('');
    expect(captureCalls.filter((c) => c.event === 'upload_file_too_large').length).toBe(0);
  });
});
