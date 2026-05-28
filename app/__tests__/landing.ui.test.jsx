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
    const faq = screen.getByTestId('faq-section');
    const finalCta = screen.getByTestId('final-cta-section');

    expect(hero).toBeTruthy();
    expect(proof).toBeTruthy();
    expect(comparison).toBeTruthy();
    expect(pricing).toBeTruthy();
    expect(faq).toBeTruthy();
    expect(finalCta).toBeTruthy();
    expect(hero.compareDocumentPosition(proof) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(proof.compareDocumentPosition(comparison) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(comparison.compareDocumentPosition(pricing) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(comparison.compareDocumentPosition(faq) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(faq.compareDocumentPosition(finalCta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test('hero keeps the 2-line headline with required rhythm', () => {
    const heading = screen.getByRole('heading', { level: 1, name: /Make your export client-ready/i });

    expect(heading).toBeTruthy();
    expect(screen.getByTestId('hero-headline-accent').textContent).toBe(LANDING_COPY.heroHeadlineL1);
    expect(screen.getByText(/Without the cleanup/)).toBeTruthy();
    const headingText = heading.textContent || '';
    expect(headingText).toContain(LANDING_COPY.heroHeadlineL1);
    expect(headingText).toContain(LANDING_COPY.heroHeadlineL2);
  });

  test('unverified social proof claim is not shown', () => {
    expect(screen.queryByText(/Trusted by 1,098 professionals this week/i)).toBeNull();
    expect(screen.queryByText(/Trusted by teams worldwide/i)).toBeNull();
    expect(screen.queryByText(/Head of Operations/i)).toBeNull();
  });

  test('legacy demo section below options is removed', () => {
    expect(screen.queryByTestId('section-home-demo')).toBeNull();
  });

  test('hero has no standalone CTA — upload card is the primary action', () => {
    const hero = screen.getByTestId('hero-section');
    expect(within(hero).queryByTestId('hero-primary-cta')).toBeNull();
    // Upload card now lives outside hero (proof-first flow)
    const uploadCard = screen.getByTestId('upload-card');
    expect(uploadCard).toBeTruthy();
    expect(hero.compareDocumentPosition(uploadCard) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test('hero has headline/subline/microcopy', () => {
    expect(screen.getByText(LANDING_COPY.heroSubheadlineL2a, { exact: false })).toBeTruthy();
    expect(screen.getByText(LANDING_COPY.heroSubheadlineL2b, { exact: false })).toBeTruthy();
    expect(screen.getByText(LANDING_COPY.heroMicrocopyFree)).toBeTruthy();
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
    const heroSpacer = screen.getByTestId('hero-section').parentElement;

    expect((heroBackdrop.getAttribute('class') || '').includes('hero-backdrop')).toBe(true);
    expect((heroBg.getAttribute('class') || '').includes('hero-bg')).toBe(true);
    expect((heroGradients.getAttribute('class') || '').includes('hero-bg-gradients')).toBe(true);
    expect(heroBackdrop.getAttribute('data-motion')).toBe('on');
    expect(heroSpacer?.getAttribute('class') || '').toContain('sm:h-[calc(100vh+140px)]');
  });

  test('pricing preview renders PAYG plan cards', () => {
    // PricingToggleSection shows payg-plan-card elements in PAYG mode (default)
    const cards = screen.getAllByTestId('payg-plan-card');
    expect(cards.length).toBeGreaterThanOrEqual(1);
  });

  test('secondary API and ROI modules are not in the primary landing flow', () => {
    expect(screen.queryByTestId('apple-grid-section')).toBeNull();
    expect(screen.queryByTestId('section-use-cases')).toBeNull();
    expect(screen.queryByText(/Integrate in minutes/i)).toBeNull();
    expect(screen.queryByText(/How much time could you save/i)).toBeNull();
  });

  test('landing uses real early workflow feedback instead of broad anonymous testimonials', () => {
    const feedback = screen.getByTestId('early-feedback-section');

    expect(feedback.textContent).toContain('Early workflow feedback');
    expect(feedback.textContent).toContain('Magdalena');
    expect(feedback.textContent).toContain("The export often isn't truly client-ready");
  });

  test('proof statement exists', () => {
    expect(screen.getByRole('heading', { level: 2, name: /See how fitforpdf transforms your file/i })).toBeTruthy();
  });

  test('proof card keeps before/after labels and full-document action', () => {
    const proofCard = screen.getByTestId('home-preview-card');

    expect(proofCard).toBeTruthy();
    expect(proofCard).toBeTruthy();
    expect(within(proofCard).getByText('Source spreadsheet')).toBeTruthy();
    // Proof card output label is 'Ready to send' — liberates 'client-ready'
    // as the exclusive signature of the H1 headline (2026-04-15 V4).
    expect(within(proofCard).getByText('Ready to send')).toBeTruthy();
    expect(within(proofCard).queryByText('Client-ready PDF')).toBeNull();
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
    expect(demoButton.textContent).toContain('See an example first');
    expect(demoClass).toContain('text-white/55');
    expect(demoClass).not.toContain('bg-white/10');
    expect(screen.queryByRole('button', { name: 'Run the demo' })).toBeNull();
    expect(screen.getAllByTestId('demo-try-button')).toHaveLength(1);
  });

  test('upload blue container is wide enough for the post-render state', () => {
    const container = screen.getByTestId('upload-blue-container');
    const inner = screen.getByTestId('upload-blue-inner');

    expect(container.getAttribute('class') || '').toContain('max-w-[1040px]');
    expect(inner.getAttribute('class') || '').toContain('max-w-[760px]');
  });

  test('preview card has desktop float animation class', () => {
    const previewCard = screen.getByTestId('home-preview-card');
    expect((previewCard.className || '').includes('home-preview-float')).toBe(true);
    // Default format is XLSX
    expect(within(previewCard).getByText('Source spreadsheet')).toBeTruthy();
    expect(within(previewCard).getByText('Ready to send')).toBeTruthy();
    // XLSX format selected by default — one of the images should contain '/Excel/'
    const proofImages = previewCard.querySelectorAll('img');
    const hasExcelImage = Array.from(proofImages).some((img) => (img.getAttribute('src') || '').includes('/Excel/'));
    expect(hasExcelImage).toBe(true);
  });

  test('proof card styling and before-after section exists', () => {
    const previewCard = screen.getByTestId('home-preview-card');
    const proofSection = screen.getByTestId(`section-${LANDING_COPY_KEYS.beforeAfter}`);

    expect(previewCard).toBeTruthy();
    expect(proofSection).toBeTruthy();
    expect(proofSection.contains(previewCard)).toBe(true);
    expect(previewCard.textContent).toContain('Ready to send');
    expect(previewCard.textContent).toContain('Source spreadsheet');
  });

  test('comparison section follows proof section in document order', () => {
    const proofSection = screen.getByTestId(`section-${LANDING_COPY_KEYS.beforeAfter}`);
    const comparison = screen.getByTestId('section-comparison');

    expect(screen.getByText('Excel PDF Export vs fitforpdf')).toBeTruthy();
    expect(screen.getByText('Stop fighting print settings. Get a presentable structured PDF in seconds.')).toBeTruthy();
    // Comparison follows proof and upload in document order, before pricing.
    expect(proofSection.compareDocumentPosition(comparison) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const pricing = screen.getByTestId(`section-${LANDING_COPY_KEYS.pricingPreview}`);
    expect(comparison.compareDocumentPosition(pricing) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test('FAQ items stay focused on conversion objections', () => {
    const faq = screen.getByTestId('home-faq');

    [
      'How much time does this actually save?',
      'Is this worth it for just a few exports?',
      'Why not just fix it in Excel?',
      'Do I need to reformat my spreadsheet first?',
      'Do you store my files?',
    ].forEach((question) => {
      expect(faq.textContent).toContain(question);
    });
    expect(faq.textContent).toContain('Yes. Open the sample PDF before uploading your own file.');
  });

  test('landing section spacing uses varied rhythm', () => {
    const proof = screen.getByTestId(`section-${LANDING_COPY_KEYS.beforeAfter}`);
    const pricing = screen.getByTestId(`section-${LANDING_COPY_KEYS.pricingPreview}`);
    const faq = screen.getByTestId('faq-section');

    // Proof section no longer uses `py-16` — it was tuned to a tight `pt-12
    // sm:pt-16` (no pb) to pull the dark upload card closer to the features
    // grid above. The intent ("section has padding-top") is what we assert.
    expect((proof.getAttribute('class') || '')).toMatch(/p[ty]-(?:8|10|12|16|20)/);
    // Pricing section has no extra py className; its inner div uses the Section default py-10
    expect((pricing.firstElementChild?.getAttribute('class') || '').includes('py-10')).toBe(true);
    expect((faq.getAttribute('class') || '').includes('py-16')).toBe(true);
  });

  test('faq section uses dedicated sizing and layout', () => {
    const faq = screen.getByTestId('faq-section');
    const faqAccordion = screen.getByTestId('home-faq');

    const faqSectionClass = faq.getAttribute('class') || '';
    const pricing = screen.getByTestId(`section-${LANDING_COPY_KEYS.pricingPreview}`);
    const pricingInner = pricing.firstElementChild;
    const faqInner = faq.firstElementChild;

    expect(faqSectionClass).toContain('bg-hero');
    expect((faq.textContent || '').includes('Frequently asked questions')).toBe(true);
    expect(pricingInner?.getAttribute('class') || '').toContain('max-w-wide');
    expect(faqInner?.getAttribute('class') || '').toContain('max-w-content');
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
