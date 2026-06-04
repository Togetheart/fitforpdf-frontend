import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import AccountPage from '../account/page';

afterEach(() => cleanup());

function mockLoggedInWithRetained(items) {
  global.fetch = vi.fn(async (url, options) => {
    const u = String(url);
    if (u.includes('/api/me')) {
      return new Response(JSON.stringify({ account: { email: 'me@x.com', hasBilling: false }, quota: { plan: 'free', free: { remaining: 3 } } }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    if (u.includes('/api/account/retained-sources')) {
      if (options && options.method === 'DELETE') {
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      return new Response(JSON.stringify({ items }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    return new Response('{}', { status: 200 });
  });
}

describe('AccountPage retained files', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: { assign: vi.fn(), href: 'http://localhost/', search: '' },
    });
  });

  test('renders a retained source by name and deletes it via DELETE', async () => {
    mockLoggedInWithRetained([
      { id: 'x1', original_name: 'clients.csv', consented_at: '2026-06-01T10:00:00Z', expires_at: '2026-06-08T10:00:00Z' },
    ]);
    render(<AccountPage />);

    await waitFor(() => expect(screen.getByText('clients.csv')).toBeTruthy());

    const delBtn = screen.getByTestId('retained-delete-x1');
    fireEvent.click(delBtn);

    await waitFor(() => {
      const deleteCall = global.fetch.mock.calls.find(
        ([url, opts]) => String(url) === '/api/account/retained-sources/x1' && opts && opts.method === 'DELETE',
      );
      expect(deleteCall).toBeTruthy();
    });
  });

  test('renders an empty-state line when no retained files', async () => {
    mockLoggedInWithRetained([]);
    render(<AccountPage />);
    await waitFor(() => expect(screen.getByText('me@x.com')).toBeTruthy());
    await waitFor(() => expect(screen.getByText(/aucun fichier conservé/i)).toBeTruthy());
  });
});
