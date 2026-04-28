import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import useConversion from '../hooks/useConversion.mjs';

/**
 * Demo → upload conversion is currently 0% (49 demo views, 0 uploads).
 * These tests pin down two things:
 *   1. The hook exposes `wasDemoLastUpload` so the UI can render a CTA.
 *   2. The hook fires `upload_after_demo` exactly once when a real upload
 *      follows a demo render in the same session.
 */

const SAMPLE_FILE = new File(['col1,col2\n1,2'], 'real.csv', { type: 'text/csv' });
const SAMPLE_DEMO_CSV = 'a,b,c\n1,2,3';

function pdfResponse() {
  return new Response(new Blob(['%PDF-1.4'], { type: 'application/pdf' }), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': 'attachment; filename="out.pdf"',
      'x-render-id': 'rid_demo',
    },
  });
}

function quotaResponse(payload = { plan_type: 'free', free_exports_left: 3 }) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

function sampleCsvResponse() {
  return new Response(SAMPLE_DEMO_CSV, {
    status: 200,
    headers: { 'content-type': 'text/csv' },
  });
}

function mockFetch(routes) {
  const originalFetch = global.fetch;
  global.fetch = vi.fn(async (url) => {
    const u = String(url);
    for (const [pattern, factory] of routes) {
      if (u.includes(pattern)) return factory();
    }
    return new Response('', { status: 404 });
  });
  return () => { global.fetch = originalFetch; };
}

/* Track posthog captures during the test. */
function mockPostHog() {
  const captures = [];
  const previousPosthog = window.posthog;
  window.posthog = { capture: (event, props) => captures.push({ event, props }) };
  return {
    captures,
    restore: () => { window.posthog = previousPosthog; },
  };
}

function DemoFlowHarness({ onSnapshot }) {
  const conversion = useConversion({
    quota: { planType: 'free', freeExportsLeft: 3, remainingInPeriod: 0 },
  });
  React.useEffect(() => {
    onSnapshot(conversion);
  }, [conversion, onSnapshot]);
  return (
    <div>
      <button onClick={() => void conversion.handleTrySample()} type="button">
        try-demo
      </button>
      <button
        onClick={() => {
          conversion.handleFileSelect(SAMPLE_FILE);
          void conversion.handleSubmit({ preventDefault: () => {} });
        }}
        type="button"
      >
        upload-real
      </button>
      <div data-testid="was-demo">{String(conversion.wasDemoLastUpload || false)}</div>
    </div>
  );
}

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  });
  /* jsdom doesn't implement URL.createObjectURL — needed by downloadBlob
   * which fires inside the demo render flow. Stubbing as no-ops. */
  if (!URL.createObjectURL) URL.createObjectURL = vi.fn(() => 'blob:stub');
  if (!URL.revokeObjectURL) URL.revokeObjectURL = vi.fn();
  HTMLAnchorElement.prototype.click = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('useConversion — demo → upload tracking', () => {
  test('wasDemoLastUpload is false on initial render', () => {
    let snapshot = null;
    render(<DemoFlowHarness onSnapshot={(c) => { snapshot = c; }} />);
    expect(snapshot.wasDemoLastUpload).toBeFalsy();
    expect(screen.getByTestId('was-demo').textContent).toBe('false');
  });

  test('wasDemoLastUpload becomes true after a successful demo render', async () => {
    const restoreFetch = mockFetch([
      ['/api/sample/premium', sampleCsvResponse],
      ['/api/quota', quotaResponse],
      ['/render', pdfResponse],
    ]);
    const ph = mockPostHog();

    render(<DemoFlowHarness onSnapshot={() => {}} />);
    await act(async () => {
      fireEvent.click(screen.getByText('try-demo'));
    });

    await waitFor(
      () => expect(screen.getByTestId('was-demo').textContent).toBe('true'),
      { timeout: 4000 },
    );

    /* trackDemoPdfShown must have been emitted */
    expect(ph.captures.some((c) => c.event === 'demo_pdf_shown')).toBe(true);

    ph.restore();
    restoreFetch();
  }, 8000);

  test('upload_after_demo fires exactly once when a real upload follows a demo', async () => {
    const restoreFetch = mockFetch([
      ['/api/sample/premium', sampleCsvResponse],
      ['/api/quota', quotaResponse],
      ['/render', pdfResponse],
    ]);
    const ph = mockPostHog();

    render(<DemoFlowHarness onSnapshot={() => {}} />);

    /* 1. demo */
    await act(async () => { fireEvent.click(screen.getByText('try-demo')); });
    await waitFor(
      () => expect(screen.getByTestId('was-demo').textContent).toBe('true'),
      { timeout: 4000 },
    );

    /* 2. real upload */
    await act(async () => { fireEvent.click(screen.getByText('upload-real')); });
    await waitFor(
      () => {
        const events = ph.captures.filter((c) => c.event === 'upload_after_demo');
        expect(events.length).toBe(1);
        expect(events[0].props.file_type).toBe('csv');
      },
      { timeout: 4000 },
    );

    /* And wasDemoLastUpload resets to false after the real upload */
    expect(screen.getByTestId('was-demo').textContent).toBe('false');

    ph.restore();
    restoreFetch();
  }, 12000);

  test('handleSwitchToRealUpload clears demo state and opens the file picker', async () => {
    const restoreFetch = mockFetch([
      ['/api/sample/premium', sampleCsvResponse],
      ['/api/quota', quotaResponse],
      ['/render', pdfResponse],
    ]);
    const ph = mockPostHog();

    /* Stub the file input click so we can assert it was triggered. */
    const inputClicks = [];
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.setAttribute('data-testid', 'generate-file-input');
    fileInput.click = () => inputClicks.push('clicked');
    document.body.appendChild(fileInput);

    function SwitchHarness() {
      const conversion = useConversion({
        quota: {
          planType: 'free',
          freeExportsLeft: 3,
          remainingInPeriod: 0,
          /* Stubbed quota plumbing so submitRender's await syncQuotaState()
           * resolves cleanly and reaches setPdfBlob(blob). */
          syncQuotaState: async () => ({ planType: 'free', freeExportsLeft: 2 }),
          isQuotaLocked: false,
          applyQuotaExhaustion: () => '',
          setPaywallReason: () => {},
          setPurchaseMessage: () => {},
        },
      });
      return (
        <div>
          <button onClick={() => void conversion.handleTrySample()}>try-demo</button>
          <button onClick={() => conversion.handleSwitchToRealUpload()}>switch</button>
          <div data-testid="file">{conversion.file?.name || 'none'}</div>
          <div data-testid="blob">{conversion.pdfBlob ? 'yes' : 'no'}</div>
          <div data-testid="was-demo">{String(conversion.wasDemoLastUpload || false)}</div>
        </div>
      );
    }

    render(<SwitchHarness />);
    /* Run the demo first; wait for wasDemoLastUpload=true which fires
     * after submitRender resolves AND pdfBlob is set. */
    await act(async () => { fireEvent.click(screen.getByText('try-demo')); });
    await waitFor(
      () => expect(screen.getByTestId('was-demo').textContent).toBe('true'),
      { timeout: 4000 },
    );
    expect(screen.getByTestId('file').textContent).toBe('enterprise-invoices-demo.csv');
    expect(screen.getByTestId('blob').textContent).toBe('yes');

    /* Now hit the switch */
    await act(async () => { fireEvent.click(screen.getByText('switch')); });

    /* State should be cleared */
    expect(screen.getByTestId('file').textContent).toBe('none');
    expect(screen.getByTestId('blob').textContent).toBe('no');

    /* And the file picker click should have been triggered (deferred) */
    await waitFor(() => expect(inputClicks.length).toBe(1), { timeout: 1000 });

    document.body.removeChild(fileInput);
    ph.restore();
    restoreFetch();
  }, 12000);

  test('upload_after_demo does NOT fire for a normal upload without a prior demo', async () => {
    const restoreFetch = mockFetch([
      ['/api/quota', quotaResponse],
      ['/render', pdfResponse],
    ]);
    const ph = mockPostHog();

    render(<DemoFlowHarness onSnapshot={() => {}} />);
    await act(async () => { fireEvent.click(screen.getByText('upload-real')); });

    /* Wait a tick so any spurious capture would land. */
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(ph.captures.some((c) => c.event === 'upload_after_demo')).toBe(false);

    ph.restore();
    restoreFetch();
  });
});
