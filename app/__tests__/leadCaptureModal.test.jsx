import { describe, test, expect, afterEach, beforeEach, vi } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import LeadCaptureModal, {
  SUPPRESSION_KEY,
  getSuppressedUntil,
  setSuppressedUntil,
} from '../components/LeadCaptureModal';

function clearSuppression() {
  try {
    window.localStorage.removeItem(SUPPRESSION_KEY);
  } catch {
    // ignore
  }
}

beforeEach(() => {
  clearSuppression();
  // Default fetch mock — 200 OK. Tests can override per case.
  global.fetch = vi.fn(() =>
    Promise.resolve(
      new Response(JSON.stringify({ ok: true, stored: false }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    )
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
  clearSuppression();
});

describe('LeadCaptureModal', () => {
  test('does not render until the trigger is true', () => {
    render(<LeadCaptureModal trigger={false} openDelayMs={0} />);
    expect(screen.queryByTestId('lead-capture-modal')).toBeNull();
  });

  test('opens when trigger flips true (with delay=0 in tests)', async () => {
    render(<LeadCaptureModal trigger={true} openDelayMs={0} />);
    await waitFor(() => expect(screen.getByTestId('lead-capture-modal')).toBeTruthy());
  });

  test('does NOT open if suppression is active', async () => {
    setSuppressedUntil(Date.now() + 60 * 1000);
    render(<LeadCaptureModal trigger={true} openDelayMs={0} />);
    // Give the effect a tick to NOT do anything
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByTestId('lead-capture-modal')).toBeNull();
  });

  test('Skip button suppresses for 30 days and closes the modal', async () => {
    render(<LeadCaptureModal trigger={true} openDelayMs={0} />);
    await waitFor(() => expect(screen.getByTestId('lead-capture-modal')).toBeTruthy());

    const skip = screen.getByTestId('lead-capture-skip');
    fireEvent.click(skip);

    expect(screen.queryByTestId('lead-capture-modal')).toBeNull();
    expect(getSuppressedUntil()).toBeGreaterThan(Date.now());
  });

  test('rejects invalid email format with an error message', async () => {
    render(<LeadCaptureModal trigger={true} openDelayMs={0} />);
    await waitFor(() => expect(screen.getByTestId('lead-capture-modal')).toBeTruthy());

    const input = screen.getByTestId('lead-capture-email');
    fireEvent.change(input, { target: { value: 'not-an-email' } });
    // Submit the form directly: jsdom doesn't reliably wire button[type=submit]
    // to the form, and we want to assert the synchronous validation path.
    fireEvent.submit(input.closest('form'));

    await waitFor(() => expect(screen.getByTestId('lead-capture-error')).toBeTruthy());
    // fetch must NOT have been called for invalid input
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('valid email POSTs to /api/leads and shows success', async () => {
    render(
      <LeadCaptureModal
        trigger={true}
        renderId="r-123"
        source="render_success"
        openDelayMs={0}
      />
    );
    await waitFor(() => expect(screen.getByTestId('lead-capture-modal')).toBeTruthy());

    const input = screen.getByTestId('lead-capture-email');
    fireEvent.change(input, { target: { value: 'me@example.com' } });
    fireEvent.submit(input.closest('form'));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    const [calledUrl, opts] = global.fetch.mock.calls[0];
    expect(calledUrl).toBe('/api/leads');
    const payload = JSON.parse(opts.body);
    expect(payload).toEqual({
      email: 'me@example.com',
      source: 'render_success',
      renderId: 'r-123',
    });

    // Suppression set after success
    await waitFor(() => expect(getSuppressedUntil()).toBeGreaterThan(Date.now()));
  });
});
