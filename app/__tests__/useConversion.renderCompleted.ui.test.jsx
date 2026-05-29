import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import useConversion from '../hooks/useConversion.mjs';

/**
 * Validates that every completed render fires `render_completed` with the
 * full metric payload — needed for the XLSX-vs-CSV quality-gap diagnostic
 * (Option A: "let real data speak before assuming a parser bug").
 */

const REAL_FILE = new File(['col1,col2\n1,2'], 'real.csv', { type: 'text/csv' });

function pdfResponse({
  score = 95,
  verdict = 'OK',
  cols = 4,
  rows = 12,
  pages = 3,
  wrap = 0,
  overflow = 0,
  renderMs = 412,
  identityHash = null,
} = {}) {
  const headers = {
    'content-type': 'application/pdf',
    'content-disposition': 'attachment; filename="out.pdf"',
    'x-render-id': 'rid_test',
    'x-cleansheet-score': String(score),
    'x-cleansheet-verdict': verdict,
    'x-render-ms': String(renderMs),
    'x-cleansheet-debug-metrics': JSON.stringify({
      columnCount: cols,
      rowCount: rows,
      pageCount: pages,
      wrap_pressure: wrap,
      overflow_cells: overflow,
    }),
  };
  if (identityHash) headers['x-identity-hash'] = identityHash;
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
  const identifies = [];
  const previousPosthog = window.posthog;
  window.posthog = {
    capture: (event, props) => captures.push({ event, props }),
    identify: (distinctId) => identifies.push(distinctId),
  };
  return {
    captures,
    identifies,
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

function Harness() {
  const conversion = useConversion({ quota: makeQuota() });
  const [ready, setReady] = React.useState(false);
  const initRef = React.useRef(false);
  React.useEffect(() => {
    /* Set file once before allowing submit so handleSubmit's closure sees it.
     * The conversion object is recreated on every render, so we guard with
     * a ref to avoid an infinite loop. */
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
        onClick={() => {
          void conversion.handleSubmit({ preventDefault: () => {} });
        }}
      >
        upload-real
      </button>
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

describe('useConversion — render_completed funnel event', () => {
  test('fires render_completed once with full metrics on a successful render', async () => {
    const restoreFetch = mockFetch([
      ['/api/quota', quotaResponse],
      ['/render', () => pdfResponse({
        score: 95,
        verdict: 'OK',
        cols: 4,
        rows: 12,
        pages: 3,
        wrap: 0,
        overflow: 0,
        renderMs: 412,
      })],
    ]);
    const ph = mockPostHog();

    render(<Harness />);
    await act(async () => {
      fireEvent.click(screen.getByText('upload-real'));
    });

    await waitFor(
      () => {
        const events = ph.captures.filter((c) => c.event === 'render_completed');
        expect(events.length).toBe(1);
      },
      { timeout: 4000 },
    );

    const event = ph.captures.find((c) => c.event === 'render_completed');
    expect(event.props.file_type).toBe('csv');
    expect(event.props.verdict).toBe('OK');
    expect(event.props.score).toBe(95);
    expect(event.props.col_count).toBe(4);
    expect(event.props.row_count).toBe(12);
    expect(event.props.page_count).toBe(3);
    expect(event.props.wrap_pressure).toBe(0);
    expect(event.props.overflow_cells).toBe(0);
    expect(event.props.render_ms).toBe(412);
    expect(event.props.is_demo).toBe(false);
    expect(event.props.mode).toBe('normal');

    ph.restore();
    restoreFetch();
  }, 8000);

  test('fires render_completed on a WARN render with the warning verdict', async () => {
    const restoreFetch = mockFetch([
      ['/api/quota', quotaResponse],
      ['/render', () => pdfResponse({
        score: 78,
        verdict: 'WARN',
        cols: 6,
        rows: 95,
        pages: 37,
        wrap: 0.81,
      })],
    ]);
    const ph = mockPostHog();

    render(<Harness />);
    await act(async () => {
      fireEvent.click(screen.getByText('upload-real'));
    });

    await waitFor(
      () => {
        const events = ph.captures.filter((c) => c.event === 'render_completed');
        expect(events.length).toBe(1);
        expect(events[0].props.verdict).toBe('WARN');
        expect(events[0].props.wrap_pressure).toBe(0.81);
      },
      { timeout: 4000 },
    );

    ph.restore();
    restoreFetch();
  }, 8000);

  test('identifies PostHog with the backend identity hash when present', async () => {
    const restoreFetch = mockFetch([
      ['/api/quota', quotaResponse],
      ['/render', () => pdfResponse({ identityHash: 'hash_render_identity' })],
    ]);
    const ph = mockPostHog();

    render(<Harness />);
    await act(async () => {
      fireEvent.click(screen.getByText('upload-real'));
    });

    await waitFor(
      () => {
        expect(ph.identifies).toEqual(['hash_render_identity']);
      },
      { timeout: 4000 },
    );

    ph.restore();
    restoreFetch();
  }, 8000);
});
