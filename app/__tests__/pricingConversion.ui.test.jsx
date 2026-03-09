import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';

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
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeTruthy();
    expect(h1.textContent).toContain('Simple pricing.');
    expect(h1.textContent).toContain('Built for professionals.');
  });

  test('renders three PAYG plan cards', () => {
    const cards = screen.getAllByTestId('payg-plan-card');

    expect(cards).toHaveLength(3);
    expect(screen.queryByTestId('plan-highlighted')).toBeNull();
    expect(screen.queryByTestId('plan-card')).toBeNull();
  });

  test('plan cards list correct prices', () => {
    const cards = screen.getAllByTestId('payg-plan-card');
    const allText = cards.map((c) => c.textContent || '').join(' ');

    expect(allText).toContain('$2.90');
    expect(allText).toContain('$15');
    expect(allText).toContain('$49');
  });

  test('contains a comparison table and faq', () => {
    const compare = screen.getByTestId('pricing-compare');
    const text = compare.textContent || '';
    const faq = screen.getByTestId('pricing-faq');

    expect(compare).toBeTruthy();
    expect(faq).toBeTruthy();
    expect(text).toContain('Client-ready PDF output');
    expect(text).toContain('fitforpdf attribution');
    expect(text).toContain('Batch export');
    expect(text).toContain('API access');
    expect(text).toContain('Pro subscription');
    expect(text).not.toContain('Pro Sub');
    expect(screen.queryByTestId('plan-highlighted')).toBeNull();
  });

  test('faq opens one item at a time and icon rotates to rotate-45', () => {
    const faq = screen.getByTestId('pricing-faq');
    const buttons = within(faq).getAllByRole('button');
    expect(buttons.length).toBe(5);

    const first = buttons[0];
    const second = buttons[1];
    const firstPanel = document.getElementById(first.getAttribute('aria-controls') || '');
    const secondPanel = document.getElementById(second.getAttribute('aria-controls') || '');
    const firstChevron = first.querySelector('[data-testid="faq-chevron"]');
    const secondChevron = second.querySelector('[data-testid="faq-chevron"]');

    expect(firstPanel).toBeTruthy();
    expect(secondPanel).toBeTruthy();
    expect(first.getAttribute('aria-expanded')).toBe('false');
    expect(second.getAttribute('aria-expanded')).toBe('false');
    expect(firstChevron).toBeTruthy();
    expect(secondChevron).toBeTruthy();

    fireEvent.click(first);
    expect(first.getAttribute('aria-expanded')).toBe('true');
    expect(firstChevron?.getAttribute('class') || '').toContain('rotate-45');
    expect(second.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(second);
    expect(second.getAttribute('aria-expanded')).toBe('true');
    expect(secondChevron?.getAttribute('class') || '').toContain('rotate-45');
    expect(first.getAttribute('aria-expanded')).toBe('false');
  });
});
