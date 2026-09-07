import { afterEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import SeoArticle from '../components/SeoArticle.jsx';
import { getArticleBySlug } from '../lib/seoArticles.mjs';

afterEach(cleanup);

describe('SeoArticle worked-example block', () => {
  test('renders a before/after comparison for an article with an example', () => {
    const article = getArticleBySlug('excel-multiple-sheets-to-single-pdf');
    render(<SeoArticle article={article} />);

    const example = screen.getByTestId('seo-example');
    expect(example).toBeTruthy();
    expect(within(example).getByTestId('seo-example-before').textContent).toContain('Transactions');
    expect(within(example).getByTestId('seo-example-after').textContent).toContain('Overview page');
  });

  test('articles without an example render no worked-example block', () => {
    const article = getArticleBySlug('wide-table-pdf-export');
    render(<SeoArticle article={article} />);
    expect(screen.queryByTestId('seo-example')).toBeNull();
  });

  test('dateModified flows into the Article JSON-LD when present', () => {
    const article = getArticleBySlug('excel-pdf-text-too-small-fix');
    const { container } = render(<SeoArticle article={article} />);
    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    const articleLd = Array.from(scripts)
      .map((s) => JSON.parse(s.textContent))
      .find((d) => d['@type'] === 'Article');
    expect(articleLd.dateModified).toBe('2026-09-07');
  });
});
