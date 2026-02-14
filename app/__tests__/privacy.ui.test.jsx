import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';

import PrivacyPage from '../privacy/page.js';

beforeEach(() => {
  render(<PrivacyPage />);
});

afterEach(() => {
  cleanup();
});

describe('privacy page UI', () => {
  test('contains file deletion statement', () => {
    const element = screen.getByText('Files are deleted immediately after conversion.');
    expect(element).toBeTruthy();
  });

  test('contains PDF retention statement', () => {
    const element = screen.getByText('The generated PDF is available for up to 15 minutes.');
    expect(element).toBeTruthy();
  });

  test('contains logs statement', () => {
    const element = screen.getByText('We do not store file contents in logs.');
    expect(element).toBeTruthy();
  });

  test('contains sensitive data warning', () => {
    const element = screen.getByText('Do not upload sensitive data.');
    expect(element).toBeTruthy();
  });
});
