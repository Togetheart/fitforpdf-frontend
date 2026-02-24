import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';

import PricingPage from '../pricing/page.jsx';

beforeEach(() => {
  render(<PricingPage />);
});

afterEach(() => {
  cleanup();
});

describe('pricing page highlight', () => {
  test('pricing page renders exactly three PAYG plan cards', () => {
    const cards = screen.getAllByTestId('payg-plan-card');

    expect(cards).toHaveLength(3);
    expect(screen.queryByTestId('plan-card')).toBeNull();
    expect(screen.queryByTestId('pricing-grid')).toBeNull();
    expect(screen.queryByTestId('plan-highlighted')).toBeNull();
  });

  test('starter pack card is the only recommended card', () => {
    const cards = screen.getAllByTestId('payg-plan-card');
    const recommendedCards = cards.filter((card) =>
      (card.textContent || '').includes('Most popular'),
    );

    expect(recommendedCards).toHaveLength(1);
  });

  test('plan cards include correct pricing values', () => {
    const cards = screen.getAllByTestId('payg-plan-card');
    const allText = cards.map((c) => c.textContent || '').join(' ');

    expect(allText).toContain('$2.90');
    expect(allText).toContain('$15');
    expect(allText).toContain('$49');
  });

  test('comparison and faq sections are present', () => {
    expect(screen.getByTestId('pricing-compare')).toBeTruthy();
    expect(screen.getByTestId('pricing-faq')).toBeTruthy();
  });
});
