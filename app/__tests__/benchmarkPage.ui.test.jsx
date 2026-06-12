import { afterEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';

import BenchmarkPage, { metadata } from '../benchmark/page.jsx';
import results from '../lib/benchmarkResults.json';

afterEach(() => cleanup());

describe('/benchmark', () => {
  test('metadata is wired for SEO discovery', () => {
    expect(metadata.title).toMatch(/benchmark/i);
    expect(metadata.description.length).toBeGreaterThan(40);
    expect(metadata.alternates?.canonical).toBe('/benchmark');
  });

  test('renders the H1 + scores both tools from real results', () => {
    render(<BenchmarkPage />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/client-ready PDF/i);
    // Both tools appear as columns
    expect(screen.getAllByText(/FitForPDF/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/headless-?Chrome/i).length).toBeGreaterThan(0);
    // At least one verdict badge from the data is rendered
    expect(screen.getAllByText(/^(OK|WARN|FAIL)$/).length).toBeGreaterThan(0);
  });

  test('exposes the open harness + machine-readable JSON (agent-readable)', () => {
    const { container } = render(<BenchmarkPage />);
    expect(container.querySelector('a[href="/benchmark/results.json"]')).toBeTruthy();
    expect(container.querySelector('a[href*="/benchmark"]')).toBeTruthy();
  });

  test('results data is honest: every scored tool has a numeric score (no fabricated nulls passed off as runs)', () => {
    for (const c of results.cases) {
      for (const tool of Object.values(c.results)) {
        if (!tool.error) {
          expect(typeof tool.score).toBe('number');
          expect(['OK', 'WARN', 'FAIL']).toContain(tool.verdict);
        }
      }
    }
    // Named-but-not-run tools live under `pending`, never with invented scores.
    expect(Array.isArray(results.pending)).toBe(true);
  });
});
