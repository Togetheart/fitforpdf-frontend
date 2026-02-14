'use client';

import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';

import LandingPage from '../page.jsx';

function configureMatchMedia({ mobile = false, reduceMotion = false, pointerFine = true } = {}) {
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

beforeEach(() => {
  configureMatchMedia({ mobile: false, reduceMotion: false, pointerFine: true });
  window.history.replaceState({}, '', '/');
});

afterEach(() => {
  cleanup();
});

describe('HeroBackdrop', () => {
  test('renders hero background layers for the hero copy', () => {
    render(<LandingPage />);

    const backdrop = screen.getByTestId('hero-backdrop');
    const heroBg = screen.getByTestId('hero-bg');
    const heroGradients = screen.getByTestId('hero-bg-gradients');

    expect(backdrop.getAttribute('data-motion')).toBe('on');
    expect(heroBg).toBeTruthy();
    expect(heroBg.getAttribute('class') || '').toContain('hero-bg');
    expect(heroGradients).toBeTruthy();
    expect((heroGradients.getAttribute('class') || '').includes('hero-bg-gradients--home')).toBe(true);
  });

  test('reports reduced motion as off for disabled motion environment', () => {
    cleanup();
    configureMatchMedia({ mobile: false, reduceMotion: true, pointerFine: true });
    render(<LandingPage />);

    const backdrop = screen.getByTestId('hero-backdrop');

    expect(backdrop.getAttribute('data-motion')).toBe('off');
  });
});
