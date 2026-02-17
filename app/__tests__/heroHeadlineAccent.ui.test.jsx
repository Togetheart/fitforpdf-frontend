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
  test('renders accent line with test id and visible on hero', () => {
    render(<HeroHeadline />);

    expect(screen.getByText('Your spreadsheet.')).toBeTruthy();
    expect(screen.getByText('Reorganized into readable sections.')).toBeTruthy();

    const accent = screen.getByTestId('hero-headline-accent');
    expect(accent).toBeTruthy();
    expect(accent.textContent).toBe('Ready to send.');
    expect(accent.className).toContain('hero-accent');
    expect(screen.getByText('Reorganized into readable sections.').className).not.toContain('hero-accent');
  });

  test('animates accent line when reduced motion is off', () => {
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
    expect(timelineTo).toHaveBeenCalledTimes(1);
    expect(timelineTo.mock.calls[0]?.[1]).toMatchObject({
      backgroundPosition: '100% 50%',
    });
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
