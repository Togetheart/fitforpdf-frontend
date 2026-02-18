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
  test('renders section word accent and Ready to send. in plain color', () => {
    render(<HeroHeadline />);

    expect(screen.getByText('Your spreadsheet.')).toBeTruthy();
    expect(screen.getByText((content) => content.includes('Reorganized into readable'))).toBeTruthy();
    expect(screen.getByText('sections.')).toBeTruthy();

    const sectionWordAccent = screen.getByTestId('hero-headline-accent');
    expect(sectionWordAccent).toBeTruthy();
    expect(sectionWordAccent.textContent).toBe('sections.');
    expect(sectionWordAccent.className).toContain('hero-accent');
    expect(sectionWordAccent.className).toContain('hero-accent--sections');

    const readyLine = screen.getByText('Ready to send.');
    expect(readyLine).toBeTruthy();
    expect(readyLine.className).not.toContain('hero-accent');
    expect(readyLine.className).not.toContain('hero-accent--sections');
  });

  test('animates accent line at load when not reduced motion', () => {
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
