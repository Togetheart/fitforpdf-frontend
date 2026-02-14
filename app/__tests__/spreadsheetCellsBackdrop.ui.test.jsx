import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';

import AppBackdrop from '../components/AppBackdrop';

function configureMatchMedia({ reduceMotion = false } = {}) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
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
  configureMatchMedia({ reduceMotion: false });
});

afterEach(() => {
  cleanup();
});

describe('app backdrop simplified to white base', () => {
  test('renders plain app backdrop without decorative layers', () => {
    render(<AppBackdrop />);
    const backdrop = screen.getByTestId('app-backdrop');

    expect(backdrop).toBeTruthy();
    expect(backdrop.getAttribute('data-motion')).toBe('on');
    expect(screen.queryByTestId('app-backdrop-layer-1')).toBeNull();
    expect(screen.queryByTestId('app-backdrop-layer-2')).toBeNull();
    expect(screen.queryByTestId('cells-backdrop')).toBeNull();
  });

  test('reduced motion marks motion state as off', () => {
    cleanup();
    configureMatchMedia({ reduceMotion: true });

    render(<AppBackdrop />);
    const backdrop = screen.getByTestId('app-backdrop');
    expect(backdrop.getAttribute('data-motion')).toBe('off');
  });
});
