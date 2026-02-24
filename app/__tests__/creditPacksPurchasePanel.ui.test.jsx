/**
 * TDD — credits-purchase-panel and upload-paywall must display prices and
 * export counts from PAYG_PACKS (new pricing) and call onBuyCreditsPack
 * with the correct Stripe pack identifiers (stripePackId).
 *
 * RED: tests fail because UploadCard still has hardcoded CREDIT_PACKS
 * showing old prices ($19 / $69) and old pack IDs.
 */

import { afterEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';

import UploadCard from '../components/UploadCard';

const BASE_PROPS = {
  toolTitle: 'FitForPDF',
  toolSubcopy: '3 free exports. No account required.',
  file: null,
  freeExportsLeft: 3,
  includeBranding: true,
  truncateLongText: false,
  isLoading: false,
  hasResultBlob: false,
  onFileSelect: () => {},
  onRemoveFile: () => {},
  onBrandingChange: () => {},
  onTruncateChange: () => {},
  onSubmit: () => {},
  onDownloadAgain: () => {},
  onTrySample: () => {},
  downloadedFileName: null,
  verdict: null,
  conversionProgress: null,
  onBuyCredits: () => {},
  isPro: false,
  onUpgrade: () => {},
  onEvent: () => {},
  planType: 'free',
  remainingInPeriod: null,
  purchaseMessage: '',
  onGoPro: () => {},
  onCloseBuyPanel: () => {},
  onBuyCreditsPack: () => {},
};

function renderWithPanel(overrides = {}) {
  const onBuyCreditsPack = vi.fn();
  render(
    <UploadCard
      {...BASE_PROPS}
      showBuyCreditsPanel
      onBuyCreditsPack={onBuyCreditsPack}
      {...overrides}
    />,
  );
  return { onBuyCreditsPack };
}

function renderWithPaywall(overrides = {}) {
  const onBuyCreditsPack = vi.fn();
  render(
    <UploadCard
      {...BASE_PROPS}
      isQuotaLocked
      freeExportsLeft={0}
      onBuyCreditsPack={onBuyCreditsPack}
      {...overrides}
    />,
  );
  return { onBuyCreditsPack };
}

afterEach(cleanup);

// ── credits-purchase-panel (shown via showBuyCreditsPanel) ────────────────

describe('credits-purchase-panel shows new PAYG_PACKS prices', () => {
  test('shows $2.90 for 1 export (single)', () => {
    renderWithPanel();
    const panel = screen.getByTestId('credits-purchase-panel');
    expect(within(panel).getByText('$2.90')).toBeTruthy();
    expect(within(panel).getByText('1 export')).toBeTruthy();
  });

  test('shows $15 for 10 exports (payg-starter)', () => {
    renderWithPanel();
    const panel = screen.getByTestId('credits-purchase-panel');
    expect(within(panel).getByText('$15')).toBeTruthy();
    expect(within(panel).getByText('10 exports')).toBeTruthy();
  });

  test('shows $49 for 100 exports (volume)', () => {
    renderWithPanel();
    const panel = screen.getByTestId('credits-purchase-panel');
    expect(within(panel).getByText('$49')).toBeTruthy();
    expect(within(panel).getByText('100 exports')).toBeTruthy();
  });

  test('does NOT show old prices $19 or $69', () => {
    renderWithPanel();
    const panel = screen.getByTestId('credits-purchase-panel');
    expect(within(panel).queryByText('$19')).toBeNull();
    expect(within(panel).queryByText('$69')).toBeNull();
  });
});

describe('credits-purchase-panel calls onBuyCreditsPack with correct Stripe pack IDs', () => {
  test('1-export button calls onBuyCreditsPack("credits_1")', () => {
    const { onBuyCreditsPack } = renderWithPanel();
    const panel = screen.getByTestId('credits-purchase-panel');
    const btn = within(panel).getAllByRole('button').find((b) =>
      b.textContent.includes('1 export'),
    );
    expect(btn).toBeTruthy();
    fireEvent.click(btn);
    expect(onBuyCreditsPack).toHaveBeenCalledWith('credits_1');
  });

  test('10-export button calls onBuyCreditsPack("credits_10")', () => {
    const { onBuyCreditsPack } = renderWithPanel();
    const panel = screen.getByTestId('credits-purchase-panel');
    const btn = within(panel).getAllByRole('button').find((b) =>
      b.textContent.includes('10 exports'),
    );
    expect(btn).toBeTruthy();
    fireEvent.click(btn);
    expect(onBuyCreditsPack).toHaveBeenCalledWith('credits_10');
  });

  test('100-export button calls onBuyCreditsPack("credits_100")', () => {
    const { onBuyCreditsPack } = renderWithPanel();
    const panel = screen.getByTestId('credits-purchase-panel');
    const btn = within(panel).getAllByRole('button').find((b) =>
      b.textContent.includes('100 exports'),
    );
    expect(btn).toBeTruthy();
    fireEvent.click(btn);
    expect(onBuyCreditsPack).toHaveBeenCalledWith('credits_100');
  });
});

// ── upload-paywall (shown via isQuotaLocked) ──────────────────────────────

describe('upload-paywall shows new PAYG_PACKS prices', () => {
  test('shows $15 for 10 exports (payg-starter)', () => {
    renderWithPaywall();
    const paywall = screen.getByTestId('upload-paywall');
    expect(within(paywall).getByText('$15')).toBeTruthy();
    expect(within(paywall).getByText('10 exports')).toBeTruthy();
  });

  test('shows $49 for 100 exports (volume)', () => {
    renderWithPaywall();
    const paywall = screen.getByTestId('upload-paywall');
    expect(within(paywall).getByText('$49')).toBeTruthy();
    expect(within(paywall).getByText('100 exports')).toBeTruthy();
  });

  test('does NOT show old prices $19 or $69', () => {
    renderWithPaywall();
    const paywall = screen.getByTestId('upload-paywall');
    expect(within(paywall).queryByText('$19')).toBeNull();
    expect(within(paywall).queryByText('$69')).toBeNull();
  });
});

describe('upload-paywall calls onBuyCreditsPack with correct Stripe pack IDs', () => {
  test('10-export paywall button calls onBuyCreditsPack("credits_10")', () => {
    const { onBuyCreditsPack } = renderWithPaywall();
    const paywall = screen.getByTestId('upload-paywall');
    const btn = within(paywall).getAllByRole('button').find((b) =>
      b.textContent.includes('10 exports'),
    );
    expect(btn).toBeTruthy();
    fireEvent.click(btn);
    expect(onBuyCreditsPack).toHaveBeenCalledWith('credits_10');
  });

  test('100-export paywall button calls onBuyCreditsPack("credits_100")', () => {
    const { onBuyCreditsPack } = renderWithPaywall();
    const paywall = screen.getByTestId('upload-paywall');
    const btn = within(paywall).getAllByRole('button').find((b) =>
      b.textContent.includes('100 exports'),
    );
    expect(btn).toBeTruthy();
    fireEvent.click(btn);
    expect(onBuyCreditsPack).toHaveBeenCalledWith('credits_100');
  });
});
