import { SEO } from './siteCopy.mjs';
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
  ];
}
