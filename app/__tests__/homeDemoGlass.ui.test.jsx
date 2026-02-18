import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import LandingPage from '../page.jsx';
import { LANDING_COPY } from '../siteCopy.mjs';

function configureMatchMedia({ mobile = false, reduceMotion = false } = {}) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query) => ({
      matches: query.includes('prefers-reduced-motion')
        ? reduceMotion
        : query.includes('max-width: 768px')
          ? mobile
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

function renderHome() {
  configureMatchMedia({ mobile: false, reduceMotion: false });
  return render(<LandingPage />);
}

beforeEach(() => {
  renderHome();
});

afterEach(() => {
  cleanup();
});

describe('home demo glass block', () => {
  test('keeps hero heading and CTA text unchanged', () => {
    expect(screen.getByRole('heading', { level: 1, name: 'Your spreadsheet. Reorganized into readable sections. Ready to send.' })).toBeTruthy();
    expect(screen.getByTestId('hero-primary-cta').textContent?.trim()).toBe(LANDING_COPY.heroPrimaryCta);
  });

  test('demo glass card appears directly below hero CTA in DOM order', () => {
    const demoCard = screen.getByTestId('demo-glass-card');
    const cta = screen.getByTestId('hero-primary-cta');
    const markers = Array.from(
      document.querySelectorAll('[data-testid="hero-primary-cta"], [data-testid="demo-glass-card"]'),
    );

    expect(markers.indexOf(cta)).toBeGreaterThan(-1);
    expect(markers.indexOf(demoCard)).toBeGreaterThan(markers.indexOf(cta));
  });

  test('demo glass card has Apple glass utility classes', () => {
    const demoCard = screen.getByTestId('demo-glass-card');
    const classes = demoCard.className;

    expect(classes).toContain('backdrop-blur');
    expect(classes).toContain('bg-white/');
    expect(classes).toContain('border');
    expect(classes).toContain('rounded-3xl');
    expect(classes).toContain('shadow-[0_10px_30px_rgba(0,0,0,0.06)]');
    expect(classes).toContain('ring-1');
    expect(classes).toContain('ring-black/5');
  });

  test('demo embed area exists with rounded overflow classes', () => {
    const embed = screen.getByTestId('demo-glass-embed');
    const embedClasses = embed.className;

    expect(embedClasses).toContain('overflow-hidden');
    expect(embedClasses).toContain('rounded-xl');
    expect(embedClasses).toContain('bg-white/40');
  });

  test('demo card has subtle inner highlight overlay', () => {
    const highlight = screen.getByTestId('demo-glass-highlight');
    const classes = highlight.className;

    expect(classes).toContain('pointer-events-none');
    expect(classes).toContain('absolute');
    expect(classes).toContain('inset-0');
    expect(classes).toContain('rounded-3xl');
    expect(classes).toContain('bg-gradient-to-b');
    expect(classes).toContain('from-white/50');
    expect(classes).toContain('to-transparent');
  });

  test('demo embed is an iframe with lazy loading and secure attributes', () => {
    const iframe = screen.getByTestId('demo-glass-iframe');

    expect(iframe.tagName.toLowerCase()).toBe('iframe');
    expect(iframe.getAttribute('loading')).toBe('lazy');
    expect(iframe.getAttribute('title')).toBe('FitForPDF interactive demo');
    expect(iframe.getAttribute('sandbox')).toContain('allow-scripts');
    expect(iframe.getAttribute('sandbox')).toContain('allow-same-origin');
    expect(iframe.getAttribute('sandbox')).toContain('allow-forms');
  });

  test('shows a lightweight skeleton while the demo iframe is loading', () => {
    const iframe = screen.getByTestId('demo-glass-iframe');
    expect(screen.getByTestId('demo-glass-skeleton')).toBeTruthy();
    fireEvent.load(iframe);
    expect(screen.queryByTestId('demo-glass-skeleton')).toBeNull();
  });
});
