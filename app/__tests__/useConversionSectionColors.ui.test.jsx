import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import useConversion from '../hooks/useConversion.mjs';

/**
 * Editable section colors — wire contract. After a render the section draft is
 * re-synced from the X-CleanSheet-Sections header; the user picks a swatch
 * (setSectionColor) and the next render's FormData carries `sectionColors`
 * (JSON, keyed by positional label) alongside columnGroups/sectionTitles.
 */

const REAL_FILE = new File(['col1,col2\n1,2'], 'real.csv', { type: 'text/csv' });

const DEFAULT_SECTIONS = [
  { label: 'A', columns: ['cat'], title: 'Categories' },
  { label: 'B', columns: ['desc'], title: 'Descriptions' },
];

function pdfResponse(sections) {
  return new Response(new Blob(['%PDF-1.4'], { type: 'application/pdf' }), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': 'attachment; filename="out.pdf"',
      'x-render-id': 'rid_sc',
      'x-cleansheet-sections': JSON.stringify(sections),
    },
  });
}

let renderCalls;
function installFetch() {
  renderCalls = [];
  const original = global.fetch;
  global.fetch = vi.fn(async (url, options) => {
    const u = String(url);
    if (u.includes('/api/render')) { renderCalls.push(options); return pdfResponse(DEFAULT_SECTIONS); }
    if (u.includes('/api/quota')) {
      return new Response(JSON.stringify({ plan_type: 'free', free_exports_left: 9 }), {
        status: 200, headers: { 'content-type': 'application/json' },
      });
    }
    return new Response('', { status: 404 });
  });
  return () => { global.fetch = original; };
}

function makeQuota() {
  return {
    isQuotaLocked: false,
    syncQuotaState: vi.fn(async () => ({ planType: 'free', freeExportsLeft: 9, remainingInPeriod: null })),
    applyQuotaExhaustion: vi.fn(), setPaywallReason: vi.fn(), setPurchaseMessage: vi.fn(),
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
      <span data-testid="sections">{conversion.sectionDraft.length}</span>
      <button type="button" onClick={() => { void conversion.handleSubmit({ preventDefault: () => {} }); }}>submit</button>
      <button type="button" onClick={() => { conversion.setSectionColor(0, '#EF4444'); }}>color</button>
    </div>
  );
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

async function settle() {
  await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('0'), { timeout: 4000 });
}

describe('useConversion, sectionColors wire contract', () => {
  test('appends sectionColors JSON to FormData after a swatch is chosen', async () => {
    restoreFetch = installFetch();
    render(<Harness />);

    // First render -> sections re-synced from the header.
    await act(async () => { fireEvent.click(screen.getByText('submit')); });
    await waitFor(() => expect(renderCalls.length).toBe(1), { timeout: 4000 });
    await waitFor(() => expect(screen.getByTestId('sections').textContent).toBe('2'), { timeout: 4000 });
    await settle();

    // The first render has no chosen color -> no sectionColors field.
    expect(renderCalls[0].body.get('sectionColors')).toBeNull();

    // Pick a swatch for section A, then re-render.
    await act(async () => { fireEvent.click(screen.getByText('color')); });
    await act(async () => { fireEvent.click(screen.getByText('submit')); });
    await waitFor(() => expect(renderCalls.length).toBe(2), { timeout: 4000 });
    await settle();

    const raw = renderCalls[1].body.get('sectionColors');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw)).toEqual({ A: '#EF4444' });
  }, 20000);
});
