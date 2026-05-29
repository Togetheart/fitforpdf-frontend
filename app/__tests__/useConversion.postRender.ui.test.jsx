import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import useConversion from '../hooks/useConversion.mjs';

/**
 * Last CEO-validated plan (May 2026): the success of a real render is
 * commercially invisible because the PDF auto-downloads and the UI
 * clears verdict/flowId/renderId. These tests lock the new behavior:
 *
 *   1. An OK render does NOT auto-download.
 *   2. confidence, flowId, renderId stay populated so the result
 *      panel can show score/verdict and CTAs.
 *   3. handleDownloadAnyway fires download_clicked + download_completed.
 *   4. handleRenderAnother fires second_real_render_started with the
 *      previous render_id, then clears the file slot.
 *   5. handlePostRenderPricingClick / handlePostRenderContactClick
 *      fire the matching PostHog events with render_id + flow_id.
 */

const REAL_FILE = new File(['col1,col2\n1,2'], 'real.csv', { type: 'text/csv' });

function pdfResponse({ score = 95, verdict = 'OK', renderId = 'rid_post', routerMode = null, routerReason = null } = {}) {
  const headers = {
    'content-type': 'application/pdf',
    'content-disposition': 'attachment; filename="out.pdf"',
    'x-render-id': renderId,
    'x-cleansheet-score': String(score),
    'x-cleansheet-verdict': verdict,
  };
  if (routerMode) headers['x-cleansheet-router-mode'] = routerMode;
  if (routerReason) headers['x-cleansheet-router-reason'] = routerReason;
  return new Response(new Blob(['%PDF-1.4'], { type: 'application/pdf' }), {
    status: 200,
    headers,
  });
}

function quotaResponse() {
  return new Response(JSON.stringify({ plan_type: 'free', free_exports_left: 3 }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
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

function mockPostHog() {
  const captures = [];
  const previousPosthog = window.posthog;
  window.posthog = { capture: (event, props) => captures.push({ event, props }) };
  return {
    captures,
    restore: () => { window.posthog = previousPosthog; },
  };
}

function makeQuota() {
  return {
    isQuotaLocked: false,
    syncQuotaState: vi.fn(async () => ({
      planType: 'free',
      freeExportsLeft: 3,
      remainingInPeriod: null,
    })),
    applyQuotaExhaustion: vi.fn(),
    setPaywallReason: vi.fn(),
    setPurchaseMessage: vi.fn(),
    planType: 'free',
    freeExportsLeft: 3,
    remainingInPeriod: 0,
    freeExportsLimit: 3,
  };
}

function Harness({ exposeRef }) {
  const conversion = useConversion({ quota: makeQuota() });
  /* Keep the latest hook reference accessible from outside the component so
   * tests can call download/render-another after a successful render. */
  exposeRef.current = conversion;
  const initRef = React.useRef(false);
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    conversion.handleFileSelect(REAL_FILE);
    setReady(true);
  }, [conversion]);
  return (
    <div>
      <button
        type="button"
        disabled={!ready}
        onClick={() => { void conversion.handleSubmit({ preventDefault: () => {} }); }}
      >
        upload-real
      </button>
      <p data-testid="verdict">{conversion.verdict || ''}</p>
      <p data-testid="render-id">{conversion.renderId || ''}</p>
      <p data-testid="flow-id">{conversion.flowId || ''}</p>
      <p data-testid="has-blob">{conversion.pdfBlob ? 'yes' : 'no'}</p>
      <p data-testid="compact-suggestion">{conversion.compactSuggestion?.mode || ''}</p>
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
  if (!URL.createObjectURL) URL.createObjectURL = vi.fn(() => 'blob:stub');
  if (!URL.revokeObjectURL) URL.revokeObjectURL = vi.fn();
  HTMLAnchorElement.prototype.click = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('useConversion — post-render result contract', () => {
  test('OK render preserves verdict/flowId/renderId/pdfBlob and does not auto-download', async () => {
    const restoreFetch = mockFetch([
      ['/api/quota', quotaResponse],
      ['/render', () => pdfResponse({ verdict: 'OK', renderId: 'rid_ok' })],
    ]);
    const ph = mockPostHog();
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const ref = { current: null };

    render(<Harness exposeRef={ref} />);
    await act(async () => {
      fireEvent.click(screen.getByText('upload-real'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('verdict').textContent).toBe('OK');
    }, { timeout: 4000 });

    expect(screen.getByTestId('render-id').textContent).toBe('rid_ok');
    expect(screen.getByTestId('flow-id').textContent).not.toBe('');
    expect(screen.getByTestId('has-blob').textContent).toBe('yes');
    // No download_completed without a user click
    expect(ph.captures.find((c) => c.event === 'download_completed')).toBeUndefined();
    expect(logSpy).not.toHaveBeenCalled();

    ph.restore();
    restoreFetch();
  }, 8000);

  test('handleDownloadAnyway fires download_clicked then download_completed with renderId + flowId', async () => {
    const restoreFetch = mockFetch([
      ['/api/quota', quotaResponse],
      ['/render', () => pdfResponse({ verdict: 'OK', renderId: 'rid_dl', score: 91 })],
    ]);
    const ph = mockPostHog();
    const ref = { current: null };

    render(<Harness exposeRef={ref} />);
    await act(async () => {
      fireEvent.click(screen.getByText('upload-real'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('verdict').textContent).toBe('OK');
    }, { timeout: 4000 });

    await act(async () => {
      ref.current.handleDownloadAnyway();
    });

    const clicked = ph.captures.find((c) => c.event === 'download_clicked');
    const completed = ph.captures.find((c) => c.event === 'download_completed');
    expect(clicked).toBeDefined();
    expect(clicked.props.render_id).toBe('rid_dl');
    expect(clicked.props.verdict).toBe('OK');
    expect(clicked.props.score).toBe(91);
    expect(clicked.props.file_type).toBe('csv');
    expect(clicked.props.is_demo).toBe(false);
    expect(completed).toBeDefined();
    expect(completed.props.render_id).toBe('rid_dl');

    ph.restore();
    restoreFetch();
  }, 8000);

  test('handleRenderAnother fires second_real_render_started with previous render_id and resets the file slot', async () => {
    const restoreFetch = mockFetch([
      ['/api/quota', quotaResponse],
      ['/render', () => pdfResponse({ verdict: 'OK', renderId: 'rid_first' })],
    ]);
    const ph = mockPostHog();
    const ref = { current: null };

    render(<Harness exposeRef={ref} />);
    await act(async () => {
      fireEvent.click(screen.getByText('upload-real'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('verdict').textContent).toBe('OK');
    }, { timeout: 4000 });

    await act(async () => {
      ref.current.handleRenderAnother();
    });

    const second = ph.captures.find((c) => c.event === 'second_real_render_started');
    expect(second).toBeDefined();
    expect(second.props.previous_render_id).toBe('rid_first');
    expect(screen.getByTestId('has-blob').textContent).toBe('no');
    expect(screen.getByTestId('verdict').textContent).toBe('');

    ph.restore();
    restoreFetch();
  }, 8000);

  test('post-render pricing and contact clicks fire dedicated events with render context', async () => {
    const restoreFetch = mockFetch([
      ['/api/quota', quotaResponse],
      ['/render', () => pdfResponse({ verdict: 'OK', renderId: 'rid_intent' })],
    ]);
    const ph = mockPostHog();
    const ref = { current: null };

    render(<Harness exposeRef={ref} />);
    await act(async () => {
      fireEvent.click(screen.getByText('upload-real'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('verdict').textContent).toBe('OK');
    }, { timeout: 4000 });

    await act(async () => {
      ref.current.handlePostRenderPricingClick();
      ref.current.handlePostRenderContactClick();
    });

    const pricing = ph.captures.find((c) => c.event === 'post_render_pricing_clicked');
    const contact = ph.captures.find((c) => c.event === 'post_render_contact_clicked');
    expect(pricing).toBeDefined();
    expect(pricing.props.render_id).toBe('rid_intent');
    expect(contact).toBeDefined();
    expect(contact.props.render_id).toBe('rid_intent');

    ph.restore();
    restoreFetch();
  }, 8000);

  test('surfaces router column_split as a compact suggestion without rerendering automatically', async () => {
    const restoreFetch = mockFetch([
      ['/api/quota', quotaResponse],
      ['/render', () => pdfResponse({
        verdict: 'OK',
        renderId: 'rid_router',
        routerMode: 'column_split',
        routerReason: 'false_fit_detected',
      })],
    ]);
    const ph = mockPostHog();
    const ref = { current: null };

    render(<Harness exposeRef={ref} />);
    await act(async () => {
      fireEvent.click(screen.getByText('upload-real'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('compact-suggestion').textContent).toBe('column_split');
    }, { timeout: 4000 });

    const renderCalls = global.fetch.mock.calls.filter(([url]) => String(url).includes('/render'));
    expect(renderCalls).toHaveLength(1);
    expect(ref.current.lastRequestMode).toBe('normal');

    ph.restore();
    restoreFetch();
  }, 8000);
});
