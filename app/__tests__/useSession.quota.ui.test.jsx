import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { describe, test, expect, vi, afterEach } from 'vitest';
import useSession from '../hooks/useSession.mjs';

afterEach(() => cleanup());

function Harness() {
  const s = useSession();
  return <span data-testid="s">{s.loading ? 'loading' : `${s.account ? s.account.email : 'anon'}|${s.quota ? s.quota.plan : 'noquota'}`}</span>;
}

describe('useSession exposes quota', () => {
  test('sets quota + account from /me', async () => {
    global.fetch = vi.fn(async (url) => {
      if (String(url).includes('/api/me')) {
        return new Response(JSON.stringify({ account: { email: 'q@x.com', hasBilling: true }, quota: { plan: 'pro', credits: { remaining: 0 } } }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      return new Response('{}', { status: 200 });
    });
    render(<Harness />);
    await waitFor(() => expect(screen.getByTestId('s').textContent).toBe('q@x.com|pro'));
  });

  test('quota null when /me is 401', async () => {
    global.fetch = vi.fn(async () => new Response('{}', { status: 401 }));
    render(<Harness />);
    await waitFor(() => expect(screen.getByTestId('s').textContent).toBe('anon|noquota'));
  });
});
