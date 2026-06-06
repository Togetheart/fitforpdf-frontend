import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';

import AppPage from '../app/page.jsx';

/**
 * Phase 2 — workbench mobile drawers.
 *
 * On a mobile viewport (matchMedia matches:true) the left rail + right inspector
 * become OFF-CANVAS DRAWERS that slide over the center workspace, instead of
 * stacking below it. This file forces the mobile branch (like appMobile.ui.test.jsx)
 * and asserts the toggle + drawer + scrim behaviour:
 *   - the "Options" (right inspector) + "Recent" (left rail) toggles render, both
 *     closed (aria-expanded=false), and no scrim is shown initially;
 *   - clicking a toggle opens its drawer (aria-expanded=true) + shows a scrim;
 *   - Escape closes; clicking the scrim closes;
 *   - opening the other toggle replaces the first (one drawer open at a time).
 *
 * Drawer content stays MOUNTED (shown/hidden via translate-x), so the inspector
 * + rail testids are always present in the DOM.
 */

function pdfResponse() {
  return new Response(new Blob(['%PDF-1.4'], { type: 'application/pdf' }), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': 'attachment; filename="out.pdf"',
      'x-render-id': 'rid_drawers',
      'x-cleansheet-score': '95',
      'x-cleansheet-verdict': 'OK',
      'x-cleansheet-sections': JSON.stringify([{ label: 'A', title: 'Customer info' }, { label: 'B', title: 'Orders' }]),
    },
  });
}

function quotaResponse() {
  return new Response(JSON.stringify({ plan_type: 'free', free_exports_left: 9 }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

function installFetch() {
  const original = global.fetch;
  global.fetch = vi.fn(async (url) => {
    const u = String(url);
    if (u.includes('/api/render')) return pdfResponse();
    if (u.includes('/api/quota')) return quotaResponse();
    return new Response('', { status: 404 });
  });
  return () => { global.fetch = original; };
}

// Force the MOBILE branch: the lg breakpoint (min-width:1024px) must NOT match, so
// useIsDesktop() stays false and ConversionTool renders the off-canvas drawers.
// (A blanket matches:true mock would make useIsDesktop true and render the desktop
// PanelGroup instead — see workbenchResizablePanels.ui.test.jsx's inverse helper.)
function configureMatchMedia() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true, configurable: true,
    value: (query) => ({ matches: !/min-width:\s*1024px/.test(String(query)), media: String(query), addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {}, dispatchEvent: () => {} }),
  });
}

let restoreFetch;
beforeEach(() => {
  // Mobile viewport for every test in this file.
  configureMatchMedia();
  if (typeof URL.createObjectURL !== 'function') URL.createObjectURL = () => 'blob:mock';
  if (typeof URL.revokeObjectURL !== 'function') URL.revokeObjectURL = () => {};
  restoreFetch = installFetch();
});
afterEach(() => {
  restoreFetch?.();
  cleanup();
  vi.restoreAllMocks();
});

const optionsToggle = () => screen.getByRole('button', { name: 'Open options panel' });
const recentToggle = () => screen.getByRole('button', { name: 'Open recent exports panel' });

describe('/app workbench — mobile drawers (Phase 2)', () => {
  test('both toggles render closed; no scrim initially', () => {
    render(<AppPage />);
    expect(optionsToggle().getAttribute('aria-expanded')).toBe('false');
    expect(recentToggle().getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('button', { name: 'Close panel' })).toBeNull();
  });

  test('drawer content (inspector + rail) stays mounted on mobile', () => {
    render(<AppPage />);
    // Even with both drawers closed, the panels are in the DOM (translate, not unmount).
    expect(screen.getByTestId('app-inspector')).toBeTruthy();
    expect(screen.getByTestId('app-left-rail')).toBeTruthy();
  });

  test('clicking the Options toggle opens the right inspector drawer with a scrim', () => {
    render(<AppPage />);
    fireEvent.click(optionsToggle());
    expect(optionsToggle().getAttribute('aria-expanded')).toBe('true');
    // The scrim appears when a drawer is open.
    expect(screen.getByRole('button', { name: 'Close panel' })).toBeTruthy();
    // The drawer is an accessible dialog labelled "Options".
    expect(screen.getByRole('dialog', { name: 'Options' })).toBeTruthy();
  });

  test('Escape closes an open drawer', () => {
    render(<AppPage />);
    fireEvent.click(optionsToggle());
    expect(optionsToggle().getAttribute('aria-expanded')).toBe('true');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(optionsToggle().getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('button', { name: 'Close panel' })).toBeNull();
  });

  test('clicking the scrim closes an open drawer', () => {
    render(<AppPage />);
    fireEvent.click(optionsToggle());
    const scrim = screen.getByRole('button', { name: 'Close panel' });
    fireEvent.click(scrim);
    expect(optionsToggle().getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('button', { name: 'Close panel' })).toBeNull();
  });

  test('the in-drawer close (X) button closes the drawer', () => {
    render(<AppPage />);
    fireEvent.click(optionsToggle());
    const dialog = screen.getByRole('dialog', { name: 'Options' });
    const closeBtn = within(dialog).getByRole('button', { name: 'Close Options panel' });
    fireEvent.click(closeBtn);
    expect(optionsToggle().getAttribute('aria-expanded')).toBe('false');
  });

  test('opening Recent while Options is open closes Options (one at a time)', () => {
    render(<AppPage />);
    fireEvent.click(optionsToggle());
    expect(optionsToggle().getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(recentToggle());
    expect(recentToggle().getAttribute('aria-expanded')).toBe('true');
    expect(optionsToggle().getAttribute('aria-expanded')).toBe('false');
    // The open drawer is now the left rail, labelled "Recent exports".
    expect(screen.getByRole('dialog', { name: 'Recent exports' })).toBeTruthy();
  });

  test('the toggle aria-controls references its drawer id', () => {
    render(<AppPage />);
    const optId = optionsToggle().getAttribute('aria-controls');
    const recId = recentToggle().getAttribute('aria-controls');
    expect(optId).toBeTruthy();
    expect(recId).toBeTruthy();
    fireEvent.click(optionsToggle());
    expect(document.getElementById(optId)).toBeTruthy();
    fireEvent.click(recentToggle());
    expect(document.getElementById(recId)).toBeTruthy();
  });
});
