import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';

import PricingPage from '../pricing/page.jsx';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

beforeEach(() => {
  render(
    <>
      <SiteHeader />
      <PricingPage />
      <SiteFooter />
    </>,
  );
});

afterEach(() => {
  cleanup();
});

describe('pricing conversion UI', () => {
  test('renders main pricing title', () => {
    expect(screen.getByRole('heading', { level: 1, name: 'Pay only for what you export.' })).toBeTruthy();
  });

  test('renders three plan cards and credits card is highlighted', () => {
    const cards = screen.getAllByTestId('plan-card');
    const titles = cards.map((card) => within(card).getByRole('heading', { level: 3 }).textContent);

    expect(cards).toHaveLength(3);
    expect(titles).toContain('Free');
    expect(titles).toContain('Credits');
    expect(titles).toContain('Pro + API');
    expect(screen.getByTestId('plan-highlighted')).toBeTruthy();
  });

  test('credits card lists both pack variants', () => {
    const creditsCard = screen.getByTestId('plan-highlighted').closest('[data-testid="plan-card"]') || null;
    const body = creditsCard ? creditsCard.textContent : '';

    expect(creditsCard).toBeTruthy();
    expect(body).toContain('100 exports • €19');
    expect(body).toContain('500 exports • €79');
  });

  test('contains a comparison table and faq', () => {
    const compare = screen.getByTestId('pricing-compare');
    const faq = screen.getByTestId('pricing-faq');

    expect(compare).toBeTruthy();
    expect(faq).toBeTruthy();
  });
});
