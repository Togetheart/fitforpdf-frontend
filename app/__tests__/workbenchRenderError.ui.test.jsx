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

  test('page-burden offers "Condense long text & retry" which re-renders with truncate_long_text=true', async () => {
    renderResponder = pageBurdenResponse;
    await selectFileAndGenerate();
    await screen.findByTestId('generate-error');

    const retry = await screen.findByTestId('generate-condense-retry');
    // The render settles after a minimum progress delay; wait until it's clickable
    // (its label flips "Condensing…" → "Condense long text & retry" at the same time).
    await waitFor(() => expect(retry.disabled).toBe(false), { timeout: 3000 });
    expect(retry.textContent).toMatch(/Condense long text & retry/i);

    // The condensed re-render succeeds.
    renderResponder = () => new Response(new Blob(['%PDF-1.4'], { type: 'application/pdf' }), {
      status: 200,
      headers: { 'content-type': 'application/pdf', 'content-disposition': 'attachment; filename="out.pdf"' },
    });
    await act(async () => { fireEvent.click(retry); });

    await waitFor(() => {
      const renderUrls = global.fetch.mock.calls
        .map((c) => String(c[0]))
        .filter((u) => u.includes('/api/render'));
      expect(renderUrls.length).toBeGreaterThanOrEqual(2);
      // The retry render must carry the condense flag the backend gate reads.
      expect(renderUrls[renderUrls.length - 1]).toMatch(/truncate_long_text=true/);
    }, { timeout: 3000 });

    // Free user + condensed result → honest upgrade nudge (gate the fidelity, not the fix).
    expect(await screen.findByTestId('condensed-upgrade-note')).toBeTruthy();
  });

  test('a low-quality (FAIL) long-text render UNDER the cap surfaces the condense recovery', async () => {
    // 200 OK PDF, but quality FAIL from long-text wrap/overflow (the 98-page case):
    // under the page-burden cap, so no 422 — the recovery must still be offered.
    renderResponder = () => new Response(new Blob(['%PDF-1.4'], { type: 'application/pdf' }), {
      status: 200,
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': 'attachment; filename="out.pdf"',
        'x-cleansheet-verdict': 'FAIL',
        'x-cleansheet-score': '55',
        'x-cleansheet-reasons': 'wrap_severe,overflow_cells',
      },
    });
    await selectFileAndGenerate();

    const btn = await screen.findByTestId('condense-recovery-btn');
    await waitFor(() => expect(btn.disabled).toBe(false), { timeout: 3000 });

    // Reworded into a neutral notice — not the old alarmist "long and dense /
    // quality score" copy, and the CTA speaks to the actual effect.
    expect(btn.textContent).toMatch(/Condense and update preview/i);
    const advisory = screen.getByTestId('condense-recovery');
    expect(advisory.textContent).toMatch(/Condensing long cells may shorten this PDF/i);
    expect(advisory.textContent).not.toMatch(/quality score/i);
    // No debug metrics on this response → the page-count fallback copy renders.
    expect(advisory.textContent).toMatch(/This PDF came out long\./);

    // Clicking re-renders the same file with the condense flag.
    renderResponder = () => new Response(new Blob(['%PDF-1.4'], { type: 'application/pdf' }), {
      status: 200,
      headers: { 'content-type': 'application/pdf', 'content-disposition': 'attachment; filename="out.pdf"' },
    });
    await act(async () => { fireEvent.click(btn); });
    await waitFor(() => {
      const urls = global.fetch.mock.calls.map((c) => String(c[0])).filter((u) => u.includes('/api/render'));
      expect(urls.length).toBeGreaterThanOrEqual(2);
      expect(urls[urls.length - 1]).toMatch(/truncate_long_text=true/);
    }, { timeout: 3000 });
  });

  test('the recovery advisory reports the page count when debug metrics carry it', async () => {
    // Same FAIL-under-cap case, but the response carries debug metrics → the
    // advisory's primary "{N} pages generated." branch renders (not the fallback).
    renderResponder = () => new Response(new Blob(['%PDF-1.4'], { type: 'application/pdf' }), {
      status: 200,
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': 'attachment; filename="out.pdf"',
        'x-cleansheet-verdict': 'FAIL',
        'x-cleansheet-score': '55',
        'x-cleansheet-reasons': 'wrap_severe,overflow_cells',
        'x-cleansheet-debug-metrics': JSON.stringify({ pageCount: 98 }),
      },
    });
    await selectFileAndGenerate();

    const advisory = await screen.findByTestId('condense-recovery');
    expect(advisory.textContent).toMatch(/98 pages generated\./);
    expect(advisory.textContent).not.toMatch(/came out long/i);
  });
});
