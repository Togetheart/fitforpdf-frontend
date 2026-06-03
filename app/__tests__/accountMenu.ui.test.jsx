import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, test, expect, vi, afterEach } from 'vitest';
import AccountMenu from '../components/AccountMenu';

afterEach(() => cleanup());

describe('AccountMenu', () => {
  test('logged out → shows a "Se connecter" link to /login', () => {
    render(<AccountMenu account={null} onLogout={() => {}} />);
    const link = screen.getByRole('link', { name: /se connecter/i });
    expect(link.getAttribute('href')).toBe('/login');
  });

  test('logged in → shows initials button; opening reveals email + logout', () => {
    const onLogout = vi.fn();
    render(<AccountMenu account={{ email: 'kunj@example.com' }} onLogout={onLogout} />);
    expect(screen.queryByText(/se connecter/i)).toBeNull();
    fireEvent.click(screen.getByTestId('account-avatar'));
    expect(screen.getByText('kunj@example.com')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /se déconnecter/i }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
