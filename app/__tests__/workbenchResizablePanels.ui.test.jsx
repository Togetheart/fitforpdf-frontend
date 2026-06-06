import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import AppPage from '../app/page.jsx';

/**
 * Phase 1 — desktop workbench resizable / collapsible panels.
 *
 * On desktop (min-width:1024px) the /app workbench renders a horizontal
 * react-resizable-panels PanelGroup: left (collapsible) | center | right
 * (collapsible). This test forces matchMedia to the DESKTOP branch (the shared
 * setup.mjs returns matches:false, which renders the unchanged mobile stack)
 * and asserts the resize handles + collapse toggles render, and that toggling
 * a collapse button flips its accessible name to "Expand …".
 *
 * The ResizeObserver no-op stub lives in setup.mjs (the lib needs it in jsdom).
 */

const REAL_FILE = new File(['col1,col2\n1,2'], 'real.csv', { type: 'text/csv' });

function pdfResponse() {
  return new Response(new Blob(['%PDF-1.4'], { type: 'application/pdf' }), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': 'attachment; filename="out.pdf"',
      'x-render-id': 'rid_panels',
      'x-cleansheet-score': '95',
      'x-cleansheet-verdict': 'OK',
      'x-cleansheet-sections': JSON.stringify([
        { label: 'A', title: 'Customer info', columns: ['Region', 'Plan'] },
        { label: 'B', title: 'Orders', columns: ['Email', 'Phone'] },
      ]),
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
    if (u.includes('/api/render')) {
      renderCalls.push(options);
      return pdfResponse();
    }
    if (u.includes('/api/quota')) return quotaResponse();
    return new Response('', { status: 404 });
  });
  return () => { global.fetch = original; };
}

// Force the DESKTOP branch: (min-width:1024px) must match. setup.mjs's stub
// returns matches:false (mobile); useIsDesktop reads this query, so we make it
// report a match here.
function forceDesktopMatchMedia() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query) => ({
      matches: /min-width:\s*1024px/.test(query),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => true,
    }),
  });
}

let restoreFetch;
beforeEach(() => {
  forceDesktopMatchMedia();
  if (typeof URL.createObjectURL !== 'function') URL.createObjectURL = () => 'blob:mock';
  if (typeof URL.revokeObjectURL !== 'function') URL.revokeObjectURL = () => {};
  restoreFetch = installFetch();
});
afterEach(() => {
  restoreFetch?.();
  cleanup();
  vi.restoreAllMocks();
});

async function mountDesktopWorkbench() {
  render(<AppPage />);
  // Drive a full render so the workbench reaches its complete desktop shell.
  const input = document.querySelector('[data-testid="generate-file-input"]');
  expect(input).toBeTruthy();
  await act(async () => {
    fireEvent.change(input, { target: { files: [REAL_FILE] } });
  });
  const generate = await screen.findByRole('button', { name: /Generate PDF/i });
  await act(async () => { fireEvent.click(generate); });
  await waitFor(() => expect(renderCalls.length).toBe(1), { timeout: 3000 });
}

describe('/app workbench — desktop resizable / collapsible panels (Phase 1)', () => {
  test('desktop renders resize handles (role="separator")', async () => {
    await mountDesktopWorkbench();
    const separators = await screen.findAllByRole('separator');
    // Two handles: between left|center and between center|right.
    expect(separators.length).toBeGreaterThanOrEqual(2);
  });

  test('collapse toggles for left and right panels render', async () => {
    await mountDesktopWorkbench();
    expect(await screen.findByRole('button', { name: 'Collapse left panel' })).toBeTruthy();
    expect(await screen.findByRole('button', { name: 'Collapse right panel' })).toBeTruthy();
  });

  test('clicking the left collapse toggle flips its accessible name to Expand', async () => {
    await mountDesktopWorkbench();
    const collapseLeft = await screen.findByRole('button', { name: 'Collapse left panel' });
    await act(async () => { fireEvent.click(collapseLeft); });
    expect(await screen.findByRole('button', { name: 'Expand left panel' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Collapse left panel' })).toBeNull();
  });

  test('clicking the right collapse toggle flips its accessible name to Expand', async () => {
    await mountDesktopWorkbench();
    const collapseRight = await screen.findByRole('button', { name: 'Collapse right panel' });
    await act(async () => { fireEvent.click(collapseRight); });
    expect(await screen.findByRole('button', { name: 'Expand right panel' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Collapse right panel' })).toBeNull();
  });
});
