import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import LoginPage from '../login/page';

afterEach(() => cleanup());

describe('LoginPage', () => {
  beforeEach(() => vi.restoreAllMocks());

  test('submitting an email posts to /api/auth/request-link and shows confirmation', async () => {
    const calls = [];
    global.fetch = vi.fn(async (url, opts) => { calls.push({ url: String(url), opts }); return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } }); });
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'me@x.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send the link/i }));
    await waitFor(() => expect(screen.getByTestId('login-sent')).toBeTruthy());
    const call = calls.find((c) => c.url.includes('/api/auth/request-link'));
    expect(call).toBeTruthy();
    expect(JSON.parse(call.opts.body).email).toBe('me@x.com');
  });

  test('shows the confirmation even on error (neutral, no email-existence leak)', async () => {
    global.fetch = vi.fn(async () => new Response('{}', { status: 500 }));
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'me@x.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send the link/i }));
    await waitFor(() => expect(screen.getByTestId('login-sent')).toBeTruthy());
  });
});
