import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';

function configureMatchMedia() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: () => ({
      matches: false,
      media: '(max-width: 768px)',
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => true,
    }),
  });
}

function quotaStub() {
  return {
    planType: 'free',
    freeExportsLeft: 2,
    freeExportsLimit: 3,
    isQuotaLocked: false,
    remainingInPeriod: null,
    usedInPeriod: null,
    periodLimit: 500,
    paywallReason: '',
    showBuyCreditsPanel: false,
    purchaseMessage: '',
    openBuyCreditsPanel: vi.fn(),
    closeBuyCreditsPanel: vi.fn(),
  };
}

function conversionStub(overrides = {}) {
  return {
    file: null,
    includeBranding: true,
    truncateLongText: false,
    isLoading: false,
    notice: null,
    error: null,
    pdfBlob: new Blob(['%PDF-1.4'], { type: 'application/pdf' }),
    resolvedPdfFilename: 'client-ready.pdf',
    renderVerdict: 'OK',
    conversionProgress: null,
    renderId: 'render_lead_123',
    shareState: { status: 'idle', jobId: null },
    layout: { overview: true, headers: true, footer: true },
    exportHistory: [],
    isHistoryLoading: false,
    historyError: null,
    historyStatus: 'all',
    hasMoreHistory: false,
    failKind: 'none',
    failureRecommendations: [],
    pageBurdenCopy: null,
    wasDemoLastUpload: false,
    confidence: { verdict: 'OK', score: 94, reasons: [], metrics: null },
    debugMetrics: null,
    handleFileSelect: vi.fn(),
    handleRemoveFile: vi.fn(),
    setIncludeBranding: vi.fn(),
    setTruncateLongText: vi.fn(),
    handleSubmit: vi.fn((event) => event?.preventDefault?.()),
    handleDownloadAnyway: vi.fn(),
    handleCopyShareLink: vi.fn(),
    handleTrySample: vi.fn(),
    handleBuyCreditsPack: vi.fn(),
    handleGoProCheckout: vi.fn(),
    handleLayoutChange: vi.fn(),
    onHistoryStatusChange: vi.fn(),
    loadMoreExportHistory: vi.fn(),
    refreshExportHistory: vi.fn(),
    handleGenerateCompact: vi.fn(),
    handleSwitchToRealUpload: vi.fn(),
    handleRenderAnother: vi.fn(),
    handlePostRenderPricingClick: vi.fn(),
    handlePostRenderContactClick: vi.fn(),
    ...overrides,
  };
}

describe('Landing lead capture integration', () => {
  beforeEach(() => {
    configureMatchMedia();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    cleanup();
  });

  test('shows the soft lead capture after a real successful render', async () => {
    vi.doMock('../hooks/useQuota.mjs', () => ({ default: () => quotaStub() }));
    vi.doMock('../hooks/useConversion.mjs', () => ({
      default: () => conversionStub(),
    }));
    vi.doMock('../components/LeadCaptureModal', () => ({
      default: ({ trigger, renderId, source }) => (trigger ? (
        <div data-testid="lead-capture-modal" data-render-id={renderId} data-source={source} />
      ) : null),
    }));

    const { default: Landing } = await import('../page.jsx');
    render(<Landing />);

    const modal = screen.getByTestId('lead-capture-modal');
    expect(modal.getAttribute('data-render-id')).toBe('render_lead_123');
    expect(modal.getAttribute('data-source')).toBe('render_success');
  });

  test('does not ask for email after demo-only output', async () => {
    vi.doMock('../hooks/useQuota.mjs', () => ({ default: () => quotaStub() }));
    vi.doMock('../hooks/useConversion.mjs', () => ({
      default: () => conversionStub({ wasDemoLastUpload: true }),
    }));
    vi.doMock('../components/LeadCaptureModal', () => ({
      default: ({ trigger }) => (trigger ? <div data-testid="lead-capture-modal" /> : null),
    }));

    const { default: Landing } = await import('../page.jsx');
    render(<Landing />);

    expect(screen.queryByTestId('lead-capture-modal')).toBeNull();
  });
});
