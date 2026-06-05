import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { describe, test, expect, afterEach, vi } from 'vitest';
import SiteHeader from '../components/SiteHeader';

let originalFetch;
function mockMe(body, status = 200) {
  originalFetch = global.fetch;
  global.fetch = vi.fn(async (url) => {
    if (String(url).includes('/api/me')) {
      return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
    }
    return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } });
  });
}

afterEach(() => {
  cleanup();
  if (originalFetch) { global.fetch = originalFetch; originalFetch = undefined; }
  vi.restoreAllMocks();
});

describe('SiteHeader auth entry', () => {
  test('logged out: exposes a "Se connecter" link to /login', async () => {
    mockMe({ error: 'not_authenticated' }, 401);
    render(<SiteHeader />);
    const links = await screen.findAllByRole('link', { name: /se connecter/i });
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links[0].getAttribute('href')).toBe('/login');
  });

  test('logged in: shows the account avatar + "Ouvrir l\'app", and no "Se connecter" link', async () => {
    mockMe({ account: { email: 'sneusch@mac.com' }, quota: { plan: 'api_enterprise' } }, 200);
    render(<SiteHeader />);
    await waitFor(() => expect(screen.getByTestId('account-avatar')).toBeTruthy());
    expect(screen.queryByRole('link', { name: /se connecter/i })).toBeNull();
    const openApp = screen.getAllByRole('link', { name: /ouvrir l'app/i });
    expect(openApp.length).toBeGreaterThanOrEqual(1);
    expect(openApp[0].getAttribute('href')).toBe('/app');
  });
});
