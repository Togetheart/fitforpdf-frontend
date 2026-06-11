import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React, { useState } from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from '@testing-library/react';

import UploadCard from '../components/UploadCard';
import { LANDING_COPY_KEYS } from '../siteCopy.mjs';

const SAMPLE_FILE = new File(['invoice_id,client,total\nA102,ACME Corp,4230.00'], 'report.csv', {
  type: 'text/csv',
});
const SAMPLE_PREMIUM_CSV = 'invoice_id,client_name,client_email,account_manager,segment,status,issue_date,due_date,currency,total_excl_vat,vat_rate,total_incl_vat,payment_terms,description,internal_notes\nINV-1001,Acme Corporation,finance@acme.com,Laura Stein,Enterprise,Paid,2026-01-02,2026-01-30,EUR,12500,20,15000,30 days,"Annual enterprise license covering 250 seats across EU subsidiaries including premium support and SLA tier 2.","Contract renewed after Q4 review."';

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

function UploadCardHarness({
  freeExportsLeft = 3,
  onSubmit = () => {},
  onBuyCredits = () => {},
  onCopyShareLink = () => {},
  showBuyCreditsForTwo = false,
  file = null,
  isLoading = false,
  conversionProgress = null,
  hasResultBlob = false,
  onBrandingChange = () => {},
  onTruncateChange = () => {},
  isPro = false,
  onEvent = () => {},
  onUpgrade = () => {},
  planType = 'free',
  remainingInPeriod = null,
  initialOptionsExpanded = false,
  exportHistory = [],
  isHistoryLoading = false,
  historyError = null,
  onRefreshHistory = () => {},
  historyStatus = 'all',
  onHistoryStatusChange = () => {},
  hasMoreHistory = false,
  onLoadMoreHistory = () => {},
  renderId = null,
  shareState = { status: 'idle', jobId: null },
}) {
  return function Harness() {
    const [currentFile, setCurrentFile] = useState(file);
    const [brandingEnabled, setBrandingEnabled] = useState(true);
    const [truncateEnabled, setTruncateEnabled] = useState(false);

    return (
      <UploadCard
        toolTitle="Generate a client-ready PDF"
        toolSubcopy="Free exports. No account required."
        file={currentFile}
        freeExportsLeft={freeExportsLeft}
        includeBranding={brandingEnabled}
        truncateLongText={truncateEnabled}
        isLoading={isLoading}
        hasResultBlob={hasResultBlob}
        onFileSelect={setCurrentFile}
        onRemoveFile={() => setCurrentFile(null)}
        onBrandingChange={(nextValue) => {
          setBrandingEnabled(nextValue);
          onBrandingChange(nextValue);
        }}
        onTruncateChange={(nextValue) => {
          setTruncateEnabled(nextValue);
          onTruncateChange(nextValue);
        }}
        onSubmit={onSubmit}
        onDownloadAgain={() => {}}
        onCopyShareLink={onCopyShareLink}
        onTrySample={() => {}}
        downloadedFileName={null}
        verdict={null}
        conversionProgress={conversionProgress}
        onBuyCredits={onBuyCredits}
        showBuyCreditsForTwo={showBuyCreditsForTwo}
        isPro={isPro}
        onEvent={onEvent}
        onUpgrade={onUpgrade}
        planType={planType}
        remainingInPeriod={remainingInPeriod}
        initialOptionsExpanded={initialOptionsExpanded}
        exportHistory={exportHistory}
        isHistoryLoading={isHistoryLoading}
        historyError={historyError}
        historyStatus={historyStatus}
        onHistoryStatusChange={onHistoryStatusChange}
        hasMoreHistory={hasMoreHistory}
        onLoadMoreHistory={onLoadMoreHistory}
        onRefreshHistory={onRefreshHistory}
        renderId={renderId}
        shareState={shareState}
      />
    );
  };
}

function renderUploadCardHarness({
  freeExportsLeft = 5,
  onSubmit = () => {},
  onBuyCredits = () => {},
  onCopyShareLink = () => {},
  showBuyCreditsForTwo = false,
  file = null,
  isLoading = false,
  conversionProgress = null,
  hasResultBlob = false,
  onBrandingChange = () => {},
  onTruncateChange = () => {},
  isPro = false,
  onEvent = () => {},
  onUpgrade = () => {},
  planType = 'free',
  remainingInPeriod = null,
  initialOptionsExpanded = false,
  exportHistory = [],
  isHistoryLoading = false,
  historyError = null,
  onRefreshHistory = () => {},
  historyStatus = 'all',
  onHistoryStatusChange = () => {},
  hasMoreHistory = false,
  onLoadMoreHistory = () => {},
  renderId = null,
  shareState = { status: 'idle', jobId: null },
}) {
  const Harness = UploadCardHarness({
    freeExportsLeft,
    onSubmit,
    onBuyCredits,
    onCopyShareLink,
    showBuyCreditsForTwo,
    file,
    isLoading,
    conversionProgress,
    hasResultBlob,
    onBrandingChange,
    onTruncateChange,
    isPro,
    onEvent,
    onUpgrade,
    planType,
    remainingInPeriod,
    initialOptionsExpanded,
    exportHistory,
    isHistoryLoading,
    historyError,
    onRefreshHistory,
    historyStatus,
    onHistoryStatusChange,
    hasMoreHistory,
    onLoadMoreHistory,
    renderId,
    shareState,
  });
  render(<Harness />);
  return {
    onBuyCredits,
    onCopyShareLink,
    onBrandingChange,
    onTruncateChange,
    onRefreshHistory,
    onHistoryStatusChange,
    onLoadMoreHistory,
  };
}

function clearBrandingNudgeSuppression() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('fitforpdf_branding_nudge_suppressed_until');
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

function createJsonResponse(status = 400, body = { error: 'bad request' }) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  });
}

function createQuotaResponse(payload = { plan_type: 'free', free_exports_left: 3 }) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  });
}

function createSampleCsvResponse() {
  return new Response(SAMPLE_PREMIUM_CSV, {
    status: 200,
    headers: {
      'content-type': 'text/csv',
    },
  });
}

function mockFetch({ responseFactory, responses = [], delayMs = 0, response }) {
  const responseList = Array.isArray(responses) ? responses.slice() : [];
  const resolvedResponse = response || null;
  const defaultResponse = responseFactory
    ? null
    : resolvedResponse || createJsonResponse(500, { error: 'No response configured' });
  const originalFetch = global.fetch;
  const calls = [];
  let index = 0;

  global.fetch = vi.fn((url, options = {}) => {
    const selected = responseFactory
      ? responseFactory(url, options)
      : responseList[index] || defaultResponse;
    index += 1;
    calls.push({ url, options, response: selected });
    const returnedResponse = selected instanceof Response && typeof selected.clone === 'function'
      ? selected.clone()
      : selected;

    if (delayMs > 0) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(returnedResponse), delayMs);
      });
    }

    return Promise.resolve(returnedResponse);
  });

  return {
    calls,
    restore: () => {
      global.fetch = originalFetch;
    },
  };
}

function getUploadedPayloadBody(call) {
  return call?.options?.body instanceof FormData ? call.options.body : null;
}

function getUploadedFile(call) {
  const body = getUploadedPayloadBody(call);
  return body ? body.get('file') : null;
}

async function advanceConversion(ms = 1900) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

describe('UploadCard unit behavior', () => {
  beforeEach(() => {
    localStorage.clear();
    clearBrandingNudgeSuppression();
    configureMatchMedia({ mobile: true });
    renderUploadCardHarness({ freeExportsLeft: 3 });
  });

  afterEach(() => {
    cleanup();
  });

  test('renders free exports badge with premium copy', () => {
    expect(screen.getByTestId('quota-pill').textContent).toMatch(/Free\s*·\s*3\s*exports\s*left/i);
    expect(screen.queryByText(/5 free exports/i)).toBeNull();
  });

  // toolSubcopy prop is accepted but no longer rendered visually in UploadCard
  test('toolSubcopy prop is accepted without rendering visible text', () => {
    expect(screen.queryByText('Free exports. No account required.')).toBeNull();
  });

  test('upload dropzone keeps surface style', () => {
    const dropzone = screen.getByTestId('upload-dropzone');

    expect(dropzone.className).toContain('cursor-pointer');
  });

  test('upload dropzone label fills the row so nearby clicks open the picker', () => {
    const shell = screen.getByTestId('generate-dropzone');
    const dropzone = screen.getByTestId('upload-dropzone');

    expect(shell.className).toContain('flex-1');
    expect(dropzone.className).toContain('w-full');
    expect(dropzone.className).not.toContain('sm:w-auto');
  });

  test('renders export history timeline fields and mismatch', () => {
    cleanup();
    renderUploadCardHarness({
      exportHistory: [{
        id: 'job_1',
        status: 'failed',
        exportState: 'render_failed_non_retryable',
        createdAt: '2026-03-18T10:00:00.000Z',
        sourceFileName: 'finance.csv',
        quotaConsumed: false,
        supportId: 'req_abc',
        options: { brandingEnabled: true, keep_headers: true },
        entitlementMismatch: 'missing_identity_for_provisioning_check',
        artifactAvailable: false,
      }],
    });

    expect(screen.getByTestId('export-history')).toBeTruthy();
    expect(screen.getByText('Export history')).toBeTruthy();
    expect(screen.getByText('Export failed, quota not consumed')).toBeTruthy();
    expect(screen.getByText('File: finance.csv')).toBeTruthy();
    expect(screen.getByText('Quota not consumed')).toBeTruthy();
    expect(screen.getByText('Support ID: req_abc')).toBeTruthy();
    expect(screen.getByText(/Provisioning mismatch: Payment received, provisioning blocked: missing checkout identity/i)).toBeTruthy();
  });

  test('refresh history button triggers callback', () => {
    cleanup();
    const onRefreshHistory = vi.fn();
    renderUploadCardHarness({
      onRefreshHistory,
      exportHistory: [{
        id: 'job_refresh',
        status: 'done',
        exportState: 'artifact_available',
        createdAt: '2026-03-18T10:00:00.000Z',
        sourceFileName: 'test.csv',
        quotaConsumed: true,
        supportId: 'req_refresh',
      }],
    });

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(onRefreshHistory).toHaveBeenCalledTimes(1);
  });

  test('history status filter triggers callback', () => {
    cleanup();
    const onHistoryStatusChange = vi.fn();
    renderUploadCardHarness({
      onHistoryStatusChange,
      exportHistory: [{
        id: 'job_filter',
        status: 'done',
        exportState: 'artifact_available',
        createdAt: '2026-03-18T10:00:00.000Z',
        sourceFileName: 'test.csv',
        quotaConsumed: true,
        supportId: 'req_filter',
      }],
    });

    // Open the <details> element to reveal the filter inside
    const details = screen.getByTestId('export-history');
    details.setAttribute('open', '');

    fireEvent.change(screen.getByLabelText('History status filter'), {
      target: { value: 'failed' },
    });

    expect(onHistoryStatusChange).toHaveBeenCalledWith('failed');
  });

  test('load more history button triggers callback when next page exists', () => {
    cleanup();
    const onLoadMoreHistory = vi.fn();
    renderUploadCardHarness({
      hasMoreHistory: true,
      onLoadMoreHistory,
      exportHistory: [{
        id: 'job_3',
        status: 'done',
        exportState: 'artifact_available',
        createdAt: '2026-03-18T12:00:00.000Z',
        sourceFileName: 'page-1.csv',
        quotaConsumed: true,
        supportId: 'req_3',
      }],
    });

    fireEvent.click(screen.getByRole('button', { name: 'Load more' }));
    expect(onLoadMoreHistory).toHaveBeenCalledTimes(1);
  });

  test('renders ready export row with artifact link', () => {
    cleanup();
    renderUploadCardHarness({
      exportHistory: [{
        id: 'job_2',
        status: 'done',
        exportState: 'artifact_available',
        createdAt: '2026-03-18T11:00:00.000Z',
        sourceFileName: 'report.csv',
        quotaConsumed: true,
        supportId: 'req_ready',
        options: { keep_headers: true },
        artifactAvailable: true,
        pdfUrl: '/jobs/job_2/pdf?token=abcd&exp=9999999999',
      }],
    });

    expect(screen.getByText('Export ready')).toBeTruthy();
    expect(screen.getByText('Quota consumed')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Download artifact' })).toBeTruthy();
  });

  test('upload card uses transparent glass styling with a single translucent layer', () => {
    const uploadCard = screen.getByTestId('upload-card');
    const cardClass = uploadCard.className;
    const glassBackdrop = screen.getByTestId('uploadcard-glass-backdrop');
    const glassHighlight = screen.getByTestId('uploadcard-glass-highlight');

    expect(cardClass).toContain('relative');
    expect(cardClass).toContain('overflow-hidden');
    expect(cardClass).toContain('rounded-xl');
    expect(cardClass).toContain('bg-white/20');
    expect(cardClass).toContain('backdrop-blur-[5px]');
    expect(cardClass).toContain('border-black/10');
    expect(cardClass).not.toContain('rounded-[28px]');
    expect(cardClass).not.toContain('p-[8px]');
    expect(glassBackdrop).toBeTruthy();
    expect(glassBackdrop.className).toContain('absolute');
    expect(glassBackdrop.className).toContain('inset-0');
    expect(glassBackdrop.className).toContain('bg-[radial-gradient');
    expect(glassHighlight.className).toContain('bg-gradient-to-b');
    expect(glassHighlight.className).toContain('rounded-xl');
    expect(screen.queryByTestId('uploadcard-glass-frame')).toBeNull();
    expect(screen.queryByTestId('uploadcard-glass-inner')).toBeNull();
  });

  test('options section is an accordion and can be collapsed/expanded', () => {
    const optionsToggle = screen.getByRole('button', { name: 'Advanced options' });

    expect(optionsToggle.getAttribute('aria-expanded')).toBe('false');
    // h-11/w-11 = 44px (iOS HIG min tap target). Was h-9/w-9 = 36px.
    expect(optionsToggle.className).toContain('h-11');
    expect(optionsToggle.className).toContain('w-11');
    expect(screen.queryByRole('switch', { name: 'Branding' })).toBeNull();
    expect(screen.queryByTestId('upload-options')).toBeNull();

    fireEvent.click(optionsToggle);

    expect(optionsToggle.getAttribute('aria-expanded')).toBe('true');
    const optionsPanel = screen.getByTestId('upload-options');
    expect(optionsPanel.className).toContain('p-4');
    expect(screen.getByRole('switch', { name: 'Branding' })).toBeTruthy();

    fireEvent.click(optionsToggle);

    expect(optionsToggle.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByTestId('upload-options')).toBeNull();
    expect(screen.queryByRole('switch', { name: 'Branding' })).toBeNull();
  });

  test('mousedown inside the options panel does NOT close the dropdown (regression)', () => {
    // Regression for the "Branding toggle resists" bug: the outside-click
    // handler used to check only the gear button ref, so a mousedown on any
    // toggle inside the panel was treated as "outside" and slammed the
    // dropdown shut before the toggle's click could register.
    const optionsToggle = screen.getByRole('button', { name: 'Advanced options' });
    fireEvent.click(optionsToggle);
    expect(screen.getByTestId('upload-options')).toBeTruthy();

    // Simulate a real pointer interaction inside the panel (the Branding row).
    const brandingRow = screen.getByTestId('setting-row-branding');
    fireEvent.mouseDown(brandingRow);

    // Panel must still be open.
    expect(screen.queryByTestId('upload-options')).toBeTruthy();
    expect(optionsToggle.getAttribute('aria-expanded')).toBe('true');

    // And a mousedown truly OUTSIDE (on document.body) still closes it.
    fireEvent.mouseDown(document.body);
    expect(screen.queryByTestId('upload-options')).toBeNull();
  });

  test('opening options does not call window.scrollBy in jsdom', () => {
    cleanup();
    vi.useFakeTimers();
    const originalScrollBy = window.scrollBy;
    const scrollBySpy = vi.fn();
    Object.defineProperty(window, 'scrollBy', {
      configurable: true,
      writable: true,
      value: scrollBySpy,
    });

    try {
      renderUploadCardHarness({});
      fireEvent.click(screen.getByRole('button', { name: 'Advanced options' }));
      vi.advanceTimersByTime(20);
      expect(scrollBySpy).not.toHaveBeenCalled();
    } finally {
      Object.defineProperty(window, 'scrollBy', {
        configurable: true,
        writable: true,
        value: originalScrollBy,
      });
      vi.useRealTimers();
    }
  });

  test('option rows keep bottom-only separators and no top border on first row', () => {
    cleanup();
    renderUploadCardHarness({ initialOptionsExpanded: true });

    const brandingRow = screen.getByTestId('setting-row-branding').parentElement;
    const truncateRow = screen.getByTestId('setting-row-truncate').parentElement;

    expect(brandingRow.className).toContain('border-b');
    expect(brandingRow.className).not.toContain('border-t');
    // truncate is the last row → no trailing separator
    expect(truncateRow.className).not.toContain('border-b');
  });

  test('upload card nested panels use glass styling', () => {
    cleanup();
    renderUploadCardHarness({
      initialOptionsExpanded: true,
      isLoading: true,
      conversionProgress: { stepIndex: 0, percent: 12 },
    });

    const optionsShell = screen.getByTestId('upload-options');
    const progressPanel = screen.getByTestId('upload-progress');

    expect(optionsShell.className).toContain('bg-[var(--color-bg)]');
    expect(progressPanel.className).toContain('glass-subtle');
  });

  test('dropzone helper copy has no two-step mention and keeps the new two-line message', () => {
    expect(screen.queryByText(/2-step/i)).toBeNull();
    expect(screen.getByText('Drop CSV or XLSX here')).toBeTruthy();
    expect(screen.getByText('or click to upload')).toBeTruthy();
  });

  // privacy helper block (upload-privacy-messages) was removed from UploadCard

  test.each([
    {
      freeExportsLeft: 3,
      expectedClass: 'bg-amber-500/15',
      expectedText: '3 exports left',
    },
    {
      freeExportsLeft: 2,
      expectedClass: 'bg-amber-500/15',
      expectedText: '2 exports left',
    },
    {
      freeExportsLeft: 1,
      expectedClass: 'bg-amber-500/15',
      expectedText: '1 exports left',
    },
    {
      freeExportsLeft: 0,
      expectedClass: 'bg-amber-500/15',
      expectedText: '0 exports left',
    },
  ])('badge style and pluralization for $freeExportsLeft exports left', ({
    freeExportsLeft,
    expectedClass,
    expectedText,
  }) => {
    cleanup();
    renderUploadCardHarness({ freeExportsLeft });
    const badge = screen.getByTestId('quota-pill');
    expect(badge.className).toContain(expectedClass);
    expect(badge.textContent).toMatch(new RegExp(`Free\\s*·\\s*${expectedText}`, 'i'));
  });

  test('buy credits button visibility follows low exports rules', () => {
    cleanup();
    renderUploadCardHarness({ freeExportsLeft: 3 });
    expect(screen.queryByRole('button', { name: 'Buy credits' })).toBeNull();

    cleanup();
    renderUploadCardHarness({ freeExportsLeft: 2 });
    expect(screen.queryByRole('button', { name: 'Buy credits' })).toBeNull();

    cleanup();
    renderUploadCardHarness({ freeExportsLeft: 1 });
    expect(screen.getByRole('button', { name: 'Buy credits' })).toBeTruthy();

    cleanup();
    renderUploadCardHarness({ freeExportsLeft: 0 });
    expect(screen.getByRole('button', { name: 'Buy credits' })).toBeTruthy();
  });

  test('buy credits button supports optional two-export visibility flag', () => {
    cleanup();
    renderUploadCardHarness({
      freeExportsLeft: 2,
      showBuyCreditsForTwo: true,
    });
    expect(screen.getByRole('button', { name: 'Buy credits' })).toBeTruthy();
  });

  test('buy credits button is accessible and activates callback', () => {
    cleanup();
    const onBuyCredits = vi.fn();
    renderUploadCardHarness({ freeExportsLeft: 1, onBuyCredits });
    const buyButton = screen.getByRole('button', { name: 'Buy credits' });

    expect(buyButton.getAttribute('aria-label')).toBe('Buy credits');
    expect(buyButton.textContent).toContain('Buy credits');
    expect(screen.getByTestId('quota-buy-slot')).toBeTruthy();

    fireEvent.click(buyButton);
    expect(onBuyCredits).toHaveBeenCalledTimes(1);
  });

  test('free users cannot disable branding and see an inline upgrade nudge', () => {
    cleanup();
    clearBrandingNudgeSuppression();
    const onEvent = vi.fn();
    const onBrandingChange = vi.fn();
    renderUploadCardHarness({
      isPro: false,
      onEvent,
      onBrandingChange,
      initialOptionsExpanded: true,
    });

    const brandingTitle = within(screen.getByTestId('setting-row-branding')).getByText('Branding');
    const brandingSwitch = screen.getByRole('switch', { name: 'Branding' });

    expect(brandingSwitch.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(brandingTitle);

    expect(brandingSwitch.getAttribute('aria-checked')).toBe('true');
    expect(onBrandingChange).not.toHaveBeenCalled();
    expect(screen.getByTestId('branding-upgrade-nudge')).toBeTruthy();
    expect(screen.getByText('Remove branding is a Pro feature')).toBeTruthy();
    expect(screen.getByText('Upgrade to remove fitforpdf branding from exported PDFs.')).toBeTruthy();
    expect(screen.getByTestId('branding-upgrade-nudge-slot').getAttribute('aria-live')).toBe('polite');
    expect(onEvent).toHaveBeenCalledWith('paywall_branding_attempt');
  });

  test('pro users can disable branding without upgrade nudge', () => {
    cleanup();
    clearBrandingNudgeSuppression();
    const onBrandingChange = vi.fn();
    renderUploadCardHarness({
      isPro: true,
      onBrandingChange,
      initialOptionsExpanded: true,
    });

    const brandingTitle = within(screen.getByTestId('setting-row-branding')).getByText('Branding');
    fireEvent.click(brandingTitle);

    expect(screen.getByRole('switch', { name: 'Branding' }).getAttribute('aria-checked')).toBe('false');
    expect(screen.queryByTestId('branding-upgrade-nudge')).toBeNull();
    expect(onBrandingChange).toHaveBeenCalledWith(false);
  });

  test('not now hides the branding upgrade nudge and tracks dismissal', () => {
    cleanup();
    clearBrandingNudgeSuppression();
    const onEvent = vi.fn();
    const onBrandingChange = vi.fn();
    renderUploadCardHarness({
      isPro: false,
      onEvent,
      onBrandingChange,
      initialOptionsExpanded: true,
    });

    const brandingTitle = within(screen.getByTestId('setting-row-branding')).getByText('Branding');
    fireEvent.click(brandingTitle);
    expect(screen.getByTestId('branding-upgrade-nudge')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Not now' }));

    expect(screen.queryByTestId('branding-upgrade-nudge')).toBeNull();
    expect(onBrandingChange).not.toHaveBeenCalled();
    expect(onEvent).toHaveBeenCalledWith('paywall_dismissed');
    expect(screen.getByRole('switch', { name: 'Branding' }).getAttribute('aria-checked')).toBe('true');
  });

  test('upgrade click triggers callback and tracks event', () => {
    cleanup();
    clearBrandingNudgeSuppression();
    const onBuyCredits = vi.fn();
    const onEvent = vi.fn();
    const onBrandingChange = vi.fn();
    renderUploadCardHarness({
      isPro: false,
      onBuyCredits,
      onEvent,
      onBrandingChange,
      initialOptionsExpanded: true,
    });

    const brandingTitle = within(screen.getByTestId('setting-row-branding')).getByText('Branding');
    fireEvent.click(brandingTitle);
    const brandingNudge = screen.getByTestId('branding-upgrade-nudge');
    fireEvent.click(within(brandingNudge).getByRole('button', { name: 'Buy credits' }));

    expect(onBuyCredits).toHaveBeenCalledTimes(1);
    expect(onEvent).toHaveBeenCalledWith('paywall_upgrade_clicked');
  });

  test('switch click triggers nudge and buy credits click replaces nudge with buy credits panel in options', () => {
    cleanup();
    clearBrandingNudgeSuppression();
    const onBuyCredits = vi.fn();
    const onEvent = vi.fn();
    renderUploadCardHarness({
      isPro: false,
      onBuyCredits,
      onEvent,
      initialOptionsExpanded: true,
    });

    const brandingSwitch = screen.getByRole('switch', { name: 'Branding' });
    fireEvent.click(brandingSwitch);

    const brandingNudge = screen.getByTestId('branding-upgrade-nudge');
    const nudgeBuyButton = within(brandingNudge).getByRole('button', { name: 'Buy credits' });
    fireEvent.click(nudgeBuyButton);

    expect(screen.queryByTestId('branding-upgrade-nudge')).toBeNull();
    expect(screen.getByTestId('credits-purchase-panel')).toBeTruthy();
    expect(screen.getByTestId('upload-options').contains(screen.getByTestId('credits-purchase-panel'))).toBe(true);
    expect(onBuyCredits).toHaveBeenCalledTimes(1);
    expect(onEvent).toHaveBeenCalledWith('paywall_upgrade_clicked');
  });

  test('clicking the gated toggle again after "Not now" re-shows the nudge (no dead toggle)', () => {
    // Regression: previously "Not now" set a 10-min suppression window, after
    // which clicking the gated toggle was a silent no-op — the toggle looked
    // broken. An explicit click must ALWAYS surface the nudge.
    cleanup();
    clearBrandingNudgeSuppression();
    const onEvent = vi.fn();
    const onBrandingChange = vi.fn();
    renderUploadCardHarness({
      isPro: false,
      onEvent,
      onBrandingChange,
      initialOptionsExpanded: true,
    });

    const brandingTitle = within(screen.getByTestId('setting-row-branding')).getByText('Branding');
    fireEvent.click(brandingTitle);
    expect(screen.getByTestId('branding-upgrade-nudge')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Not now' }));
    expect(screen.queryByTestId('branding-upgrade-nudge')).toBeNull();

    // Second explicit click → nudge re-appears immediately, no silent swallow.
    fireEvent.click(brandingTitle);
    expect(screen.getByTestId('branding-upgrade-nudge')).toBeTruthy();
    expect(onEvent).toHaveBeenCalledWith('paywall_branding_attempt');
    expect(onBrandingChange).not.toHaveBeenCalled();
    expect(screen.getByRole('switch', { name: 'Branding' }).getAttribute('aria-checked')).toBe('true');
  });

  test('"Not now" then re-click works repeatedly without any suppression delay', () => {
    cleanup();
    clearBrandingNudgeSuppression();
    const onEvent = vi.fn();
    const onBrandingChange = vi.fn();
    renderUploadCardHarness({
      isPro: false,
      onEvent,
      onBrandingChange,
      initialOptionsExpanded: true,
    });

    const brandingTitle = within(screen.getByTestId('setting-row-branding')).getByText('Branding');

    for (let i = 0; i < 3; i += 1) {
      fireEvent.click(brandingTitle);
      expect(screen.getByTestId('branding-upgrade-nudge')).toBeTruthy();
      fireEvent.click(screen.getByRole('button', { name: 'Not now' }));
      expect(screen.queryByTestId('branding-upgrade-nudge')).toBeNull();
    }

    expect(onBrandingChange).not.toHaveBeenCalled();
    expect(onEvent).toHaveBeenCalledWith('paywall_dismissed');
  });

  test('click on setting title or description toggles the row', () => {
    cleanup();
    const onBrandingChange = vi.fn();
    renderUploadCardHarness({ onBrandingChange, initialOptionsExpanded: true, isPro: true });
    const brandingTitle = within(screen.getByTestId('setting-row-branding')).getByText('Branding');
    const brandingDescription = screen.getByText('Adds a small “Generated by FitForPDF” credit to the footer.');

    fireEvent.click(brandingTitle);
    fireEvent.click(brandingDescription);
    expect(onBrandingChange).toHaveBeenCalledTimes(2);
  });

  test('setting rows no longer render info tooltips', () => {
    cleanup();
    renderUploadCardHarness({ initialOptionsExpanded: true });

    expect(screen.queryByLabelText('Branding info')).toBeNull();
    expect(screen.queryByLabelText('Truncate long text info')).toBeNull();
  });

  test('buy credits slot includes text when low exports make it a purchase prompt', () => {
    cleanup();
    renderUploadCardHarness({ freeExportsLeft: 1, onBuyCredits: vi.fn() });

    const slot = screen.getByTestId('quota-buy-slot');
    expect(slot).toBeTruthy();
    expect(slot.textContent).toContain('Buy credits');
    expect(slot.className).toContain('gap-2');
    expect(slot.className).toContain('px-3');
    expect(slot.className).not.toContain('w-9');
    expect(slot.className).toContain('h-9');
  });

  test('keyboard focus stays on native controls only', () => {
    cleanup();
    const onBuyCredits = vi.fn();
    renderUploadCardHarness({ freeExportsLeft: 1, onBuyCredits, initialOptionsExpanded: true });

    expect(screen.getByTestId('setting-row-branding').tabIndex).toBe(-1);
    expect(screen.getByTestId('setting-row-truncate').tabIndex).toBe(-1);

    const brandingSwitch = screen.getByRole('switch', { name: 'Branding' });
    const truncateSwitch = screen.getByRole('switch', { name: 'Truncate long text' });
    const buyCreditsButton = screen.getByRole('button', { name: 'Buy credits' });

    expect(brandingSwitch.tabIndex).toBe(0);
    expect(truncateSwitch.tabIndex).toBe(0);
    expect(buyCreditsButton.tabIndex).toBe(0);
  });

  test('quota badge reserve container keeps stable width regardless of exports left', () => {
    cleanup();
    renderUploadCardHarness({ freeExportsLeft: 1 });
    const slotClass = screen.getByTestId('quota-buy-slot').className;

    cleanup();
    renderUploadCardHarness({ freeExportsLeft: 0 });
    expect(screen.getByTestId('quota-buy-slot').className).toBe(slotClass);
  });

  test('dropzone accepts file selection and remove clears it', () => {
    const input = screen.getByTestId('generate-file-input');

    fireEvent.change(input, {
      target: { files: [SAMPLE_FILE] },
    });
    expect(screen.getByText('report.csv')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Generate PDF' })).toHaveProperty('disabled', false);

    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(screen.queryByText('report.csv')).toBeNull();
    expect(screen.getByRole('button', { name: 'Generate PDF' })).toHaveProperty('disabled', true);
  });

  test('keyboard accessibility on dropzone', () => {
    const dropzone = screen.getByRole('button', { name: 'Upload CSV or XLSX file' });

    expect(dropzone.getAttribute('role')).toBe('button');
    expect(dropzone.getAttribute('tabindex')).toBe('0');
    });
  });
