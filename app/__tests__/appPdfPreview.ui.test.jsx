import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';

vi.mock('../hooks/useQuota.mjs', () => ({
  default: () => ({
    freeExportsLeft: 3,
    freeExportsLimit: 3,
    planType: 'free',
    isQuotaLocked: false,
    remainingInPeriod: 3,
    usedInPeriod: 0,
    periodLimit: 3,
    paywallReason: null,
    showBuyCreditsPanel: false,
    purchaseMessage: '',
    openBuyCreditsPanel: vi.fn(),
    closeBuyCreditsPanel: vi.fn(),
    syncQuotaState: vi.fn(async () => ({ planType: 'free', freeExportsLeft: 3 })),
    applyQuotaExhaustion: vi.fn(() => 'No exports left.'),
    setPaywallReason: vi.fn(),
    setPurchaseMessage: vi.fn(),
  }),
}));

const conversion = {
  file: new File(['a,b\n1,2'], 'customers.csv', { type: 'text/csv' }),
  includeBranding: true,
  truncateLongText: false,
  isLoading: false,
  notice: null,
  error: null,
  pdfBlob: new Blob(['%PDF-1.4'], { type: 'application/pdf' }),
  resolvedPdfFilename: 'customers.pdf',
  renderVerdict: 'OK',
  conversionProgress: { running: false, stepIndex: 0, percent: 0, label: 'Uploading' },
  layout: { overview: true, headers: true, footer: true },
  exportHistory: [],
  isHistoryLoading: false,
  historyError: null,
  historyStatus: 'all',
  hasMoreHistory: false,
  renderId: 'render_123',
  shareState: { status: 'idle', jobId: null },
  failKind: null,
  failureRecommendations: [],
  pageBurdenCopy: null,
  compactSuggestion: null,
  wasDemoLastUpload: false,
  confidence: { verdict: 'OK', score: 98, reasons: [], metrics: null },
  debugMetrics: null,
  reportTitle: '',
  setReportTitle: vi.fn(),
  columnMap: 'auto',
  setColumnMap: vi.fn(),
  renderedSections: [],
  sectionTitleOverrides: {},
  setSectionTitleOverrides: vi.fn(),
  handleFileSelect: vi.fn(),
  handleRemoveFile: vi.fn(),
  setIncludeBranding: vi.fn(),
  setTruncateLongText: vi.fn(),
  handleSubmit: vi.fn(),
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
};

vi.mock('../hooks/useConversion.mjs', () => ({
  default: () => conversion,
}));

import AppPage from '../app/page.jsx';

let createObjectUrl;
let revokeObjectUrl;

beforeEach(() => {
  createObjectUrl = vi.fn(() => 'blob:fitforpdf-preview');
  revokeObjectUrl = vi.fn();
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: createObjectUrl,
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: revokeObjectUrl,
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('/app embedded PDF preview', () => {
  test('embeds the generated PDF blob in the workbench canvas', async () => {
    render(<AppPage />);

    const preview = await screen.findByTestId('app-pdf-preview');
    expect(preview.getAttribute('data')).toBe('blob:fitforpdf-preview');
    expect(preview.getAttribute('type')).toBe('application/pdf');
    expect(preview.getAttribute('aria-label')).toBe('PDF preview: customers.pdf');
    expect(createObjectUrl).toHaveBeenCalledWith(conversion.pdfBlob);
  });

  test('revokes the preview object URL on unmount', async () => {
    const rendered = render(<AppPage />);
    await screen.findByTestId('app-pdf-preview');

    rendered.unmount();

    await waitFor(() => {
      expect(revokeObjectUrl).toHaveBeenCalledWith('blob:fitforpdf-preview');
    });
  });
});
