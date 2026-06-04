import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import AccountPage from '../account/page';

afterEach(() => cleanup());

function mockMe(body, status = 200) {
  global.fetch = vi.fn(async (url) => {
    const u = String(url);
    if (u.includes('/api/me')) return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
    if (u.includes('/api/account/billing-portal')) return new Response(JSON.stringify({ url: 'https://portal.stripe/go' }), { status: 200, headers: { 'content-type': 'application/json' } });
    return new Response('{}', { status: 200 });
  });
}

describe('AccountPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: { assign: vi.fn(), href: 'http://localhost/', search: '' },
    });
  });

  test('logged in: shows email, plan, credits, and a billing button when hasBilling', async () => {
    mockMe({ account: { email: 'me@x.com', hasBilling: true }, quota: { plan: 'credits', credits: { remaining: 7 } } });
    render(<AccountPage />);
    await waitFor(() => expect(screen.getByText('me@x.com')).toBeTruthy());
    expect(screen.getByText(/7/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /facturation/i }));
    await waitFor(() => expect(window.location.assign).toHaveBeenCalledWith('https://portal.stripe/go'));
  });

  test('logged in without billing: shows no-invoice message, no billing button', async () => {
    mockMe({ account: { email: 'nb@x.com', hasBilling: false }, quota: { plan: 'free', credits: { remaining: 0 } } });
    render(<AccountPage />);
    await waitFor(() => expect(screen.getByText('nb@x.com')).toBeTruthy());
    expect(screen.queryByRole('button', { name: /facturation/i })).toBeNull();
    expect(screen.getByText(/aucune facture/i)).toBeTruthy();
  });

  test('logged out: redirects to /login', async () => {
    mockMe({}, 401);
    render(<AccountPage />);
    await waitFor(() => expect(window.location.assign).toHaveBeenCalledWith('/login'));
  });
});
