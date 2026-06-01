import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';

let pathname = '/';

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
}));

import SiteShellGate from '../components/SiteShellGate';

beforeEach(() => {
  pathname = '/';
});

afterEach(() => {
  cleanup();
});

describe('SiteShellGate', () => {
  test('keeps marketing chrome on normal site routes', () => {
    pathname = '/pricing';

    render(
      <SiteShellGate>
        <div data-testid="route-content">Pricing</div>
      </SiteShellGate>,
    );

    expect(screen.getByTestId('route-content')).toBeTruthy();
    expect(screen.getByTestId('site-header')).toBeTruthy();
    expect(screen.getByTestId('site-footer')).toBeTruthy();
  });

  test('removes marketing chrome on the immersive app route', () => {
    pathname = '/app';

    render(
      <SiteShellGate>
        <div data-testid="route-content">Workbench</div>
      </SiteShellGate>,
    );

    expect(screen.getByTestId('route-content')).toBeTruthy();
    expect(screen.queryByTestId('site-header')).toBeNull();
    expect(screen.queryByTestId('site-footer')).toBeNull();
  });
});
