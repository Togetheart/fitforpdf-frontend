import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';

import useConversion from '../hooks/useConversion.mjs';

const SAMPLE_FILE = new File(['a,b\n1,2'], 'test.csv', { type: 'text/csv' });

function createPdfResponse() {
  return new Response(new Blob(['%PDF-1.4'], { type: 'application/pdf' }), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': 'attachment; filename="report.pdf"',
    },
  });
}

function mockFetch(handler) {
  const originalFetch = global.fetch;
  const calls = [];
  global.fetch = vi.fn((url, options = {}) => {
    calls.push({ url: String(url), options });
    return Promise.resolve(handler({ url: String(url), options }));
  });
  return {
    calls,
    restore: () => {
      global.fetch = originalFetch;
    },
  };
}

function createQuotaSnapshot({ planType = 'free', freeExportsLeft = 0, remainingInPeriod = 0 }) {
  return { planType, freeExportsLeft, remainingInPeriod };
}

function ConversionHarness({ quota }) {
  const conversion = useConversion({ quota });
  const [ready, setReady] = React.useState(false);
  /* useConversion returns a fresh object on every render, so the effect's
   * [conversion] dep ticks each render. Guard the file-select to run once. */
  const initRef = React.useRef(false);

  React.useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    conversion.handleFileSelect(SAMPLE_FILE);
    setReady(true);
  }, [conversion]);

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          void conversion.handleSubmit({
            preventDefault: () => {},
          });
        }}
        disabled={!ready}
      >
        Generate PDF
      </button>
      <div data-testid="error">{conversion.error || ''}</div>
    </div>
  );
}

function ShareHarness({ quota }) {
  const conversion = useConversion({ quota });

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          void conversion.handleCopyShareLink('job-share-hook', 'render_success');
        }}
      >
        Copy review link
      </button>
      <div data-testid="notice">{conversion.notice || ''}</div>
      <div data-testid="error">{conversion.error || ''}</div>
    </div>
  );
}

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('useConversion frontend quota lock handling', () => {
  test('refreshes quota on submit when lock is stale and still allows export when unlocked', async () => {
    const fetchMock = mockFetch(({ url }) => {
      if (url.includes('/api/render')) return createPdfResponse();
      return new Response(JSON.stringify({ error: 'unexpected' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    });

    const syncQuotaState = vi.fn(async () => createQuotaSnapshot({
      planType: 'free',
      freeExportsLeft: 1,
      remainingInPeriod: null,
    }));
    const quota = {
      isQuotaLocked: true,
      syncQuotaState,
      applyQuotaExhaustion: vi.fn(),
      setPaywallReason: vi.fn(),
      setPurchaseMessage: vi.fn(),
      planType: 'free',
      freeExportsLeft: 0,
      remainingInPeriod: 0,
      freeExportsLimit: 3,
    };

    render(<ConversionHarness quota={quota} />);
    fireEvent.click(screen.getByRole('button', { name: 'Generate PDF' }));

    await waitFor(() => {
      expect(fetchMock.calls.filter((call) => call.url.includes('/api/render')).length).toBe(1);
    });
    expect(syncQuotaState).toHaveBeenCalledTimes(2);

    fetchMock.restore();
  });

  test('keeps blocking when quota remains locked after refresh', async () => {
    const fetchMock = mockFetch(() => new Response(
      JSON.stringify({ error: 'render should not be called' }),
      {
        status: 500,
        headers: { 'content-type': 'application/json' },
      },
    ));

    const syncQuotaState = vi.fn(async () => createQuotaSnapshot({
      planType: 'free',
      freeExportsLeft: 0,
      remainingInPeriod: 0,
    }));
    const quota = {
      isQuotaLocked: true,
      syncQuotaState,
      applyQuotaExhaustion: vi.fn(),
      setPaywallReason: vi.fn(),
      setPurchaseMessage: vi.fn(),
      planType: 'free',
      freeExportsLeft: 0,
      remainingInPeriod: 0,
      freeExportsLimit: 3,
    };

    render(<ConversionHarness quota={quota} />);
    fireEvent.click(screen.getByRole('button', { name: 'Generate PDF' }));

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe('');
      expect(fetchMock.calls.length).toBe(0);
    });

    expect(syncQuotaState).toHaveBeenCalledTimes(1);
    fetchMock.restore();
  });

  test('copies secure review link and tracks the share event after a successful render', async () => {
    const originalClipboard = window.navigator.clipboard;
    const clipboardWriteText = vi.fn(async () => {});
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: { writeText: clipboardWriteText },
    });
    Object.defineProperty(window, 'posthog', {
      configurable: true,
      value: { capture: vi.fn() },
    });

    const fetchMock = mockFetch(({ url }) => {
      if (String(url).includes('/api/jobs/job-share-hook/share')) {
        return new Response(JSON.stringify({
          shareUrl: 'https://www.fitforpdf.com/s/job-share-hook?token=abc123&exp=9999999999',
          expiresAt: '2026-03-26T12:15:00.000Z',
        }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: 'unexpected' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    });

    const quota = {
      isQuotaLocked: false,
      syncQuotaState: vi.fn(async () => createQuotaSnapshot({
        planType: 'free',
        freeExportsLeft: 2,
        remainingInPeriod: null,
      })),
      applyQuotaExhaustion: vi.fn(),
      setPaywallReason: vi.fn(),
      setPurchaseMessage: vi.fn(),
      planType: 'free',
      freeExportsLeft: 3,
      remainingInPeriod: null,
      freeExportsLimit: 3,
    };

    try {
      render(<ShareHarness quota={quota} />);
      fireEvent.click(screen.getByRole('button', { name: 'Copy review link' }));

      await waitFor(() => {
        expect(clipboardWriteText).toHaveBeenCalledWith('https://www.fitforpdf.com/s/job-share-hook?token=abc123&exp=9999999999');
      });
      expect(window.posthog.capture).toHaveBeenCalledWith('share_link_copied', {
        surface: 'render_success',
        job_id: 'job-share-hook',
      });
      expect(screen.getByTestId('notice').textContent).toContain('Review link copied.');
    } finally {
      Object.defineProperty(window.navigator, 'clipboard', {
        configurable: true,
        value: originalClipboard,
      });
      fetchMock.restore();
    }
  });
});
