import { SEO } from './siteCopy.mjs';

export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: 'ClaudeBot', disallow: '/' },
      { userAgent: 'SaaSHub', disallow: '/' },
    ],
    sitemap: `${SEO.siteUrl}/sitemap.xml`,
    host: new URL(SEO.siteUrl).host,
  };
}
