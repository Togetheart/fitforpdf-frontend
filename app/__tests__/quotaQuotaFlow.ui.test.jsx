import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';

import LandingPage from '../page.jsx';

function configureMatchMedia({ mobile = false } = {}) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: () => ({
      matches: mobile,
      media: '(max-width: 768px)',
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => {},
    }),
  });
}

function mockFetch(responseFactory, defaultResponse = createJsonResponse(500, { error: 'unexpected fetch' })) {
  const originalFetch = global.fetch;
  const calls = [];
  const responseByUrl = typeof responseFactory === 'function' ? responseFactory : null;

  global.fetch = vi.fn((url, options = {}) => {
    calls.push({ url: String(url), options });
    const response = responseByUrl ? responseByUrl(String(url), options) : defaultResponse;
    return Promise.resolve(response || defaultResponse);
  });

  return {
    calls,
    restore: () => {
      global.fetch = originalFetch;
    },
  };
}

function createJsonResponse(status = 400, body = { error: 'bad request' }) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  });
}

function createQuotaResponse(payload = {
  plan_type: 'free',
  free_exports_left: 3,
  free: {
    limit: 3,
    remaining: 3,
  },
}) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  });
}

function createPdfResponse() {
  return new Response(new Blob(['%PDF-1.4'], { type: 'application/pdf' }), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': 'attachment; filename="customers-100.pdf"',
    },
  });
}

function toArrayBufferResponse(status, payload = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  });
}

function createRenderError(status, code) {
  return new Response(JSON.stringify({ error: 'quota exhausted', code }), {
    status,
    headers: {
      'content-type': 'application/json',
      'x-cleansheet-code': code,
    },
  });
}

async function advanceConversion(ms = 1900) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
    await Promise.resolve();
  });
}

const SAMPLE_FILE = new File(['a,b\n1,2'], 'report.csv', { type: 'text/csv' });

beforeEach(() => {
  configureMatchMedia({ mobile: false });
});

afterEach(() => {
  cleanup();
  if (vi.isFakeTimers()) {
    vi.useRealTimers();
  }
});

describe('quota-driven plan state and paywall flows', () => {
  test.each([
    {
      plan: 'free',
      quota: {
        plan_type: 'free',
        free_exports_left: 3,
        free: { limit: 3, remaining: 3 },
      },
      helperCopy: '3 free exports. No account required.',
      expected: 'Free · 3 exports left',
    },
    {
      plan: 'credits',
      quota: { plan_type: 'credits', free_exports_left: 12 },
      expected: 'Credits · 12 exports left',
    },
    {
      plan: 'pro',
      quota: { plan_type: 'pro', remaining_in_period: 7, period_limit: 500, used_in_period: 493 },
      expected: 'Pro · 7 exports left this month',
    },
  ])('badge renders correctly for $plan plan from /api/quota', async ({ quota, expected }) => {
    const mock = mockFetch((url) => {
      if (url.includes('/api/quota')) {
        return createQuotaResponse(quota);
      }
      return createJsonResponse(500, { error: 'unexpected' });
    });

    render(<LandingPage />);
    await waitFor(() => {
      expect(screen.getByTestId('quota-pill').textContent).toContain(expected);
    });
    expect(screen.queryByText('5 free exports. No account required.')).toBeNull();

    mock.restore();
  });

  test('pro plan shows top banner once with quota remaining', async () => {
    const mock = mockFetch((url) => {
      if (url.includes('/api/quota')) {
        return createQuotaResponse({
          plan_type: 'pro',
          remaining_in_period: 7,
          period_limit: 500,
          used_in_period: 493,
        });
      }
      return createJsonResponse(500, { error: 'unexpected' });
    });

    render(<LandingPage />);

    await waitFor(() => {
      expect(screen.getByTestId('pro-top-banner')).toBeTruthy();
    });

    const banners = screen.getAllByTestId('pro-top-banner');
    expect(banners).toHaveLength(1);
    expect(banners[0].textContent).toContain('Pro · 7 exports left this month');

    mock.restore();
  });

  test('free helper copy uses free.limit from quota', async () => {
    const mock = mockFetch((url) => {
      if (url.includes('/api/quota')) {
        return createQuotaResponse({
          plan_type: 'free',
          free_exports_left: 3,
          free: { limit: 3, remaining: 3 },
        });
      }
      return createJsonResponse(500, { error: 'unexpected' });
    });

    render(<LandingPage />);

    await waitFor(() => {
      expect(screen.getByText('3 free exports. No account required.')).toBeTruthy();
      expect(screen.getByTestId('quota-pill').textContent).toContain('Free · 3 exports left');
    });
    expect(screen.queryByText('5 free exports. No account required.')).toBeNull();

    mock.restore();
  });

  test('free users get inline upsell for branding and layout toggles', async () => {
    const mock = mockFetch((url) => {
      if (url.includes('/api/quota')) {
        return createQuotaResponse({
          plan_type: 'free',
          free_exports_left: 3,
          free: { limit: 3, remaining: 3 },
        });
      }
      return createJsonResponse(500, { error: 'unexpected' });
    });

    render(<LandingPage />);
    await waitFor(() => {
      expect(screen.getByTestId('quota-pill')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Advanced options' }));
    const brandingTitle = within(screen.getByTestId('setting-row-branding')).getByText('Branding');
    fireEvent.click(brandingTitle);

    expect(screen.getByTestId('branding-upgrade-nudge')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Buy credits' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Go Pro' })).toBeTruthy();

    const layoutTitle = within(screen.getByTestId('setting-row-overview')).getByText('Keep overview');
    fireEvent.click(layoutTitle);
    expect(screen.getByTestId('branding-upgrade-nudge')).toBeTruthy();

    mock.restore();
  });

  test('credits plan can toggle branding and layout controls', async () => {
    const mock = mockFetch((url) => {
      if (url.includes('/api/quota')) {
        return createQuotaResponse({ plan_type: 'credits', free_exports_left: 6 });
      }
      return createJsonResponse(500, { error: 'unexpected' });
    });

    render(<LandingPage />);
    await waitFor(() => {
      expect(screen.getByText('Credits · 6 exports left')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Advanced options' }));
    const brandingSwitch = screen.getByRole('switch', { name: 'Branding' });
    const overviewSwitch = screen.getByRole('switch', { name: 'Keep overview' });
    expect(screen.queryByTestId('branding-upgrade-nudge')).toBeNull();

    fireEvent.click(brandingSwitch);
    fireEvent.click(overviewSwitch);

    expect(brandingSwitch.getAttribute('aria-checked')).toBe('false');
    expect(overviewSwitch.getAttribute('aria-checked')).toBe('false');
    expect(screen.queryByTestId('branding-upgrade-nudge')).toBeNull();

    mock.restore();
  });

  test('credits panel lists both pack options and calls checkout endpoint', async () => {
    const mock = mockFetch((url, options = {}) => {
      if (url.includes('/api/quota')) {
        return createQuotaResponse({ plan_type: 'free', free_exports_left: 1 });
      }
      if (url.includes('/api/credits/purchase/checkout')) {
        const body = JSON.parse(options.body || '{}');
        expect(body.pack).toBeDefined();
        return createJsonResponse(501, { error: 'coming soon' });
      }
      return createJsonResponse(500, { error: 'unexpected' });
    });

    render(<LandingPage />);
    await waitFor(() => expect(screen.getByTestId('quota-pill').textContent).toContain('Free · 1 exports left'));
    const buyIconButton = screen.getByRole('button', { name: 'Buy credits' });
    fireEvent.click(buyIconButton);

    const panel = await screen.findByTestId('credits-purchase-panel');
    expect(panel).toBeTruthy();

    // Verify pack buttons exist (CREDIT_PACKS: 1 export / 10 exports / 100 exports)
    const packButtons = within(panel).getAllByRole('button').filter(
      (btn) => btn.textContent && /exports?/i.test(btn.textContent),
    );
    expect(packButtons.length).toBeGreaterThanOrEqual(2);
    fireEvent.click(packButtons[0]);

    await waitFor(() => {
      const checkoutCall = mock.calls.find((call) => call.url.includes('/api/credits/purchase/checkout'));
      expect(!!checkoutCall).toBe(true);
      expect(checkoutCall.options.method).toBe('POST');
      const packId = JSON.parse(checkoutCall.options.body).pack;
      expect(['credits_1', 'credits_10', 'credits_100']).toContain(packId);
      // Panel stays open with the error message shown inside
      const panel = screen.getByTestId('credits-purchase-panel');
      expect(panel).toBeTruthy();
      expect(panel.textContent).toContain('Payments coming soon. Contact us.');
    });

    mock.restore();
  });

  test('Go Pro button triggers pro checkout endpoint', async () => {
    const mock = mockFetch((url) => {
      if (url.includes('/api/quota')) {
        return createQuotaResponse({
          plan_type: 'free',
          free_exports_left: 3,
          free: { limit: 3, remaining: 3 },
        });
      }
      if (url.includes('/api/plan/pro/checkout')) {
        return createJsonResponse(501, { error: 'coming soon' });
      }
      return createJsonResponse(500, { error: 'unexpected' });
    });

    render(<LandingPage />);
    await waitFor(() => expect(screen.getByTestId('quota-pill')).toBeTruthy());

    // Open Advanced options to access the upgrade nudge
    fireEvent.click(screen.getByRole('button', { name: 'Advanced options' }));
    const brandingTitle = within(screen.getByTestId('setting-row-branding')).getByText('Branding');
    fireEvent.click(brandingTitle);

    expect(screen.getByTestId('branding-upgrade-nudge')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Go Pro' }));

    await waitFor(() => {
      const checkoutCall = mock.calls.find((call) => call.url.includes('/api/plan/pro/checkout'));
      expect(!!checkoutCall).toBe(true);
      expect(checkoutCall.options.method).toBe('POST');
      // purchaseMessage is set internally but only shown inside credits-purchase-panel
      // which is not open in this flow — just verify no confusing technical error is shown
      expect(screen.queryByText('Stripe checkout is not connected yet.')).toBeNull();
    });

    mock.restore();
  });

  test('free_quota_exhausted 402 updates badge, paywall, and keeps buy-credits icon', async () => {
    const mock = mockFetch((url, options = {}) => {
      if (url.includes('/api/quota')) {
        return createQuotaResponse({ plan_type: 'free', free_exports_left: 1 });
      }
      if (url.includes('/api/render')) {
        return createRenderError(402, 'free_quota_exhausted');
      }
      return createJsonResponse(500, { error: 'unexpected' });
    });

    render(<LandingPage />);
    fireEvent.change(screen.getByTestId('generate-file-input'), {
      target: { files: [SAMPLE_FILE] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Generate PDF' }));

    await waitFor(() => {
      expect(screen.getByTestId('quota-pill').textContent).toMatch(/Free · 0 exports left/i);
      expect(screen.getByTestId('upload-paywall')).toBeTruthy();
      expect(screen.getByTestId('quota-buy-slot').querySelector('button[aria-label="Buy credits"]')).toBeTruthy();
    });

    mock.restore();
  });

  test('free flow: 3 -> 2 -> 1 -> 0 then paywall, with stable non-technical block', async () => {
    const quotaSnapshots = [
      { plan_type: 'free', free_exports_left: 3 },
      { plan_type: 'free', free_exports_left: 2 },
      { plan_type: 'free', free_exports_left: 1 },
      { plan_type: 'free', free_exports_left: 0 },
    ];
    let quotaIndex = 0;

    const mock = mockFetch((url) => {
      if (url.includes('/api/quota')) {
        const snapshot = quotaSnapshots[Math.min(quotaIndex, quotaSnapshots.length - 1)];
        quotaIndex += 1;
        return createQuotaResponse(snapshot);
      }
      if (url.includes('/api/render')) {
        return createPdfResponse();
      }
      return createJsonResponse(500, { error: 'unexpected request' });
    });

    render(<LandingPage />);
    const fileInput = screen.getByTestId('generate-file-input');
    const fileSelect = { target: { files: [SAMPLE_FILE] } };

    await waitFor(() => {
      expect(screen.getByTestId('quota-pill').textContent).toContain('Free · 3 exports left');
    }, { timeout: 2000 });

  async function runOneExport({
    remainingLabel,
    expectPaywallAfter = false,
  }) {
    const beforeRenderCalls = mock.calls.filter((call) => String(call.url).includes('/api/render')).length;

    fireEvent.change(fileInput, fileSelect);

    const uploadCard = screen.getByTestId('upload-card');
    const form = uploadCard.querySelector('form');
    expect(form).toBeTruthy();
    fireEvent.submit(form);

    if (expectPaywallAfter) {
      await waitFor(() => {
        expect(screen.getByTestId('upload-paywall')).toBeTruthy();
        expect(screen.getByTestId('quota-pill').textContent).toContain(remainingLabel);
      }, { timeout: 4000 });
      return;
    }

    await waitFor(() => {
      expect(screen.getByText('Download again')).toBeTruthy();
    }, { timeout: 4000 });

      await waitFor(() => {
        expect(mock.calls.filter((call) => String(call.url).includes('/api/render')).length)
          .toBe(beforeRenderCalls + 1);
      }, { timeout: 2000 });

    await waitFor(() => {
      expect(screen.getByTestId('quota-pill').textContent).toContain(remainingLabel);
    }, { timeout: 2000 });

    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
  }

    await runOneExport({ remainingLabel: 'Free · 2 exports left' });
    await runOneExport({ remainingLabel: 'Free · 1 exports left' });
    await runOneExport({
      remainingLabel: 'Free · 0 exports left',
      expectPaywallAfter: true,
    });

    await waitFor(() => {
      expect(screen.getByTestId('upload-paywall')).toBeTruthy();
    }, { timeout: 2000 });
    // Paywall shows PAYWALL_PACKS buttons (10 exports/$15, 100 exports/$49), not 'Buy credits'/'Go Pro'
    const paywallButtons = within(screen.getByTestId('upload-paywall')).getAllByRole('button');
    expect(paywallButtons.length).toBeGreaterThanOrEqual(2);
    // Generate PDF button is not rendered when paywall is shown
    expect(screen.queryByRole('button', { name: 'Generate PDF' })).toBeNull();

    const renderCallsBeforeFourthAttempt = mock.calls.filter((call) => String(call.url).includes('/api/render')).length;
    const generateButton = screen.queryByRole('button', { name: 'Generate PDF' });
    const form = screen.getByTestId('upload-card').querySelector('form');
    if (generateButton && !generateButton.disabled) {
      fireEvent.click(generateButton);
    } else {
      fireEvent.submit(form);
    }
    expect(
      mock.calls.filter((call) => String(call.url).includes('/api/render')).length,
    ).toBe(renderCallsBeforeFourthAttempt);

    const renderCalls = mock.calls.filter((call) => String(call.url).includes('/api/render'));
    expect(renderCalls).toHaveLength(3);
    expect(quotaIndex).toBeGreaterThanOrEqual(4);
    mock.restore();
  }, 20000);
});
