import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import useConversion from '../hooks/useConversion.mjs';

/**
 * Regression for the v1 bug (#49, reverted): the backend labels sections
 * POSITIONALLY by columnGroups order and maps sectionTitles by positional label.
 * v1 keyed order + renames by label, so reorder + rename made titles land on the
 * wrong section and drift on each re-render. v2 is position-based; this test runs
 * the full round-trip against a faithful backend mock and asserts a rename stays
 * with ITS column and does not drift across re-renders.
 */

const REAL_FILE = new File(['col1,col2\n1,2'], 'real.csv', { type: 'text/csv' });

// Initial auto-detected sections (label, columns, title).
const DEFAULT_SECTIONS = [
  { label: 'A', columns: ['cat'], title: 'Categories' },
  { label: 'B', columns: ['desc'], title: 'Descriptions' },
  { label: 'C', columns: ['color'], title: 'Colors' },
];

function pdfResponse(sections) {
  return new Response(new Blob(['%PDF-1.4'], { type: 'application/pdf' }), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': 'attachment; filename="out.pdf"',
      'x-render-id': 'rid_rt',
      'x-cleansheet-sections': JSON.stringify(sections),
    },
  });
}

// Faithful backend: when columnGroups are supplied, render sections in that order
// with POSITIONAL labels (1st non-fixed group -> "A", 2nd -> "B", ...) and apply
// sectionTitles by that positional label. Otherwise return the auto sections.
function fakeBackendRender(options) {
  const body = options?.body;
  let columnGroups = null;
  let sectionTitles = {};
  if (body && typeof body.get === 'function') {
    const cg = body.get('columnGroups');
    if (cg) columnGroups = JSON.parse(cg);
    const st = body.get('sectionTitles');
    if (st) sectionTitles = JSON.parse(st);
  }
  if (Array.isArray(columnGroups) && columnGroups.length) {
    const nonFixed = columnGroups.filter((g) => g.label !== '__fixed__');
    const sections = nonFixed.map((g, i) => {
      const label = String.fromCharCode(65 + i); // positional, ignores g.label
      return { label, columns: g.columns, title: sectionTitles[label] || `Auto ${g.columns.join('+')}` };
    });
    return pdfResponse(sections);
  }
  return pdfResponse(DEFAULT_SECTIONS);
}

let renderCalls;
function installFetch() {
  renderCalls = [];
  const original = global.fetch;
  global.fetch = vi.fn(async (url, options) => {
    const u = String(url);
    if (u.includes('/api/render')) { renderCalls.push(options); return fakeBackendRender(options); }
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
      <button type="button" onClick={() => { conversion.renameSection(0, 'Cat'); }}>rename</button>
      <button type="button" onClick={() => { conversion.reorderSection(0, 2); }}>reorder</button>
    </div>
  );
}

// Find the section (columnGroup) containing `column` in a render call, and return
// the title that render assigned to it (via sectionTitles, keyed by its label).
function titleOfColumn(options, column) {
  const cg = JSON.parse(options.body.get('columnGroups'));
  const st = JSON.parse(options.body.get('sectionTitles') || '{}');
  const g = cg.find((grp) => (grp.columns || []).includes(column));
  return g ? { label: g.label, title: st[g.label] } : null;
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

describe('section reorder v2 — rename + reorder round-trip (no drift)', () => {
  test('a rename stays with its column after reorder, and does not drift on re-render', async () => {
    restoreFetch = installFetch();
    render(<Harness />);

    // Initial render -> auto sections [cat/Categories, desc/Descriptions, color/Colors].
    await act(async () => { fireEvent.click(screen.getByText('submit')); });
    await waitFor(() => expect(renderCalls.length).toBe(1), { timeout: 4000 });
    await waitFor(() => expect(screen.getByTestId('sections').textContent).toBe('3'), { timeout: 4000 });
    await settle();

    // Rename section 0 ("Categories") -> "Cat", then move it to the END.
    await act(async () => { fireEvent.click(screen.getByText('rename')); });
    await act(async () => { fireEvent.click(screen.getByText('reorder')); });
    await act(async () => { fireEvent.click(screen.getByText('submit')); });
    await waitFor(() => expect(renderCalls.length).toBe(2), { timeout: 4000 });
    await settle();

    // The "Cat" title must be on the section that still holds the 'cat' column —
    // now last (positional label C) — NOT on whatever ended up first.
    const second = titleOfColumn(renderCalls[1], 'cat');
    expect(second).toEqual({ label: 'C', title: 'Cat' });
    // And the section now first ('desc') is NOT titled 'Cat'.
    expect(titleOfColumn(renderCalls[1], 'desc').title).not.toBe('Cat');

    // Re-render again with no further edits: the rename must NOT drift.
    await act(async () => { fireEvent.click(screen.getByText('submit')); });
    await waitFor(() => expect(renderCalls.length).toBe(3), { timeout: 4000 });
    await settle();

    expect(titleOfColumn(renderCalls[2], 'cat')).toEqual({ label: 'C', title: 'Cat' });
  }, 20000);
});
