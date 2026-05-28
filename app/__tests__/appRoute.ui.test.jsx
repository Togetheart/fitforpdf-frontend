import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';

import AppPage from '../app/page.jsx';

function configureMatchMedia({ mobile = false } = {}) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: () => ({
      matches: mobile,
      media: '(max-width: 768px)',
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => {},
    }),
  });
}

beforeEach(() => {
  configureMatchMedia({ mobile: false });
});

afterEach(() => {
  cleanup();
});

describe('/app tool-first workbench shell', () => {
  test('renders the workbench shell with the conversion tool', () => {
    render(<AppPage />);
    expect(screen.getByTestId('app-workbench')).toBeTruthy();
    // The existing UploadCard is reused inside the shell (no rebuild).
    expect(screen.getByTestId('tool')).toBeTruthy();
  });

  test('surfaces the API path as a secondary route, not a primary CTA', () => {
    render(<AppPage />);
    const apiLink = screen.getByRole('link', { name: /API/i });
    expect(apiLink.getAttribute('href')).toBe('/developers');
  });

  test('frames itself as a tool, not a landing page (no hero marketing sections)', () => {
    render(<AppPage />);
    // The landing-only proof/comparison sections must NOT be present on /app.
    expect(screen.queryByTestId('early-feedback-section')).toBeNull();
  });
});
