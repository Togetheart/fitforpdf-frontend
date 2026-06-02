import { render, screen, cleanup } from '@testing-library/react';
import { describe, test, expect, afterEach } from 'vitest';
import SiteHeader from '../components/SiteHeader';

afterEach(() => cleanup());

describe('SiteHeader auth entry', () => {
  test('exposes a "Se connecter" link to /login', () => {
    render(<SiteHeader />);
    const links = screen.getAllByRole('link', { name: /se connecter/i });
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links[0].getAttribute('href')).toBe('/login');
  });
});
