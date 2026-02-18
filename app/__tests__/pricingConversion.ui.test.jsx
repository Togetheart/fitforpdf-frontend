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
    expect(screen.getByRole('heading', { level: 1, name: 'Pay only when it’s worth sending.' })).toBeTruthy();
    expect(screen.queryByRole('heading', { level: 1, name: 'Pay only for what you export.' })).toBeNull();
    expect(screen.queryByText('Start free. Upgrade only when your PDFs are worth sending.')).toBeNull();
  });

  test('renders two plan cards and credits card is highlighted', () => {
    const cards = screen.getAllByTestId('plan-card');
    const titles = cards.map((card) => within(card).getByRole('heading', { level: 3 }).textContent);
    const highlighted = screen.getAllByTestId('plan-highlighted');

    expect(cards).toHaveLength(2);
    expect(titles).toContain('Free');
    expect(titles).toContain('Credits');
    expect(highlighted).toHaveLength(1);
    expect(String(highlighted[0].textContent || '')).toContain('Most popular');
    expect(screen.getByTestId('plan-highlighted')).toBeTruthy();
  });

  test('credits card lists both pack variants', () => {
    const creditsCard = screen.getByTestId('plan-credits')?.closest('[data-testid="plan-card"]') || null;
    const body = creditsCard ? creditsCard.textContent : '';

    expect(creditsCard).toBeTruthy();
    expect(body).toContain('100 exports');
    expect(body).toContain('€19');
    expect(body).toContain('500 exports');
    expect(body).toContain('€79');
  });

  test('contains a comparison table and faq', () => {
    const compare = screen.getByTestId('pricing-compare');
    const text = compare.textContent || '';
    const faq = screen.getByTestId('pricing-faq');

    expect(compare).toBeTruthy();
    expect(faq).toBeTruthy();
    expect(text).toContain('Client-ready PDF output');
    expect(text).toContain('Branding removable');
    expect(text).toContain('Batch export');
    expect(text).toContain('API access');
    expect(screen.getByTestId('plan-highlighted')).toBeTruthy();
  });

  test('faq opens one item at a time and icon rotates', () => {
    const faq = screen.getByTestId('pricing-faq');
    const buttons = within(faq).getAllByRole('button');
    expect(buttons.length).toBe(4);

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
    expect(firstChevron?.getAttribute('class') || '').toContain('rotate-180');
    expect(second.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(second);
    expect(second.getAttribute('aria-expanded')).toBe('true');
    expect(secondChevron?.getAttribute('class') || '').toContain('rotate-180');
    expect(first.getAttribute('aria-expanded')).toBe('false');
  });
});
