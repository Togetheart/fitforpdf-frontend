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
    const comparison = screen.getByTestId('section-comparison');
    const pricing = screen.getByTestId(`section-${LANDING_COPY_KEYS.pricingPreview}`);
    const privacy = screen.getByTestId('privacy-section');
    const faq = screen.getByTestId('faq-section');
    const finalCta = screen.getByTestId('final-cta-section');

    expect(hero).toBeTruthy();
    expect(proof).toBeTruthy();
    expect(comparison).toBeTruthy();
    expect(pricing).toBeTruthy();
    expect(privacy).toBeTruthy();
    expect(faq).toBeTruthy();
    expect(finalCta).toBeTruthy();
    expect(hero.compareDocumentPosition(proof) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(proof.compareDocumentPosition(comparison) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(proof.compareDocumentPosition(pricing) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(comparison.compareDocumentPosition(pricing) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(pricing.compareDocumentPosition(privacy) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(privacy.compareDocumentPosition(faq) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(faq.compareDocumentPosition(finalCta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test('hero keeps the 3-line headline with required rhythm', () => {
    const heading = screen.getByRole('heading', { level: 1, name: /Stop Excel PDFs where columns get cut off\./i });

    expect(heading).toBeTruthy();
    expect(screen.getByText('Stop Excel PDFs where columns get cut off.')).toBeTruthy();
    expect(screen.getByText('Turn wide spreadsheets into readable')).toBeTruthy();
    expect(screen.getByText('sections.')).toBeTruthy();
    expect(screen.getByText('Ready to send.')).toBeTruthy();
    const headingText = heading.textContent || '';
    expect(headingText).toContain('Stop Excel PDFs where columns get cut off.');
    expect(headingText).toContain('Turn wide spreadsheets into readable sections.');
    expect(headingText).toContain('Ready to send.');
  });

  test('unverified social proof claim is not shown', () => {
    expect(screen.queryByText(/Trusted by 1,098 professionals this week/i)).toBeNull();
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
    expect(uploadGenerate.getAttribute('class') || '').toContain('bg-cta');
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

  test('pricing preview renders PAYG plan cards', () => {
    // PricingToggleSection shows payg-plan-card elements in PAYG mode (default)
    const cards = screen.getAllByTestId('payg-plan-card');
    expect(cards.length).toBeGreaterThanOrEqual(1);
  });

  test('proof statement exists', () => {
    expect(screen.getByRole('heading', { level: 2, name: /See how FitForPDF transforms your file/i })).toBeTruthy();
  });

  test('proof card keeps before/after labels and full-document action', () => {
    const proofCard = screen.getByTestId('home-preview-card');

    expect(proofCard).toBeTruthy();
    expect(proofCard).toBeTruthy();
    expect(within(proofCard).getByText('Source spreadsheet')).toBeTruthy();
    expect(within(proofCard).getByText('Client-ready PDF')).toBeTruthy();
    expect(within(proofCard).getByRole('button', { name: 'View full document ↗' })).toBeTruthy();
  });

  test('starter plan remains the highlighted pay-as-you-go option', () => {
    const cards = screen.getAllByTestId('payg-plan-card');
    const starterCard = cards.find((card) => card.textContent?.includes('Starter'));

    expect(starterCard).toBeTruthy();
    expect(starterCard?.textContent).toContain('Most popular');
    expect(starterCard?.className || '').toContain('md:scale-[1.04]');
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
    const demoClass = demoButton.getAttribute('class') || '';
    expect(demoClass).toContain('text-accent');
    expect(demoClass).toContain('bg-accent');
    expect(screen.queryByRole('button', { name: 'Run the demo' })).toBeNull();
    expect(screen.getAllByTestId('demo-try-button')).toHaveLength(1);
  });

  test('preview card has desktop float animation class', () => {
    const previewCard = screen.getByTestId('home-preview-card');
    expect((previewCard.className || '').includes('home-preview-float')).toBe(true);
    // Default format is XLSX
    expect(within(previewCard).getByText('Source spreadsheet')).toBeTruthy();
    expect(within(previewCard).getByText('Client-ready PDF')).toBeTruthy();
    const proofWrapper = screen.getByTestId('proof-pdf-image');
    const proofImg = proofWrapper.querySelector('img');
    // XLSX format selected — image src contains '/Excel/'
    expect((proofImg?.getAttribute('src') || '')).toContain('/Excel/');
    expect((proofWrapper.getAttribute('class') || '')).toContain('w-full');
  });

  test('proof card styling and before-after section exists', () => {
    const previewCard = screen.getByTestId('home-preview-card');
    const proofSection = screen.getByTestId(`section-${LANDING_COPY_KEYS.beforeAfter}`);

    expect(previewCard).toBeTruthy();
    expect(proofSection).toBeTruthy();
    expect(proofSection.contains(previewCard)).toBe(true);
    expect(previewCard.textContent).toContain('Client-ready PDF');
    expect(previewCard.textContent).toContain('Source spreadsheet');
  });

  test('comparison section sits next to proof section', () => {
    const proofSection = screen.getByTestId(`section-${LANDING_COPY_KEYS.beforeAfter}`);
    const comparison = screen.getByTestId('section-comparison');

    expect(screen.getByText('Excel PDF Export vs FitForPDF')).toBeTruthy();
    expect(screen.getByText('Stop fighting print settings. Get a client-ready structured PDF in seconds.')).toBeTruthy();
    expect(proofSection.nextElementSibling).toBe(comparison);
    expect(proofSection.compareDocumentPosition(comparison) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test('FAQ items stay focused on conversion objections', () => {
    const faq = screen.getByTestId('home-faq');

    [
      'Do my "Pay as you go" credits expire?',
      'Is the Starter pack a subscription?',
      'Will my clients see the FitForPDF logo?',
      'What counts as an export?',
      'Do you store my files?',
    ].forEach((question) => {
      expect(faq.textContent).toContain(question);
    });
  });

  test('landing section spacing uses varied rhythm', () => {
    const proof = screen.getByTestId(`section-${LANDING_COPY_KEYS.beforeAfter}`);
    const pricing = screen.getByTestId(`section-${LANDING_COPY_KEYS.pricingPreview}`);
    const privacy = screen.getByTestId('privacy-section');
    const faq = screen.getByTestId('faq-section');

    expect((proof.getAttribute('class') || '').includes('py-20')).toBe(true);
    expect((pricing.getAttribute('class') || '').includes('py-16')).toBe(true);
    expect((privacy.getAttribute('class') || '').includes('py-20')).toBe(true);
    expect((faq.getAttribute('class') || '').includes('py-20')).toBe(true);
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

    expect(privacyClass).toContain('bg-hero');
    expect(faqSectionClass).toContain('bg-hero');
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

  test('format selector defaults to XLSX and offers both format options', () => {
    const selector = screen.getByTestId('format-selector');
    const radios = within(selector).getAllByRole('radio');
    expect(radios).toHaveLength(2);

    const csvRadio = radios.find((r) => r.textContent.includes('CSV'));
    const xlsxRadio = radios.find((r) => r.textContent.includes('XLSX'));
    expect(csvRadio).toBeTruthy();
    expect(xlsxRadio).toBeTruthy();
    // Default format is XLSX
    expect(xlsxRadio.getAttribute('aria-checked')).toBe('true');
    expect(csvRadio.getAttribute('aria-checked')).toBe('false');
  });
});
