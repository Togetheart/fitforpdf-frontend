import { SEO } from './siteCopy.mjs';

const MOD = new Date('2026-02-24');

export default function sitemap() {
  return [
    { url: SEO.siteUrl, lastModified: MOD, changeFrequency: 'weekly', priority: 1 },
    { url: `${SEO.siteUrl}/pricing`, lastModified: MOD, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SEO.siteUrl}/privacy`, lastModified: MOD, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SEO.siteUrl}/${SEO.excelCutoff.slug}`, lastModified: MOD, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SEO.siteUrl}/${SEO.fitOnePage.slug}`, lastModified: MOD, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SEO.siteUrl}/${SEO.csvPdf.slug}`, lastModified: MOD, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SEO.siteUrl}/${SEO.auditPdf.slug}`, lastModified: MOD, changeFrequency: 'monthly', priority: 0.6 },
  ];
}
