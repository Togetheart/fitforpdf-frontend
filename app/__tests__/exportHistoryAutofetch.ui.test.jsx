import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { cleanup, render, waitFor } from '@testing-library/react';

import AppPage from '../app/page.jsx';

let restore;
function installFetch() {
  const calls = [];
  const original = global.fetch;
  global.fetch = vi.fn(async (url) => {
    const u = String(url);
    calls.push(u);
    if (u.includes('/api/jobs')) {
      return new Response(JSON.stringify({ items: [], count: 0, nextCursor: null }), {
        status: 200, headers: { 'content-type': 'application/json' },
      });
    }
    if (u.includes('/api/quota')) {
      return new Response(JSON.stringify({ plan: 'free', free: { remaining: 3 } }), {
        status: 200, headers: { 'content-type': 'application/json' },
      });
    }
    return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } });
  });
  return { calls, restore: () => { global.fetch = original; } };
}

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true, configurable: true,
    value: () => ({ matches: false, media: '', addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {}, dispatchEvent: () => {} }),
  });
  if (typeof URL.createObjectURL !== 'function') URL.createObjectURL = () => 'blob:mock';
});
afterEach(() => { restore?.(); cleanup(); vi.restoreAllMocks(); });

describe('workbench — "Recent exports" auto-fetches on mount', () => {
  test('GET /api/jobs is requested on mount (panel was previously never fetched)', async () => {
    const f = installFetch();
    restore = f.restore;
    render(<AppPage />);
    await waitFor(() => expect(f.calls.some((u) => u.includes('/api/jobs'))).toBe(true));
  });
});
