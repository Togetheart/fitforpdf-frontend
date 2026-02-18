import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';

import Landing from '../page.jsx';

vi.mock('../components/BeforeAfter.mjs', () => ({
  default: () => <div data-layout="stack" data-testid="before-after" />,
}));

function ensureMatchMedia() {
  if (window.matchMedia) return;
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: () => ({
      matches: false,
      media: '(max-width: 768px)',
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => {},
    }),
  });
}

beforeEach(() => {
  ensureMatchMedia();
  render(<Landing />);
});

afterEach(() => {
  cleanup();
});

describe('pricing highlight on home', () => {
  test('home pricing preview renders exactly three cards', () => {
    const pricingGrid = screen.getByTestId('pricing-grid');
    const cards = within(pricingGrid).getAllByTestId('plan-card');

    expect(cards).toHaveLength(3);
  });

  test('credits is the only highlighted plan card', () => {
    const highlightedCards = screen.getAllByTestId('plan-highlighted');
    const allCards = screen.getAllByTestId('plan-card');

    expect(highlightedCards).toHaveLength(1);
    expect(allCards).toHaveLength(3);

    const creditsCard = screen.getByTestId('plan-highlighted').closest('[data-testid="plan-card"]');
    expect(creditsCard).toBeTruthy();
    expect(creditsCard.querySelector('h3')?.textContent).toBe('Credits');
  });

  test('highlighted credits card contains both pack rows', () => {
    const creditsCard = screen.getByTestId('plan-highlighted').closest('[data-testid="plan-card"]');
    const cardText = creditsCard ? creditsCard.textContent : '';

    expect(cardText).toContain('100 exports · €19');
    expect(cardText).toContain('500 exports · €79');
  });

  test('free card and pro card contain required pricing text', () => {
    const cards = screen.getAllByTestId('plan-card');
    const freeCard = cards.find((card) => /Free/i.test(card.querySelector('h3')?.textContent || ''));
    const proCard = cards.find((card) => /Pro \+ API/i.test(card.querySelector('h3')?.textContent || ''));

    expect(freeCard).toBeTruthy();
    expect(proCard).toBeTruthy();
    expect(freeCard?.textContent || '').toContain('5 exports total');
    expect(proCard?.textContent || '').toContain('€29/month');
  });
});
