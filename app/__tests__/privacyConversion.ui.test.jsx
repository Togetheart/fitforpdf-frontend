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
  test('uses pricing-style eyebrow and centered hero heading', () => {
    expect(screen.getByText('PRIVACY')).toBeTruthy();
    expect(screen.getByTestId('privacy-h1')).toBeTruthy();
    expect((screen.getByTestId('privacy-h1').className || '').includes('text-center')).toBe(true);
  });

  test('renders required retention and safety claims', () => {
    expect(screen.getByText('Files are deleted immediately after conversion.')).toBeTruthy();
    expect(screen.getByText('The generated PDF is available for up to 15 minutes.')).toBeTruthy();
    expect(screen.getByText('We do not store file contents in logs.')).toBeTruthy();
    expect(screen.getByText('Do not upload sensitive data.')).toBeTruthy();
  });

  test('renders what we log section and shared header/footer', () => {
    expect(screen.getByRole('heading', { name: 'What we log' })).toBeTruthy();
    const headerLinks = screen.getAllByRole('navigation')[0];
    expect(headerLinks.textContent).toContain('Pricing');
    expect(headerLinks.textContent).toContain('Privacy');
    expect(screen.getAllByRole('contentinfo').length).toBe(1);
  });
});
