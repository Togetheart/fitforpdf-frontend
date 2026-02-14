import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';

import Landing from '../page.jsx';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { LANDING_COPY_KEYS, PRICING_CARDS } from '../siteCopy.mjs';

vi.mock('../components/BeforeAfter.mjs', () => ({
  default: () => <div data-layout="split" data-testid="before-after" />,
}));

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
      <Landing />
      <SiteFooter />
    </>,
  );
});

afterEach(() => {
  cleanup();
});

describe('landing structure and UI invariants', () => {
  test('hero section uses shared PageHero and backdrop', () => {
    const pageHero = screen.getByTestId('page-hero');
    const heroBackdrop = within(pageHero).getByTestId('hero-backdrop');
    const heroBg = within(pageHero).getByTestId('hero-bg');
    const heroGradients = within(pageHero).getByTestId('hero-bg-gradients');
    const heroNoise = within(pageHero).getByTestId('hero-bg-noise');

    expect(pageHero.getAttribute('data-testid')).toBe('page-hero');
    expect(heroBackdrop.getAttribute('aria-hidden')).toBe('true');
    expect(heroBg).toBeTruthy();
    expect(heroGradients).toBeTruthy();
    expect(heroNoise).toBeTruthy();
  });

  test('reduced motion disables hero backdrop drift animation', async () => {
    cleanup();
    configureMatchMedia({ mobile: false, reduceMotion: true });
    render(
      <>
        <SiteHeader />
        <Landing />
        <SiteFooter />
      </>,
    );

    const heroGradients = screen.getByTestId('hero-bg-gradients');
    expect((heroGradients.getAttribute('class') || '').includes('hero-bg-animate')).toBe(false);
  });

  test('hero has exactly one primary CTA and no secondary links', () => {
    const hero = screen.getByTestId('hero-section');
    const primary = within(hero).getByTestId('hero-primary-cta');
    const links = within(hero).getAllByRole('link');

    expect(primary.textContent).toBe('Generate PDF');
    expect(within(hero).queryByRole('link', { name: 'See pricing' })).toBeNull();
    expect(within(hero).queryByRole('link', { name: 'Try on Telegram' })).toBeNull();
    expect(links).toHaveLength(1);
    expect(primary.getAttribute('href')).toBe('#tool');
    expect(primary.className).toContain('h-11');
    expect(primary.className).toContain('rounded-full');
  });

  test('top nav has the three required links', () => {
    const navs = screen.getAllByRole('navigation');
    expect(navs.length).toBeGreaterThan(1);
    const headerNav = navs[0];
    expect(within(headerNav).getByRole('link', { name: 'Pricing' }).getAttribute('href')).toBe('/pricing');
    expect(within(headerNav).getByRole('link', { name: 'Privacy' }).getAttribute('href')).toBe('/privacy');
    expect(within(headerNav).getByRole('link', { name: 'Try on Telegram' }).getAttribute('href')).toBe(
      'https://t.me/CrabiAssistantBot',
    );
  });

  test('hero title renders as two separated lines', () => {
    const hero = screen.getByTestId('hero-section');
    const heroTitleLines = within(hero).getAllByText(/Client-ready PDFs\.|From messy spreadsheets\./i);
    const lineBreak = hero.querySelector('h1 br');

    expect(heroTitleLines).toHaveLength(2);
    expect(lineBreak).toBeTruthy();
  });

  test('hero is before tool section in DOM order', () => {
    const heroHeading = screen.getByRole('heading', { name: /From messy spreadsheets\./i, level: 1 });
    const toolHeading = screen.getByRole('heading', { name: /Generate a client-ready PDF/i, level: 2 });
    expect(heroHeading.compareDocumentPosition(toolHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test('tool section id is #tool and exists', () => {
    const toolSection = screen.getByTestId(LANDING_COPY_KEYS.upload);
    expect(toolSection.getAttribute('id')).toBe(LANDING_COPY_KEYS.upload);
    expect(within(toolSection).getByText('Generate a client-ready PDF')).toBeTruthy();
    expect(within(toolSection).getByText('Drop CSV or XLSX here')).toBeTruthy();
  });

  test('UploadCard includes dropzone, CTA, badge and switches', () => {
    const toolSection = screen.getByTestId(LANDING_COPY_KEYS.upload);
    const uploadCard = within(toolSection).getByTestId('upload-card');

    expect(uploadCard).toBeTruthy();
    expect(within(toolSection).getByText('Drop CSV or XLSX here')).toBeTruthy();
    expect(within(toolSection).getByRole('button', { name: 'Generate PDF' })).toBeTruthy();
    expect(within(toolSection).getByTestId('upload-dropzone')).toBeTruthy();
    expect(within(toolSection).getByText(/Free:\s*3\s*exports left/i)).toBeTruthy();
    expect(uploadCard.querySelector('[data-testid="quota-pill"]')).toBeTruthy();

    const switches = within(toolSection).getAllByRole('switch');
    expect(switches).toHaveLength(2);
    expect(within(toolSection).getByRole('switch', { name: 'Branding' })).toBeTruthy();
    expect(within(toolSection).getByRole('switch', { name: 'Truncate long text' })).toBeTruthy();
  });

  test('pricing preview has three cards and featured credits card', () => {
    const pricingGrid = screen.getByTestId('pricing-grid');
    const cards = within(pricingGrid).getAllByRole('article');
    const renderedTitles = cards.map((card) => {
      const heading = within(card).getByRole('heading', { level: 3 });
      return heading.textContent || '';
    });

    expect(cards).toHaveLength(3);
    PRICING_CARDS.forEach((plan) => {
      expect(renderedTitles).toContain(plan.title);
    });
    expect(renderedTitles[1]).toBe('Credits');
    expect(cards[1].getAttribute('data-featured')).toBe('true');
    expect(pricingGrid.className.includes('grid-cols-1')).toBe(true);
    expect(pricingGrid.className.includes('md:grid-cols-3')).toBe(true);
    const creditsCard = screen.getByTestId('plan-credits');
    expect(creditsCard).toBeTruthy();
    expect(creditsCard.getAttribute('data-highlight')).toBe('true');
  });

  test('home includes premium section labels and micro copy', () => {
    const hero = screen.getByTestId('hero-section');
    expect(within(hero).getByText('FITFORPDF')).toBeTruthy();
    expect(within(hero).getByText('Files are deleted immediately after conversion. PDF available for 15 minutes.')).toBeTruthy();
    expect(within(hero).getByText('No account. No tracking of file contents. Works with CSV and XLSX.')).toBeTruthy();
  });

  test('problem section uses the three real-world pain lines', () => {
    const problemSection = screen.getByTestId(LANDING_COPY_KEYS.problem);
    expect(problemSection.getAttribute('data-section-bg')).toBe('gray');
    expect(within(problemSection).getByText('Spreadsheet exports fail in real life.')).toBeTruthy();
    expect(within(problemSection).getByText('Columns are cut.')).toBeTruthy();
    expect(within(problemSection).getByText('Text becomes unreadable after zoom.')).toBeTruthy();
    expect(within(problemSection).getByText('Manual layout fixes become mandatory.')).toBeTruthy();
  });

  test('transformation and client-ready sections are present', () => {
    expect(screen.getByRole('heading', { name: /From raw data to structured document\./i, level: 2 })).toBeTruthy();
    expect(screen.getByTestId('before-after')).toBeTruthy();
    expect(screen.getByRole('heading', { name: /Client-ready means/i, level: 2 })).toBeTruthy();
  });

  test('pricing and trust previews are present with secondary links', () => {
    expect(screen.getByRole('heading', { name: /Simple pricing\./i, level: 2 })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /Privacy-first by default\./i, level: 2 })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'See full pricing' }).getAttribute('href')).toBe('/pricing');
    expect(screen.getByRole('link', { name: 'Read privacy policy' }).getAttribute('href')).toBe('/privacy');
  });
});

test('free exports pill is scoped to tool section', () => {
  const toolSection = screen.getByTestId(LANDING_COPY_KEYS.upload);
  const counters = screen.getAllByText(/Free[:\s]\s*\d+\s*exports left/i);

  expect(counters.length).toBeGreaterThan(0);
  counters.forEach((node) => {
    expect(node.closest('section')).toBe(toolSection);
  });
});
