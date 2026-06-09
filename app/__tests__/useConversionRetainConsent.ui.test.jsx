import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';

import useConversion from '../hooks/useConversion.mjs';

const SAMPLE_FILE = new File(['a,b\n1,2'], 'test.csv', { type: 'text/csv' });

function createPdfResponse() {
  return new Response(new Blob(['%PDF-1.4'], { type: 'application/pdf' }), {
    status: 200,
    headers: { 'content-type': 'application/pdf', 'content-disposition': 'attachment; filename="report.pdf"' },
  });
}
function mockFetch(handler) {
  const originalFetch = global.fetch;
  const calls = [];
  global.fetch = vi.fn((url, options = {}) => {
    calls.push({ url: String(url), options });
    return Promise.resolve(handler({ url: String(url), options }));
  });
  return { calls, restore: () => { global.fetch = originalFetch; } };
}
function createQuotaSnapshot() { return { planType: 'free', freeExportsLeft: 5, remainingInPeriod: 5 }; }

function Harness({ consent }) {
  const conversion = useConversion({ quota: createQuotaSnapshot() });
  const initRef = React.useRef(false);
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    conversion.handleFileSelect(SAMPLE_FILE);
    if (consent) conversion.setRetainSourceConsent(true);
    setReady(true);
  }, [conversion, consent]);
  return (
    <button type="button" disabled={!ready}
      onClick={() => { void conversion.handleSubmit({ preventDefault: () => {} }); }}>
      Generate PDF
    </button>
  );
}

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true, configurable: true,
    value: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
  });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function getRenderFormData(calls) {
  const call = calls.find((c) => c.url.includes('/api/render'));
  return call && call.options.body instanceof FormData ? call.options.body : null;
}

describe('useConversion, retain_consent in render FormData', () => {
  test('default (no consent) → retain_consent="0"', async () => {
    const mock = mockFetch(() => createPdfResponse());
    render(<Harness consent={false} />);
    fireEvent.click(await screen.findByRole('button'));
    await waitFor(() => { expect(getRenderFormData(mock.calls)).not.toBeNull(); });
    expect(getRenderFormData(mock.calls).get('retain_consent')).toBe('0');
    mock.restore();
  });

  test('consent on → retain_consent="1"', async () => {
    const mock = mockFetch(() => createPdfResponse());
    render(<Harness consent />);
    fireEvent.click(await screen.findByRole('button'));
    await waitFor(() => { expect(getRenderFormData(mock.calls)).not.toBeNull(); });
    expect(getRenderFormData(mock.calls).get('retain_consent')).toBe('1');
    mock.restore();
  });
});
