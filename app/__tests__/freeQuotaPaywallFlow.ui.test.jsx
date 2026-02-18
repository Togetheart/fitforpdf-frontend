import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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

function createJsonResponse(status = 400, body = { error: 'bad request' }) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  });
}

function createQuotaResponse(payload) {
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

function createFreeQuotaErrorResponse() {
  return new Response(JSON.stringify({
    error: 'quota exhausted',
    code: 'free_quota_exhausted',
  }), {
    status: 402,
    headers: {
      'content-type': 'application/json',
      'x-cleansheet-code': 'free_quota_exhausted',
    },
  });
}

function parseRemainingFromBadge(text = '') {
  const match = /(\d+)\s*exports?\s*left/i.exec(text);
  if (!match) return null;
  const value = Number.parseInt(match[1], 10);
  return Number.isFinite(value) ? value : null;
}

function createDeterministicFetch({
  quotaStart = 3,
  renderOutcomes = ['pdf'],
}) {
  let quotaCallIndex = 0;
  let renderCallIndex = 0;
  const calls = [];
  const renderQueue = renderOutcomes.slice();
  const originalFetch = global.fetch;

  function resolveQuotaSnapshot() {
    const quotaRemaining = Math.max(0, quotaStart - quotaCallIndex);
    return { plan_type: 'free', free_exports_left: quotaRemaining };
  }

  global.fetch = vi.fn((url, options = {}) => {
    const target = String(url);
    calls.push({ url: target, options });

    if (target.includes('/api/quota')) {
      const snapshot = resolveQuotaSnapshot();
      quotaCallIndex += 1;
      return Promise.resolve(createQuotaResponse(snapshot));
    }

    if (target.includes('/api/render')) {
      const next = renderQueue[Math.min(renderCallIndex, renderQueue.length - 1)];
      renderCallIndex += 1;
      if (next === 'pdf') return Promise.resolve(createPdfResponse());
      if (next === 'free_quota_exhausted') return Promise.resolve(createFreeQuotaErrorResponse());
      return Promise.resolve(createJsonResponse(500, { error: 'unexpected render response' }));
    }

    return Promise.resolve(createJsonResponse(500, { error: 'unexpected endpoint' }));
  });

  return {
    calls,
    restore: () => {
      global.fetch = originalFetch;
    },
    getQuotaCallCount: () => calls.filter((call) => call.url.includes('/api/quota')).length,
    getRenderCallCount: () => calls.filter((call) => call.url.includes('/api/render')).length,
  };
}

const SAMPLE_FILE = new File(['a,b\n1,2'], 'report.csv', { type: 'text/csv' });

beforeEach(() => {
  configureMatchMedia({ mobile: false });
});

afterEach(() => {
  cleanup();
});

describe('free plan strict quota journey', () => {
    test('three free renders then immediate paywall at 0', async () => {
    const mock = createDeterministicFetch({
      quotaStart: 3,
      renderOutcomes: ['pdf', 'pdf', 'pdf', 'free_quota_exhausted'],
    });

    render(<LandingPage />);

    const getBadgeText = () => screen.getByTestId('quota-pill').textContent;
    const getRemaining = () => parseRemainingFromBadge(getBadgeText());
    const getForm = () => screen.getByTestId('upload-card').querySelector('form');

    await waitFor(() => {
      expect(screen.getByTestId('quota-pill').textContent).toMatch(/Free ·\s*3\s*exports?\s*left/i);
      expect(screen.getByRole('button', { name: 'Generate PDF' })).toBeTruthy();
      expect(screen.queryByTestId('upload-paywall')).toBeNull();
      expect(screen.queryByText(/free_quota_exhausted/i)).toBeNull();
      expect(screen.queryByText(/^Error$/i)).toBeNull();
    });

    const runExport = async ({
      expectedBadgeAfter,
      retainForNextAttempt = false,
      expectPaywallAfter = false,
    }) => {
      const fileInput = screen.getByTestId('generate-file-input');
      fireEvent.change(fileInput, { target: { files: [SAMPLE_FILE] } });
      const generateButton = screen.getByRole('button', { name: 'Generate PDF' });
      const beforeRenderCalls = mock.getRenderCallCount();
      const remainingBefore = getRemaining();

      expect(remainingBefore).toBeGreaterThanOrEqual(0);

      fireEvent.click(generateButton);
      expect(generateButton.disabled).toBe(true);

      const badgeBefore = getBadgeText();
      expect(parseRemainingFromBadge(badgeBefore)).toBe(remainingBefore);

      // Ensure no double-submit while loading.
      fireEvent.click(generateButton);
      expect(mock.getRenderCallCount()).toBe(beforeRenderCalls + 1);

      if (expectPaywallAfter) {
        await waitFor(() => {
          expect(screen.getByText(/0\s*exports\s*left/i)).toBeTruthy();
          expect(screen.getByTestId('upload-paywall')).toBeTruthy();
        });
        return;
      }

      await waitFor(() => {
        const doneButton = screen.getByTestId('download-again');
        expect(doneButton).toBeTruthy();
        expect(doneButton.disabled).toBe(false);
      }, { timeout: 3000 });

      await waitFor(() => {
        const expectedRegex = new RegExp(`Free ·\\s*${expectedBadgeAfter}\\s*exports?\\s*left`, 'i');
        expect(screen.getByTestId('quota-pill').textContent).toMatch(expectedRegex);
        expect(getRemaining()).toBeGreaterThanOrEqual(0);
        expect(screen.queryByText(/free_quota_exhausted/i)).toBeNull();
      });

      if (retainForNextAttempt) {
        return;
      }

      fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
      await waitFor(() => {
        expect(screen.queryByTestId('download-again')).toBeNull();
      });
    };

    await runExport({ expectedBadgeAfter: 2 });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Generate PDF' })).toBeTruthy());

    await runExport({ expectedBadgeAfter: 1 });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Generate PDF' })).toBeTruthy());

    await runExport({
      expectedBadgeAfter: 0,
      retainForNextAttempt: true,
      expectPaywallAfter: true,
    });

    await waitFor(() => {
      expect(screen.getByTestId('upload-paywall')).toBeTruthy();
    });
    const paywallAfterFinal = screen.getByTestId('upload-paywall');
    expect(within(paywallAfterFinal).getByRole('button', { name: 'Buy credits' })).toBeTruthy();
    expect(within(paywallAfterFinal).getByRole('button', { name: 'Go Pro' })).toBeTruthy();
    expect(paywallAfterFinal.textContent).toMatch(/reached your exports limit for this plan|free export limit|reached your free export limit/i);

    await waitFor(() => {
      expect(screen.getByTestId('upload-paywall')).toBeTruthy();
      expect(screen.queryByLabelText('Buy credits')).toBeTruthy();
      expect(screen.getByText(/0\s*exports\s*left/i)).toBeTruthy();
    });

    const fileInput = screen.getByTestId('generate-file-input');
    fireEvent.change(fileInput, { target: { files: [SAMPLE_FILE] } });
    const form = getForm();
    const renderCallsBeforeFourtthAttempt = mock.getRenderCallCount();
    const generateButton = screen.queryByRole('button', { name: 'Generate PDF' });

    if (generateButton && !generateButton.disabled) {
      fireEvent.click(generateButton);
    } else {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mock.getRenderCallCount()).toBe(renderCallsBeforeFourtthAttempt);
      expect(screen.getByTestId('upload-paywall')).toBeTruthy();
      expect(screen.queryByText(/free_quota_exhausted/i)).toBeNull();
      expect(screen.queryByText(/^Error$/i)).toBeNull();
      expect(screen.getByTestId('upload-paywall').textContent).toMatch(/Buy credits/);
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Buy credits')).toBeTruthy();
      expect(screen.queryByText(/free_quota_exhausted/i)).toBeNull();
      expect(screen.queryByText(/^Error$/i)).toBeNull();
    });

    expect(screen.queryByTestId('quota-buy-slot')?.querySelector('button[aria-label="Buy credits"]')).toBeTruthy();
    expect(getRemaining()).toBe(0);
    expect(mock.getRenderCallCount()).toBe(3);
    expect(mock.getQuotaCallCount()).toBeGreaterThanOrEqual(4);

    mock.restore();
  }, { timeout: 20000 });
});
