import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { SEO_ARTICLES, DEMO_ARTICLE_SLUGS, getArticleBySlug } from '../lib/seoArticles.mjs';

const EXPECTED = [
  'convertir-balance-comptable-csv-en-pdf',
  'irs-tax-stats-csv-to-pdf',
  'world-bank-gdp-csv-to-pdf',
];

test('the 3 demo articles are registered with unique slugs', () => {
  for (const slug of EXPECTED) {
    assert.ok(getArticleBySlug(slug), `missing article: ${slug}`);
  }
  const slugs = SEO_ARTICLES.map((a) => a.slug);
  assert.equal(new Set(slugs).size, slugs.length, 'slugs must be unique');
  assert.deepEqual([...DEMO_ARTICLE_SLUGS].sort(), [...EXPECTED].sort());
});

test('each demo article has required + demo fields, valid lang, and an existing sample file', () => {
  for (const slug of EXPECTED) {
    const a = getArticleBySlug(slug);
    for (const f of ['title', 'description', 'h1', 'lead']) {
      assert.equal(typeof a[f], 'string');
      assert.ok(a[f].length > 8, `${slug}.${f} too short`);
    }
    assert.ok(['fr', 'en'].includes(a.lang), `${slug}.lang invalid`);
    assert.ok(a.title.length <= 60, `${slug}.title > 60 chars`);
    assert.ok(a.description.length <= 160, `${slug}.description > 160 chars`);
    assert.ok(Array.isArray(a.faqs) && a.faqs.length >= 1);
    const d = a.demo;
    assert.ok(d, `${slug} missing demo`);
    for (const f of ['sampleFile', 'afterImage', 'beforeSnippet', 'downloadName', 'license', 'sampleSlug']) {
      assert.ok(d[f], `${slug}.demo.${f} missing`);
    }
    assert.ok(d.sampleFile.startsWith('/CSV/'), `${slug}.demo.sampleFile must be a /CSV/ public path`);
    assert.ok(
      existsSync(join(process.cwd(), 'public', d.sampleFile)),
      `${slug}.demo.sampleFile not found in public${d.sampleFile}`,
    );
  }
});
