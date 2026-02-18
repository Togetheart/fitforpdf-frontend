import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen, within, waitFor } from '@testing-library/react';

import LandingPage from '../page.jsx';
import { LANDING_COPY } from '../siteCopy.mjs';

function configureMatchMedia({ mobile = false, reduceMotion = false } = {}) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query) => ({
      matches: query.includes('prefers-reduced-motion')
        ? reduceMotion
        : query.includes('max-width: 768px')
          ? mobile
          : false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => true,
    }),
  });
}

function renderHome() {
  configureMatchMedia({ mobile: false, reduceMotion: false });
  return render(<LandingPage />);
}

function createPdfResponse() {
  return new Response(new Blob(['%PDF-1.4'], { type: 'application/pdf' }), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
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

function mockFetch() {
  const originalFetch = global.fetch;
  const calls = [];
  global.fetch = vi.fn((url, options = {}) => {
    let response = createPdfResponse();

    if (String(url).includes('/api/sample/premium')) {
      response = createSampleCsvResponse();
    }

    calls.push({ url, options, response });

    return Promise.resolve(response);
  });

  return {
    calls,
    restore: () => {
      global.fetch = originalFetch;
    },
  };
}

beforeEach(() => {
  renderHome();
});

afterEach(() => {
  cleanup();
});

describe('home demo proof block', () => {
  test('keeps hero heading and CTA text unchanged', () => {
    expect(screen.getByRole('heading', { level: 1, name: 'Your spreadsheet. Reorganized into readable sections. Ready to send.' })).toBeTruthy();
    expect(screen.getByTestId('hero-primary-cta').textContent?.trim()).toBe(LANDING_COPY.heroPrimaryCta);
  });

  test('proof block is in dedicated home-demo section', () => {
    const proofSection = screen.getByTestId('section-before-after');
    const previewCard = screen.getByTestId('home-preview-card');
    const demoButton = screen.getByRole('button', { name: 'Try with demo file' });

    expect(screen.queryByTestId('demo-glass-card')).toBeNull();
    expect(screen.queryByTestId('section-home-demo')).toBeNull();
    expect(proofSection).toBeTruthy();
    expect(proofSection.contains(previewCard)).toBe(true);
    expect(demoButton).toBeTruthy();
  });

  test('Try with demo CTA is unique on landing', () => {
    const buttons = screen.getAllByRole('button', { name: 'Try with demo file' });
    expect(buttons).toHaveLength(1);
  });

  test('demo helper content is present', () => {
    const demoButton = screen.getByRole('button', { name: 'Try with demo file' });
    const uploadCard = screen.getByTestId('upload-card');
    const helperText = within(uploadCard).getByText('120 rows · 15 columns · invoices');

    expect(uploadCard).toBeTruthy();
    expect(demoButton.className).toContain('rounded-full');
    expect(helperText).toBeTruthy();
  });

  test('Try with demo flow loads premium CSV and converts', async () => {
    const fetchMock = mockFetch();
    const demoButton = screen.getByRole('button', { name: 'Try with demo file' });
    fireEvent.click(demoButton);

    await waitFor(() => {
      expect(fetchMock.calls.length).toBe(2);
    });

    const sampleCall = fetchMock.calls.find((call) => String(call.url).includes('/api/sample/premium'));
    const renderCall = fetchMock.calls.find((call) => String(call.url).includes('/api/render'));
    expect(sampleCall).toBeTruthy();
    expect(renderCall).toBeTruthy();

    const sampleUrl = new URL(sampleCall.url, 'http://localhost');
    const renderUrl = new URL(renderCall.url, 'http://localhost');

    expect(sampleUrl.pathname).toBe('/api/sample/premium');
    expect(renderUrl.pathname).toBe('/api/render');
    expect(renderCall.options.method).toBe('POST');
    expect(renderCall.options.body).toBeInstanceOf(FormData);

    fetchMock.restore();
  });

  test('no demo glass embed remains on landing', () => {
    expect(screen.queryByTestId('demo-glass-card')).toBeNull();
  });
});
