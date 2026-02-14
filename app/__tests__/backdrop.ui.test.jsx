import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';

import LandingPage from '../page.jsx';
import PricingPage from '../pricing/page.jsx';
import PrivacyPage from '../privacy/page.jsx';
import SiteShell from '../components/SiteShell';

function configureMatchMedia({
  mobile = false,
  reduceMotion = false,
  pointerFine = true,
} = {}) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query) => ({
      matches: query.includes('prefers-reduced-motion: reduce')
        ? reduceMotion
        : query.includes('max-width: 768px')
          ? mobile
          : query.includes('(pointer: fine)')
            ? pointerFine
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

function renderWithShell(component) {
  return render(<SiteShell>{component}</SiteShell>);
}

beforeEach(() => {
  configureMatchMedia();
});

afterEach(() => {
  cleanup();
});

describe('global app backdrop', () => {
  test('renders app backdrop on every page', () => {
    renderWithShell(<LandingPage />);
    const homeBackdrop = screen.getByTestId('app-backdrop');
    expect(homeBackdrop).toBeTruthy();
    expect(homeBackdrop.getAttribute('aria-hidden')).toBe('true');

    cleanup();
    renderWithShell(<PricingPage />);
    expect(screen.getByTestId('app-backdrop')).toBeTruthy();

    cleanup();
    renderWithShell(<PrivacyPage />);
    expect(screen.getByTestId('app-backdrop')).toBeTruthy();
  });

  test('home has both global backdrop and hero focus layers', () => {
    renderWithShell(<LandingPage />);

    const appBackdrop = screen.getByTestId('app-backdrop');
    const heroBackdrop = screen.getByTestId('hero-backdrop');

    expect(appBackdrop).toBeTruthy();
    expect(heroBackdrop).toBeTruthy();
  });

  test('pricing and privacy use only the global backdrop in focus layer level', () => {
    renderWithShell(<PricingPage />);

    expect(screen.getByTestId('app-backdrop')).toBeTruthy();
    expect(screen.queryByTestId('hero-bg-layer-1')).toBeNull();
    expect(screen.queryByTestId('hero-bg-layer-2')).toBeNull();

    cleanup();

    renderWithShell(<PrivacyPage />);

    expect(screen.getByTestId('app-backdrop')).toBeTruthy();
    expect(screen.queryByTestId('hero-bg-layer-1')).toBeNull();
    expect(screen.queryByTestId('hero-bg-layer-2')).toBeNull();
  });

  test('reduced motion disables AppBackdrop animation classes', () => {
    cleanup();
    configureMatchMedia({ reduceMotion: true });
    renderWithShell(<LandingPage />);

    const appBackdrop = screen.getByTestId('app-backdrop');
    expect(appBackdrop.getAttribute('data-motion')).toBe('off');
    expect((appBackdrop.getAttribute('class') || '').includes('app-bg-white')).toBe(true);
  });
});
