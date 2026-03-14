import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';

import LandingPage from '../page.jsx';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { LANDING_COPY_KEYS, HOME_FAQ } from '../siteCopy.mjs';

vi.mock('../components/BeforeAfter.mjs', () => ({
  default: () => <div data-testid="before-after" />,
}));

function configureMatchMedia({ mobile = false } = {}) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: () => ({
      matches: mobile,
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
  configureMatchMedia({ mobile: false });
  render(
    <>
      <SiteHeader />
      <LandingPage />
      <SiteFooter />
    </>,
  );
});

afterEach(() => {
  cleanup();
});

describe('home conversion-critical UI', () => {
  test('hero has no standalone CTA — upload card is the primary action', () => {
    const hero = screen.getByTestId('hero-section');

    expect(screen.queryByTestId('hero-primary-cta')).toBeNull();
    expect(within(hero).queryByRole('link', { name: 'Generate PDF' })).toBeNull();
    expect(within(hero).queryByRole('link', { name: 'See pricing' })).toBeNull();
    expect(within(hero).queryByRole('link', { name: 'Try on Telegram' })).toBeNull();
    // Upload card now lives in its own section after the hero (proof-first flow)
    expect(screen.getByTestId('upload-card')).toBeTruthy();
  });

  test('upload module is outside hero and FAQ is present', () => {
    const hero = screen.getByTestId('hero-section');
    const toolSection = screen.getByTestId(LANDING_COPY_KEYS.upload);
    const faq = screen.getByTestId('home-faq');

    // Upload card moved outside hero (proof-first flow)
    expect(hero.contains(toolSection)).toBe(false);
    expect(hero.contains(faq)).toBeFalsy();
    expect(screen.getAllByTestId(LANDING_COPY_KEYS.upload)).toHaveLength(1);
    // Tool section still follows hero in document order
    expect(hero.compareDocumentPosition(toolSection) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test('upload module includes dropzone, toggles and quota badge', () => {
    const tool = screen.getByTestId(LANDING_COPY_KEYS.upload);

    expect(within(tool).getByTestId('upload-dropzone')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Advanced options' })).toBeTruthy();
    expect(screen.queryByRole('switch')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Advanced options' }));

    expect(within(tool).getAllByRole('switch')).toHaveLength(5);
    expect(within(tool).getByRole('switch', { name: 'Branding' })).toBeTruthy();
    expect(within(tool).getByRole('switch', { name: 'Truncate long text' })).toBeTruthy();
    expect(
      within(tool).getByTestId('quota-pill').textContent,
    ).toMatch(/(?:Free$|Free\s*·\s*(?:\d+\s*exports left|1 export left))/i);
  });

  test('upload card heading is anchored for scroll targeting', () => {
    const generateEl = document.getElementById('generate');
    expect(generateEl).toBeTruthy();
    expect(generateEl.className).toContain('scroll-mt-24');
    expect(screen.queryByTestId('hero-primary-cta')).toBeNull();
  });

  test('upload action is not available before file selection and enabled after selecting', () => {
    const tool = screen.getByTestId(LANDING_COPY_KEYS.upload);
    const cta = within(tool).getByRole('button', { name: 'Generate PDF' });
    const ctaClass = cta.getAttribute('class') || '';

    expect(cta).toHaveProperty('disabled', true);
    expect(ctaClass).toContain('bg-accent');

    const input = screen.getByTestId('generate-file-input');
    const file = new File(['name,score\na,1'], 'report.csv', { type: 'text/csv' });
    fireEvent.change(input, {
      target: { files: [file] },
    });

    expect(within(tool).getByText('report.csv')).toBeTruthy();
    expect(within(tool).getByRole('button', { name: 'Generate PDF' })).toHaveProperty('disabled', false);
  });

  test('pricing preview renders plan cards', () => {
    const pricingCards = screen.getAllByTestId('payg-plan-card');
    expect(pricingCards.length).toBeGreaterThanOrEqual(1);
  });

  test('home faq uses accordion items with expanding behavior', () => {
    const firstQuestion = HOME_FAQ[0].q;
    const firstButton = screen.getByRole('button', { name: firstQuestion });
    const panel = document.getElementById(firstButton.getAttribute('aria-controls'));
    const chevron = firstButton.querySelector('[data-testid="faq-chevron"]');
    const panelClass = (panel?.getAttribute('class') || '');

    expect(firstButton.getAttribute('aria-expanded')).toBe('false');
    expect(panel).toBeTruthy();
    expect(panelClass).toContain('max-h-0');

    fireEvent.click(firstButton);

    expect(firstButton.getAttribute('aria-expanded')).toBe('true');
    expect(panel?.getAttribute('class') || '').toContain('max-h-[20rem]');
    expect(chevron.getAttribute('class') || '').toContain('rotate-45');
  });
});
