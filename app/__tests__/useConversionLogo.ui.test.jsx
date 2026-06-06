import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import React from 'react';

import useConversion from '../hooks/useConversion.mjs';

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true, configurable: true,
    value: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
  });
});
afterEach(() => cleanup());

function Harness({ file }) {
  const c = useConversion({ quota: { planType: 'free', freeExportsLeft: 5, remainingInPeriod: 5 } });
  return (
    <div>
      <div data-testid="logo-name">{c.logoFile ? c.logoFile.name : 'none'}</div>
      <div data-testid="logo-error">{c.logoError || ''}</div>
      <button type="button" onClick={() => c.handleLogoSelect(file)}>select</button>
      <button type="button" onClick={() => c.removeLogo()}>remove</button>
    </div>
  );
}

const bigPng = () => new File([new Uint8Array(300 * 1024)], 'big.png', { type: 'image/png' });
const smallPng = () => new File([new Uint8Array(10)], 'logo.png', { type: 'image/png' });
const gif = () => new File([new Uint8Array(10)], 'a.gif', { type: 'image/gif' });

describe('useConversion.handleLogoSelect — logo validation (no silent drop)', () => {
  test('rejects a logo > 256 KB with a clear error and keeps no logo', () => {
    render(<Harness file={bigPng()} />);
    fireEvent.click(screen.getByText('select'));
    expect(screen.getByTestId('logo-error').textContent).toMatch(/256 Ko/i);
    expect(screen.getByTestId('logo-name').textContent).toBe('none');
  });

  test('rejects a non PNG/JPG file', () => {
    render(<Harness file={gif()} />);
    fireEvent.click(screen.getByText('select'));
    expect(screen.getByTestId('logo-error').textContent).toMatch(/PNG ou JPG/i);
    expect(screen.getByTestId('logo-name').textContent).toBe('none');
  });

  test('accepts a valid small PNG and clears any error', () => {
    render(<Harness file={smallPng()} />);
    fireEvent.click(screen.getByText('select'));
    expect(screen.getByTestId('logo-name').textContent).toBe('logo.png');
    expect(screen.getByTestId('logo-error').textContent).toBe('');
  });

  test('removeLogo clears the selected logo', () => {
    render(<Harness file={smallPng()} />);
    fireEvent.click(screen.getByText('select'));
    expect(screen.getByTestId('logo-name').textContent).toBe('logo.png');
    fireEvent.click(screen.getByText('remove'));
    expect(screen.getByTestId('logo-name').textContent).toBe('none');
  });
});
