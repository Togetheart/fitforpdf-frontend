import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import AppPage from '../app/page.jsx';

/**
 * The /app workbench dropzone (WorkbenchDropzone) calls handleSubmit but, before
 * this fix, rendered conversion.error / page-burden recommendations NOWHERE — so a
 * failed render (422 page_burden, 400, etc.) looked like a dead button ("comme si
 * il se passait rien"). These lock that the failure is actually surfaced.
 */

const REAL_FILE = new File(['col1,col2\n1,2'], 'real.csv', { type: 'text/csv' });

function quotaResponse() {
  return new Response(JSON.stringify({ plan_type: 'free', free_exports_left: 9 }), {
    status: 200, headers: { 'content-type': 'application/json' },
  });
}

function pageBurdenResponse() {
  return new Response(JSON.stringify({
    error: 'Projected page count is too high for a sendable PDF.',
    estimatedPages: 246,
    recommendations: ['mode_compact', 'scope_reduce'],
    confidence: { score: 35, verdict: 'FAIL', reasons: ['page_burden_high'] },
  }), { status: 422, headers: { 'content-type': 'application/json' } });
}

function genericErrorResponse() {
  return new Response(JSON.stringify({ error: 'Boom specific error' }), {
    status: 400, headers: { 'content-type': 'application/json' },
  });
}

let renderResponder;
function installFetch() {
  const original = global.fetch;
  global.fetch = vi.fn(async (url) => {
    const u = String(url);
    if (u.includes('/api/render')) return renderResponder();
    if (u.includes('/api/quota')) return quotaResponse();
    return new Response('', { status: 404 });
  });
  return () => { global.fetch = original; };
}

let restoreFetch;
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true, configurable: true,
    value: () => ({ matches: false, media: '', addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {}, dispatchEvent: () => {} }),
  });
  if (typeof URL.createObjectURL !== 'function') URL.createObjectURL = () => 'blob:mock';
  if (typeof URL.revokeObjectURL !== 'function') URL.revokeObjectURL = () => {};
  restoreFetch = installFetch();
});
afterEach(() => { restoreFetch?.(); cleanup(); vi.restoreAllMocks(); });

async function selectFileAndGenerate() {
  render(<AppPage />);
  const input = document.querySelector('[data-testid="generate-file-input"]');
  await act(async () => { fireEvent.change(input, { target: { files: [REAL_FILE] } }); });
  const generate = await screen.findByRole('button', { name: /Generate PDF/i });
  await act(async () => { fireEvent.click(generate); });
}

describe('/app workbench dropzone surfaces render failures', () => {
  test('page-burden (422) shows the failure + an actionable recommendation, not silence', async () => {
    renderResponder = pageBurdenResponse;
    await selectFileAndGenerate();

    const box = await screen.findByTestId('generate-error');
    // The compact recommendation must be visible (recommendationLabel('mode_compact')).
    expect(within(box).getByText(/compact/i)).toBeTruthy();
    // And no PDF preview should be claimed.
    expect(screen.queryByTestId('app-pdf-preview')).toBeNull();
  });

  test('generic 400 error message is shown in the dropzone', async () => {
    renderResponder = genericErrorResponse;
    await selectFileAndGenerate();

    const box = await screen.findByTestId('generate-error');
    expect(within(box).getByText(/Boom specific error/i)).toBeTruthy();
  });
});
