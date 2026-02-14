import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';

import PricingPage from '../pricing/page.jsx';

beforeEach(() => {
  render(<PricingPage />);
});

afterEach(() => {
  cleanup();
});

describe('pricing page highlight', () => {
  test('pricing page renders exactly three plan cards', () => {
    const cards = screen.getAllByTestId('plan-card');
    const grid = screen.getByTestId('pricing-grid');

    expect(grid).toBeTruthy();
    expect(cards).toHaveLength(3);
  });

  test('only credits card is highlighted and has Most popular', () => {
    const highlighted = screen.getAllByTestId('plan-highlighted');
    const cards = screen.getAllByTestId('plan-card');

    expect(highlighted).toHaveLength(1);
    expect(highlighted[0]).toBeTruthy();
    expect(highlighted[0].textContent).toContain('Most popular');

    const highlightedCard = highlighted[0].closest('[data-testid="plan-card"]');
    expect(highlightedCard).toBeTruthy();
    expect(highlightedCard?.getAttribute('data-featured')).toBe('true');

    cards
      .filter((card) => card !== highlightedCard)
      .forEach((card) => expect(card.getAttribute('data-featured')).toBe('false'));
  });

  test('credits card includes both pack rows', () => {
    const creditsCard = screen.getByTestId('plan-highlighted').closest('[data-testid="plan-card"]');
    const creditsText = creditsCard ? creditsCard.textContent || '' : '';

    expect(creditsText).toContain('100 exports • €19');
    expect(creditsText).toContain('500 exports • €79');
  });

  test('comparison and faq sections are present', () => {
    expect(screen.getByTestId('pricing-compare')).toBeTruthy();
    expect(screen.getByTestId('pricing-faq')).toBeTruthy();
  });
});
