import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import LandingPage from '../page.jsx';
import PricingPage from '../pricing/page.jsx';
import PrivacyPage from '../privacy/page.jsx';
import SiteShell from '../components/SiteShell';

vi.mock('../components/BeforeAfter.mjs', () => ({
  default: () => <div data-testid="before-after" />,
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

function headerLinks(headerRoot) {
  const header = screen.getByTestId(headerRoot);
  const links = Array.from(header.querySelectorAll('a'));
  const getByText = (text) => links.find((link) => link.textContent?.trim() === text);

  return {
    pricing: getByText('Pricing'),
    privacy: getByText('Privacy'),
  };
}

beforeEach(() => {
  ensureMatchMedia();
});

afterEach(() => {
  cleanup();
});

describe('shared site shell navigation', () => {
  test('home has shared header/footer links and single instances', () => {
    render(
      <SiteShell>
        <LandingPage />
      </SiteShell>,
    );

    expect(screen.getAllByTestId('site-header')).toHaveLength(1);
    expect(screen.getAllByTestId('site-footer')).toHaveLength(1);

    const header = headerLinks('site-header');
    expect(header.pricing?.getAttribute('href')).toBe('/pricing');
    expect(header.privacy?.getAttribute('href')).toBe('/privacy');

    const footer = screen.getByTestId('site-footer');
    expect(footer.querySelector('a[href="/pricing"]')).toBeTruthy();
    expect(footer.querySelector('a[href="/privacy"]')).toBeTruthy();
    expect(footer.querySelector('a[href="/developers"]')).toBeTruthy();
    expect(footer.querySelector('a[href="/excel-to-pdf-columns-cut-off"]')).toBeTruthy();
    expect(footer.querySelector('a[href="/fit-excel-sheet-on-one-page-pdf"]')).toBeTruthy();
    expect(footer.querySelector('a[href="/csv-to-structured-pdf"]')).toBeTruthy();
    expect(footer.querySelector('a[href="/audit-report-excel-to-pdf-tips"]')).toBeTruthy();
    expect(footer.querySelector('img[alt="fitforpdf"]')).toBeTruthy();
  });

  test('pricing has shared header/footer links and single instances', () => {
    render(
      <SiteShell>
        <PricingPage />
      </SiteShell>,
    );

    expect(screen.getAllByTestId('site-header')).toHaveLength(1);
    expect(screen.getAllByTestId('site-footer')).toHaveLength(1);

    const header = headerLinks('site-header');
    expect(header.pricing?.getAttribute('href')).toBe('/pricing');
    expect(header.privacy?.getAttribute('href')).toBe('/privacy');
  });

  test('privacy has shared header/footer links and single instances', () => {
    render(
      <SiteShell>
        <PrivacyPage />
      </SiteShell>,
    );

    expect(screen.getAllByTestId('site-header')).toHaveLength(1);
    expect(screen.getAllByTestId('site-footer')).toHaveLength(1);

    const header = headerLinks('site-header');
    expect(header.pricing?.getAttribute('href')).toBe('/pricing');
    expect(header.privacy?.getAttribute('href')).toBe('/privacy');
  });
});
