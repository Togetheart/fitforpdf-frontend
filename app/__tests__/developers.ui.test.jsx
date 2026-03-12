/**
 * /developers page — TDD tests for the "Get your API key" flow.
 *
 * Verifies:
 *   1. Page renders with all critical documentation sections
 *   2. Request access form validates and submits
 *   3. Success/error states display correctly
 *   4. API documentation matches actual backend spec
 */

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';

import DevelopersPage from '../developers/page.jsx';

// ── Helpers ──────────────────────────────────────────────────────

function mockFetchOnce(status, body) {
  global.fetch = vi.fn(() =>
    Promise.resolve(
      new Response(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json' },
      })
    )
  );
}

beforeEach(() => {
  // clipboard stub
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn(() => Promise.resolve()) },
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// ── Page structure ───────────────────────────────────────────────

describe('Developers page — documentation sections', () => {
  test('renders the page title and API base URL', () => {
    render(<DevelopersPage />);
    // API base URL appears multiple times (hero + code samples), use getAllByText
    const matches = screen.getAllByText(/api\.fitforpdf\.com\/v1/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  test('shows all 3 endpoints (health, quota, render)', () => {
    render(<DevelopersPage />);
    expect(screen.getAllByText('/v1/health').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('/v1/quota').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('/v1/render').length).toBeGreaterThanOrEqual(1);
  });

  test('shows auth required badge for protected endpoints', () => {
    render(<DevelopersPage />);
    const authBadges = screen.getAllByText('auth required');
    // quota + render = 2 auth-protected endpoints
    expect(authBadges.length).toBe(2);
  });

  test('documents the X-FITFORPDF-KEY header', () => {
    render(<DevelopersPage />);
    expect(screen.getByText('X-FITFORPDF-KEY')).toBeTruthy();
  });

  test('documents the ffp_live_ key prefix', () => {
    render(<DevelopersPage />);
    const matches = screen.getAllByText(/ffp_live_/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  test('shows all render options from backend spec', () => {
    render(<DevelopersPage />);
    const expectedOptions = ['mode', 'branding', 'columnMap', 'locale', 'pagination', 'compress'];
    for (const opt of expectedOptions) {
      expect(screen.getAllByText(opt).length).toBeGreaterThanOrEqual(1);
    }
  });

  test('shows error codes matching backend implementation', () => {
    render(<DevelopersPage />);
    const expectedCodes = [
      'api_key_missing',
      'api_key_invalid',
      'free_quota_exhausted',
      'credits_exhausted',
      'rate_limited',
      'file_too_large',
    ];
    for (const code of expectedCodes) {
      expect(screen.getByText(code)).toBeTruthy();
    }
  });

  test('shows response headers documentation', () => {
    render(<DevelopersPage />);
    expect(screen.getByText('X-FitForPDF-Score')).toBeTruthy();
    expect(screen.getByText('X-FitForPDF-Verdict')).toBeTruthy();
    expect(screen.getByText('X-Render-MS')).toBeTruthy();
  });

  test('shows rate limit info (60 req/min)', () => {
    render(<DevelopersPage />);
    expect(screen.getByText(/60 requests per minute/)).toBeTruthy();
  });
});

// ── Request access form ──────────────────────────────────────────

describe('Developers page — request access form', () => {
  test('renders form with name, email, and useCase fields', () => {
    render(<DevelopersPage />);
    // Actual placeholders from the component
    expect(screen.getByPlaceholderText('Jane Smith')).toBeTruthy();
    expect(screen.getByPlaceholderText('jane@company.com')).toBeTruthy();
    expect(screen.getByPlaceholderText(/Auto-generating client reports/)).toBeTruthy();
  });

  test('renders "Get your API key" heading', () => {
    render(<DevelopersPage />);
    expect(screen.getByText('Get your API key')).toBeTruthy();
  });

  test('submit button says "Request early access"', () => {
    render(<DevelopersPage />);
    expect(screen.getByRole('button', { name: /Request early access/ })).toBeTruthy();
  });

  test('submits form and shows success state', async () => {
    render(<DevelopersPage />);

    mockFetchOnce(201, {
      message: "Request received. We'll review it and send your API key within 24 hours.",
    });

    fireEvent.change(screen.getByPlaceholderText('Jane Smith'), {
      target: { value: 'Jane Doe' },
    });
    fireEvent.change(screen.getByPlaceholderText('jane@company.com'), {
      target: { value: 'jane@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Auto-generating/), {
      target: { value: 'CRM export reports' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Request early access/ }));

    await waitFor(() => {
      // Success state shows "You're on the list"
      expect(screen.getByText(/on the list/i)).toBeTruthy();
    });

    // Verify fetch was called with correct payload
    expect(global.fetch).toHaveBeenCalledWith('/api/request-access', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Doe',
        email: 'jane@example.com',
        useCase: 'CRM export reports',
      }),
    });
  });

  test('shows error message on backend validation error', async () => {
    render(<DevelopersPage />);

    mockFetchOnce(400, {
      error: { code: 'invalid_email', message: 'A valid email address is required.' },
    });

    // Use a syntactically valid email so HTML5 validation doesn't block submit
    fireEvent.change(screen.getByPlaceholderText('Jane Smith'), {
      target: { value: 'Jane' },
    });
    fireEvent.change(screen.getByPlaceholderText('jane@company.com'), {
      target: { value: 'test@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Request early access/ }));

    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeTruthy();
    });
  });

  test('shows duplicate request error (409 already_requested)', async () => {
    render(<DevelopersPage />);

    mockFetchOnce(409, {
      error: { code: 'already_requested', message: "A request for this email is already pending." },
    });

    fireEvent.change(screen.getByPlaceholderText('Jane Smith'), {
      target: { value: 'Jane' },
    });
    fireEvent.change(screen.getByPlaceholderText('jane@company.com'), {
      target: { value: 'jane@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Request early access/ }));

    await waitFor(() => {
      expect(screen.getByText(/already pending/i)).toBeTruthy();
    });
  });

  test('handles network error gracefully', async () => {
    render(<DevelopersPage />);

    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    fireEvent.change(screen.getByPlaceholderText('Jane Smith'), {
      target: { value: 'Jane' },
    });
    fireEvent.change(screen.getByPlaceholderText('jane@company.com'), {
      target: { value: 'jane@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Request early access/ }));

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeTruthy();
    });
  });
});
