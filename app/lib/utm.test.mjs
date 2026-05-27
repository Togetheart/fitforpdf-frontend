import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildUtm, withUtm, makeUtm, UTM_SOURCE, UTM_MEDIUM, UTM_CAMPAIGN } from './utm.mjs';

test('buildUtm — assembles standard utm params', () => {
  const q = buildUtm({ source: 'linkedin', medium: 'social', campaign: 'launch' });
  assert.equal(q, 'utm_source=linkedin&utm_medium=social&utm_campaign=launch');
});

test('buildUtm — drops falsy values', () => {
  assert.equal(buildUtm({ source: 'linkedin' }), 'utm_source=linkedin');
  assert.equal(buildUtm({}), '');
  assert.equal(buildUtm(), '');
});

test('buildUtm — encodes special chars', () => {
  const q = buildUtm({ source: 'twitter', campaign: 'launch v1' });
  assert.ok(q.includes('utm_campaign=launch%20v1'));
});

test('withUtm — appends to outbound URL', () => {
  const href = withUtm('https://example.com/page', {
    source: 'fitforpdf',
    medium: 'partner',
    campaign: 'brand',
  });
  assert.ok(href.includes('utm_source=fitforpdf'));
  assert.ok(href.includes('utm_medium=partner'));
  assert.ok(href.includes('utm_campaign=brand'));
});

test('withUtm — preserves existing query params', () => {
  const href = withUtm('https://example.com/page?ref=abc', {
    source: 'linkedin',
    medium: 'social',
  });
  assert.ok(href.includes('ref=abc'));
  assert.ok(href.includes('utm_source=linkedin'));
});

test('withUtm — returns same-origin paths unchanged', () => {
  assert.equal(withUtm('/about', { source: 'x' }), '/about');
  assert.equal(withUtm('#anchor', { source: 'x' }), '#anchor');
  assert.equal(withUtm('?q=1', { source: 'x' }), '?q=1');
});

test('withUtm — skips mailto / tel', () => {
  assert.equal(withUtm('mailto:hi@x.com', { source: 'x' }), 'mailto:hi@x.com');
  assert.equal(withUtm('tel:+33', { source: 'x' }), 'tel:+33');
});

test('withUtm — skips fitforpdf.com (preserves inbound attribution)', () => {
  const href = 'https://www.fitforpdf.com/pricing';
  assert.equal(withUtm(href, { source: 'x' }), href);
});

test('withUtm — does not double-tag if utm_source already present', () => {
  const href = 'https://example.com/?utm_source=manual';
  const result = withUtm(href, { source: 'auto' });
  assert.equal(result, href);
});

test('withUtm — returns empty/non-string unchanged', () => {
  assert.equal(withUtm('', { source: 'x' }), '');
  assert.equal(withUtm(null, { source: 'x' }), null);
  assert.equal(withUtm(undefined, { source: 'x' }), undefined);
});

test('makeUtm — bakes defaults, allows override', () => {
  const footerUtm = makeUtm({ medium: 'social', campaign: 'footer' });
  const href = footerUtm('https://linkedin.com/in/me', { source: 'linkedin' });
  assert.ok(href.includes('utm_source=linkedin'));
  assert.ok(href.includes('utm_medium=social'));
  assert.ok(href.includes('utm_campaign=footer'));
});

test('constants — exposes commonly-used source/medium/campaign tokens', () => {
  assert.equal(UTM_SOURCE.linkedin, 'linkedin');
  assert.equal(UTM_MEDIUM.social, 'social');
  assert.equal(UTM_CAMPAIGN.microlaunch, 'microlaunch');
});
