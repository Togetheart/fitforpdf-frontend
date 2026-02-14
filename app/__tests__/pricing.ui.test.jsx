import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';

import PricingPage, { default as PricingPageDefaultExport } from '../pricing/page.jsx';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { PRICING_CARDS, PRICING_PAGE_COPY } from '../siteCopy.mjs';

const pricingPlanTitles = PRICING_CARDS.map((plan) => plan.title);

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

describe('pricing page UI', () => {
  test('pricing page exports a React component', () => {
    expect(typeof PricingPageDefaultExport).toBe('function');
    expect(PricingPage).toBe(PricingPageDefaultExport);
  });

  test('header and footer are present', () => {
    expect(screen.getAllByRole('navigation').length).toBeGreaterThan(1);
    expect(screen.getByRole('contentinfo')).toBeTruthy();
  });

  test('renders 3 cards with desktop 3-col grid classes', () => {
    const grid = screen.getByTestId('pricing-grid');
    const cards = within(grid).getAllByRole('article');

    expect(grid.className.includes('grid-cols-1')).toBe(true);
    expect(grid.className.includes('md:grid-cols-3')).toBe(true);
    expect(cards).toHaveLength(3);
    expect(cards[1].getAttribute('data-featured')).toBe('true');
  });

  test('contains expected pricing titles', () => {
    pricingPlanTitles.forEach((title) => {
      expect(screen.getByRole('heading', { name: title, level: 2 })).toBeTruthy();
    });
  });

  test('renders exact expected prices', () => {
    const pageText = document.body.textContent || '';

    expect(pageText.includes('€19')).toBe(true);
    expect(pageText.includes('€79')).toBe(true);
    expect(pageText.includes('€29/month')).toBe(true);
  });

  test('Join early access CTA is present as a link', () => {
    const joinLink = screen.getByRole('link', { name: /Join early access/i });

    expect(joinLink).toBeTruthy();
    expect(joinLink.getAttribute('href')).toBe(PRICING_PAGE_COPY.proApiCtaHref);
  });
});
