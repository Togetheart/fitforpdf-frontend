import React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

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

function createPdfResponse() {
  return new Response(new Blob(['%PDF-1.4'], { type: 'application/pdf' }), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': 'attachment; filename="enterprise-invoices-demo.pdf"',
      'x-cleansheet-column-map-rendered': '1',
    },
  });
}

function createSampleCsvResponse() {
  return new Response('invoice_id,client_name,client_email\nINV-1001,Acme,finance@acme.com', {
    status: 200,
    headers: {
      'content-type': 'text/csv',
    },
  });
}

function mockFetch({ responseFactory }) {
  const originalFetch = global.fetch;
  const calls = [];

  global.fetch = vi.fn((url, options = {}) => {
    const selected = responseFactory(url, options);
    calls.push({ url, options, response: selected });
    return Promise.resolve(selected);
  });

  return {
    calls,
    restore: () => {
      global.fetch = originalFetch;
    },
  };
}

describe('Premium sample demo conversion UI', () => {
  beforeEach(() => {
    localStorage.clear();
    configureMatchMedia({ mobile: false });
  });

  afterEach(() => {
    cleanup();
  });

  test('shows demo CTA in upload block', () => {
    render(<LandingPage />);

    expect(screen.queryByText('120 rows · 15 columns · invoices')).toBeNull();
    expect(screen.getByTestId('upload-card')).toBeTruthy();
    expect(screen.getByTestId('demo-try-button')).toBeTruthy();
  });

  test('Run the demo triggers premium CSV fetch then /api/render', async () => {
    const mock = mockFetch({
      responseFactory: (url) => (String(url).includes('/api/sample/premium')
        ? createSampleCsvResponse()
        : createPdfResponse()),
    });

    render(<LandingPage />);
    fireEvent.click(screen.getByTestId('demo-try-button'));

    await waitFor(() => {
      expect(mock.calls).toHaveLength(2);
    });

    const sampleCall = mock.calls.find((call) => String(call.url).includes('/api/sample/premium'));
    const renderCall = mock.calls.find((call) => String(call.url).includes('/api/render'));

    expect(sampleCall).toBeTruthy();
    expect(renderCall).toBeTruthy();
    expect(sampleCall.options.method || 'GET').toBe('GET');
    expect(renderCall.options.method).toBe('POST');
    expect(renderCall.options.headers['X-FitForPDF-Source-Filename']).toBe('enterprise-invoices-demo.csv');
    expect(renderCall.options.body).toBeInstanceOf(FormData);

    mock.restore();
  });
});
