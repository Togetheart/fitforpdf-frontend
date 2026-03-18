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
  test('home pricing preview renders exactly three PAYG cards', () => {
    const cards = screen.getAllByTestId('payg-plan-card');

    expect(cards).toHaveLength(3);
    expect(screen.queryByTestId('plan-card')).toBeNull();
    expect(screen.queryByTestId('pricing-grid')).toBeNull();
  });

  test('PAYG cards show correct prices', () => {
    const cards = screen.getAllByTestId('payg-plan-card');
    const allText = cards.map((c) => c.textContent || '').join(' ');

    expect(allText).toContain('$4.90');
    expect(allText).toContain('$19');
    expect(allText).toContain('$79');
  });

  test('starter pack is marked as recommended (Most popular)', () => {
    const cards = screen.getAllByTestId('payg-plan-card');
    const popularTexts = cards.filter((c) => (c.textContent || '').includes('Most popular'));

    expect(popularTexts).toHaveLength(1);
  });

  test('plan cards contain required pricing text', () => {
    const cards = screen.getAllByTestId('payg-plan-card');
    const allText = cards.map((c) => c.textContent || '').join(' ');

    expect(allText).toContain('$4.90');
    expect(allText).toContain('$19');
    expect(allText).toContain('$79');
  });
});
