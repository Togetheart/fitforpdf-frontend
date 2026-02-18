import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';

import Landing from '../page.jsx';
import { LANDING_COPY, LANDING_COPY_KEYS } from '../siteCopy.mjs';

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
  render(<Landing />);
});

afterEach(() => {
  cleanup();
});

describe('landing conversion-first structure', () => {
  test('sections exist in strict order', () => {
      const hero = screen.getByTestId('hero-section');
      const proof = screen.getByTestId(`section-${LANDING_COPY_KEYS.beforeAfter}`);
      const howItWorks = screen.getByTestId('section-how-it-works');
      const pricing = screen.getByTestId(`section-${LANDING_COPY_KEYS.pricingPreview}`);
      const privacy = screen.getByTestId(`section-${LANDING_COPY_KEYS.privacyStrip}`);

    expect(hero).toBeTruthy();
    expect(proof).toBeTruthy();
    expect(howItWorks).toBeTruthy();
    expect(pricing).toBeTruthy();
    expect(privacy).toBeTruthy();
    expect(hero.compareDocumentPosition(proof) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(proof.compareDocumentPosition(howItWorks) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(howItWorks.compareDocumentPosition(pricing) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(pricing.compareDocumentPosition(privacy) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test('legacy demo section below options is removed', () => {
    expect(screen.queryByTestId('section-home-demo')).toBeNull();
  });

  test('hero has exactly one primary CTA and no other hero links', () => {
    const hero = screen.getByTestId('hero-section');
    const primary = within(hero).getByTestId('hero-primary-cta');
    const links = within(hero).getAllByRole('link');

    expect(primary).toBeTruthy();
    expect(primary.textContent).toBe('Generate PDF');
    expect(primary.getAttribute('href')).toBe('#generate');
    expect(links).toHaveLength(1);
  });

  test('hero has headline/subline/trust line', () => {
    expect(screen.getByText(LANDING_COPY.heroSubheadline)).toBeTruthy();
    expect(screen.getByText(LANDING_COPY.heroTrustLine)).toBeTruthy();
    expect(screen.getAllByText(LANDING_COPY.heroTrustLine)).toHaveLength(1);
  });

  test('hero includes subtle gradient background and CTA glow utility', () => {
    const heroBackdrop = screen.getByTestId('hero-backdrop');
    const heroBg = screen.getByTestId('hero-bg');
    const heroGradients = screen.getByTestId('hero-bg-gradients');
    const primary = screen.getByTestId('hero-primary-cta');

    expect((heroBackdrop.getAttribute('class') || '').includes('hero-backdrop')).toBe(true);
    expect((heroBg.getAttribute('class') || '').includes('hero-bg')).toBe(true);
    expect((heroGradients.getAttribute('class') || '').includes('hero-bg-gradients')).toBe(true);
    expect(primary.getAttribute('class') || '').toContain('hover:shadow-[0_0_40px_rgba(239,68,68,0.25)]');
    expect(heroBackdrop.getAttribute('data-motion')).toBe('on');
  });

  test('pricing preview renders free + credits cards only', () => {
    const pricingGrid = screen.getByTestId('pricing-grid');
    const cards = within(pricingGrid).getAllByTestId('pricing-preview-card');

    expect(pricingGrid).toBeTruthy();
    expect(cards).toHaveLength(2);
  });

  test('proof statement exists', () => {
    expect(screen.getByRole('heading', { level: 2, name: /From raw data to structured document/i })).toBeTruthy();
  });

  test('Run the demo is in the proof section and unique', () => {
    const proofSection = screen.getByTestId(`section-${LANDING_COPY_KEYS.beforeAfter}`);
    const realDataCard = screen.getByTestId('real-data-card');
    const demoButton = within(realDataCard).getByRole('button', { name: 'Run the demo' });

    expect(proofSection.contains(realDataCard)).toBe(true);
    expect(demoButton).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Run the demo' })).toHaveLength(1);
  });

  test('preview card has desktop float animation class', () => {
    const previewCard = screen.getByTestId('home-preview-card');
    expect((previewCard.className || '').includes('home-preview-float')).toBe(true);
    expect(within(previewCard).getByRole('img')).toHaveAttribute('src', expect.stringContaining('/fitforpdf-proof-v8.svg'));
    expect(within(previewCard).getByText('Structured PDF (v8)')).toBeTruthy();
  });
});
