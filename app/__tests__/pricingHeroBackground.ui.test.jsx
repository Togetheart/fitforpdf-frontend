import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';

import PricingPage from '../pricing/page.jsx';

function configureMatchMedia({ mobile = false } = {}) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query) => ({
      matches: mobile,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => true,
    }),
  });
}

beforeEach(() => {
  configureMatchMedia({ mobile: false });
});

afterEach(() => {
  cleanup();
});

describe('pricing page hero section', () => {
  test('pricing page renders without errors', () => {
    render(<PricingPage />);
    expect(document.body).toBeTruthy();
  });

  test('pricing page has a simple hero section with h1 heading', () => {
    render(<PricingPage />);

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeTruthy();
    expect(h1.textContent).toContain('Simple pricing.');
    expect(h1.textContent).toContain('Built for professionals.');
    expect(screen.queryByTestId('hero-bg')).toBeNull();
    expect(screen.queryByTestId('hero-bg-gradients')).toBeNull();
    expect(screen.queryByTestId('page-hero')).toBeNull();
  });

  test('pricing page renders PAYG cards, comparison, and FAQ', () => {
    render(<PricingPage />);

    const cards = screen.getAllByTestId('payg-plan-card');
    expect(cards).toHaveLength(3);
    expect(screen.getByTestId('pricing-compare')).toBeTruthy();
    expect(screen.getByTestId('pricing-faq')).toBeTruthy();
  });
});
