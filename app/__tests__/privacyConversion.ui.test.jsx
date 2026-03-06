import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';

import PrivacyPage from '../privacy/page.jsx';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

beforeEach(() => {
  render(
    <>
      <SiteHeader />
      <PrivacyPage />
      <SiteFooter />
    </>,
  );
});

afterEach(() => {
  cleanup();
});

describe('privacy conversion UI', () => {
  test('uses privacy-style eyebrow and hero heading', () => {
    // The h1 with data-testid="privacy-h1" is the small "Privacy" heading
    const heading = screen.getByTestId('privacy-h1');
    expect(heading).toBeTruthy();
    expect(heading.textContent).toContain('Privacy');
    // Large hero copy spans
    expect(screen.getByText('Your data.')).toBeTruthy();
    expect(screen.getByText('Not our business.')).toBeTruthy();
  });

  test('renders required retention and safety claims', () => {
    expect(screen.getByText('Files are deleted immediately after conversion.')).toBeTruthy();
    expect(screen.getByText('The generated PDF is available for up to 15 minutes. Automatically deleted after.')).toBeTruthy();
    expect(screen.getByText('File contents are never stored in logs.')).toBeTruthy();
    expect(screen.getByText(/Do not upload highly regulated or special-category data/i)).toBeTruthy();
  });

  test('renders what we log section and shared header/footer', () => {
    expect(screen.getByRole('heading', { name: 'What we log' })).toBeTruthy();
    const headerLinks = screen.getAllByRole('navigation')[0];
    expect(headerLinks.textContent).toContain('Pricing');
    expect(headerLinks.textContent).toContain('Privacy');
    expect(screen.getAllByRole('contentinfo').length).toBe(1);
  });
});
