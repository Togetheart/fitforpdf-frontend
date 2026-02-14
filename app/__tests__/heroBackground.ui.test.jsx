import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import LandingPage from '../page.jsx';

function configureMatchMedia({ mobile = false, reduceMotion = false } = {}) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query) => ({
      matches: query.includes('prefers-reduced-motion: reduce')
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
});

afterEach(() => {
  cleanup();
});

describe('hero background shared structure', () => {
  test('home hero has hero background layers', () => {
    render(<LandingPage />);

    const heroBg = screen.getByTestId('hero-bg');
    const layerOne = screen.getByTestId('hero-bg-layer-1');
    const layerTwo = screen.getByTestId('hero-bg-layer-2');
    const grain = screen.getByTestId('hero-bg-grain');
    const heroGradients = screen.getByTestId('hero-bg-gradients');

    expect(heroBg).toBeTruthy();
    expect(layerOne).toBeTruthy();
    expect(layerTwo).toBeTruthy();
    expect(grain).toBeTruthy();
    expect(heroGradients).toBeTruthy();
    expect((heroBg.getAttribute('class') || '').includes('hero-bg')).toBe(true);
    expect((heroBg.getAttribute('class') || '').includes('pointer-events-none')).toBe(true);
    expect((layerOne.getAttribute('style') || '').includes('radial-gradient')).toBe(true);
    expect((layerTwo.getAttribute('style') || '').includes('radial-gradient')).toBe(true);
    expect((layerOne.getAttribute('class') || '').includes('motion-safe:animate-heroMeshA')).toBe(true);
    expect((layerTwo.getAttribute('class') || '').includes('motion-safe:animate-heroMeshB')).toBe(true);
    expect((grain.getAttribute('class') || '').includes('hero-bg-grain')).toBe(true);
  });

  test('home hero background animation disabled when reduced motion is requested', async () => {
    cleanup();
    configureMatchMedia({ mobile: false, reduceMotion: true });

    render(<LandingPage />);

    const layerOne = screen.getByTestId('hero-bg-layer-1');
    const layerTwo = screen.getByTestId('hero-bg-layer-2');

    const layerOneClasses = layerOne.getAttribute('class') || '';
    const layerTwoClasses = layerTwo.getAttribute('class') || '';
    const hasRawLayerOne = /(?:^|\s)animate-heroMeshA(?:\s|$)/.test(layerOneClasses);
    const hasRawLayerTwo = /(?:^|\s)animate-heroMeshB(?:\s|$)/.test(layerTwoClasses);
    const hasReduceGuard = layerOneClasses.includes('motion-reduce:animate-none')
      && layerTwoClasses.includes('motion-reduce:animate-none');

    expect(hasRawLayerOne).toBe(false);
    expect(hasRawLayerTwo).toBe(false);
    expect(hasReduceGuard).toBe(true);
  });
});
