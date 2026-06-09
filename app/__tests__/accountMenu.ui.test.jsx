import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, test, expect, vi, afterEach } from 'vitest';
import AccountMenu from '../components/AccountMenu';

afterEach(() => cleanup());

describe('AccountMenu', () => {
  test('logged out → shows a "Log in" link to /login', () => {
    render(<AccountMenu account={null} onLogout={() => {}} />);
    const link = screen.getByRole('link', { name: /log in/i });
    expect(link.getAttribute('href')).toBe('/login');
  });

  test('logged in → shows initials button; opening reveals email + logout', () => {
    const onLogout = vi.fn();
    render(<AccountMenu account={{ email: 'kunj@example.com' }} onLogout={onLogout} />);
    expect(screen.queryByText(/log in/i)).toBeNull();
    fireEvent.click(screen.getByTestId('account-avatar'));
    expect(screen.getByText('kunj@example.com')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /log out/i }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  test('logged in → dropdown has a "My account" link to /account', () => {
    render(<AccountMenu account={{ email: 'k@x.com' }} onLogout={() => {}} />);
    fireEvent.click(screen.getByTestId('account-avatar'));
    const link = screen.getByRole('link', { name: /my account/i });
    expect(link.getAttribute('href')).toBe('/account');
  });

  test('clicking outside closes the dropdown', () => {
    render(<AccountMenu account={{ email: 'k@x.com' }} onLogout={() => {}} />);
    fireEvent.click(screen.getByTestId('account-avatar'));
    expect(screen.getByText('k@x.com')).toBeTruthy();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('k@x.com')).toBeNull();
  });
});
