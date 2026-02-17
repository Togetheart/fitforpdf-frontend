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
}) {
  return function Harness() {
    const [currentFile, setCurrentFile] = useState(file);

    return (
      <UploadCard
        toolTitle="Generate a client-ready PDF"
        toolSubcopy="3 free exports. No account."
        file={currentFile}
        freeExportsLeft={freeExportsLeft}
        includeBranding
        truncateLongText={false}
        isLoading={isLoading}
        hasResultBlob={hasResultBlob}
        onFileSelect={setCurrentFile}
        onRemoveFile={() => setCurrentFile(null)}
        onBrandingChange={onBrandingChange}
        onTruncateChange={onTruncateChange}
        onSubmit={onSubmit}
        onDownloadAgain={() => {}}
        onTrySample={() => {}}
        downloadedFileName={null}
        verdict={null}
        conversionProgress={conversionProgress}
        onBuyCredits={onBuyCredits}
        showBuyCreditsForTwo={showBuyCreditsForTwo}
      />
    );
  };
}

function renderUploadCardHarness({
  freeExportsLeft = 3,
  onSubmit = () => {},
  onBuyCredits = () => {},
  showBuyCreditsForTwo = false,
  isLoading = false,
  conversionProgress = null,
  onBrandingChange = () => {},
  onTruncateChange = () => {},
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
  });
  render(<Harness />);
  return { onBuyCredits, onBrandingChange, onTruncateChange };
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

    if (delayMs > 0) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(selected), delayMs);
      });
    }

    return Promise.resolve(selected);
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
    vi.advanceTimersByTime(ms);
    await Promise.resolve();
  });
}

describe('UploadCard unit behavior', () => {
  beforeEach(() => {
    localStorage.clear();
    configureMatchMedia({ mobile: true });
    renderUploadCardHarness({ freeExportsLeft: 3 });
  });

  afterEach(() => {
    cleanup();
  });

  test('renders free exports badge with premium copy', () => {
    expect(screen.getByTestId('quota-pill').textContent).toMatch(/Free\s*·\s*3\s*exports\s*left/i);
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
      expectedText: '1 export left',
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
    expect(screen.getByText('Buy credits')).toBeTruthy();

    fireEvent.click(buyButton);
    expect(onBuyCredits).toHaveBeenCalledTimes(1);
  });

  test('click on setting title or description toggles the row', () => {
    cleanup();
    const onBrandingChange = vi.fn();
    renderUploadCardHarness({ onBrandingChange });
    const brandingTitle = within(screen.getByTestId('setting-row-branding')).getByText('Branding');
    const brandingDescription = screen.getByText('Adds a lightweight brand treatment by default');

    fireEvent.click(brandingTitle);
    fireEvent.click(brandingDescription);
    expect(onBrandingChange).toHaveBeenCalledTimes(2);
  });

  test('clicking tooltip inside row does not toggle setting', () => {
    cleanup();
    const onBrandingChange = vi.fn();
    renderUploadCardHarness({ onBrandingChange });

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
    renderUploadCardHarness({ freeExportsLeft: 1, onBuyCredits });

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
    const uploadSection = screen.getByTestId(LANDING_COPY_KEYS.upload);
    const uploadCard = screen.getByTestId('upload-card');
    fireEvent.click(within(uploadCard).getByRole('button', { name: 'Run the demo' }));

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
    const uploadCard = screen.getByTestId('upload-card');
    const demoRow = within(uploadCard).getByTestId('run-demo-row');
    const demoButton = within(demoRow).getByRole('button', { name: 'Run the demo' });
    const demoPhrase = within(demoRow).getByText('See how FitForPDF handles real-world invoice complexity.');
    const separator = within(demoRow).getByText('·');
    const stats = within(demoRow).getByText('120 rows · 14 columns · long descriptions');

    expect(demoButton).toBeTruthy();
    expect(demoPhrase).toBeTruthy();
    expect(separator).toBeTruthy();
    expect(stats).toBeTruthy();
    expect(demoRow.className).toContain('flex');
    expect(demoRow.className).toContain('flex-wrap');
    expect(demoRow.className).toContain('gap-x-2');
    expect(demoRow.className).toContain('gap-y-1');
    expect(demoRow.className).toContain('items-center');
    expect(demoRow.className).toContain('text-sm');
    expect(demoButton.className).toContain('font-semibold');
    expect(demoPhrase.className).toContain('text-slate-600');
    expect(separator.className).toContain('text-slate-400');
    expect(stats.className).toContain('text-slate-500');
    expect(demoRow.children).toHaveLength(4);

    mock.restore();
  });

  test('progress UI follows three steps and completes after minimum visible duration', async () => {
    vi.useFakeTimers();

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

    await advanceConversion(520);
    expect(screen.getByTestId('upload-progress-label').textContent).toBe('Structuring (column grouping)');

    await advanceConversion(560);
    expect(screen.getByTestId('upload-progress-label').textContent).toBe('Generating PDF');

    await advanceConversion(920);
    expect(screen.queryByText('Converting your file')).toBeNull();
    expect(screen.getByRole('button', { name: 'Download again' })).toBeTruthy();

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
    vi.useFakeTimers();

    const responses = [
      createPdfResponse(),
      createJsonResponse(400, { error: 'bad' }),
      createJsonResponse(200, { error: 'ok', verdict: 'OK' }),
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
    await advanceConversion(1900);

    expect(localStorage.getItem('fitforpdf_free_exports_used')).toBe('1');
    expect(screen.getByTestId('quota-pill').textContent).toMatch(/Free\s*·\s*2\s*exports left/i);

    cleanup();

    render(<LandingPage />);
    fireEvent.change(screen.getByTestId('generate-file-input'), {
      target: { files: [SAMPLE_FILE] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Generate PDF' }));
    await advanceConversion(1900);
    expect(localStorage.getItem('fitforpdf_free_exports_used')).toBe('1');
    expect(screen.getByTestId('quota-pill').textContent).toMatch(/Free\s*·\s*2\s*exports left/i);

    cleanup();

    render(<LandingPage />);
    fireEvent.change(screen.getByTestId('generate-file-input'), {
      target: { files: [SAMPLE_FILE] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Generate PDF' }));
    await advanceConversion(1900);
    expect(localStorage.getItem('fitforpdf_free_exports_used')).toBe('1');
    expect(screen.getByTestId('quota-pill').textContent).toMatch(/Free\s*·\s*2\s*exports left/i);

    mock.restore();
  });

  test('paywall blocks conversion when quota is exhausted', () => {
    localStorage.setItem('fitforpdf_free_exports_used', '3');

    render(<LandingPage />);

    expect(screen.getByRole('link', { name: 'Upgrade to continue' })).toBeTruthy();
    expect(screen.getByTestId('upload-paywall')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Generate PDF' })).toBeNull();
    const uploadSection = screen.getByTestId(LANDING_COPY_KEYS.upload);
    const uploadCard = screen.getByTestId('upload-card');
    expect(within(uploadCard).queryByRole('button', { name: 'Run the demo' })).toBeNull();
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
    fireEvent.click(screen.getByRole('switch', { name: 'Branding' }));
    fireEvent.click(screen.getByRole('button', { name: 'Generate PDF' }));

    await advanceConversion(1900);

    const [call] = mock.calls;
    expect(getUploadedPayloadBody(call)?.get('branding')).toBe('0');
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

    fireEvent.click(screen.getByRole('switch', { name: 'Truncate long text' }));
    fireEvent.click(screen.getByRole('button', { name: 'Generate PDF' }));

    await advanceConversion(1900);

    const [call] = mock.calls;
    const calledUrl = new URL(call.url, 'http://localhost');
    expect(calledUrl.searchParams.get('truncate_long_text')).toBe('true');
    mock.restore();
  });
});
