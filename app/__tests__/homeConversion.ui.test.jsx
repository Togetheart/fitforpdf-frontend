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
  test('hero contains exactly one primary CTA and no extra hero buttons', () => {
    const hero = screen.getByTestId('hero-section');
    const primary = screen.getByTestId('hero-primary-cta');
    const links = within(hero).getAllByRole('link');

    expect(primary.getAttribute('href')).toBe('#generate');
    expect(primary.textContent).toBe('Generate PDF');
    expect(links).toHaveLength(1);
    expect(within(hero).queryByRole('link', { name: 'See pricing' })).toBeNull();
    expect(within(hero).queryByRole('link', { name: 'Try on Telegram' })).toBeNull();
  });

  test('hero is followed by upload module and FAQ is present', () => {
    const hero = screen.getByTestId('hero-section');
    const toolSection = screen.getByTestId(LANDING_COPY_KEYS.upload);
    const faq = screen.getByTestId('home-faq');

    expect(hero.compareDocumentPosition(toolSection) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(hero.compareDocumentPosition(faq) & Node.DOCUMENT_POSITION_PRECEDING).toBeFalsy();
  });

  test('upload module includes dropzone, toggles and quota badge', () => {
    const tool = screen.getByTestId(LANDING_COPY_KEYS.upload);

    expect(within(tool).getByTestId('upload-dropzone')).toBeTruthy();
    expect(within(tool).getAllByRole('switch')).toHaveLength(2);
    expect(within(tool).getByRole('switch', { name: 'Branding' })).toBeTruthy();
    expect(within(tool).getByRole('switch', { name: 'Truncate long text' })).toBeTruthy();
    expect(within(tool).getByTestId('quota-pill').textContent).toMatch(/Free\s*·\s*(?:\d+\s*exports left|1 export left)/i);
  });

  test('hero CTA points to the generate button anchor', () => {
    const generateTitle = screen.getByRole('heading', { name: 'Generate a client-ready PDF' });
    expect(screen.getByTestId('hero-primary-cta').getAttribute('href')).toBe('#generate');
    expect(generateTitle.getAttribute('id')).toBe('generate');
    expect(generateTitle.className).toContain('scroll-mt-24');
  });

  test('upload action is not available before file selection and enabled after selecting', () => {
    const tool = screen.getByTestId(LANDING_COPY_KEYS.upload);
    const cta = within(tool).getByRole('button', { name: 'Generate PDF' });

    expect(cta).toHaveProperty('disabled', true);

    const input = screen.getByTestId('generate-file-input');
    const file = new File(['name,score\na,1'], 'report.csv', { type: 'text/csv' });
    fireEvent.change(input, {
      target: { files: [file] },
    });

    expect(within(tool).getByText('report.csv')).toBeTruthy();
    expect(within(tool).getByRole('button', { name: 'Generate PDF' })).toHaveProperty('disabled', false);
  });

  test('pricing preview renders three cards', () => {
    const pricingCards = screen.getAllByTestId('pricing-preview-card');
    expect(pricingCards).toHaveLength(3);
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
    expect(chevron.getAttribute('class') || '').toContain('rotate-180');
  });
});
