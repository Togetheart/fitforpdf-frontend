import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import ConsentBanner from '../components/ConsentBanner';

const KEY = 'ffp-analytics-consent';

beforeEach(() => {
  localStorage.clear();
  window.posthog = { opt_in_capturing: vi.fn(), opt_out_capturing: vi.fn() };
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('ConsentBanner (GDPR/CNIL gate)', () => {
  test('shows when no choice has been made yet', () => {
    render(<ConsentBanner />);
    expect(screen.getByRole('dialog', { name: /consent/i })).toBeTruthy();
  });

  test('Accept opts capturing IN, persists "granted", and hides', () => {
    render(<ConsentBanner />);
    fireEvent.click(screen.getByRole('button', { name: /accept/i }));
    expect(window.posthog.opt_in_capturing).toHaveBeenCalledTimes(1);
    expect(window.posthog.opt_out_capturing).not.toHaveBeenCalled();
    expect(localStorage.getItem(KEY)).toBe('granted');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  test('Decline opts capturing OUT, persists "denied", and hides', () => {
    render(<ConsentBanner />);
    fireEvent.click(screen.getByRole('button', { name: /decline/i }));
    expect(window.posthog.opt_out_capturing).toHaveBeenCalledTimes(1);
    expect(window.posthog.opt_in_capturing).not.toHaveBeenCalled();
    expect(localStorage.getItem(KEY)).toBe('denied');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  test('stays hidden when a choice already exists (no nag on return)', () => {
    localStorage.setItem(KEY, 'denied');
    render(<ConsentBanner />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  test('re-opens on the ffp:open-consent event (footer withdrawal path)', () => {
    localStorage.setItem(KEY, 'granted');
    render(<ConsentBanner />);
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent(window, new Event('ffp:open-consent'));
    expect(screen.getByRole('dialog')).toBeTruthy();
  });
});
