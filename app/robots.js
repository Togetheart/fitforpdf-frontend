import { SEO } from './siteCopy.mjs';

export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      // ClaudeBot intentionally allowed: we ship llms.txt + an MCP, so agent
      // readers should reach the site. (SaaSHub stays blocked — directory spam.)
      { userAgent: 'SaaSHub', disallow: '/' },
    ],
    sitemap: `${SEO.siteUrl}/sitemap.xml`,
    host: new URL(SEO.siteUrl).host,
  };
}
