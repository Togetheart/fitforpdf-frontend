import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';

import AppPage from '../app/page.jsx';

/*
 * S1 distribution-sprint funnel events, integration on the /app workbench.
 *
 * The 31 July verdict (design doc, sprint distribution V2) needs:
 *   app_open (with ?ref= channel attribution) → … → paywall_view,
 *   plus control_used to learn which V2 controls real users reach for.
 * These tests pin the WIRING (events actually fire from the real page),
 * the helpers themselves are unit-tested in app/lib/analytics.test.mjs.
 */

const REAL_FILE = new File(['col1,col2\n1,2'], 'real.csv', { type: 'text/csv' });

function configureMatchMedia({ desktop = true } = {}) {
  // Desktop branch: (min-width:1024px) must match, else the inspector lives
  // in a CLOSED mobile drawer and its controls are unreachable pre-render
  // (same pattern as workbenchResizablePanels.ui.test.jsx).
  Object.defineProperty(window, 'matchMedia', {
    writable: true, configurable: true,
    value: (query) => ({
      matches: desktop && /min-width:\s*1024px/.test(String(query)),
      media: String(query),
      addEventListener: () => {}, removeEventListener: () => {},
      addListener: () => {}, removeListener: () => {}, dispatchEvent: () => {},
    }),
  });
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

let quotaPayload;
let captured;
let restoreFetch;
let originalLocation;

beforeEach(() => {
  configureMatchMedia({ desktop: true });
  localStorage.clear();
  captured = [];
  window.posthog = {
    capture: (event, properties) => captured.push({ event, properties }),
    register: vi.fn(),
  };
  originalLocation = window.location;
  Object.defineProperty(window, 'location', {
    writable: true, configurable: true,
    value: { assign: vi.fn(), href: 'http://localhost/app?ref=hn', search: '?ref=hn', origin: 'http://localhost', hostname: 'localhost' },
  });
  quotaPayload = { plan_type: 'free', free_exports_left: 3, free: { limit: 3, remaining: 3 } };
  const original = global.fetch;
  global.fetch = vi.fn(async (url) => {
    if (String(url).includes('/api/quota')) return jsonResponse(quotaPayload);
    return new Response('', { status: 404 });
  });
  restoreFetch = () => { global.fetch = original; };
});

afterEach(() => {
  restoreFetch?.();
  delete window.posthog;
  Object.defineProperty(window, 'location', { writable: true, configurable: true, value: originalLocation });
  cleanup();
  vi.restoreAllMocks();
});

function eventsOf(name) {
  return captured.filter((c) => c.event === name);
}

describe('/app workbench, S1 funnel events', () => {
  test('app_open fires once on mount with ?ref= channel attribution', async () => {
    render(<AppPage />);
    await waitFor(() => expect(eventsOf('app_open').length).toBe(1), { timeout: 3000 });

    const open = eventsOf('app_open')[0];
    expect(open.properties.ref).toBe('hn');
    expect(open.properties.surface).toBe('workbench');
    expect(open.properties.$set_once?.initial_ref).toBe('hn');
    expect(window.posthog.register).toHaveBeenCalledWith({ ref: 'hn' });
    // First touch persisted for later sessions (criterion-3 attribution).
    expect(localStorage.getItem('ffp_ref')).toBe('hn');
  });

  test('paywall_view fires when the quota wall becomes visible', async () => {
    quotaPayload = { plan_type: 'free', free_exports_left: 0, free: { limit: 3, remaining: 0 } };
    render(<AppPage />);
    await waitFor(() => expect(eventsOf('app_open').length).toBe(1), { timeout: 3000 });

    const input = document.querySelector('[data-testid="generate-file-input"]');
    await act(async () => {
      fireEvent.change(input, { target: { files: [REAL_FILE] } });
    });

    await screen.findByTestId('workbench-quota-paywall');
    await waitFor(() => expect(eventsOf('paywall_view').length).toBe(1), { timeout: 3000 });
    expect(eventsOf('paywall_view')[0].properties.surface).toBe('workbench');
  });

  test('control_used fires once per control (typing the report title twice = one event)', async () => {
    render(<AppPage />);
    await waitFor(() => expect(eventsOf('app_open').length).toBe(1), { timeout: 3000 });

    // Export tab hosts the Report title input (visible pre-render).
    // PanelTabs renders role="tab" (not button) — see ConversionTool ~245.
    // Exact accessible name: the rail also has export-ish tab labels.
    const exportTab = screen.getAllByRole('tab', { name: 'Export' })
      .at(-1); // inspector tabs render after the rail's in DOM order
    await act(async () => { fireEvent.click(exportTab); });

    const titleInput = await screen.findByPlaceholderText(/Acme Co/i);
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'A' } });
      fireEvent.change(titleInput, { target: { value: 'Ac' } });
    });

    expect(eventsOf('control_used').length).toBe(1);
    expect(eventsOf('control_used')[0].properties.control).toBe('report_title');
  });
});
