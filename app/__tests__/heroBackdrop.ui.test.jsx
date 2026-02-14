import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { gsap } from 'gsap';

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
          : query.includes('(pointer: fine)')
            ? true
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
  vi.restoreAllMocks();
});

describe('hero backdrop gsap motion engine', () => {
  test('renders hero backdrop layers and enables motion when supported', () => {
    const timelineMock = { to: vi.fn().mockReturnThis(), kill: vi.fn() };
    const timelineSpy = vi.spyOn(gsap, 'timeline').mockReturnValue(timelineMock);
    const quickToSpy = vi.spyOn(gsap, 'quickTo').mockReturnValue(vi.fn());

    render(<LandingPage />);

    const backdrop = screen.getByTestId('hero-backdrop');
    const heroBg = screen.getByTestId('hero-bg');
    const layerOne = screen.getByTestId('hero-bg-layer-1');
    const layerTwo = screen.getByTestId('hero-bg-layer-2');
    const grain = screen.getByTestId('hero-bg-grain');
    const heroGradients = screen.getByTestId('hero-bg-gradients');
    const noise = screen.getByTestId('hero-bg-noise');

    expect(backdrop).toBeTruthy();
    expect(backdrop.getAttribute('data-motion')).toBe('on');
    expect(heroBg).toBeTruthy();
    expect(layerOne).toBeTruthy();
    expect(layerTwo).toBeTruthy();
    expect(grain).toBeTruthy();
    expect(heroGradients).toBeTruthy();
    expect(noise).toBeTruthy();
    expect((heroBg.getAttribute('class') || '').includes('hero-bg')).toBe(true);
    expect((heroBg.getAttribute('class') || '').includes('pointer-events-none')).toBe(true);
    expect((layerOne.getAttribute('style') || '').includes('radial-gradient')).toBe(true);
    expect((layerTwo.getAttribute('style') || '').includes('radial-gradient')).toBe(true);
    expect(timelineSpy).toHaveBeenCalledTimes(3);
    expect(quickToSpy).toHaveBeenCalledTimes(4);
  });

  test('does not initialize gsap timeline when reduced motion is requested', () => {
    cleanup();
    configureMatchMedia({ mobile: false, reduceMotion: true });
    const timelineSpy = vi.spyOn(gsap, 'timeline');
    const quickToSpy = vi.spyOn(gsap, 'quickTo');

    render(<LandingPage />);

    const backdrop = screen.getByTestId('hero-backdrop');
    expect(backdrop.getAttribute('data-motion')).toBe('off');
    expect(timelineSpy).not.toHaveBeenCalled();
    expect(quickToSpy).not.toHaveBeenCalled();
  });
});
