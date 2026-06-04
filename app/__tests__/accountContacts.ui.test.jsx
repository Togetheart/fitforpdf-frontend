import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import AccountPage from '../account/page';

afterEach(() => cleanup());

function mockLoggedInWithContacts(items, total) {
  global.fetch = vi.fn(async (url, options) => {
    const u = String(url);
    if (u.includes('/api/me')) {
      return new Response(JSON.stringify({ account: { email: 'me@x.com', hasBilling: false }, quota: { plan: 'free', free: { remaining: 3 } } }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    if (u.includes('/api/account/contacts')) {
      if (options && options.method === 'DELETE') {
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      return new Response(JSON.stringify({ items, total }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    return new Response('{}', { status: 200 });
  });
}

describe('AccountPage contacts', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: { assign: vi.fn(), href: 'http://localhost/', search: '' },
    });
    if (!window.matchMedia) {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
    }
  });

  test('renders the contacts heading, count, and a row with name/email/company', async () => {
    mockLoggedInWithContacts(
      [{ id: 'k1', name: 'Alice', email: 'a@b.co', phone: null, company: 'Acme', role: null }],
      1,
    );
    render(<AccountPage />);

    await waitFor(() => expect(screen.getByText(/Mes contacts/)).toBeTruthy());
    await waitFor(() => expect(screen.getByText('Alice')).toBeTruthy());
    expect(screen.getByText('a@b.co')).toBeTruthy();
    expect(screen.getByText('Acme')).toBeTruthy();
    // count (1) rendered in the heading
    const row = screen.getByTestId('contact-row-k1');
    expect(row).toBeTruthy();
    expect(screen.getByText(/Mes contacts \(1\)/)).toBeTruthy();
  });

  test('renders an "Exporter CSV" anchor pointing at the export endpoint', async () => {
    mockLoggedInWithContacts(
      [{ id: 'k1', name: 'Alice', email: 'a@b.co', phone: null, company: 'Acme', role: null }],
      1,
    );
    render(<AccountPage />);
    const exportLink = await screen.findByTestId('contacts-export');
    expect(exportLink.getAttribute('href')).toBe('/api/account/contacts/export');
  });

  test('clicking a row delete control issues DELETE to /api/account/contacts/:id', async () => {
    mockLoggedInWithContacts(
      [{ id: 'k1', name: 'Alice', email: 'a@b.co', phone: null, company: 'Acme', role: null }],
      1,
    );
    render(<AccountPage />);

    const delBtn = await screen.findByTestId('contact-delete-k1');
    fireEvent.click(delBtn);

    await waitFor(() => {
      const deleteCall = global.fetch.mock.calls.find(
        ([url, opts]) => String(url) === '/api/account/contacts/k1' && opts && opts.method === 'DELETE',
      );
      expect(deleteCall).toBeTruthy();
    });
  });

  test('clicking "Tout supprimer" issues DELETE to /api/account/contacts', async () => {
    mockLoggedInWithContacts(
      [{ id: 'k1', name: 'Alice', email: 'a@b.co', phone: null, company: 'Acme', role: null }],
      1,
    );
    render(<AccountPage />);

    const clearBtn = await screen.findByTestId('contacts-clear');
    fireEvent.click(clearBtn);

    await waitFor(() => {
      const deleteCall = global.fetch.mock.calls.find(
        ([url, opts]) => String(url) === '/api/account/contacts' && opts && opts.method === 'DELETE',
      );
      expect(deleteCall).toBeTruthy();
    });
  });

  test('empty state renders "Aucun contact."', async () => {
    mockLoggedInWithContacts([], 0);
    render(<AccountPage />);
    await waitFor(() => expect(screen.getByText('me@x.com')).toBeTruthy());
    await waitFor(() => expect(screen.getByText(/aucun contact\./i)).toBeTruthy());
  });
});
