import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import LandingPage from '../page.jsx';

vi.mock('../components/BeforeAfter.mjs', () => ({
  default: () => <div data-testid="before-after" />,
}));

function configureMatchMedia({ mobile = false, reduceMotion = false } = {}) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query) => {
      const isReduce = query.includes('prefers-reduced-motion: reduce');
      const matches = isReduce ? reduceMotion : mobile;
      const listenerStore = new Set();
      return {
        matches,
        media: query,
        addEventListener: (type, listener) => {
          if (type === 'change' && typeof listener === 'function') listenerStore.add(listener);
        },
        removeEventListener: (type, listener) => {
          if (type === 'change') listenerStore.delete(listener);
        },
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => true,
      };
    },
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
    const heroNoise = screen.getByTestId('hero-bg-noise');

    expect(heroBg).toBeTruthy();
    expect(layerOne).toBeTruthy();
    expect(layerTwo).toBeTruthy();
    expect(grain).toBeTruthy();
    expect((heroBg.getAttribute('class') || '').includes('hero-bg')).toBe(true);
    expect((heroBg.getAttribute('class') || '').includes('pointer-events-none')).toBe(true);
    expect((layerOne.getAttribute('style') || '').includes('radial-gradient')).toBe(true);
    expect((layerTwo.getAttribute('style') || '').includes('radial-gradient')).toBe(true);
    expect((layerOne.getAttribute('class') || '').includes('motion-safe:animate-heroMeshA')).toBe(true);
    expect((layerTwo.getAttribute('class') || '').includes('motion-safe:animate-heroMeshB')).toBe(true);
    expect((grain.getAttribute('class') || '').includes('hero-bg-grain')).toBe(true);
    expect(heroGradients).toBeTruthy();
    expect(heroNoise).toBeTruthy();
  });

  test('home hero background animation disabled when reduced motion is requested', async () => {
    cleanup();
    configureMatchMedia({ mobile: false, reduceMotion: true });

    render(<LandingPage />);

    const layerOne = screen.getByTestId('hero-bg-layer-1');
    const layerTwo = screen.getByTestId('hero-bg-layer-2');
    const heroGradients = screen.getByTestId('hero-bg-gradients');

    await waitFor(() => {
      const layerOneClasses = layerOne.getAttribute('class') || '';
      const layerTwoClasses = layerTwo.getAttribute('class') || '';
      const hasRawLayerOne = /(?:^|\s)animate-heroMeshA(?:\s|$)/.test(layerOneClasses);
      const hasRawLayerTwo = /(?:^|\s)animate-heroMeshB(?:\s|$)/.test(layerTwoClasses);
      const hasReduceGuard = layerOneClasses.includes('motion-reduce:animate-none') &&
        layerTwoClasses.includes('motion-reduce:animate-none');
      expect((heroGradients.getAttribute('class') || '').includes('hero-bg-gradients--home')).toBe(true);
      expect(hasRawLayerOne).toBe(false);
      expect(hasRawLayerTwo).toBe(false);
      expect(hasReduceGuard).toBe(true);
    });
  });
});
