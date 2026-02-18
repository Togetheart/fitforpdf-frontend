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
    telegram: getByText('Try on Telegram'),
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
    expect(header.telegram?.getAttribute('href')).toBe('https://t.me/CrabiAssistantBot');

    const footer = screen.getByTestId('site-footer');
    expect(footer.querySelector('a[href=\"/pricing\"]')).toBeTruthy();
    expect(footer.querySelector('a[href=\"/privacy\"]')).toBeTruthy();
    expect(footer.querySelector('a[href=\"https://t.me/CrabiAssistantBot\"]')).toBeTruthy();
    expect((footer.textContent || '').includes('FitForPDF')).toBe(true);
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
    expect(header.telegram?.getAttribute('href')).toBe('https://t.me/CrabiAssistantBot');
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
    expect(header.telegram?.getAttribute('href')).toBe('https://t.me/CrabiAssistantBot');
  });
});
