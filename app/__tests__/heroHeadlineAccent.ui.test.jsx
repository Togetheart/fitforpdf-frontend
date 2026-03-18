import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import * as gsap from 'gsap';

import HeroHeadline from '../components/HeroHeadline';

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
  test('renders "Readable PDFs" as gradient accent and second line as plain text', () => {
    render(<HeroHeadline />);

    const accent = screen.getByTestId('hero-headline-accent');
    expect(accent).toBeTruthy();
    expect(accent.textContent).toBe('Readable PDFs');
    expect(accent.className).toContain('hero-accent');
    expect(accent.className).toContain('hero-accent--sections');

    const secondLine = screen.getByText(/from wide tables/);
    expect(secondLine).toBeTruthy();
    expect(secondLine.className).not.toContain('hero-accent');
    expect(secondLine.className).not.toContain('hero-accent--sections');
  });

  test('animates accent at load when not reduced motion', () => {
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
    expect(timelineSpy).toHaveBeenCalledTimes(1);
    expect(timelineTo).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        backgroundPosition: '100% 50%',
        duration: 12,
      }),
    );
  });

  test('keeps reduced-motion static and does not animate', () => {
    cleanup();
    configureMatchMedia(true);

    const gsapCore = gsap.gsap || gsap.default || gsap;
    const timelineSpy = vi.spyOn(gsapCore, 'timeline');

    render(<HeroHeadline />);

    const accent = screen.getByTestId('hero-headline-accent');
    expect(accent.getAttribute('data-anim')).toBe('off');
    expect(timelineSpy).not.toHaveBeenCalled();
  });
});
