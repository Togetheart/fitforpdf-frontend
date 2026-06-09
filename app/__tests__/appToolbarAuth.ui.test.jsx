import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import ConversionTool from '../components/ConversionTool';

afterEach(() => cleanup());

describe('AppToolbar account entry', () => {
  beforeEach(() => {
    global.fetch = vi.fn(async (url) => {
      const u = String(url);
      if (u.includes('/api/me')) return new Response(JSON.stringify({ error: 'not_authenticated' }), { status: 401, headers: { 'content-type': 'application/json' } });
      if (u.includes('/api/quota')) return new Response(JSON.stringify({ plan: 'free', free: { remaining: 3, limit: 3 } }), { status: 200, headers: { 'content-type': 'application/json' } });
      return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } });
    });
  });

  test('workbench shows "Log in" (not a hardcoded SN avatar) when logged out', async () => {
    render(<ConversionTool layout="workbench" />);
    await waitFor(() => {
      expect(screen.getAllByRole('link', { name: /log in/i }).length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.queryByText('SN')).toBeNull();
  });
});
