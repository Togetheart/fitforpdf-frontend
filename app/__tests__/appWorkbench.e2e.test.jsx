import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import AppPage from '../app/page.jsx';

/**
 * End-to-end /app workbench tests with the REAL useConversion hook and a mocked
 * fetch. These lock the behavior the audit found broken: the inspector
 * "Update preview" button must actually re-render (it called handleSubmit()
 * with no event and threw on e.preventDefault()), and edited section names must
 * reach the render FormData on regenerate.
 */

const REAL_FILE = new File(['col1,col2\n1,2'], 'real.csv', { type: 'text/csv' });

function pdfResponse() {
  return new Response(new Blob(['%PDF-1.4'], { type: 'application/pdf' }), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': 'attachment; filename="out.pdf"',
      'x-render-id': 'rid_e2e',
      'x-cleansheet-score': '95',
      'x-cleansheet-verdict': 'OK',
      'x-cleansheet-sections': JSON.stringify([
        { label: 'A', title: 'Customer info', columns: ['Region', 'Plan'] },
        { label: 'B', title: 'Orders', columns: ['Email', 'Phone'] },
      ]),
    },
  });
}

function quotaResponse() {
  return new Response(JSON.stringify({ plan_type: 'free', free_exports_left: 9 }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

let renderCalls;

function installFetch() {
  renderCalls = [];
  const original = global.fetch;
  global.fetch = vi.fn(async (url, options) => {
    const u = String(url);
    if (u.includes('/api/render')) {
      renderCalls.push(options);
      return pdfResponse();
    }
    if (u.includes('/api/quota')) return quotaResponse();
    return new Response('', { status: 404 });
  });
  return () => { global.fetch = original; };
}

function configureMatchMedia({ mobile = false } = {}) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true, configurable: true,
    value: () => ({ matches: mobile, media: '', addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {}, dispatchEvent: () => {} }),
  });
}

let restoreFetch;
beforeEach(() => {
  configureMatchMedia({ mobile: false });
  if (typeof URL.createObjectURL !== 'function') URL.createObjectURL = () => 'blob:mock';
  if (typeof URL.revokeObjectURL !== 'function') URL.revokeObjectURL = () => {};
  restoreFetch = installFetch();
});
afterEach(() => {
  restoreFetch?.();
  cleanup();
  vi.restoreAllMocks();
});

async function selectFileAndGenerate() {
  render(<AppPage />);
  const input = document.querySelector('[data-testid="generate-file-input"]');
  expect(input).toBeTruthy();
  await act(async () => {
    fireEvent.change(input, { target: { files: [REAL_FILE] } });
  });
  const generate = await screen.findByRole('button', { name: /Generate PDF/i });
  await act(async () => { fireEvent.click(generate); });
  await waitFor(() => expect(renderCalls.length).toBe(1), { timeout: 3000 });
  // Wait for the render to fully settle (isLoading false + in-flight ref reset)
  // so the next submit is not swallowed by the in-flight guard.
  await waitFor(
    () => expect(screen.getByRole('button', { name: /Update preview/i }).disabled).toBe(false),
    { timeout: 3000 },
  );
}

async function clickUpdatePreviewAndExpectRender(expectedCount) {
  const updateBtn = screen.getByRole('button', { name: /Update preview/i });
  await act(async () => { fireEvent.click(updateBtn); });
  await waitFor(() => expect(renderCalls.length).toBe(expectedCount), { timeout: 3000 });
}

function bodyEntries(options) {
  const out = {};
  if (options?.body && typeof options.body.entries === 'function') {
    for (const [k, v] of options.body.entries()) out[k] = v;
  }
  return out;
}

describe('/app workbench — end-to-end (real hook, mocked fetch)', () => {
  test('Generate renders, then "Update preview" actually fires a SECOND render (P1 regression)', async () => {
    await selectFileAndGenerate();
    // Preview appeared.
    await waitFor(() => expect(screen.getByTestId('app-pdf-preview')).toBeTruthy());
    // The bug: clicking Update preview threw (handleSubmit() with no event) and
    // never re-rendered. After the fix it must fire a second /api/render.
    await clickUpdatePreviewAndExpectRender(2);
  });

  test('edited section name is sent as sectionTitles on the regenerate', async () => {
    await selectFileAndGenerate();
    // Section rename inputs come from the x-cleansheet-sections header.
    const renameBox = await screen.findByTestId('app-section-rename');
    const inputs = renameBox.querySelectorAll('input');
    expect(inputs.length).toBeGreaterThan(0);
    await act(async () => { fireEvent.change(inputs[0], { target: { value: 'Clients' } }); });
    await clickUpdatePreviewAndExpectRender(2);
    const entries = bodyEntries(renderCalls[1]);
    expect(entries.sectionTitles).toBeTruthy();
    expect(JSON.parse(entries.sectionTitles).A).toBe('Clients');
  });

  test('reassigning a column sends a columnGroups override on regenerate', async () => {
    await selectFileAndGenerate();
    // The custom-groups control is populated from the sections columns.
    const groupsBox = await screen.findByTestId('app-custom-groups');
    const selects = groupsBox.querySelectorAll('select');
    expect(selects.length).toBe(4); // Region, Plan, Email, Phone
    // Move "Region" (first column, currently group A) into a new group C.
    await act(async () => { fireEvent.change(selects[0], { target: { value: 'C' } }); });
    await clickUpdatePreviewAndExpectRender(2);
    const entries = bodyEntries(renderCalls[1]);
    expect(entries.columnGroups).toBeTruthy();
    const groups = JSON.parse(entries.columnGroups);
    const groupC = groups.find((g) => g.label === 'C');
    expect(groupC).toBeTruthy();
    expect(groupC.columns).toContain('Region');
  });

  test('accent color and logo file are sent in the render FormData', async () => {
    render(<AppPage />);
    const accent = screen.getByLabelText(/Accent color/i);
    await act(async () => { fireEvent.change(accent, { target: { value: '#ff0000' } }); });
    const logoInput = screen.getByLabelText(/Logo image/i);
    const logo = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], 'brand.png', { type: 'image/png' });
    await act(async () => { fireEvent.change(logoInput, { target: { files: [logo] } }); });
    const fileInput = document.querySelector('[data-testid="generate-file-input"]');
    await act(async () => { fireEvent.change(fileInput, { target: { files: [REAL_FILE] } }); });
    const generate = await screen.findByRole('button', { name: /Generate PDF/i });
    await act(async () => { fireEvent.click(generate); });
    await waitFor(() => expect(renderCalls.length).toBe(1));
    const entries = bodyEntries(renderCalls[0]);
    expect(String(entries.accentColor).toLowerCase()).toBe('#ff0000');
    expect(entries.logo).toBeInstanceOf(File);
    expect(entries.logo.name).toBe('brand.png');
  });

  test('Report title typed before Generate is sent in the render FormData', async () => {
    render(<AppPage />);
    const titleInput = screen.getByLabelText(/Report title/i);
    await act(async () => { fireEvent.change(titleInput, { target: { value: 'Acme Q4' } }); });
    const fileInput = document.querySelector('[data-testid="generate-file-input"]');
    await act(async () => { fireEvent.change(fileInput, { target: { files: [REAL_FILE] } }); });
    const generate = await screen.findByRole('button', { name: /Generate PDF/i });
    await act(async () => { fireEvent.click(generate); });
    await waitFor(() => expect(renderCalls.length).toBe(1));
    expect(bodyEntries(renderCalls[0]).reportTitle).toBe('Acme Q4');
  });
});
