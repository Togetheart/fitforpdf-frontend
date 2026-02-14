'use client';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { gsap } from 'gsap';

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
  vi.restoreAllMocks();
});

describe('HeroBackdrop', () => {
  test('renders layers and animates radial center variables when motion is allowed', () => {
    const toSpy = vi.spyOn(gsap, 'to');
    const quickToSpy = vi.spyOn(gsap, 'quickTo');
    const addEventSpy = vi.spyOn(HTMLElement.prototype, 'addEventListener');

    render(<LandingPage />);

    const backdrop = screen.getByTestId('hero-backdrop');
    const layerOne = screen.getByTestId('hero-bg-layer-1');
    const layerTwo = screen.getByTestId('hero-bg-layer-2');
    const grain = screen.getByTestId('hero-bg-grain');

    expect(backdrop.getAttribute('data-motion')).toBe('on');
    expect(layerOne.style.backgroundImage).toContain('var(--r1x)');
    expect(layerTwo.style.backgroundImage).toContain('var(--r2x)');
    expect(grain).toBeTruthy();

    expect(toSpy).toHaveBeenCalledWith(
      layerOne,
      expect.objectContaining({
        '--r1x': expect.stringContaining('%'),
        '--r1y': expect.stringContaining('%'),
      }),
    );
    expect(toSpy).toHaveBeenCalledWith(
      layerTwo,
      expect.objectContaining({
        '--r2x': expect.stringContaining('%'),
        '--r2y': expect.stringContaining('%'),
      }),
    );
    expect(toSpy).toHaveBeenCalledWith(
      grain,
      expect.objectContaining({ opacity: 0.16 }),
    );

    expect(quickToSpy).toHaveBeenCalledTimes(6);
    expect(addEventSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
    expect(addEventSpy).toHaveBeenCalledWith('pointerleave', expect.any(Function));
  });

  test('debug mode multiplies motion amplitudes', () => {
    cleanup();
    window.history.replaceState({}, '', '/?motion=debug');

    const toSpy = vi.spyOn(gsap, 'to');
    render(<LandingPage />);

    const layerOne = screen.getByTestId('hero-bg-layer-1');
    const layerTwo = screen.getByTestId('hero-bg-layer-2');
    const calls = toSpy.mock.calls.map(([, values]) => values || {}).filter((values) => values && typeof values === 'object');
    const layerOneCall = calls.find((values) => values['--r1x']);
    const layerTwoCall = calls.find((values) => values['--r2x']);

    expect(layerOneCall?.['--r1x']).toBe('60%');
    expect(layerOneCall?.['--r1y']).toBe('64%');
    expect(layerTwoCall?.['--r2x']).toBe('16%');
    expect(layerTwoCall?.['--r2y']).toBe('66%');
  });

  test('disables all gsap motion when reduced motion is requested', () => {
    cleanup();
    configureMatchMedia({ mobile: false, reduceMotion: true, pointerFine: true });

    const toSpy = vi.spyOn(gsap, 'to');
    const quickToSpy = vi.spyOn(gsap, 'quickTo');
    const addEventSpy = vi.spyOn(HTMLElement.prototype, 'addEventListener');

    render(<LandingPage />);

    const backdrop = screen.getByTestId('hero-backdrop');
    expect(backdrop.getAttribute('data-motion')).toBe('off');
    expect(toSpy).not.toHaveBeenCalled();
    expect(quickToSpy).not.toHaveBeenCalled();
    expect(addEventSpy).not.toHaveBeenCalledWith('pointermove', expect.any(Function));
    expect(addEventSpy).not.toHaveBeenCalledWith('pointerleave', expect.any(Function));
  });

  test('does not attach pointer listeners on non-fine pointer devices', () => {
    cleanup();
    configureMatchMedia({ mobile: true, reduceMotion: false, pointerFine: false });

    const quickToSpy = vi.spyOn(gsap, 'quickTo');
    const addEventSpy = vi.spyOn(HTMLElement.prototype, 'addEventListener');

    render(<LandingPage />);

    expect(quickToSpy).not.toHaveBeenCalled();
    expect(addEventSpy).not.toHaveBeenCalledWith('pointermove', expect.any(Function));
    expect(addEventSpy).not.toHaveBeenCalledWith('pointerleave', expect.any(Function));
  });
});
