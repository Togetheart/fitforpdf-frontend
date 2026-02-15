import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React, { useState } from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import UploadCard from '../components/UploadCard';
import LandingPage from '../page.jsx';

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
  file = null,
  isLoading = false,
  conversionProgress = null,
  hasResultBlob = false,
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
        onBrandingChange={() => {}}
        onTruncateChange={() => {}}
        onSubmit={onSubmit}
        onDownloadAgain={() => {}}
        onTrySample={() => {}}
        downloadedFileName={null}
        verdict={null}
        conversionProgress={conversionProgress}
      />
    );
  };
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
    const Harness = UploadCardHarness({ freeExportsLeft: 3 });
    render(<Harness />);
  });

  afterEach(() => {
    cleanup();
  });

  test('renders free exports badge with premium copy', () => {
    expect(screen.getByTestId('quota-pill').textContent).toMatch(/Free\.\s*3\s*exports left/i);
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
        if (String(url).includes('/sample/premium.csv')) {
          return createSampleCsvResponse();
        }
        return createPdfResponse();
      },
    });

    render(<LandingPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Try premium demo (120 rows · 14 columns)' }));

    await waitFor(() => {
      expect(mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    const sampleCall = mock.calls.find((call) => String(call.url).includes('/sample/premium.csv'));
    const renderCall = mock.calls.find((call) => String(call.url).includes('/api/render'));
    expect(sampleCall).toBeTruthy();
    expect(renderCall).toBeTruthy();

    const sampleCalledUrl = new URL(sampleCall.url, 'http://localhost');
    expect(sampleCalledUrl.pathname).toBe('/sample/premium.csv');
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
    expect(screen.getByTestId('quota-pill').textContent).toMatch(/Free\.\s*2\s*exports left/i);

    cleanup();

    render(<LandingPage />);
    fireEvent.change(screen.getByTestId('generate-file-input'), {
      target: { files: [SAMPLE_FILE] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Generate PDF' }));
    await advanceConversion(1900);
    expect(localStorage.getItem('fitforpdf_free_exports_used')).toBe('1');
    expect(screen.getByTestId('quota-pill').textContent).toMatch(/Free\.\s*2\s*exports left/i);

    cleanup();

    render(<LandingPage />);
    fireEvent.change(screen.getByTestId('generate-file-input'), {
      target: { files: [SAMPLE_FILE] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Generate PDF' }));
    await advanceConversion(1900);
    expect(localStorage.getItem('fitforpdf_free_exports_used')).toBe('1');
    expect(screen.getByTestId('quota-pill').textContent).toMatch(/Free\.\s*2\s*exports left/i);

    mock.restore();
  });

  test('paywall blocks conversion when quota is exhausted', () => {
    localStorage.setItem('fitforpdf_free_exports_used', '3');

    render(<LandingPage />);

    expect(screen.getByRole('link', { name: 'Upgrade to continue' })).toBeTruthy();
    expect(screen.getByTestId('upload-paywall')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Generate PDF' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Try premium demo (120 rows · 14 columns)' })).toBeNull();
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
