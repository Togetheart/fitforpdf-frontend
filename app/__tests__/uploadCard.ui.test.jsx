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

import UploadCard, {
  getBrandingNudgeSuppressedUntil,
  setBrandingNudgeSuppressedUntil,
} from '../components/UploadCard';
import LandingPage from '../page.jsx';
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
  showBuyCreditsForTwo = false,
  file = null,
  isLoading = false,
  conversionProgress = null,
  hasResultBlob = false,
  onBrandingChange = () => {},
  onTruncateChange = () => {},
  isPro = true,
  onEvent = () => {},
  onUpgrade = () => {},
  planType = 'free',
  remainingInPeriod = null,
  initialOptionsExpanded = false,
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
      />
    );
  };
}

function renderUploadCardHarness({
  freeExportsLeft = 5,
  onSubmit = () => {},
  onBuyCredits = () => {},
  showBuyCreditsForTwo = false,
  isLoading = false,
  conversionProgress = null,
  onBrandingChange = () => {},
  onTruncateChange = () => {},
  isPro = true,
  onEvent = () => {},
  onUpgrade = () => {},
  planType = 'free',
  remainingInPeriod = null,
  initialOptionsExpanded = false,
}) {
  const Harness = UploadCardHarness({
    freeExportsLeft,
    onSubmit,
    onBuyCredits,
    showBuyCreditsForTwo,
    isLoading,
    conversionProgress,
    onBrandingChange,
    onTruncateChange,
    isPro,
    onEvent,
    onUpgrade,
    planType,
    remainingInPeriod,
    initialOptionsExpanded,
  });
  render(<Harness />);
  return { onBuyCredits, onBrandingChange, onTruncateChange };
}

function clearBrandingNudgeSuppression() {
  if (typeof window === 'undefined') return;
  setBrandingNudgeSuppressedUntil(0);
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

  test('options section is an accordion and can be collapsed/expanded', () => {
    const optionsToggle = screen.getByRole('button', { name: 'Options' });

    expect(optionsToggle.getAttribute('aria-expanded')).toBe('false');
    expect(optionsToggle.className).toContain('px-5');
    expect(optionsToggle.className).toContain('py-4');
    expect(screen.queryByRole('switch', { name: 'Branding' })).toBeNull();
    expect(screen.queryByTestId('upload-options')).toBeNull();

    fireEvent.click(optionsToggle);

    expect(optionsToggle.getAttribute('aria-expanded')).toBe('true');
    const optionsPanel = screen.getByTestId('upload-options');
    expect(optionsPanel.className).toContain('px-5');
    expect(optionsPanel.className).toContain('py-4');
    expect(screen.getByRole('switch', { name: 'Branding' })).toBeTruthy();

    fireEvent.click(optionsToggle);

    expect(optionsToggle.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByTestId('upload-options')).toBeNull();
    expect(screen.queryByRole('switch', { name: 'Branding' })).toBeNull();
  });

  test('dropzone helper copy has no two-step mention and keeps the new two-line message', () => {
    expect(screen.queryByText(/2-step/i)).toBeNull();
    expect(screen.getByText('Drop CSV or XLSX here')).toBeTruthy();
    expect(screen.getByText('or click to upload')).toBeTruthy();
  });

  test.each([
    {
      freeExportsLeft: 3,
      expectedClass: 'bg-slate-100',
      expectedText: '3 exports left',
    },
    {
      freeExportsLeft: 2,
      expectedClass: 'bg-amber-400',
      expectedText: '2 exports left',
    },
    {
      freeExportsLeft: 1,
      expectedClass: 'bg-amber-600',
      expectedText: '1 exports left',
    },
    {
      freeExportsLeft: 0,
      expectedClass: 'bg-red-600',
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
    expect(screen.getByText('Upgrade to remove FitForPDF branding from exported PDFs.')).toBeTruthy();
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

  test('suppression timestamp prevents re-showing nudge for 10 minutes', () => {
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
    fireEvent.click(screen.getByRole('button', { name: 'Not now' }));
    expect(getBrandingNudgeSuppressedUntil()).toBeGreaterThan(Date.now());

    fireEvent.click(brandingTitle);
    expect(screen.queryByTestId('branding-upgrade-nudge')).toBeNull();
    expect(onBrandingChange).not.toHaveBeenCalled();
    expect(screen.getByRole('switch', { name: 'Branding' }).getAttribute('aria-checked')).toBe('true');
    expect(onEvent).toHaveBeenCalledWith('paywall_dismissed');
  });

  test('branding nudge reappears after 10-minute suppression window', () => {
    cleanup();
    clearBrandingNudgeSuppression();
    const onEvent = vi.fn();
    const onBrandingChange = vi.fn();
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);

    renderUploadCardHarness({
      isPro: false,
      onEvent,
      onBrandingChange,
      initialOptionsExpanded: true,
    });

    const brandingTitle = within(screen.getByTestId('setting-row-branding')).getByText('Branding');
    fireEvent.click(brandingTitle);
    fireEvent.click(screen.getByRole('button', { name: 'Not now' }));

    expect(screen.queryByTestId('branding-upgrade-nudge')).toBeNull();

    vi.advanceTimersByTime(10 * 60 * 1000 + 5);
    vi.setSystemTime(now + (10 * 60 * 1000 + 5));
    fireEvent.click(brandingTitle);

    expect(onEvent).toHaveBeenCalledWith('paywall_branding_attempt');
    expect(screen.getByTestId('branding-upgrade-nudge')).toBeTruthy();
    expect(onBrandingChange).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  test('click on setting title or description toggles the row', () => {
    cleanup();
    const onBrandingChange = vi.fn();
    renderUploadCardHarness({ onBrandingChange, initialOptionsExpanded: true });
    const brandingTitle = within(screen.getByTestId('setting-row-branding')).getByText('Branding');
    const brandingDescription = screen.getByText('Adds a lightweight brand treatment by default');

    fireEvent.click(brandingTitle);
    fireEvent.click(brandingDescription);
    expect(onBrandingChange).toHaveBeenCalledTimes(2);
  });

  test('clicking tooltip inside row does not toggle setting', () => {
    cleanup();
    const onBrandingChange = vi.fn();
    renderUploadCardHarness({ onBrandingChange, initialOptionsExpanded: true });

    fireEvent.click(screen.getByLabelText('Branding info'));
    expect(onBrandingChange).toHaveBeenCalledTimes(0);
  });

  test('buy credits slot stays reserved and is displayed to the left of badge', () => {
    cleanup();
    renderUploadCardHarness({ freeExportsLeft: 1, onBuyCredits: vi.fn() });

    const slot = screen.getByTestId('quota-buy-slot');
    const badge = screen.getByTestId('quota-pill');
    const slotPosition = slot.compareDocumentPosition(badge);

    expect(slotPosition & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByTestId('quota-buy-slot').className).toContain('w-9');
    expect(screen.getByTestId('quota-buy-slot').className).toContain('h-9');
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
    renderUploadCardHarness({ freeExportsLeft: 3 });
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

  test('keyboard and tooltip accessibility', () => {
    const dropzone = screen.getByRole('button', { name: 'Upload CSV or XLSX file' });
    fireEvent.click(screen.getByRole('button', { name: 'Options' }));
    const tooltip = screen.getByLabelText('Branding info');

    expect(dropzone.getAttribute('role')).toBe('button');
    expect(dropzone.getAttribute('tabindex')).toBe('0');
    expect(tooltip).toBeTruthy();
    });
  });

describe('UploadCard conversion flow on landing page', () => {
  beforeEach(() => {
    localStorage.clear();
    configureMatchMedia({ mobile: false });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  test('sample button runs /api/render as multipart and uses source filename', async () => {
    const mock = mockFetch({
      responseFactory: (url) => {
        if (String(url).includes('/api/sample/premium')) {
          return createSampleCsvResponse();
        }
        return createPdfResponse();
      },
    });

    render(<LandingPage />);
    const realDataCard = screen.getByTestId('real-data-card');
    const demoButton = within(realDataCard).getByRole('button', { name: 'Run the demo' });
    fireEvent.click(demoButton);

    await waitFor(() => {
      expect(mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    const sampleCall = mock.calls.find((call) => String(call.url).includes('/api/sample/premium'));
    const renderCall = mock.calls.find((call) => String(call.url).includes('/api/render'));
    expect(sampleCall).toBeTruthy();
    expect(renderCall).toBeTruthy();

    const sampleCalledUrl = new URL(sampleCall.url, 'http://localhost');
    expect(sampleCalledUrl.pathname).toBe('/api/sample/premium');
    expect(sampleCall.options.method).toBeUndefined();

    const calledUrl = new URL(renderCall.url, 'http://localhost');

    expect(calledUrl.pathname).toBe('/api/render');
    expect(calledUrl.searchParams.get('columnMap')).toBe('force');
    expect(renderCall.options.method).toBe('POST');
    expect(renderCall.options.headers['X-FitForPDF-Source-Filename']).toBe('enterprise-invoices-demo.csv');
    expect(renderCall.options.body).toBeInstanceOf(FormData);
    expect(getUploadedFile(renderCall)?.name).toBe('enterprise-invoices-demo.csv');
    expect(getUploadedPayloadBody(renderCall)?.get('branding')).toBe('1');

    mock.restore();
  });

  test('shows only one demo CTA on the upload page', () => {
    const mock = mockFetch({
      response: createPdfResponse(),
      delayMs: 30,
    });

    render(<LandingPage />);

    expect(screen.getAllByRole('button', { name: 'Run the demo' })).toHaveLength(1);

    mock.restore();
  });

  test('run the demo helper text is compact and muted with wrap-friendly layout', () => {
    const mock = mockFetch({
      response: createPdfResponse(),
      delayMs: 30,
    });

    render(<LandingPage />);
    const realDataCard = screen.getByTestId('real-data-card');
    const demoButton = within(realDataCard).getByRole('button', { name: 'Run the demo' });
    const runDemoCopy = within(realDataCard).getByText('See how FitForPDF handles real-world invoice complexity.');

    expect(demoButton).toBeTruthy();
    expect(runDemoCopy).toBeTruthy();
    expect(demoButton.className).toContain('rounded-full');
    expect(demoButton.className).toContain('inline-flex');
    expect(screen.queryByTestId('run-demo-row')).toBeNull();

    mock.restore();
  });

  test('buy credits panel appears inline under options upgrade nudge', () => {
    clearBrandingNudgeSuppression();
    const mock = mockFetch({
      response: createPdfResponse(),
      delayMs: 30,
    });
    render(<LandingPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Options' }));
    const brandingTitle = within(screen.getByTestId('setting-row-branding')).getByText('Branding');
    fireEvent.click(brandingTitle);
    expect(screen.getByTestId('branding-upgrade-nudge')).toBeTruthy();

    const nudgeSection = screen.getByTestId('branding-upgrade-nudge');
    fireEvent.click(within(nudgeSection).getByRole('button', { name: 'Buy credits' }));

    const panel = screen.getByTestId('credits-purchase-panel');
    expect(panel).toBeTruthy();
    const buyPanelHost = screen.getByTestId('branding-upgrade-nudge-slot').parentElement;
    expect(buyPanelHost?.children[1]).toBe(panel);

    mock.restore();
  });

  test('progress UI follows three steps and completes after minimum visible duration', async () => {
    const mock = mockFetch({
      response: createPdfResponse(),
      delayMs: 30,
    });

    render(<LandingPage />);

    fireEvent.change(screen.getByTestId('generate-file-input'), {
      target: { files: [SAMPLE_FILE] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Generate PDF' }));

    expect(screen.getByText('Converting your file')).toBeTruthy();
    expect(screen.getByTestId('upload-progress-label').textContent).toBe('Uploading');

    await waitFor(() => {
      expect(screen.getByTestId('upload-progress-label').textContent).toBe('Structuring (column grouping)');
    }, { timeout: 2000 });

    await waitFor(() => {
      expect(screen.getByTestId('upload-progress-label').textContent).toBe('Generating PDF');
    }, { timeout: 2000 });

    await waitFor(() => {
      expect(screen.queryByText('Converting your file')).toBeNull();
      expect(screen.getByRole('button', { name: 'Download again' })).toBeTruthy();
    }, { timeout: 4000 });

    mock.restore();
  });

  test('renders exactly three progress steps', () => {
    renderUploadCardHarness({ isLoading: true, conversionProgress: { stepIndex: 0, percent: 12 } });
    const list = screen.getByRole('list', { name: /conversion steps/i });
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
  });

  test('renders progress step numbers 1, 2, 3', () => {
    renderUploadCardHarness({ isLoading: true, conversionProgress: { stepIndex: 0, percent: 12 } });
    const list = screen.getByRole('list', { name: /conversion steps/i });
    const steps = within(list).getAllByRole('listitem');

    expect(steps[0].textContent).toContain('1');
    expect(steps[1].textContent).toContain('2');
    expect(steps[2].textContent).toContain('3');
  });

  test('applies active state classes to the current step', () => {
    renderUploadCardHarness({ isLoading: true, conversionProgress: { stepIndex: 1, percent: 45 } });
    const list = screen.getByRole('list', { name: /conversion steps/i });
    const steps = within(list).getAllByRole('listitem');
    const activeCircle = within(steps[1]).getByText('2');
    const activeLabel = within(steps[1]).getByText('Structuring (column grouping)');

    expect(activeCircle.className).toContain('bg-rose-600');
    expect(activeCircle.className).toContain('text-white');
    expect(activeLabel.className).toContain('text-slate-900');
    expect(activeLabel.className).toContain('font-medium');
  });

  test('applies completed state classes to prior steps', () => {
    renderUploadCardHarness({ isLoading: true, conversionProgress: { stepIndex: 1, percent: 45 } });
    const list = screen.getByRole('list', { name: /conversion steps/i });
    const steps = within(list).getAllByRole('listitem');
    const completedCircle = within(steps[0]).getByText('1');
    const completedLabel = within(steps[0]).getByText('Uploading');

    expect(completedCircle.className).toContain('bg-emerald-50');
    expect(completedCircle.className).toContain('text-emerald-700');
    expect(completedLabel.className).toContain('text-slate-700');
  });

  test('applies pending state classes to upcoming steps', () => {
    renderUploadCardHarness({ isLoading: true, conversionProgress: { stepIndex: 1, percent: 45 } });
    const list = screen.getByRole('list', { name: /conversion steps/i });
    const steps = within(list).getAllByRole('listitem');
    const pendingCircle = within(steps[2]).getByText('3');
    const pendingLabel = within(steps[2]).getByText('Generating PDF');

    expect(pendingCircle.className).toContain('bg-slate-100');
    expect(pendingCircle.className).toContain('text-slate-400');
    expect(pendingLabel.className).toContain('text-slate-400');
  });

  test('aria-current is set only on active step', () => {
    renderUploadCardHarness({ isLoading: true, conversionProgress: { stepIndex: 1, percent: 45 } });
    const list = screen.getByRole('list', { name: /conversion steps/i });
    const steps = within(list).getAllByRole('listitem');

    expect(steps[0].getAttribute('aria-current')).toBeNull();
    expect(steps[1].getAttribute('aria-current')).toBe('step');
    expect(steps[2].getAttribute('aria-current')).toBeNull();
  });

  test('layout wrapper keeps fixed height', () => {
    renderUploadCardHarness({ isLoading: true, conversionProgress: { stepIndex: 1, percent: 45 } });
    expect(screen.getByRole('list', { name: /conversion steps/i }).className).toContain('h-14');
  });

  test('quota increments only for successful PDF responses', async () => {
    const responses = [
      createQuotaResponse({ plan_type: 'free', free_exports_left: 3 }),
      createPdfResponse(),
      createQuotaResponse({ plan_type: 'free', free_exports_left: 2 }),
      createQuotaResponse({ plan_type: 'free', free_exports_left: 2 }),
    ];

    const mock = mockFetch({
      responseFactory: () => responses.shift() || responses[0],
      delayMs: 30,
    });

    render(<LandingPage />);
    fireEvent.change(screen.getByTestId('generate-file-input'), {
      target: { files: [SAMPLE_FILE] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Generate PDF' }));

    await waitFor(() => {
      expect(screen.getByTestId('quota-pill').textContent).toMatch(/Free\s*·\s*2\s*exports\s*left/i);
    }, { timeout: 5000 });
    const quotaCalls = mock.calls.filter((call) => String(call.url).includes('/api/quota'));
    expect(quotaCalls.length).toBeGreaterThanOrEqual(2);

    mock.restore();
  });

  test('paywall blocks conversion when quota is exhausted', async () => {
    const mock = mockFetch({
      response: createQuotaResponse({ plan_type: 'free', free_exports_left: 0 }),
    });

    render(<LandingPage />);

    await waitFor(() => {
      expect(screen.getByTestId('upload-paywall')).toBeTruthy();
    });
    const uploadPaywall = screen.getByTestId('upload-paywall');
    expect(within(uploadPaywall).getByRole('button', { name: 'Buy credits' })).toBeTruthy();
    expect(within(uploadPaywall).getByRole('button', { name: 'Go Pro' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Generate PDF' })).toHaveProperty('disabled', true);
    expect(within(uploadPaywall).getByTestId('quota-upgrade-inline')).toBeTruthy();
    const uploadSection = screen.getByTestId(LANDING_COPY_KEYS.upload);
    const uploadCard = screen.getByTestId('upload-card');
    expect(within(screen.getByTestId('quota-buy-slot')).getByLabelText('Buy credits')).toBeTruthy();
    expect(screen.getByTestId('quota-pill').textContent).toMatch(/Free\s*·\s*0\s*exports\s*left/i);
    expect(within(uploadCard).queryByRole('button', { name: 'Run the demo' })).toBeNull();
    mock.restore();
  });

  test('Branding switch updates multipart branding payload', async () => {
    vi.useFakeTimers();

    const mock = mockFetch({
      response: createPdfResponse(),
      delayMs: 20,
    });

    render(<LandingPage />);
    fireEvent.change(screen.getByTestId('generate-file-input'), {
      target: { files: [SAMPLE_FILE] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Options' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Branding' }));
    fireEvent.click(screen.getByRole('button', { name: 'Generate PDF' }));

    await advanceConversion(1900);

    const call = mock.calls.find((entry) => String(entry.url).includes('/api/render'));
    expect(getUploadedPayloadBody(call)?.get('branding')).toBe('1');
    mock.restore();
  });

  test('Truncate long text switch updates truncate_long_text query param', async () => {
    vi.useFakeTimers();

    const mock = mockFetch({
      response: createPdfResponse(),
      delayMs: 20,
    });

    render(<LandingPage />);
    fireEvent.change(screen.getByTestId('generate-file-input'), {
      target: { files: [SAMPLE_FILE] },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Options' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Truncate long text' }));
    fireEvent.click(screen.getByRole('button', { name: 'Generate PDF' }));

    await advanceConversion(1900);

    const call = mock.calls.find((entry) => String(entry.url).includes('/api/render'));
    const calledUrl = new URL(call.url, 'http://localhost');
    expect(calledUrl.searchParams.get('truncate_long_text')).toBe('true');
    mock.restore();
  });
});
