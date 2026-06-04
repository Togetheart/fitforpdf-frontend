import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import AccountPage from '../account/page';

afterEach(() => cleanup());

// Mirror accountPage.ui.test.jsx: the page reads session via useSession,
// which fetches /api/me. We drive the page by mocking global.fetch for /api/me.
function mockMe(body, status = 200) {
  global.fetch = vi.fn(async (url) => {
    const u = String(url);
    if (u.includes('/api/me')) return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
    return new Response('{}', { status: 200 });
  });
}

describe('AccountPage plan-aware remaining', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: { assign: vi.fn(), href: 'http://localhost/', search: '' },
    });
  });

  test('Pro user shows remainingInPeriod (480), not credits.remaining (0)', async () => {
    mockMe({ account: { email: 'p@x.co' }, quota: { plan: 'pro', credits: { remaining: 0 }, pro: { remainingInPeriod: 480 } } });
    render(<AccountPage />);
    await waitFor(() => expect(screen.getByText('p@x.co')).toBeTruthy());
    expect(screen.getByText('480')).toBeTruthy();
    expect(screen.queryByText('0')).toBeNull();
  });

  test('credits user shows credits.remaining (37)', async () => {
    mockMe({ account: { email: 'c@x.co' }, quota: { plan: 'credits', credits: { remaining: 37 } } });
    render(<AccountPage />);
    await waitFor(() => expect(screen.getByText('c@x.co')).toBeTruthy());
    expect(screen.getByText('37')).toBeTruthy();
  });
});
