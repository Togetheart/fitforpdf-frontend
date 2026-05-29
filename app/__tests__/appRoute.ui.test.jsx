import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';

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
    expect(screen.getByRole('main', { name: /fitforpdf conversion workbench/i })).toBeTruthy();
    // The existing UploadCard is reused inside the shell (no rebuild).
    expect(screen.getByTestId('tool')).toBeTruthy();
  });

  test('renders immersive workbench regions instead of a centered page card', () => {
    render(<AppPage />);
    expect(screen.getByTestId('app-toolbar')).toBeTruthy();
    expect(screen.getByTestId('app-left-rail')).toBeTruthy();
    expect(screen.getByTestId('app-canvas')).toBeTruthy();
    expect(screen.getByTestId('app-inspector')).toBeTruthy();
    expect(screen.getByRole('complementary', { name: /recent exports and sections/i })).toBeTruthy();
    expect(screen.getByRole('complementary', { name: /conversion settings/i })).toBeTruthy();
  });

  test('matches the finalized app chrome structure', () => {
    render(<AppPage />);
    expect(screen.getByText('FitForPDF')).toBeTruthy();
    expect(screen.getByTestId('app-crumb').textContent).toMatch(/new export/i);
    expect(screen.getByTestId('app-quota').textContent).toMatch(/free/i);
    expect(screen.getByTestId('app-avatar').textContent).toBe('SN');
  });

  test('shows finalized inspector sections with live/soon statuses and bottom actions', () => {
    render(<AppPage />);
    const inspector = screen.getByTestId('app-inspector');
    expect(within(inspector).getByText('Adjust output')).toBeTruthy();
    expect(within(inspector).getByText('Report title')).toBeTruthy();
    expect(within(inspector).getAllByText('Live').length).toBeGreaterThanOrEqual(2);
    expect(within(inspector).getByText('Branding')).toBeTruthy();
    expect(within(inspector).getAllByText('Soon').length).toBeGreaterThanOrEqual(2);
    expect(within(inspector).getByRole('button', { name: /Update preview/i })).toBeTruthy();
    expect(within(inspector).getByRole('button', { name: /Download PDF/i })).toBeTruthy();
    expect(within(inspector).getByRole('button', { name: /Render another file/i })).toBeTruthy();
  });

  test('surfaces the API path as a secondary route, not a primary CTA', () => {
    render(<AppPage />);
    const apiLinks = screen.getAllByRole('link', { name: /API/i });
    expect(apiLinks.length).toBeGreaterThanOrEqual(1);
    expect(apiLinks.every((link) => link.getAttribute('href') === '/developers')).toBe(true);
  });

  test('frames itself as a tool, not a landing page (no hero marketing sections)', () => {
    render(<AppPage />);
    // The landing-only proof/comparison sections must NOT be present on /app.
    expect(screen.queryByTestId('early-feedback-section')).toBeNull();
  });

  test('exposes a pre-render Report title control (Kunj custom title)', () => {
    render(<AppPage />);
    expect(screen.getByTestId('app-inspector')).toBeTruthy();
    const input = screen.getByLabelText(/Report title/i);
    expect(input).toBeTruthy();
    fireEvent.change(input, { target: { value: 'Acme Q4' } });
    expect(input.value).toBe('Acme Q4');
  });

  test('exposes a pre-render column-grouping toggle (auto default, selectable)', () => {
    render(<AppPage />);
    const group = screen.getByTestId('app-columnmap');
    const auto = within(group).getByRole('button', { name: 'Auto' });
    expect(auto.getAttribute('aria-pressed')).toBe('true');
    const off = within(group).getByRole('button', { name: 'Off' });
    fireEvent.click(off);
    expect(off.getAttribute('aria-pressed')).toBe('true');
    expect(auto.getAttribute('aria-pressed')).toBe('false');
  });
});
