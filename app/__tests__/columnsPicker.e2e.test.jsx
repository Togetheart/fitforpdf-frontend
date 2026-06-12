import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import AppPage from '../app/page.jsx';

const WIDE_COLS = Array.from({ length: 30 }, (_, i) => `col${i + 1}`);

const REAL_FILE = new File(['col1,col2\n1,2'], 'real.csv', { type: 'text/csv' });

// Build a successful wide-render Response. Mirrors the PDF-response builder in
// appCustomGroups.e2e.test.jsx (same status, content-type, and headers it sets);
// only the sections header is changed so the file has 30 columns across 2 sections.
function wideRenderResponse() {
  const sections = [
    { label: 'A', title: '', columns: WIDE_COLS.slice(0, 15) },
    { label: 'B', title: '', columns: WIDE_COLS.slice(15) },
  ];
  return new Response(new Blob(['%PDF-1.4'], { type: 'application/pdf' }), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': 'attachment; filename="out.pdf"',
      'x-render-id': 'rid_cp',
      'x-cleansheet-score': '95',
      'x-cleansheet-verdict': 'OK',
      'x-cleansheet-sections': JSON.stringify(sections),
      'x-cleansheet-frozen-columns': '[]',
    },
  });
}

function quotaResponse() {
  return new Response(JSON.stringify({ plan_type: 'free', free_exports_left: 9 }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

let renderCalls;
function installFetch() {
  renderCalls = [];
  const original = global.fetch;
  global.fetch = vi.fn(async (url, options) => {
    const u = String(url);
    if (u.includes('/api/render')) { renderCalls.push(options); return wideRenderResponse(); }
    if (u.includes('/api/quota')) return quotaResponse();
    return new Response('', { status: 404 });
  });
  return () => { global.fetch = original; };
}

function configureMatchMedia() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true, configurable: true,
    value: () => ({ matches: false, media: '', addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {}, dispatchEvent: () => {} }),
  });
}

function bodyEntries(options) {
  const out = {};
  if (options?.body && typeof options.body.entries === 'function') {
    for (const [k, v] of options.body.entries()) out[k] = v;
  }
  return out;
}

let restoreFetch;
beforeEach(() => {
  configureMatchMedia();
  if (typeof URL.createObjectURL !== 'function') URL.createObjectURL = () => 'blob:mock';
  if (typeof URL.revokeObjectURL !== 'function') URL.revokeObjectURL = () => {};
  restoreFetch = installFetch();
});
afterEach(() => { restoreFetch?.(); cleanup(); vi.restoreAllMocks(); });

async function generate() {
  render(<AppPage />);
  const input = document.querySelector('[data-testid="generate-file-input"]');
  await act(async () => { fireEvent.change(input, { target: { files: [REAL_FILE] } }); });
  const gen = await screen.findByRole('button', { name: /Generate PDF/i });
  await act(async () => { fireEvent.click(gen); });
  await waitFor(() => expect(renderCalls.length).toBe(1), { timeout: 3000 });
  await waitFor(
    () => expect(screen.getByRole('button', { name: /Update preview/i }).disabled).toBe(false),
    { timeout: 3000 },
  );
}

describe('Columns picker end-to-end', () => {
  test('first render sends NO includeColumns; after unchecking, the next render sends the kept columns', async () => {
    await generate();

    expect(bodyEntries(renderCalls[0]).includeColumns).toBeUndefined(); // uncurated -> omitted

    // Uncheck one column in the Columns picker, then update the preview.
    const picker = await screen.findByTestId('app-columns-picker');
    await act(async () => {
      fireEvent.click(within(picker).getByRole('checkbox', { name: 'col2' }));
    });

    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Update preview/i })); });

    await waitFor(() => expect(renderCalls.length).toBe(2), { timeout: 3000 });
    const sent = JSON.parse(bodyEntries(renderCalls[1]).includeColumns);
    expect(sent).toEqual(WIDE_COLS.filter((c) => c !== 'col2'));
    expect(sent).not.toContain('col2');
    expect(sent).toHaveLength(29);
  });
});
