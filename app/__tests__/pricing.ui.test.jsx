import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';

import PricingPage, { default as PricingPageDefaultExport } from '../pricing/page.jsx';
import { PRICING_PAGE_COPY } from '../siteCopy.mjs';

beforeEach(() => {
  render(<PricingPage />);
});

afterEach(() => {
  cleanup();
});

describe('pricing page UI', () => {
  test('pricing page exports a React component', () => {
    expect(typeof PricingPageDefaultExport).toBe('function');
    expect(PricingPage).toBe(PricingPageDefaultExport);
  });

  test('renders 3 primary columns with desktop 3-col grid classes', () => {
    const primaryGrid = screen.getByTestId('pricing-primary-grid');
    const cards = within(primaryGrid).getAllByRole('article');

    expect(primaryGrid.className.includes('grid-cols-1')).toBe(true);
    expect(primaryGrid.className.includes('md:grid-cols-3')).toBe(true);
    expect(cards).toHaveLength(3);
  });

  test('contains free, credits 100, credits 500, pro, and API offerings', () => {
    expect(screen.getByRole('heading', { name: /Free/i, level: 2 })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /Credits 100 exports/i, level: 2 })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /Credits 500 exports/i, level: 2 })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /Pro \(coming soon\)/i, level: 2 })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /API \(coming soon\)/i, level: 2 })).toBeTruthy();
  });

  test('Join early access CTA is present as a link', () => {
    const joinLink = screen.getByRole('link', { name: /Join early access/i });

    expect(joinLink).toBeTruthy();
    expect(joinLink.getAttribute('href')).toBe(PRICING_PAGE_COPY.apiCtaHref);
  });
});
