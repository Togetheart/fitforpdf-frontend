import { SEO } from './siteCopy.mjs';
import { SEO_ARTICLES } from './lib/seoArticles.mjs';
import fs from 'fs';
import path from 'path';

/**
 * Try to read the real last-modified date of a page file.
 * Falls back to today if the file cannot be read.
 */
function pageModDate(pagePath) {
  try {
    const full = path.join(process.cwd(), 'app', pagePath);
    return fs.statSync(full).mtime;
  } catch {
    return new Date();
  }
}

export default function sitemap() {
  return [
    {
      url: SEO.siteUrl,
      lastModified: pageModDate('page.jsx'),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SEO.siteUrl}/pricing`,
      lastModified: pageModDate('pricing/page.jsx'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SEO.siteUrl}/privacy`,
      lastModified: pageModDate('privacy/page.jsx'),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${SEO.siteUrl}/developers`,
      lastModified: pageModDate('developers/page.jsx'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SEO.siteUrl}/${SEO.excelCutoff.slug}`,
      lastModified: pageModDate(`${SEO.excelCutoff.slug}/page.jsx`),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SEO.siteUrl}/${SEO.fitOnePage.slug}`,
      lastModified: pageModDate(`${SEO.fitOnePage.slug}/page.jsx`),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SEO.siteUrl}/${SEO.csvPdf.slug}`,
      lastModified: pageModDate(`${SEO.csvPdf.slug}/page.jsx`),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SEO.siteUrl}/${SEO.auditPdf.slug}`,
      lastModified: pageModDate(`${SEO.auditPdf.slug}/page.jsx`),
      changeFrequency: 'monthly',
      priority: 0.6,
    },

    // Long-tail SEO articles (cloned from /excel-to-pdf-columns-cut-off — the
    // only page that brings organic Google traffic at 0% bounce). Each article
    // lives in app/lib/seoArticles.mjs and renders via app/components/SeoArticle.
    ...SEO_ARTICLES.map((article) => ({
      url: `${SEO.siteUrl}/${article.slug}`,
      lastModified: pageModDate(`${article.slug}/page.jsx`),
      changeFrequency: 'monthly',
      priority: 0.6,
    })),

    // Comparison pages
    {
      url: `${SEO.siteUrl}/vs-puppeteer`,
      lastModified: pageModDate('vs-puppeteer/page.jsx'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SEO.siteUrl}/vs-reportlab`,
      lastModified: pageModDate('vs-reportlab/page.jsx'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SEO.siteUrl}/vs-wkhtmltopdf`,
      lastModified: pageModDate('vs-wkhtmltopdf/page.jsx'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SEO.siteUrl}/benchmark`,
      lastModified: pageModDate('benchmark/page.jsx'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },

    // Audience pages
    {
      url: `${SEO.siteUrl}/for-auditors`,
      lastModified: pageModDate('for-auditors/page.jsx'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SEO.siteUrl}/for-consultants`,
      lastModified: pageModDate('for-consultants/page.jsx'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SEO.siteUrl}/for-finance`,
      lastModified: pageModDate('for-finance/page.jsx'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SEO.siteUrl}/for-saas`,
      lastModified: pageModDate('for-saas/page.jsx'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },

    // Examples
    {
      url: `${SEO.siteUrl}/examples`,
      lastModified: pageModDate('examples/page.jsx'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },

    // About
    {
      url: `${SEO.siteUrl}/about`,
      lastModified: pageModDate('about/page.jsx'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },

    // Utility pages
    {
      url: `${SEO.siteUrl}/contact`,
      lastModified: pageModDate('contact/page.jsx'),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${SEO.siteUrl}/terms`,
      lastModified: pageModDate('terms/page.jsx'),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${SEO.siteUrl}/mentions-legales`,
      lastModified: pageModDate('mentions-legales/page.jsx'),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${SEO.siteUrl}/brand`,
      lastModified: pageModDate('brand/page.jsx'),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${SEO.siteUrl}/changelog`,
      lastModified: pageModDate('changelog/page.jsx'),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];
}
