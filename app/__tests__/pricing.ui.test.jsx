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
    const titles = cards.map((card) => within(card).getByRole('heading', { level: 3 }).textContent || '');
    pricingPlanTitles.forEach((title) => {
      expect(titles).toContain(title);
    });
    expect(screen.getByText(PRICING_PAGE_COPY.creditsBadge)).toBeTruthy();
    expect(cards.find((card) => card.getAttribute('data-featured') === 'true')).toBeTruthy();
  });

  test('only one badge is shown for the most popular card', () => {
    const badges = screen.getAllByTestId('pricing-badge');
    const featuredCards = screen.getAllByRole('article').filter((card) => card.getAttribute('data-featured') === 'true');

    expect(badges).toHaveLength(1);
    expect(featuredCards).toHaveLength(1);
    expect(featuredCards[0].textContent).toContain(PRICING_PAGE_COPY.creditsBadge);
  });

  test('contains exact expected prices', () => {
    const pageText = document.body.textContent || '';

    expect(pageText.includes('100 exports')).toBe(true);
    expect(pageText.includes('€19')).toBe(true);
    expect(pageText.includes('500 exports')).toBe(true);
    expect(pageText.includes('€79')).toBe(true);
    expect(pageText.includes('€29/month')).toBe(true);
  });

  test('each plan has exactly one CTA', () => {
    const cards = screen.getAllByRole('article');
    cards.forEach((card) => {
      const actions = [...within(card).queryAllByRole('link'), ...within(card).queryAllByRole('button')];
      expect(actions).toHaveLength(1);
    });
  });

  test('credits action is disabled and explained as coming soon', () => {
    const button = screen.getByRole('button', { name: PRICING_PAGE_COPY.creditsCtaLabel });
    expect(button.disabled).toBe(true);
    expect(screen.getByText(PRICING_PAGE_COPY.creditsCtaTooltip)).toBeTruthy();
  });

  test('comparison table is rendered', () => {
    expect(screen.getByTestId('pricing-comparison-table')).toBeTruthy();
    expect(screen.getByRole('table')).toBeTruthy();
    expect(screen.getByText('Feature comparison')).toBeTruthy();
  });

  test('Join early access CTA is present as a mail link', () => {
    const joinLink = screen.getByRole('link', { name: /Join early access/i });
    expect(joinLink).toBeTruthy();
    expect(joinLink.getAttribute('href')).toBe(PRICING_PAGE_COPY.proApiCtaHref);
  });

  test('FAQ renders 4 accordion items', () => {
    const faqSection = screen.getByTestId('section-pricing-faq');
    const faqToggles = within(faqSection).getAllByRole('button');

    expect(faqToggles).toHaveLength(PRICING_PAGE_COPY.faq.length);
  });

  test('pricing hero copy matches high-trust value framing', () => {
    expect(screen.getByRole('heading', { level: 1, name: PRICING_PAGE_COPY.pageTitle })).toBeTruthy();
    expect(screen.getByText(PRICING_PAGE_COPY.pageMicro)).toBeTruthy();
    expect(screen.getByText(PRICING_PAGE_COPY.socialProof)).toBeTruthy();
  });
});
