import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import AppPage from '../app/page.jsx';

/**
 * Option A: the custom-groups control must show EVERY column — the per-section
 * data columns AND the pinned/anchor columns (exposed via
 * x-cleansheet-frozen-columns). Pinned columns default to "Fixed"; moving one
 * into a real group un-pins it (and emits a columnGroups override that carries
 * the reserved __fixed__ group). Regression guard for "we don't have all the
 * titles available for editing in the groups section".
 */

const REAL_FILE = new File(['col1,col2\n1,2'], 'real.csv', { type: 'text/csv' });

function pdfResponseWithFrozen() {
  return new Response(new Blob(['%PDF-1.4'], { type: 'application/pdf' }), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': 'attachment; filename="out.pdf"',
      'x-render-id': 'rid_cg',
      'x-cleansheet-score': '95',
      'x-cleansheet-verdict': 'OK',
      'x-cleansheet-sections': JSON.stringify([
        { label: 'A', title: 'Customer info', columns: ['Region', 'Plan'] },
        { label: 'B', title: 'Orders', columns: ['Email', 'Phone'] },
      ]),
      'x-cleansheet-frozen-columns': JSON.stringify(['Customer ID', 'Internal ID']),
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
    if (u.includes('/api/render')) { renderCalls.push(options); return pdfResponseWithFrozen(); }
    if (u.includes('/api/quota')) return quotaResponse();
    return new Response('', { status: 404 });
  });
  return () => { global.fetch = original; };
}

function configureMatchMedia() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true, configurable: true,
    value: () => ({ matches: false, media: '', addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {}, dispatchEvent: () => {} }),
  });
}

function bodyEntries(options) {
  const out = {};
  if (options?.body && typeof options.body.entries === 'function') {
    for (const [k, v] of options.body.entries()) out[k] = v;
  }
  return out;
}

let restoreFetch;
beforeEach(() => {
  configureMatchMedia();
  if (typeof URL.createObjectURL !== 'function') URL.createObjectURL = () => 'blob:mock';
  if (typeof URL.revokeObjectURL !== 'function') URL.revokeObjectURL = () => {};
  restoreFetch = installFetch();
});
afterEach(() => { restoreFetch?.(); cleanup(); vi.restoreAllMocks(); });

async function generate() {
  render(<AppPage />);
  const input = document.querySelector('[data-testid="generate-file-input"]');
  await act(async () => { fireEvent.change(input, { target: { files: [REAL_FILE] } }); });
  const gen = await screen.findByRole('button', { name: /Generate PDF/i });
  await act(async () => { fireEvent.click(gen); });
  await waitFor(() => expect(renderCalls.length).toBe(1), { timeout: 3000 });
  await waitFor(
    () => expect(screen.getByRole('button', { name: /Update preview/i }).disabled).toBe(false),
    { timeout: 3000 },
  );
}

describe('/app custom groups — pinned columns are visible and movable (Option A)', () => {
  test('lists pinned columns (tagged Fixed) alongside the section columns', async () => {
    await generate();
    const box = await screen.findByTestId('app-custom-groups');
    const selects = box.querySelectorAll('select');
    // Region, Plan, Email, Phone (data) + Customer ID, Internal ID (pinned) = 6.
    expect(selects.length).toBe(6);
    expect(box.textContent).toContain('Customer ID');
    expect(box.textContent).toContain('Internal ID');
    // Pinned columns default to the Fixed bucket (select value 'fixed').
    expect(box.querySelector('select[aria-label="Section for Customer ID"]').value).toBe('fixed');
    expect(box.querySelector('select[aria-label="Section for Internal ID"]').value).toBe('fixed');
  });

  test('moving a pinned column into a real group un-pins it in the override', async () => {
    await generate();
    const box = await screen.findByTestId('app-custom-groups');
    await act(async () => {
      // Move into the first section (positional "Group A" = option index 0).
      fireEvent.change(box.querySelector('select[aria-label="Section for Customer ID"]'), { target: { value: '0' } });
    });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Update preview/i })); });
    await waitFor(() => expect(renderCalls.length).toBe(2), { timeout: 3000 });

    const groups = JSON.parse(bodyEntries(renderCalls[1]).columnGroups);
    const groupA = groups.find((g) => g.label === 'A');
    expect(groupA.columns).toContain('Customer ID'); // un-pinned into A
    const fixed = groups.find((g) => g.label === '__fixed__');
    expect(fixed.columns).toContain('Internal ID');  // still pinned
    expect(fixed.columns).not.toContain('Customer ID');
  });
});

/**
 * The column NAME carries the color of the group it is assigned to, matching the
 * group pills (A=blue, B=green/emerald, C=amber, D=violet, cycling). Fixed columns
 * (repeated in every section) stay neutral. The color tracks the live dropdown
 * selection, so moving a column recolors its name immediately (no re-render).
 */
describe('/app custom groups — column name takes its group color', () => {
  test('group-A columns render blue, group-B columns render emerald, fixed columns stay neutral', async () => {
    await generate();
    const box = await screen.findByTestId('app-custom-groups');

    // A=[Region, Plan] -> blue ; B=[Email, Phone] -> emerald.
    expect(within(box).getByText('Region').className).toContain('text-blue-700');
    expect(within(box).getByText('Plan').className).toContain('text-blue-700');
    expect(within(box).getByText('Email').className).toContain('text-emerald-700');
    expect(within(box).getByText('Phone').className).toContain('text-emerald-700');

    // Fixed columns belong to no single group -> no group color.
    const customerId = within(box).getByText('Customer ID');
    expect(customerId.className).not.toContain('text-blue-700');
    expect(customerId.className).not.toContain('text-emerald-700');
    expect(within(box).getByText('Internal ID').className).not.toContain('text-blue-700');
  });

  test('moving a fixed column into group A recolors its name to blue live (before re-render)', async () => {
    await generate();
    const box = await screen.findByTestId('app-custom-groups');

    await act(async () => {
      fireEvent.change(box.querySelector('select[aria-label="Section for Customer ID"]'), { target: { value: '0' } });
    });

    // Recolored from the draft alone — no second render call yet.
    expect(renderCalls.length).toBe(1);
    expect(within(box).getByText('Customer ID').className).toContain('text-blue-700');
  });
});

/**
 * Terminology is unified on "Section" (the PDF output concept, already used by the
 * dropdowns and the "Section names" editor) — no more "Group" in the visible copy.
 */
describe('/app custom groups — panel uses "Section" terminology, not "Group"', () => {
  test('pills, header, option, aria-label and hint all say "Section"', async () => {
    await generate();
    const box = await screen.findByTestId('app-custom-groups');

    // Colored pills: positional labels read "Section A", "Section B".
    expect(screen.getByText('Section A')).toBeTruthy();
    expect(screen.getByText('Section B')).toBeTruthy();
    expect(screen.queryByText('Group A')).toBeNull();

    // Sub-panel header.
    expect(screen.getByText('Custom sections')).toBeTruthy();
    expect(screen.queryByText('Custom groups')).toBeNull();

    // Dropdown trailing option + per-row aria-label.
    const optionTexts = [...box.querySelectorAll('option')].map((o) => o.textContent);
    expect(optionTexts).toContain('New section');
    expect(optionTexts).not.toContain('New group');
    expect(box.querySelector('select[aria-label="Section for Region"]')).toBeTruthy();
    expect(box.querySelector('select[aria-label="Group for Region"]')).toBeNull();

    // Hint copy.
    expect(box.textContent).toContain('between sections');
    expect(box.textContent).not.toContain('between groups');
  });
});
