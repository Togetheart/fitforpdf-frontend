import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';

import AppPage from '../app/page.jsx';

/**
 * Defect 28 — mobile operability.
 *
 * On a mobile viewport (matchMedia matches:true) the inspector controls must
 * remain *reachable and operable* — not pixel-perfect. JSDOM does not apply CSS
 * layout, so this is a reachability/operability test, not a layout test: the
 * Report title input is present and editable, the column-grouping toggle buttons
 * are present and clickable (clicking 'Off' flips its aria-pressed to true), and
 * the left rail exists in the DOM without the page throwing.
 *
 * Uses the real useConversion hook with a mocked global.fetch (helpers copied
 * from appWorkbench.e2e.test.jsx).
 */

function pdfResponse() {
  return new Response(new Blob(['%PDF-1.4'], { type: 'application/pdf' }), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': 'attachment; filename="out.pdf"',
      'x-render-id': 'rid_mobile',
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

function configureMatchMedia({ mobile = false } = {}) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true, configurable: true,
    value: () => ({ matches: mobile, media: '', addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {}, dispatchEvent: () => {} }),
  });
}

let restoreFetch;
beforeEach(() => {
  // Mobile viewport for every test in this file.
  configureMatchMedia({ mobile: true });
  if (typeof URL.createObjectURL !== 'function') URL.createObjectURL = () => 'blob:mock';
  if (typeof URL.revokeObjectURL !== 'function') URL.revokeObjectURL = () => {};
  restoreFetch = installFetch();
});
afterEach(() => {
  restoreFetch?.();
  cleanup();
  vi.restoreAllMocks();
});

describe('/app workbench — mobile operability (Defect 28)', () => {
  test('renders on a mobile viewport without throwing, with the left rail in the DOM', () => {
    expect(() => render(<AppPage />)).not.toThrow();
    // The left rail is hidden via CSS on mobile (hidden lg:flex) but must still
    // be present in the DOM — reachability, not pixel layout.
    expect(screen.getByTestId('app-left-rail')).toBeTruthy();
    // The inspector that houses the controls is also mounted.
    expect(screen.getByTestId('app-inspector')).toBeTruthy();
  });

  test('Report title input is present and editable on mobile', () => {
    render(<AppPage />);
    const titleInput = screen.getByLabelText(/Report title/i);
    expect(titleInput).toBeTruthy();
    // Editable: a change event must update the controlled value.
    fireEvent.change(titleInput, { target: { value: 'Mobile report' } });
    expect(titleInput.value).toBe('Mobile report');
  });

  test('column grouping toggle buttons are present and clickable; clicking Off sets aria-pressed true', () => {
    render(<AppPage />);
    const group = screen.getByTestId('app-columnmap');
    expect(group).toBeTruthy();

    const buttons = within(group).getAllByRole('button');
    // Off / Auto (Force retired).
    expect(buttons.length).toBe(2);

    const offButton = within(group).getByRole('button', { name: /^Off$/i });
    // Default columnMap is 'auto', so Off starts unpressed.
    expect(offButton.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(offButton);
    // After the click the Off toggle is the active/pressed control.
    expect(offButton.getAttribute('aria-pressed')).toBe('true');
  });
});
