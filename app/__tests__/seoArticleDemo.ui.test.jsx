import { afterEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import SeoArticle from '../components/SeoArticle.jsx';
import { getArticleBySlug } from '../lib/seoArticles.mjs';

afterEach(cleanup);

describe('SeoArticle demo block', () => {
  test('renders before/after, a download link, and the license for a demo article', () => {
    const article = getArticleBySlug('world-bank-gdp-csv-to-pdf');
    render(<SeoArticle article={article} />);

    const demo = screen.getByTestId('seo-demo');
    expect(demo).toBeTruthy();

    // download link points at the public sample with the download attribute
    const dl = within(demo).getByTestId('seo-demo-download');
    expect(dl.getAttribute('href')).toBe(article.demo.sampleFile);
    expect(dl.hasAttribute('download')).toBe(true);

    // the rendered-PDF preview image uses the afterImage
    const img = within(demo).getByTestId('seo-demo-after');
    expect(img.getAttribute('src')).toContain(article.demo.afterImage);

    // license attribution is shown
    expect(demo.textContent).toContain('World Bank');
  });

  test('sets lang on the article wrapper and localizes demo labels for a French page', () => {
    const article = getArticleBySlug('convertir-balance-comptable-csv-en-pdf');
    const { container } = render(<SeoArticle article={article} />);
    expect(container.querySelector('[lang="fr"]')).toBeTruthy();
    expect(screen.getByTestId('seo-demo-download').textContent).toMatch(/Télécharger/i);
  });

  test('articles without a demo render no demo block', () => {
    const article = getArticleBySlug('wide-table-pdf-export');
    render(<SeoArticle article={article} />);
    expect(screen.queryByTestId('seo-demo')).toBeNull();
  });
});
