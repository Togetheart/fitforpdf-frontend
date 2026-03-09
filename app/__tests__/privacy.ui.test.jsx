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

    expect(hero).toBeTruthy();
    expect(backdrop).toBeTruthy();
    expect(backdrop?.getAttribute('aria-hidden')).toBe('true');
    expect(gradients).toBeTruthy();
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
    expect(gradients).toBeTruthy();
  });

  test('has global header and footer', () => {
    expect(screen.getAllByRole('navigation').length).toBeGreaterThan(1);
    expect(screen.getByRole('contentinfo')).toBeTruthy();
  });

  test('renders premium hero hierarchy', () => {
    const heading = screen.getByTestId('privacy-h1');
    expect(heading).toBeTruthy();
    // h1 displays "Privacy" as the small eyebrow heading
    expect(heading.textContent).toContain('Privacy');
    // Large hero copy is in a separate <p> element with spans
    expect(screen.getByText('Your data.')).toBeTruthy();
    expect(screen.getByText('Not our business.')).toBeTruthy();
    // Negative checks — old copy not present
    expect(screen.queryByText('fitforpdf is designed to process files — not store them.')).toBeNull();
    expect(screen.queryByText('No account. No tracking. Files deleted after conversion.')).toBeNull();
  });

  test('contains file handling promises', () => {
    expect(screen.getByText('Files are deleted immediately after conversion.')).toBeTruthy();
    expect(screen.getByText('The generated PDF is available for up to 15 minutes. Automatically deleted after.')).toBeTruthy();
    expect(screen.getByText('File contents are never stored in logs.')).toBeTruthy();
    expect(screen.getByText(/Do not upload highly regulated or special-category data/i)).toBeTruthy();
  });

  test('contains trust sections and sensitive-data callout', () => {
    expect(screen.getByRole('heading', { level: 2, name: 'How file handling works' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: 'What we log' })).toBeTruthy();
    expect(screen.getByTestId('privacy-sensitive-callout').textContent).toContain('Do not upload');
  });

  test('uses glass styling for privacy cards', () => {
    const handlingCards = screen.getAllByTestId('privacy-handling-card');
    const logsCard = screen.getByTestId('privacy-logs-card');
    const sensitiveCallout = screen.getByTestId('privacy-sensitive-callout');

    expect(handlingCards).toHaveLength(2);
    handlingCards.forEach((card) => {
      const className = card.getAttribute('class') || '';
      expect(className).toContain('glass');
    });

    const logsCardClass = logsCard.getAttribute('class') || '';
    expect(logsCardClass).toContain('glass');

    const calloutClass = sensitiveCallout.getAttribute('class') || '';
    expect(calloutClass).toContain('glass');
  });

  test('contains legal footer line', () => {
    expect(screen.getByText('This page constitutes the Privacy Policy of fitforpdf, in accordance with GDPR (EU) 2016/679.')).toBeTruthy();
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
  });

  test('footer remains present', () => {
    expect(screen.getByRole('contentinfo')).toBeTruthy();
  });
});
