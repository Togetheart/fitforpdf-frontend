import { afterEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';

import SiteShell from '../components/SiteShell';

const hasClass = (node, className) => (node.getAttribute('class') || '').split(/\s+/).includes(className);

afterEach(() => {
  cleanup();
});

describe('site navbar style and behavior', () => {
  test('navbar uses sticky glassmorphism classes', () => {
    render(
      <SiteShell>
        <main data-testid="page-content">content</main>
      </SiteShell>,
    );

    const header = screen.getByTestId('site-header');

    expect(hasClass(header, 'sticky')).toBe(true);
    expect(hasClass(header, 'top-0')).toBe(true);
    expect(hasClass(header, 'z-50')).toBe(true);
    expect(hasClass(header, 'backdrop-blur-xl')).toBe(true);
    expect(hasClass(header, 'bg-white/60')).toBe(true);
    expect(hasClass(header, 'supports-[backdrop-filter]:bg-white/50')).toBe(true);
    expect(hasClass(header, 'border-b')).toBe(true);
    expect(hasClass(header, 'border-slate-200/60')).toBe(true);
    expect(hasClass(header, 'ring-1')).toBe(true);
    expect(hasClass(header, 'ring-black/5')).toBe(true);
    expect(hasClass(header, 'shadow-sm')).toBe(true);
  });

  test('sticky implementation has no fixed spacer shim', () => {
    render(
      <SiteShell>
        <main data-testid="page-content">content</main>
      </SiteShell>,
    );

    const header = screen.getByTestId('site-header');
    const maybeSpacer = screen.queryByTestId('site-header-spacer');

    expect(hasClass(header, 'fixed')).toBe(false);
    expect(maybeSpacer).toBeNull();
  });

  test('navbar links remain keyboard focusable', () => {
    render(
      <SiteShell>
        <main data-testid="page-content">content</main>
      </SiteShell>,
    );

    const header = screen.getByTestId('site-header');
    const headerNav = header.querySelector('nav');
    const pricingLink = headerNav ? headerNav.querySelector('a[href="/pricing"]') : null;

    expect(pricingLink).not.toBeNull();
    pricingLink.focus();

    expect(document.activeElement).toBe(pricingLink);
  });
});
