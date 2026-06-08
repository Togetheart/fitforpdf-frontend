import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import React from 'react';

import useConversion, { normalizeLogoFile } from '../hooks/useConversion.mjs';

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
      <button type="button" onClick={() => { void c.handleLogoSelect(file); }}>select</button>
      <button type="button" onClick={() => c.removeLogo()}>remove</button>
    </div>
  );
}

const bigPng = () => new File([new Uint8Array(300 * 1024)], 'big.png', { type: 'image/png' });
const smallPng = () => new File([new Uint8Array(10)], 'logo.png', { type: 'image/png' });
const gif = () => new File([new Uint8Array(10)], 'a.gif', { type: 'image/gif' });

// jsdom has no createImageBitmap/canvas, so handleLogoSelect falls back to the raw file
// and the 256 KB guard applies — the behaviour we want when the browser can't normalize.
describe('useConversion.handleLogoSelect — validation + fallback', () => {
  test('rejects a non PNG/JPG file', async () => {
    render(<Harness file={gif()} />);
    fireEvent.click(screen.getByText('select'));
    await waitFor(() => expect(screen.getByTestId('logo-error').textContent).toMatch(/PNG or JPG/i));
    expect(screen.getByTestId('logo-name').textContent).toBe('none');
  });

  test('rejects a > 256 KB logo when it cannot be normalized (fallback path)', async () => {
    render(<Harness file={bigPng()} />);
    fireEvent.click(screen.getByText('select'));
    await waitFor(() => expect(screen.getByTestId('logo-error').textContent).toMatch(/256 KB/i));
    expect(screen.getByTestId('logo-name').textContent).toBe('none');
  });

  test('accepts a valid small PNG and clears any error', async () => {
    render(<Harness file={smallPng()} />);
    fireEvent.click(screen.getByText('select'));
    await waitFor(() => expect(screen.getByTestId('logo-name').textContent).toBe('logo.png'));
    expect(screen.getByTestId('logo-error').textContent).toBe('');
  });

  test('removeLogo clears the selected logo', async () => {
    render(<Harness file={smallPng()} />);
    fireEvent.click(screen.getByText('select'));
    await waitFor(() => expect(screen.getByTestId('logo-name').textContent).toBe('logo.png'));
    fireEvent.click(screen.getByText('remove'));
    expect(screen.getByTestId('logo-name').textContent).toBe('none');
  });
});

describe('normalizeLogoFile — canvas re-encode to a baseline PNG', () => {
  test('returns null when the browser cannot normalize (no createImageBitmap)', async () => {
    expect(typeof createImageBitmap).not.toBe('function'); // jsdom default
    const out = await normalizeLogoFile(smallPng());
    expect(out).toBeNull();
  });

  test('re-encodes to a downscaled image/png File when canvas is available', async () => {
    const origCIB = global.createImageBitmap;
    const origGetContext = HTMLCanvasElement.prototype.getContext;
    const origToBlob = HTMLCanvasElement.prototype.toBlob;
    global.createImageBitmap = async () => ({ width: 2000, height: 800, close() {} });
    HTMLCanvasElement.prototype.getContext = function getContext() { return { drawImage() {} }; };
    HTMLCanvasElement.prototype.toBlob = function toBlob(cb) { cb(new Blob([new Uint8Array(64)], { type: 'image/png' })); };
    try {
      const out = await normalizeLogoFile(new File([new Uint8Array(5)], 'starbucks-logo.png', { type: 'image/png' }));
      expect(out).toBeTruthy();
      expect(out.type).toBe('image/png');
      expect(out.name).toBe('starbucks-logo.png');
      expect(out.size).toBeLessThanOrEqual(256 * 1024);
    } finally {
      global.createImageBitmap = origCIB;
      HTMLCanvasElement.prototype.getContext = origGetContext;
      HTMLCanvasElement.prototype.toBlob = origToBlob;
    }
  });
});
