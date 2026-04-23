import { afterEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';

import DevelopersPage from '../developers/page.jsx';

afterEach(() => cleanup());

describe('/developers — AI agents section', () => {
  test('has a dedicated "For AI agents" section', () => {
    render(<DevelopersPage />);
    const section = screen.getByTestId('developers-agents-section');
    expect(section).toBeTruthy();
  });

  test('advertises the discovery manifest + openapi spec', () => {
    const { container } = render(<DevelopersPage />);
    expect(
      container.querySelector('a[href="/.well-known/ai-plugin.json"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('a[href="/api/openapi.json"]'),
    ).toBeTruthy();
  });

  test('documents the agent-compat JSON endpoint', () => {
    render(<DevelopersPage />);
    const section = screen.getByTestId('developers-agents-section');
    expect(section.textContent).toMatch(/\/api\/agent\/render/);
    expect(section.textContent).toMatch(/file_url/);
  });

  test('shows a Claude (Anthropic) tool-calling snippet', () => {
    render(<DevelopersPage />);
    const snippet = screen.getByTestId('agent-snippet-claude');
    expect(snippet.textContent).toMatch(/render_pdf/);
    expect(snippet.textContent.toLowerCase()).toMatch(/anthropic|claude/);
  });

  test('shows an OpenAI function-calling snippet', () => {
    render(<DevelopersPage />);
    const snippet = screen.getByTestId('agent-snippet-openai');
    expect(snippet.textContent).toMatch(/render_pdf/);
    expect(snippet.textContent.toLowerCase()).toMatch(/openai|tools/);
  });

  test('shows a LangChain snippet', () => {
    render(<DevelopersPage />);
    const snippet = screen.getByTestId('agent-snippet-langchain');
    expect(snippet.textContent.toLowerCase()).toMatch(/langchain|tool/);
  });
});
