import { afterEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';

import ForAgentsPage, { metadata } from '../for-agents/page.jsx';

afterEach(() => cleanup());

describe('/for-agents', () => {
  test('metadata is wired for SEO discovery', () => {
    expect(metadata.title).toMatch(/agents/i);
    expect(typeof metadata.description).toBe('string');
    expect(metadata.description.length).toBeGreaterThan(40);
    expect(metadata.alternates?.canonical).toBe('/for-agents');
  });

  test('renders H1 announcing the agent positioning', () => {
    render(<ForAgentsPage />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent.toLowerCase()).toMatch(/agent|pdf/);
  });

  test('surfaces the core agent-native value props', () => {
    render(<ForAgentsPage />);
    // Deterministic + No LLM is the headline differentiator for agents
    expect(screen.getAllByText(/deterministic/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/no llm/i).length).toBeGreaterThan(0);
  });

  test('points to /developers for the API contract', () => {
    const { container } = render(<ForAgentsPage />);
    const devLink = container.querySelector('a[href="/developers"]');
    expect(devLink).toBeTruthy();
  });
});
