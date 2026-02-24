import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';

import PricingPage, { default as PricingPageDefaultExport } from '../pricing/page.jsx';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { PRICING_PAGE_COPY } from '../siteCopy.mjs';

function configureMatchMedia({ mobile = false, reduceMotion = false } = {}) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query) => ({
      matches: query.includes('prefers-reduced-motion')
        ? reduceMotion
        : query.includes('max-width: 768px')
          ? mobile
          : false,
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
  configureMatchMedia({ mobile: false, reduceMotion: false });
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

  test('renders the pricing hero heading', () => {
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeTruthy();
    expect(h1.textContent).toContain('Simple pricing.');
    expect(h1.textContent).toContain('Built for professionals.');
  });

  test('renders exactly 3 PAYG plan cards', () => {
    const cards = screen.getAllByTestId('payg-plan-card');

    expect(cards).toHaveLength(3);
    expect(screen.queryByTestId('pricing-grid')).toBeNull();
    expect(screen.queryByTestId('plan-card')).toBeNull();
  });

  test('plan cards show correct prices', () => {
    const pageText = document.body.textContent || '';

    expect(pageText.includes('$2.90')).toBe(true);
    expect(pageText.includes('$15')).toBe(true);
    expect(pageText.includes('$49')).toBe(true);
  });

  test('comparison table is present and has comparison test id', () => {
    const compare = screen.getByTestId('pricing-compare');
    expect(compare).toBeTruthy();
    const compareText = compare.textContent || '';

    expect(compareText).toContain('Client-ready PDF output');
    expect(compareText).toContain('FitForPDF attribution');
    expect(compareText).toContain('Batch export');
    expect(compareText).toContain('API access');
    expect(compareText).not.toContain('Branding removable');
  });

  test('pricing comparison mobile cards have bg-hero class', () => {
    const featureRows = screen.getAllByTestId('feature-compare-row');
    expect(featureRows.length).toBeGreaterThan(0);

    featureRows.forEach((row) => {
      const className = row.getAttribute('class') || '';
      expect(className).toContain('bg-hero');
    });
  });

  test('FAQ exists and is interactive', () => {
    const faq = screen.getByTestId('pricing-faq');
    const firstQuestion = PRICING_PAGE_COPY.faq[0].q;

    expect(faq).toBeTruthy();
    expect(within(faq).getByRole('button', { name: firstQuestion })).toBeTruthy();
  });

  test('clicking first FAQ question expands answer and rotates icon to rotate-45', () => {
    const firstQuestion = PRICING_PAGE_COPY.faq[0].q;
    const firstButton = screen.getByRole('button', { name: firstQuestion });
    const panelId = firstButton.getAttribute('aria-controls');
    const panel = document.getElementById(panelId || '');
    const icon = firstButton.querySelector('[data-testid="faq-chevron"]');

    expect(firstButton.getAttribute('aria-expanded')).toBe('false');
    expect(panel).toBeTruthy();
    expect(panel.getAttribute('class') || '').toContain('max-h-0');
    expect(panel.getAttribute('class') || '').toContain('opacity-0');
    expect(icon).toBeTruthy();
    expect((icon?.getAttribute('class') || '').includes('rotate-45')).toBe(false);

    fireEvent.click(firstButton);

    expect(firstButton.getAttribute('aria-expanded')).toBe('true');
    expect(panel.getAttribute('class') || '').toContain('max-h-[20rem]');
    expect(panel.getAttribute('class') || '').toContain('opacity-100');
    const updatedIcon = firstButton.querySelector('[data-testid="faq-chevron"]');
    expect((updatedIcon?.getAttribute('class') || '').includes('rotate-45')).toBe(true);
  });

  test('contains expected plan pricing values', () => {
    const pageText = document.body.textContent || '';

    expect(pageText.includes('$2.90')).toBe(true);
    expect(pageText.includes('$15')).toBe(true);
    expect(pageText.includes('$49')).toBe(true);
    expect(pageText.includes('€29/month')).toBe(false);
    expect(pageText.includes('Coming soon')).toBe(false);
  });
});
