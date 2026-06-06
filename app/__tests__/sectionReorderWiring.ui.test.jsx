import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import useConversion from '../hooks/useConversion.mjs';

/**
 * Wiring test for drag-and-drop section reordering: once the user reorders
 * sections (sectionOrder), the next render must send `columnGroups` in that
 * order so the preview + download follow. The drag interaction itself can't be
 * simulated in jsdom; here we set sectionOrder directly and assert the FormData.
 */

const REAL_FILE = new File(['col1,col2\n1,2'], 'real.csv', { type: 'text/csv' });

function pdfResponse() {
  return new Response(new Blob(['%PDF-1.4'], { type: 'application/pdf' }), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': 'attachment; filename="out.pdf"',
      'x-render-id': 'rid_reorder',
      'x-cleansheet-sections': JSON.stringify([
        { label: 'A', title: 'Customer info', columns: ['Region', 'Plan'] },
        { label: 'B', title: 'Orders', columns: ['Email', 'Phone'] },
      ]),
    },
  });
}

function quotaResponse() {
  return new Response(JSON.stringify({ plan_type: 'free', free_exports_left: 9 }), {
    status: 200, headers: { 'content-type': 'application/json' },
  });
}

let renderCalls;
function installFetch() {
  renderCalls = [];
  const original = global.fetch;
  global.fetch = vi.fn(async (url, options) => {
    const u = String(url);
    if (u.includes('/api/render')) { renderCalls.push(options); return pdfResponse(); }
    if (u.includes('/api/quota')) return quotaResponse();
    return new Response('', { status: 404 });
  });
  return () => { global.fetch = original; };
}

function makeQuota() {
  return {
    isQuotaLocked: false,
    syncQuotaState: vi.fn(async () => ({ planType: 'free', freeExportsLeft: 9, remainingInPeriod: null })),
    applyQuotaExhaustion: vi.fn(),
    setPaywallReason: vi.fn(),
    setPurchaseMessage: vi.fn(),
    planType: 'free', freeExportsLeft: 9, remainingInPeriod: 0, freeExportsLimit: 3,
  };
}

function Harness() {
  const conversion = useConversion({ quota: makeQuota() });
  const initRef = React.useRef(false);
  React.useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    conversion.handleFileSelect(REAL_FILE);
  }, [conversion]);
  return (
    <div>
      <span data-testid="loading">{conversion.isLoading ? '1' : '0'}</span>
      <span data-testid="sections">{conversion.renderedSections.length}</span>
      <button type="button" onClick={() => { void conversion.handleSubmit({ preventDefault: () => {} }); }}>submit</button>
      <button type="button" onClick={() => { conversion.setSectionOrder(['B', 'A']); }}>reorder</button>
    </div>
  );
}

function columnGroupsLabels(options) {
  if (!options?.body || typeof options.body.get !== 'function') return null;
  const raw = options.body.get('columnGroups');
  if (!raw) return null;
  return JSON.parse(raw).map((g) => g.label);
}

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true, configurable: true,
    value: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
  });
  if (!URL.createObjectURL) URL.createObjectURL = vi.fn(() => 'blob:stub');
  if (!URL.revokeObjectURL) URL.revokeObjectURL = vi.fn();
  HTMLAnchorElement.prototype.click = vi.fn();
});

let restoreFetch;
afterEach(() => { restoreFetch?.(); cleanup(); vi.restoreAllMocks(); });

describe('useConversion — section reorder wiring', () => {
  test('after reordering, the next render sends columnGroups in the chosen order', async () => {
    restoreFetch = installFetch();
    render(<Harness />);

    // First render: establishes renderedSections [A, B].
    await act(async () => { fireEvent.click(screen.getByText('submit')); });
    await waitFor(() => expect(renderCalls.length).toBe(1), { timeout: 4000 });
    await waitFor(() => expect(screen.getByTestId('sections').textContent).toBe('2'), { timeout: 4000 });
    // Wait for the render to fully settle (min-progress delay) so the next submit isn't swallowed.
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('0'), { timeout: 4000 });
    // No customization yet -> no columnGroups sent.
    expect(columnGroupsLabels(renderCalls[0])).toBeNull();

    // Reorder B before A, then re-render.
    await act(async () => { fireEvent.click(screen.getByText('reorder')); });
    await act(async () => { fireEvent.click(screen.getByText('submit')); });
    await waitFor(() => expect(renderCalls.length).toBe(2), { timeout: 4000 });

    expect(columnGroupsLabels(renderCalls[1])).toEqual(['B', 'A']);
  });
});
