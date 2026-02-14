import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';

import PrivacyPage from '../privacy/page.jsx';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

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
      <PrivacyPage />
      <SiteFooter />
    </>,
  );
});

afterEach(() => {
  cleanup();
});

describe('privacy page UI', () => {
  test('uses shared page hero and shared backdrop', () => {
    const hero = screen.getByTestId('page-hero');
    const backdrop = hero.querySelector('[data-testid="hero-backdrop"]');
    const gradients = hero.querySelector('[data-testid="hero-bg-gradients"]');
    const noise = hero.querySelector('[data-testid="hero-bg-noise"]');

    expect(hero).toBeTruthy();
    expect(backdrop).toBeTruthy();
    expect(backdrop?.getAttribute('aria-hidden')).toBe('true');
    expect(gradients).toBeTruthy();
    expect(noise).toBeTruthy();
  });

  test('reduced-motion disables hero backdrop animation', () => {
    cleanup();
    configureMatchMedia({ mobile: false, reduceMotion: true });
    render(
      <>
        <SiteHeader />
        <PrivacyPage />
        <SiteFooter />
      </>,
    );

    const gradients = screen.getByTestId('hero-bg-gradients');
    expect((gradients.getAttribute('class') || '').includes('animate-heroMesh')).toBe(false);
  });

  test('has global header and footer', () => {
    expect(screen.getAllByRole('navigation').length).toBeGreaterThan(1);
    expect(screen.getByRole('contentinfo')).toBeTruthy();
  });

  test('renders premium hero hierarchy', () => {
    const heading = screen.getByTestId('privacy-h1');
    expect(heading).toBeTruthy();
    expect((heading.getAttribute('class') || '').includes('text-center')).toBe(true);
    expect(screen.getByText('Not our business.')).toBeTruthy();
    expect(screen.getByText('PRIVACY')).toBeTruthy();
    expect(screen.getByText('FitForPDF processes files — it does not store them.')).toBeTruthy();
    expect(screen.queryByText('FitForPDF is designed to process files — not store them.')).toBeNull();
    expect(screen.queryByText('No account. No tracking. Files deleted after conversion.')).toBeNull();

    const lines = heading.querySelectorAll('span');
    expect(lines.length).toBeGreaterThan(1);
    expect(lines[0]?.textContent).toBe('Your data.');
    expect(lines[1]?.textContent).toBe('Not our business.');
  });

  test('contains file handling promises', () => {
    expect(screen.getByText('Files are deleted immediately after conversion.')).toBeTruthy();
    expect(screen.getByText('The generated PDF is available for up to 15 minutes.')).toBeTruthy();
    expect(screen.getByText('We do not store file contents in logs.')).toBeTruthy();
    expect(screen.getByText('Do not upload sensitive data.')).toBeTruthy();
  });

  test('contains trust sections and sensitive-data callout', () => {
    expect(screen.getByRole('heading', { level: 2, name: 'How file handling works' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: 'What we log' })).toBeTruthy();
    expect(screen.getByTestId('privacy-sensitive-callout').textContent).toContain('Do not upload sensitive data.');
  });

  test('contains legal footer line', () => {
    expect(screen.getByText('For legal terms, see Terms of Service.')).toBeTruthy();
  });

  test('header nav links are present', () => {
    const headerNav = screen.getAllByRole('navigation')[0];
    const headerLinks = headerNav.querySelectorAll('a');
    expect(Array.from(headerLinks).find((link) => link.textContent?.trim() === 'Pricing')?.getAttribute('href')).toBe(
      '/pricing',
    );
    expect(Array.from(headerLinks).find((link) => link.textContent?.trim() === 'Privacy')?.getAttribute('href')).toBe(
      '/privacy',
    );
    expect(
      Array.from(headerLinks).find(
        (link) => link.textContent?.trim() === 'Try on Telegram',
      )?.getAttribute('href'),
    ).toBe('https://t.me/CrabiAssistantBot');
  });

  test('footer remains present', () => {
    expect(screen.getByRole('contentinfo')).toBeTruthy();
  });
});
