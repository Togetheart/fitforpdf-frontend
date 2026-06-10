import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';

import AppPage from '../app/page.jsx';

/*
 * Quota → paywall → checkout flows, on the /app workbench.
 *
 * S1 sprint (2026-06-10): the V1 inline tool left the landing, and with it the
 * home-mounted flow specs (quotaQuotaFlow / freeQuotaPaywallFlow /
 * checkoutRedirectFlow / premiumSample / homeConversion / homeDemoGlass).
 * The /app workbench is now the ONLY conversion surface, so the page-level
 * money paths are asserted here: plan badge from /api/quota, the quota-locked
 * paywall block, and the Stripe checkout redirect. Component-level UploadCard
 * mechanics keep their own specs (uploadCard*.test.jsx).
 */

const REAL_FILE = new File(['col1,col2\n1,2'], 'real.csv', { type: 'text/csv' });
const STRIPE_CHECKOUT_URL = 'https://checkout.stripe.com/c/pay/cs_test_workbench';

function configureMatchMedia({ mobile = false } = {}) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true, configurable: true,
    value: () => ({ matches: mobile, media: '', addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {}, dispatchEvent: () => {} }),
  });
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

let fetchCalls;
let quotaPayload;

function installFetch() {
  fetchCalls = [];
  const original = global.fetch;
  global.fetch = vi.fn(async (url, options = {}) => {
    const u = String(url);
    fetchCalls.push({ url: u, options });
    if (u.includes('/api/quota')) return jsonResponse(quotaPayload);
    if (u.includes('/api/credits/purchase/checkout')) {
      return jsonResponse({ url: STRIPE_CHECKOUT_URL });
    }
    return new Response('', { status: 404 });
  });
  return () => { global.fetch = original; };
}

let restoreFetch;
let originalLocation;

beforeEach(() => {
  configureMatchMedia({ mobile: false });
  if (typeof URL.createObjectURL !== 'function') URL.createObjectURL = () => 'blob:mock';
  if (typeof URL.revokeObjectURL !== 'function') URL.revokeObjectURL = () => {};
  // jsdom cannot navigate; stub location so window.location.assign is spyable.
  originalLocation = window.location;
  Object.defineProperty(window, 'location', {
    writable: true, configurable: true,
    value: { assign: vi.fn(), href: 'http://localhost/app', search: '', origin: 'http://localhost' },
  });
  quotaPayload = { plan_type: 'free', free_exports_left: 3, free: { limit: 3, remaining: 3 } };
  restoreFetch = installFetch();
});

afterEach(() => {
  restoreFetch?.();
  Object.defineProperty(window, 'location', { writable: true, configurable: true, value: originalLocation });
  cleanup();
  vi.restoreAllMocks();
});

async function findPlanBadge() {
  return waitFor(() => {
    const badge = screen.getByTestId('plan-badge');
    expect(badge).toBeTruthy();
    return badge;
  }, { timeout: 3000 });
}

describe('/app workbench, quota badge from /api/quota', () => {
  test("free plan renders the 'Free · N exports' chip", async () => {
    quotaPayload = { plan_type: 'free', free_exports_left: 3, free: { limit: 3, remaining: 3 } };
    render(<AppPage />);
    const badge = await findPlanBadge();
    expect(badge.textContent).toContain('Free · 3 exports');
  });

  test('credits plan renders the remaining-credits chip', async () => {
    quotaPayload = { plan_type: 'credits', free_exports_left: 12 };
    render(<AppPage />);
    const badge = await findPlanBadge();
    expect(badge.textContent).toContain('12 credits');
  });

  test('pro plan renders the Pro chip (never flashes Free)', async () => {
    quotaPayload = { plan_type: 'pro', free_exports_left: 0 };
    render(<AppPage />);
    const badge = await findPlanBadge();
    expect(badge.textContent).toContain('Pro · 500/mo');
  });
});

describe('/app workbench, conversion flow behaviors ported from the V1 landing specs', () => {
  function pdfResponse() {
    return new Response(new Blob(['%PDF-1.4'], { type: 'application/pdf' }), {
      status: 200,
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': 'attachment; filename="out.pdf"',
        'x-render-id': 'rid_flow',
        'x-cleansheet-score': '95',
        'x-cleansheet-verdict': 'OK',
        'x-cleansheet-sections': JSON.stringify([
          { label: 'A', title: 'Customer info', columns: ['Region', 'Plan'] },
        ]),
      },
    });
  }

  function sampleCsvResponse() {
    return new Response('invoice_id,client\nINV-1,Acme', {
      status: 200,
      headers: {
        'content-type': 'text/csv',
        'content-disposition': 'attachment; filename="enterprise-invoices-demo.csv"',
      },
    });
  }

  function installFlowFetch() {
    const original = global.fetch;
    const calls = [];
    let renders = 0;
    global.fetch = vi.fn(async (url, options = {}) => {
      const u = String(url);
      calls.push({ url: u, options });
      if (u.includes('/api/quota')) {
        // Server-truth decrement: useConversion re-syncs /api/quota after a
        // successful render (useConversion.mjs:659), so the mock must count.
        const left = Math.max(0, (quotaPayload.free_exports_left ?? 3) - renders);
        return jsonResponse({ ...quotaPayload, free_exports_left: left, free: { ...(quotaPayload.free || {}), remaining: left } });
      }
      if (u.includes('/api/sample/premium')) return sampleCsvResponse();
      if (u.includes('/api/render')) {
        renders += 1;
        return pdfResponse();
      }
      return new Response('', { status: 404 });
    });
    return { calls, restore: () => { global.fetch = original; } };
  }

  test('sample sandbox: Try a sample → Render this sample fetches the demo CSV then renders it', async () => {
    const flow = installFlowFetch();
    render(<AppPage />);
    await findPlanBadge();

    const expander = await screen.findByRole('button', { name: /Try a sample/i });
    await act(async () => { fireEvent.click(expander); });
    const renderSample = await screen.findByRole('button', { name: /Render this sample/i });
    await act(async () => { fireEvent.click(renderSample); });

    await waitFor(() => {
      expect(flow.calls.some((c) => c.url.includes('/api/sample/premium'))).toBe(true);
      expect(flow.calls.some((c) => c.url.includes('/api/render'))).toBe(true);
    }, { timeout: 3000 });

    const renderCall = flow.calls.find((c) => c.url.includes('/api/render'));
    expect(renderCall.options.method).toBe('POST');
    expect(renderCall.options.body).toBeInstanceOf(FormData);
    expect(renderCall.options.headers['X-FitForPDF-Source-Filename']).toBe('enterprise-invoices-demo.csv');
    flow.restore();
  });

  test('double click on Generate PDF triggers only one /api/render while in-flight', async () => {
    const flow = installFlowFetch();
    render(<AppPage />);
    await findPlanBadge();

    const input = document.querySelector('[data-testid="generate-file-input"]');
    await act(async () => {
      fireEvent.change(input, { target: { files: [REAL_FILE] } });
    });
    const generate = await screen.findByRole('button', { name: /Generate PDF/i });
    await act(async () => {
      fireEvent.click(generate);
      fireEvent.click(generate);
    });

    await waitFor(() => {
      expect(flow.calls.filter((c) => c.url.includes('/api/render')).length).toBe(1);
    }, { timeout: 3000 });
    // Give any double-fire a chance to surface before asserting the final count.
    await new Promise((r) => setTimeout(r, 50));
    expect(flow.calls.filter((c) => c.url.includes('/api/render')).length).toBe(1);
    flow.restore();
  });

  test('free quota chip decrements after a successful render (3 → 2)', async () => {
    const flow = installFlowFetch();
    quotaPayload = { plan_type: 'free', free_exports_left: 3, free: { limit: 3, remaining: 3 } };
    render(<AppPage />);
    const badge = await findPlanBadge();
    expect(badge.textContent).toContain('Free · 3 exports');

    const input = document.querySelector('[data-testid="generate-file-input"]');
    await act(async () => {
      fireEvent.change(input, { target: { files: [REAL_FILE] } });
    });
    const generate = await screen.findByRole('button', { name: /Generate PDF/i });
    await act(async () => { fireEvent.click(generate); });

    await waitFor(() => {
      expect(screen.getByTestId('plan-badge').textContent).toContain('Free · 2 exports');
    }, { timeout: 3000 });
    flow.restore();
  });
});

describe('/app workbench, quota-locked paywall', () => {
  test('exhausted free quota + selected file shows the paywall block and disables Generate', async () => {
    quotaPayload = { plan_type: 'free', free_exports_left: 0, free: { limit: 3, remaining: 0 } };
    render(<AppPage />);
    await findPlanBadge();

    const input = document.querySelector('[data-testid="generate-file-input"]');
    expect(input).toBeTruthy();
    await act(async () => {
      fireEvent.change(input, { target: { files: [REAL_FILE] } });
    });

    const paywall = await screen.findByTestId('workbench-quota-paywall');
    expect(paywall.textContent).toContain("You've used your free exports.");

    const generate = screen.queryByRole('button', { name: /Generate PDF/i });
    if (generate) expect(generate.disabled).toBe(true);
    // No render must have fired.
    expect(fetchCalls.some((c) => c.url.includes('/api/render'))).toBe(false);
  });

  test('paywall pack button POSTs checkout and redirects the browser to Stripe', async () => {
    quotaPayload = { plan_type: 'free', free_exports_left: 0, free: { limit: 3, remaining: 0 } };
    render(<AppPage />);
    await findPlanBadge();

    const input = document.querySelector('[data-testid="generate-file-input"]');
    await act(async () => {
      fireEvent.change(input, { target: { files: [REAL_FILE] } });
    });

    const paywall = await screen.findByTestId('workbench-quota-paywall');
    const packButton = paywall.querySelector('button');
    expect(packButton).toBeTruthy();
    await act(async () => { fireEvent.click(packButton); });

    await waitFor(() => {
      expect(fetchCalls.some((c) => c.url.includes('/api/credits/purchase/checkout'))).toBe(true);
    }, { timeout: 3000 });
    await waitFor(() => {
      expect(window.location.assign).toHaveBeenCalledWith(STRIPE_CHECKOUT_URL);
    }, { timeout: 3000 });
  });
});
