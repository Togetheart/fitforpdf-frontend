import { cleanup, render, screen, waitFor, fireEvent } from '@testing-library/react';
import { afterEach, describe, test, expect, beforeEach, vi } from 'vitest';
import useSession from '../hooks/useSession.mjs';

function Harness() {
  const s = useSession();
  return (
    <div>
      <span data-testid="state">{s.loading ? 'loading' : s.account ? s.account.email : 'anon'}</span>
      <button onClick={() => s.logout()}>logout</button>
    </div>
  );
}

describe('useSession', () => {
  beforeEach(() => { vi.restoreAllMocks(); });
  afterEach(() => { cleanup(); });

  test('loads the account from /api/me', async () => {
    global.fetch = vi.fn(async (url) => {
      if (String(url).includes('/api/me')) return new Response(JSON.stringify({ account: { email: 'me@x.com' } }), { status: 200, headers: { 'content-type': 'application/json' } });
      return new Response('{}', { status: 200 });
    });
    render(<Harness />);
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('me@x.com'));
  });

  test('shows anon when /api/me is 401', async () => {
    global.fetch = vi.fn(async () => new Response(JSON.stringify({ error: 'not_authenticated' }), { status: 401, headers: { 'content-type': 'application/json' } }));
    render(<Harness />);
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('anon'));
  });

  test('logout POSTs /api/auth/logout and clears account', async () => {
    const calls = [];
    global.fetch = vi.fn(async (url, opts) => {
      calls.push({ url: String(url), method: opts?.method });
      if (String(url).includes('/api/me')) return new Response(JSON.stringify({ account: { email: 'me@x.com' } }), { status: 200, headers: { 'content-type': 'application/json' } });
      return new Response('{}', { status: 200 });
    });
    render(<Harness />);
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('me@x.com'));
    fireEvent.click(screen.getByText('logout'));
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('anon'));
    expect(calls.some((c) => c.url.includes('/api/auth/logout') && c.method === 'POST')).toBe(true);
  });
});
