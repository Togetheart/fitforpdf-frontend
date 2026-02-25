import { describe, test, expect, afterEach, vi, beforeEach } from 'vitest';
import React from 'react';
import { cleanup, render, screen, fireEvent, act } from '@testing-library/react';
import FeedbackBar from '../components/FeedbackBar.jsx';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

beforeEach(() => {
  vi.useFakeTimers();
  global.fetch = vi.fn().mockResolvedValue({ status: 201 });
});

describe('FeedbackBar', () => {
  test('renders nothing when renderId is null', () => {
    const { container } = render(<FeedbackBar renderId={null} visible={true} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders nothing when visible is false', () => {
    const { container } = render(<FeedbackBar renderId="abc" visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  test('appears after 2s when visible=true and renderId is set', async () => {
    render(<FeedbackBar renderId="abc" visible={true} />);
    expect(screen.queryByRole('region', { name: /feedback/i })).toBeNull();
    await act(async () => { vi.advanceTimersByTime(2001); });
    expect(screen.getByRole('region', { name: /feedback/i })).toBeTruthy();
  });

  test('shows thumbs-up and thumbs-down buttons in idle state', async () => {
    render(<FeedbackBar renderId="abc" visible={true} />);
    await act(async () => { vi.advanceTimersByTime(2001); });
    expect(screen.getByRole('button', { name: /ok/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /probl/i })).toBeTruthy();
  });

  test('thumbs-up submits vote=up and shows "Merci !"', async () => {
    render(<FeedbackBar renderId="abc" visible={true} />);
    await act(async () => { vi.advanceTimersByTime(2001); });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /ok/i })); });
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/render/feedback',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"vote":"up"'),
      }),
    );
    expect(screen.getByText(/merci/i)).toBeTruthy();
  });

  test('thumbs-down shows reason pills', async () => {
    render(<FeedbackBar renderId="abc" visible={true} />);
    await act(async () => { vi.advanceTimersByTime(2001); });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /probl/i })); });
    expect(screen.getByRole('button', { name: /mise en page/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /autre/i })).toBeTruthy();
  });

  test('clicking a reason (non-Autre) submits vote=down with reason', async () => {
    render(<FeedbackBar renderId="abc" visible={true} />);
    await act(async () => { vi.advanceTimersByTime(2001); });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /probl/i })); });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /mise en page/i })); });
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/render/feedback',
      expect.objectContaining({
        body: expect.stringContaining('"vote":"down"'),
      }),
    );
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/render/feedback',
      expect.objectContaining({
        body: expect.stringContaining('"reason":"layout"'),
      }),
    );
  });

  test('clicking Autre shows textarea', async () => {
    render(<FeedbackBar renderId="abc" visible={true} />);
    await act(async () => { vi.advanceTimersByTime(2001); });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /probl/i })); });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /autre/i })); });
    expect(screen.getByRole('textbox')).toBeTruthy();
  });

  test('Autre textarea submit sends comment', async () => {
    render(<FeedbackBar renderId="abc" visible={true} />);
    await act(async () => { vi.advanceTimersByTime(2001); });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /probl/i })); });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /autre/i })); });
    await act(async () => { fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Mon commentaire' } }); });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /envoyer/i })); });
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/render/feedback',
      expect.objectContaining({
        body: expect.stringContaining('"comment":"Mon commentaire"'),
      }),
    );
  });

  test('409 response shows "Déjà envoyé"', async () => {
    global.fetch = vi.fn().mockResolvedValue({ status: 409 });
    render(<FeedbackBar renderId="abc" visible={true} />);
    await act(async () => { vi.advanceTimersByTime(2001); });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /ok/i })); });
    expect(screen.getByText(/d.j. envoy/i)).toBeTruthy();
  });

  test('auto-hides after 60s without interaction', async () => {
    const { container } = render(<FeedbackBar renderId="abc" visible={true} />);
    await act(async () => { vi.advanceTimersByTime(2001); });
    expect(container.firstChild).not.toBeNull();
    await act(async () => { vi.advanceTimersByTime(60_001); });
    expect(screen.queryByRole('button', { name: /ok/i })).toBeNull();
  });
});
