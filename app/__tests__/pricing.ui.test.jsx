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
  test('has page hero shell and backdrop', () => {
    const hero = screen.getByTestId('page-hero');
    expect(hero).toBeTruthy();

    const backdrop = hero.querySelector('[data-testid="hero-backdrop"]');
    const heroBg = hero.querySelector('[data-testid="hero-bg"]');
    const heroGradients = hero.querySelector('[data-testid="hero-bg-gradients"]');

    expect(backdrop).toBeTruthy();
    expect(backdrop?.getAttribute('aria-hidden')).toBe('true');
    expect(heroBg).toBeTruthy();
    expect(heroGradients).toBeTruthy();
  });

  test('hero backdrop animation disabled in reduced-motion mode', () => {
    cleanup();
    configureMatchMedia({ mobile: false, reduceMotion: true });
    render(
      <>
        <SiteHeader />
        <PricingPage />
        <SiteFooter />
      </>,
    );

    const gradients = screen.getByTestId('hero-bg-gradients');
    expect((gradients.getAttribute('class') || '').includes('hero-bg-animate')).toBe(false);
  });

  test('pricing page exports a React component', () => {
    expect(typeof PricingPageDefaultExport).toBe('function');
    expect(PricingPage).toBe(PricingPageDefaultExport);
  });

  test('header and footer are present', () => {
    expect(screen.getAllByRole('navigation').length).toBeGreaterThan(1);
    expect(screen.getByRole('contentinfo')).toBeTruthy();
  });

  test('renders the pricing hero heading', () => {
    expect(screen.getByRole('heading', { level: 1, name: 'Pay only for what you export.' })).toBeTruthy();
  });

  test('renders exactly 3 plan cards with correct grid behavior', () => {
    const grid = screen.getByTestId('pricing-grid');
    const cards = screen.getAllByTestId('plan-card');

    expect(grid).toBeTruthy();
    expect((grid.getAttribute('class') || '').includes('grid-cols-1')).toBe(true);
    expect((grid.getAttribute('class') || '').includes('md:grid-cols-3')).toBe(true);
    expect(cards).toHaveLength(3);
    expect(screen.getByRole('heading', { level: 3, name: 'Free' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: 'Credits' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: 'Pro + API' })).toBeTruthy();
  });

  test('credits card lists both packs and prices', () => {
    const cards = screen.getAllByTestId('plan-card');
    const creditsCard = cards.find((card) =>
      /Credits/i.test(within(card).queryByRole('heading', { level: 3 })?.textContent || ''),
    );

    expect(creditsCard).toBeTruthy();
    expect(within(creditsCard).getByText('100 exports · €19')).toBeTruthy();
    expect(within(creditsCard).getByText('500 exports · €79')).toBeTruthy();
  });

  test('comparison table is present and has comparison test id', () => {
    const compare = screen.getByTestId('pricing-compare');
    expect(compare).toBeTruthy();
    const compareText = compare.textContent || '';

    expect(compareText).toContain('Client-ready PDF output');
    expect(compareText).toContain('Branding removable');
    expect(compareText).toContain('Batch export');
    expect(compareText).toContain('API access');
  });

  test('FAQ exists and is interactive', () => {
    const faq = screen.getByTestId('pricing-faq');
    const firstQuestion = PRICING_PAGE_COPY.faq[0].q;

    expect(faq).toBeTruthy();
    expect(within(faq).getByRole('button', { name: firstQuestion })).toBeTruthy();
  });

  test('clicking first FAQ question expands answer and rotates icon', () => {
    const firstQuestion = PRICING_PAGE_COPY.faq[0].q;
    const firstButton = screen.getByRole('button', { name: firstQuestion });
    const panelId = firstButton.getAttribute('aria-controls');
    const panel = document.getElementById(panelId || '');
    const icon = firstButton.querySelector('[data-testid="faq-chevron"]') || firstButton.querySelector('svg:last-child');
    const iconClass = icon ? icon.getAttribute('class') || '' : '';

    expect(firstButton.getAttribute('aria-expanded')).toBe('false');
    expect(panel).toBeTruthy();
    expect(panel.getAttribute('class') || '').toContain('grid-rows-[0fr]');
    expect(iconClass.includes('rotate-180')).toBe(false);

    fireEvent.click(firstButton);

    expect(firstButton.getAttribute('aria-expanded')).toBe('true');
    expect(panel.getAttribute('class') || '').toContain('grid-rows-[1fr]');
    expect(panel.getAttribute('class') || '').toContain('opacity-100');
    const updatedIcon = firstButton.querySelector('[data-testid="faq-chevron"]') || firstButton.querySelector('svg:last-child');
    const updatedIconClass = updatedIcon ? updatedIcon.getAttribute('class') || '' : '';
    expect(updatedIconClass.includes('rotate-180')).toBe(true);
  });

  test('contains expected plan pricing values', () => {
    const pageText = document.body.textContent || '';

    expect(pageText.includes('100 exports · €19')).toBe(true);
    expect(pageText.includes('500 exports · €79')).toBe(true);
    expect(pageText.includes('€29/month')).toBe(true);
  });

  test('pricing CTA items are intentional for no-Stripe state', () => {
    const creditsButton = screen.getByRole('button', { name: PRICING_PAGE_COPY.creditsCtaLabel });
    expect(creditsButton).toBeTruthy();
    expect(creditsButton.getAttribute('disabled')).toBe('');
  });
});
