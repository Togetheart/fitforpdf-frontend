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

describe('privacy page UI', () => {
  test('has global header and footer', () => {
    expect(screen.getAllByRole('navigation').length).toBeGreaterThan(1);
    expect(screen.getByRole('contentinfo')).toBeTruthy();
  });

  test('renders premium hero hierarchy', () => {
    expect(screen.getByRole('heading', { level: 1, name: /Your data\./i })).toBeTruthy();
    expect(screen.getByText('Not our business.')).toBeTruthy();
    expect(screen.getByText('PRIVACY')).toBeTruthy();
  });

  test('contains privacy core sections', () => {
    expect(screen.getByRole('heading', { level: 2, name: 'How file handling works' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: 'What we don’t do' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: 'Infrastructure' })).toBeTruthy();
  });

  test('contains file handling promises', () => {
    expect(screen.getByText('Files are deleted immediately after conversion.')).toBeTruthy();
    expect(screen.getByText('Available for up to 15 minutes.')).toBeTruthy();
    expect(screen.getByText('We do not store file contents in logs.')).toBeTruthy();
    expect(screen.getByText('Do not upload sensitive data.')).toBeTruthy();
  });

  test('contains legal footer line', () => {
    expect(screen.getByText('For legal terms, see Terms of Service.')).toBeTruthy();
  });
});
