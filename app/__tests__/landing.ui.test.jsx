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
    const clientReady = screen.getByTestId('section-client-ready');
    const pricing = screen.getByTestId(`section-${LANDING_COPY_KEYS.pricingPreview}`);
    const privacy = screen.getByTestId('privacy-section');
    const faq = screen.getByTestId('faq-section');
    const finalCta = screen.getByTestId('final-cta-section');

    expect(hero).toBeTruthy();
    expect(proof).toBeTruthy();
    expect(clientReady).toBeTruthy();
    expect(pricing).toBeTruthy();
    expect(privacy).toBeTruthy();
    expect(faq).toBeTruthy();
    expect(finalCta).toBeTruthy();
    expect(hero.compareDocumentPosition(proof) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(proof.compareDocumentPosition(clientReady) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(clientReady.compareDocumentPosition(pricing) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(pricing.compareDocumentPosition(privacy) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(privacy.compareDocumentPosition(faq) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(faq.compareDocumentPosition(finalCta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test('legacy demo section below options is removed', () => {
    expect(screen.queryByTestId('section-home-demo')).toBeNull();
  });

  test('hero has no standalone CTA — upload card is the primary action', () => {
    const hero = screen.getByTestId('hero-section');
    expect(within(hero).queryByTestId('hero-primary-cta')).toBeNull();
    const uploadCard = within(hero).getByTestId('upload-card');
    expect(uploadCard).toBeTruthy();
  });

  test('hero has headline/subline/trust line', () => {
    expect(screen.getByText(LANDING_COPY.heroSubheadline)).toBeTruthy();
    expect(screen.getByText(LANDING_COPY.heroTrustLine)).toBeTruthy();
    expect(screen.getAllByText(LANDING_COPY.heroTrustLine)).toHaveLength(1);
  });

  test('upload block includes a Generate PDF button as the sole CTA', () => {
    const toolSection = screen.getByTestId(LANDING_COPY_KEYS.upload);
    const uploadGenerate = within(toolSection).getByRole('button', { name: 'Generate PDF' });

    expect(uploadGenerate).toBeTruthy();
    expect(uploadGenerate.getAttribute('class') || '').toContain('bg-accent');
    expect(screen.queryByTestId('hero-primary-cta')).toBeNull();
  });

  test('hero includes subtle gradient background', () => {
    const heroBackdrop = screen.getByTestId('hero-backdrop');
    const heroBg = screen.getByTestId('hero-bg');
    const heroGradients = screen.getByTestId('hero-bg-gradients');

    expect((heroBackdrop.getAttribute('class') || '').includes('hero-backdrop')).toBe(true);
    expect((heroBg.getAttribute('class') || '').includes('hero-bg')).toBe(true);
    expect((heroGradients.getAttribute('class') || '').includes('hero-bg-gradients')).toBe(true);
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

  test('single demo entrypoint is in the upload block', () => {
    const proofSection = screen.getByTestId(`section-${LANDING_COPY_KEYS.beforeAfter}`);
    const uploadCard = screen.getByTestId('upload-card');
    const proofCard = screen.getByTestId('home-preview-card');
    const demoButton = screen.getByTestId('demo-try-button');

    expect(proofSection.contains(uploadCard)).toBe(false);
    expect(uploadCard).toBeTruthy();
    expect(proofCard).toBeTruthy();
    expect(demoButton).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Run the demo' })).toBeNull();
    expect(screen.getAllByTestId('demo-try-button')).toHaveLength(1);
  });

  test('preview card has desktop float animation class', () => {
    const previewCard = screen.getByTestId('home-preview-card');
    expect((previewCard.className || '').includes('home-preview-float')).toBe(true);
    expect((previewCard.className || '').includes('max-w-7xl')).toBe(true);
    const images = within(previewCard).getAllByRole('img');
    expect(images[0].getAttribute('src') || '').toContain('/before_csv.webp');
    const proofWrapper = screen.getByTestId('proof-pdf-image');
    const proofImg = proofWrapper.querySelector('img');
    expect((proofImg?.getAttribute('src') || '')).toContain('/CSV/enterprise-invoices-demo-overview.webp');
    expect(proofWrapper.getAttribute('class') || '').toContain('w-full');
    expect(within(previewCard).getByText('CSV INPUT')).toBeTruthy();
    expect(within(previewCard).getByText('STRUCTURED PDF')).toBeTruthy();
  });

  test('proof card is glass-elevated and client-ready section exists', () => {
    const previewCard = screen.getByTestId('home-preview-card');
    const clientReady = screen.getByTestId('section-client-ready');

    expect((previewCard.className || '').includes('glass-elevated')).toBe(true);
    expect(clientReady).toBeTruthy();
    expect(clientReady.textContent).toContain('Client-ready means');
  });

  test('landing section spacing uses varied rhythm', () => {
    const proof = screen.getByTestId(`section-${LANDING_COPY_KEYS.beforeAfter}`);
    const clientReady = screen.getByTestId('section-client-ready');
    const pricing = screen.getByTestId(`section-${LANDING_COPY_KEYS.pricingPreview}`);
    const privacy = screen.getByTestId('privacy-section');
    const faq = screen.getByTestId('faq-section');

    expect((proof.getAttribute('class') || '').includes('py-16')).toBe(true);
    expect((clientReady.getAttribute('class') || '').includes('py-16')).toBe(true);
    expect((pricing.getAttribute('class') || '').includes('py-16')).toBe(true);
    expect((privacy.getAttribute('class') || '').includes('py-16')).toBe(true);
    expect((faq.getAttribute('class') || '').includes('py-16')).toBe(true);
  });

  test('privacy and faq sections use dedicated sizing and layout', () => {
    const privacy = screen.getByTestId('privacy-section');
    const faq = screen.getByTestId('faq-section');
    const faqAccordion = screen.getByTestId('home-faq');

    const privacyClass = privacy.getAttribute('class') || '';
    const faqSectionClass = faq.getAttribute('class') || '';
    const pricing = screen.getByTestId(`section-${LANDING_COPY_KEYS.pricingPreview}`);
    const pricingInner = pricing.firstElementChild;
    const faqAccordionClass = faqAccordion.getAttribute('class') || '';
    const faqInner = faq.firstElementChild;

    expect(privacyClass).toContain('bg-slate-50');
    expect(faqSectionClass).toContain('bg-white');
    expect((privacy.textContent || '').includes('Your data. Not our business.')).toBe(true);
    expect((faq.textContent || '').includes('Frequently asked questions')).toBe(true);
    expect(pricingInner?.getAttribute('class') || '').toContain('max-w-[960px]');
    expect(faqInner?.getAttribute('class') || '').toContain('max-w-[960px]');
    expect(faqAccordion.parentElement?.getAttribute('class') || '').toContain('w-full');
  });

  test('faq section keeps a single heading and a single home FAQ mount', () => {
    const faq = screen.getByTestId('faq-section');

    expect(screen.getAllByRole('heading', { name: 'Frequently asked questions' })).toHaveLength(1);
    expect(screen.getAllByTestId('home-faq')).toHaveLength(1);
  });

  test('format selector defaults to CSV and offers both format options', () => {
    const selector = screen.getByTestId('format-selector');
    const radios = within(selector).getAllByRole('radio');
    expect(radios).toHaveLength(2);

    const csvRadio = radios.find((r) => r.textContent.includes('CSV'));
    const xlsxRadio = radios.find((r) => r.textContent.includes('XLSX'));
    expect(csvRadio).toBeTruthy();
    expect(xlsxRadio).toBeTruthy();
    expect(csvRadio.getAttribute('aria-checked')).toBe('true');
    expect(xlsxRadio.getAttribute('aria-checked')).toBe('false');
  });
});
