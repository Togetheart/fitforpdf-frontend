/**
 * Defect 26 — composed-chrome gate.
 *
 * SiteShellGate decides the page chrome from the route. On the immersive /app
 * route it must BYPASS the marketing SiteShell entirely: the only <main> on the
 * page is AppPage's own workbench <main>, and the marketing SiteHeader must be
 * absent. On a normal marketing route (e.g. /pricing) the gate must wrap the
 * children in SiteShell, which contributes the marketing SiteHeader.
 *
 * This composes the *real* SiteShellGate with the *real* AppPage so a
 * regression that double-renders a shell <main> (or leaks the marketing header
 * onto /app) is caught.
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { cleanup, render } from '@testing-library/react';

// usePathname is the single input SiteShellGate branches on. A mutable module
// variable lets each test pick the route before rendering.
let pathname = '/';
vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
}));

import SiteShellGate from '../components/SiteShellGate.jsx';
import AppPage from '../app/page.jsx';

beforeEach(() => {
  pathname = '/';
});

afterEach(() => {
  cleanup();
});

describe('Defect 26, SiteShellGate composed chrome', () => {
  test('on /app there is exactly one <main> and no marketing SiteHeader', () => {
    pathname = '/app';

    render(
      <SiteShellGate>
        <AppPage />
      </SiteShellGate>,
    );

    // AppPage owns its single immersive <main>; SiteShell (and its <main>) is
    // bypassed for /app, so the document must contain exactly one main.
    const mains = document.querySelectorAll('main');
    expect(mains.length).toBe(1);
    expect(mains[0].getAttribute('data-testid')).toBe('app-workbench');

    // The marketing header carries data-testid="site-header" — it must not be
    // present on the immersive app route.
    expect(document.querySelector('[data-testid="site-header"]')).toBeNull();
  });

  test('on a marketing route (/pricing) the gate renders SiteShell with its header', () => {
    pathname = '/pricing';

    render(
      <SiteShellGate>
        <div data-testid="route-content">Pricing</div>
      </SiteShellGate>,
    );

    // Contrasting case: the marketing chrome (SiteHeader) IS present, wrapping
    // the page content inside SiteShell's single <main>.
    expect(document.querySelector('[data-testid="site-header"]')).not.toBeNull();
    expect(document.querySelector('[data-testid="route-content"]')).not.toBeNull();
    expect(document.querySelectorAll('main').length).toBe(1);
  });
});
