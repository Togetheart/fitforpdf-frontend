import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';

import Landing from '../page.jsx';
import SiteHeader from '../_components/SiteHeader';
import { LANDING_COPY_KEYS } from '../siteCopy.mjs';

vi.mock('../components/BeforeAfter.mjs', () => ({
  default: () => <div data-testid="before-after-placeholder" />,
}));

function ensureMatchMedia() {
  if (window.matchMedia) return;
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: () => ({
      matches: false,
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
  ensureMatchMedia();
  render(<Landing />);
});

afterEach(() => {
  cleanup();
});

describe('landing structure and UI invariants', () => {
  test('hero heading is before tool heading in DOM order', () => {
    const heroHeading = screen.getByRole('heading', { name: /Client-ready PDFs\. From messy spreadsheets\./i, level: 1 });
    const toolHeading = screen.getByRole('heading', { name: /Try FitForPDF on the web/i, level: 2 });
    expect(heroHeading.compareDocumentPosition(toolHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test('tool section id is #tool and exists', () => {
    const toolSection = screen.getByTestId('tool-section');
    expect(toolSection.getAttribute('id')).toBe(LANDING_COPY_KEYS.upload);
  });

  test('hero has exactly one primary CTA and no secondary links', () => {
    const hero = screen.getByTestId('hero-section');
    const primary = within(hero).getByTestId('primary-cta');
    const links = within(hero).getAllByRole('link');

    expect(primary.textContent).toBe('Generate PDF');
    expect(links).toHaveLength(1);
    expect(primary.getAttribute('href')).toBe('#tool');
    expect(primary.className.includes('h-11')).toBe(true);
    expect(primary.className.includes('rounded-full')).toBe(true);
    expect(hero.querySelector('button')).toBeNull();

    expect(within(hero).queryByText('See pricing')).toBeNull();
    expect(within(hero).queryByText('Try on Telegram')).toBeNull();
  });

  test('pricing preview has three cards and responsive grid classes', () => {
    const pricingGrid = screen.getByTestId('pricing-grid');
    const cards = within(pricingGrid).getAllByRole('article');

    expect(cards).toHaveLength(3);
    expect(pricingGrid.className.includes('grid-cols-1')).toBe(true);
    expect(pricingGrid.className.includes('md:grid-cols-3')).toBe(true);
  });

  test('section backgrounds alternate by helper data attribute', () => {
    const sections = document.querySelectorAll('section[data-section-bg]');
    sections.forEach((section, index) => {
      if (index % 2 === 0) {
        expect(section.className.includes('bg-white')).toBe(true);
      } else {
        expect(section.className.includes('bg-gray-50')).toBe(true);
      }
    });
  });
});

test('free exports text is scoped to tool section only', () => {
  const toolSection = screen.getByTestId('tool-section');
  const counters = screen.getAllByText(/Free exports left:/);

  expect(counters.length).toBeGreaterThan(0);
  counters.forEach((node) => {
    expect(node.closest('section')).toBe(toolSection);
  });
});

test('landing has no local main nav', () => {
  expect(screen.queryByRole('navigation', { name: /main navigation/i })).toBeNull();
});

test('global SiteHeader contains nav links', () => {
  cleanup();
  render(<SiteHeader />);
  const headerNav = screen.getByRole('navigation');
  expect(within(headerNav).getByRole('link', { name: 'Pricing' }).getAttribute('href')).toBe('/pricing');
  expect(within(headerNav).getByRole('link', { name: 'Privacy' }).getAttribute('href')).toBe('/privacy');
  expect(within(headerNav).getByRole('link', { name: 'Try on Telegram' }).getAttribute('href')).toBe(
    'https://t.me/CrabiAssistantBot',
  );
});
