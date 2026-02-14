import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';

import PrivacyPage from '../privacy/page.jsx';

function configureMatchMedia({ mobile = false } = {}) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query) => ({
      matches: mobile,
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
  configureMatchMedia({ mobile: false });
});

afterEach(() => {
  cleanup();
});

describe('privacy hero background', () => {
  test('privacy hero has shared hero background wrapper and layers', () => {
    render(<PrivacyPage />);

    const heroBg = screen.getByTestId('hero-bg');
    const heroGradients = screen.getByTestId('hero-bg-gradients');

    expect(heroBg).toBeTruthy();
    expect((heroBg.getAttribute('class') || '').includes('hero-bg')).toBe(true);
    expect((heroBg.getAttribute('class') || '').includes('pointer-events-none')).toBe(true);
    expect(heroGradients).toBeTruthy();
    expect((heroGradients.getAttribute('class') || '').includes('hero-bg-gradients--privacy')).toBe(true);
  });
});
