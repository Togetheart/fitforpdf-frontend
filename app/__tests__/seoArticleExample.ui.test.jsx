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
    expect(within(example).getByTestId('seo-example-after').textContent).toMatch(/first (?:work)?sheet only/i);
    expect(example.textContent).toMatch(/conceptual/i);
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
    expect(articleLd.dateModified).toBe('2026-09-23');
  });

  test('multi-sheet instructions disclose the first-sheet limit in copy, CTA and structured data', () => {
    const article = getArticleBySlug('excel-multiple-sheets-to-single-pdf');
    const { container } = render(<SeoArticle article={article} />);
    expect(article.lead).toMatch(/first (?:work)?sheet only/i);
    expect(article.cta.body).toMatch(/first (?:work)?sheet only/i);
    expect(article.sections.some(({ body }) => /combine.*PDF/i.test(body || ''))).toBe(true);
    expect(container.textContent).not.toMatch(/overview page lists all 3 sheets|section per sheet|any number of sheets|automated multi-sheet handling/i);
    const faq = Array.from(container.querySelectorAll('script[type="application/ld+json"]'))
      .map((script) => JSON.parse(script.textContent))
      .find((data) => data['@type'] === 'FAQPage');
    expect(JSON.stringify(faq)).toMatch(/first (?:work)?sheet only/i);
  });

  test('text-size advice avoids unsupported fixed font sizes and example scaling figures', () => {
    const article = getArticleBySlug('excel-pdf-text-too-small-fix');
    render(<SeoArticle article={article} />);
    expect(screen.getByTestId('seo-example').textContent).toMatch(/conceptual/i);
    expect(JSON.stringify(article)).not.toMatch(/\d+(?:-\d+)?pt|38%|200%|readable at 100%/i);
  });
});
