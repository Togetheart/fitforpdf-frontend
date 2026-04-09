import { SEO } from './siteCopy.mjs';

export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
    ],
    sitemap: `${SEO.siteUrl}/sitemap.xml`,
    host: new URL(SEO.siteUrl).host,
  };
}
