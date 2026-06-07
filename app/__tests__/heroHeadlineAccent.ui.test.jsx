import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import * as gsap from 'gsap';

import HeroHeadline from '../components/HeroHeadline';
import { LANDING_COPY } from '../siteCopy.mjs';

function configureMatchMedia(reduceMotion = false) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query) => ({
      matches: query.includes('prefers-reduced-motion: reduce') ? reduceMotion : false,
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
  configureMatchMedia(false);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('HeroHeadline accent animation', () => {
  test('renders heroHeadlineL1 as gradient accent and heroHeadlineL2 as plain text', () => {
    render(<HeroHeadline />);

    const accent = screen.getByTestId('hero-headline-accent');
    expect(accent).toBeTruthy();
    expect(accent.textContent).toBe(LANDING_COPY.heroHeadlineL1);
    expect(accent.className).toContain('hero-accent');
    expect(accent.className).toContain('hero-accent--sections');

    const secondLine = screen.getByText(LANDING_COPY.heroHeadlineL2);
    expect(secondLine).toBeTruthy();
    expect(secondLine.className).not.toContain('hero-accent');
    expect(secondLine.className).not.toContain('hero-accent--sections');
  });

  test('animates accent at load when not reduced motion', async () => {
    configureMatchMedia(false);
    const timelineTo = vi.fn().mockReturnThis();
    const timeline = { to: timelineTo, kill: vi.fn() };
    const gsapCore = gsap.gsap || gsap.default || gsap;
    const timelineSpy = vi
      .spyOn(gsapCore, 'timeline')
      .mockReturnValue(timeline);

    render(<HeroHeadline />);

    const accent = screen.getByTestId('hero-headline-accent');
    expect(accent.getAttribute('data-anim')).toBe('on');
    // GSAP is now dynamically imported (deferred chunk), so the timeline is
    // created on a microtask after the effect runs — wait for it.
    await vi.waitFor(() => expect(timelineSpy).toHaveBeenCalledTimes(1));
    expect(timelineTo).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        backgroundPosition: '100% 50%',
        duration: 12,
      }),
    );
  });

  test('keeps reduced-motion static and does not animate', async () => {
    cleanup();
    configureMatchMedia(true);

    const gsapCore = gsap.gsap || gsap.default || gsap;
    const timelineSpy = vi.spyOn(gsapCore, 'timeline');

    render(<HeroHeadline />);

    const accent = screen.getByTestId('hero-headline-accent');
    expect(accent.getAttribute('data-anim')).toBe('off');
    // Reduced motion returns before the dynamic import — give any stray
    // microtask a chance, then assert gsap was never loaded/used.
    await Promise.resolve();
    expect(timelineSpy).not.toHaveBeenCalled();
  });
});
