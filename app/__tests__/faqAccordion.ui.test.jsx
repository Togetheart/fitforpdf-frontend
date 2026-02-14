import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import FaqAccordion from '../components/FaqAccordion';

const FAQ_ITEMS = [
  {
    id: 'a',
    q: 'What counts as an export?',
    a: 'A successful PDF generation (HTTP 200 with a PDF response).',
  },
  {
    id: 'b',
    q: 'Do you store my files?',
    a: 'No. Files are deleted immediately after conversion.',
  },
];

beforeEach(() => {
  render(<FaqAccordion title="Frequently asked questions" items={FAQ_ITEMS} />);
});

afterEach(() => {
  cleanup();
});

describe('FaqAccordion', () => {
  test('renders title and all questions', () => {
    expect(screen.getByRole('heading', { name: /Frequently asked questions/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'What counts as an export?' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Do you store my files?' })).toBeTruthy();
  });

  test('toggles answer visibility on click', () => {
    const first = screen.getByRole('button', { name: 'What counts as an export?' });
    const panelId = first.getAttribute('aria-controls');
    const panel = document.getElementById(panelId);

    expect(first.getAttribute('aria-expanded')).toBe('false');
    expect(panel.className).toContain('max-h-0');
    expect(panel.className).toContain('opacity-0');

    fireEvent.click(first);
    expect(first.getAttribute('aria-expanded')).toBe('true');
    expect(panel.className).toContain('max-h-[20rem]');
    expect(panel.className).toContain('opacity-100');

    fireEvent.click(first);
    expect(first.getAttribute('aria-expanded')).toBe('false');
    expect(panel.className).toContain('max-h-0');
    expect(panel.className).toContain('opacity-0');
  });

  test('opens only one item at a time', () => {
    const first = screen.getByRole('button', { name: 'What counts as an export?' });
    const second = screen.getByRole('button', { name: 'Do you store my files?' });

    fireEvent.click(first);
    expect(first.getAttribute('aria-expanded')).toBe('true');
    expect(second.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(second);
    expect(first.getAttribute('aria-expanded')).toBe('false');
    expect(second.getAttribute('aria-expanded')).toBe('true');
  });

  test('updates aria-expanded attributes as expected', () => {
    const second = screen.getByRole('button', { name: 'Do you store my files?' });

    expect(second.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(second);
    expect(second.getAttribute('aria-expanded')).toBe('true');
    expect(document.getElementById(second.getAttribute('aria-controls'))).toBeTruthy();
  });

  test('opens item based on URL hash', () => {
    cleanup();
    window.history.replaceState({}, '', '#b');
    render(<FaqAccordion title="Frequently asked questions" items={FAQ_ITEMS} />);

    const second = screen.getByRole('button', { name: 'Do you store my files?' });
    expect(second.getAttribute('aria-expanded')).toBe('true');
  });
});
