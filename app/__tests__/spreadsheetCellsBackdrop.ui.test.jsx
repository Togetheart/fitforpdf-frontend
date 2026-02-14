import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';

import { gsap } from 'gsap';
import AppBackdrop from '../components/AppBackdrop';

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

beforeEach(() => {
  configureMatchMedia({ mobile: false, reduceMotion: false, pointerFine: true });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('spreadsheet cells backdrop', () => {
  test('app backdrop includes cells layer with multiple rect outlines', () => {
    render(<AppBackdrop />);

    const layer = screen.getByTestId('cells-backdrop');
    const cells = layer.querySelectorAll('[data-cell="true"]');

    expect(layer).toBeTruthy();
    expect(layer.getAttribute('class') || '').toContain('pointer-events-none');
    expect(cells.length).toBeGreaterThanOrEqual(8);
  });

  test('prefers-reduced-motion does not create gsap timeline', () => {
    configureMatchMedia({ mobile: false, reduceMotion: true, pointerFine: true });
    const timelineSpy = vi.spyOn(gsap, 'timeline');

    render(<AppBackdrop />);

    expect(timelineSpy).not.toHaveBeenCalled();
    expect(screen.getByTestId('cells-backdrop').getAttribute('class') || '').toContain('pointer-events-none');
  });

  test('cell positions are not a uniform grid', () => {
    render(<AppBackdrop />);

    const layer = screen.getByTestId('cells-backdrop');
    const cells = layer.querySelectorAll('[data-cell="true"]');
    const xs = Array.from(cells).map((cell) => {
      const transform = cell.getAttribute('transform') || '';
      const match = /translate\(([-\d.]+)\s+([-\d.]+)\)/.exec(transform);
      return Number.parseFloat(match?.[1] || '0');
    });
    const uniq = xs
      .sort((a, b) => a - b)
      .slice(1)
      .map((v, idx, arr) => Math.abs(v - arr[idx - 1]));

    expect(uniq.length).toBeGreaterThanOrEqual(7);
    const mean = uniq.reduce((sum, value) => sum + value, 0) / uniq.length;
    const stable = uniq.every((value) => Math.abs(value - mean) < 4);

    expect(stable).toBe(false);
  });
});
