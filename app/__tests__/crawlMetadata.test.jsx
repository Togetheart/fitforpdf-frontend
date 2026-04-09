import { describe, expect, test } from 'vitest';
import robots from '../robots';
import sitemap from '../sitemap';
import { SEO } from '../siteCopy.mjs';

describe('crawl metadata', () => {
  test('robots metadata uses canonical host format', () => {
    const meta = robots();
    const canonicalHost = new URL(SEO.siteUrl).host;

    expect(meta.rules).toContainEqual({ userAgent: '*', allow: '/' });
    expect(meta.sitemap).toBe(`${SEO.siteUrl}/sitemap.xml`);
    expect(meta.host).toBe(canonicalHost);
    expect(meta.host).not.toMatch(/^https?:\/\//);
  });

  test('sitemap root entry uses canonical site URL', () => {
    const entries = sitemap();
    const root = entries.find((entry) => entry.url === SEO.siteUrl);

    expect(root).toBeDefined();
    expect(root.changeFrequency).toBe('weekly');
    expect(root.priority).toBe(1);
  });
});
