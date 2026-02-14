import assert from 'node:assert/strict';
import test from 'node:test';

import { PRICING_CARDS, PRICING_FAQ, PRICING_PAGE_COPY } from '../siteCopy.mjs';

function pageText() {
  const cardText = PRICING_CARDS
    .map((card) => [card.title, card.priceLine, ...(card.points || [])].join(' '))
    .join(' ');
  const faqText = PRICING_FAQ.map((item) => `${item.question} ${item.answer}`).join(' ');
  return [
    PRICING_PAGE_COPY.pageTitle,
    PRICING_PAGE_COPY.pageSubtitle,
    cardText,
    'FAQ',
    faqText,
    PRICING_PAGE_COPY.retentionTitle,
    PRICING_PAGE_COPY.filesDeleted,
    PRICING_PAGE_COPY.pdfsDeleted,
    PRICING_PAGE_COPY.noLogs,
  ]
    .join(' ');
}

test('pricing page contains 100 exports and €19', () => {
  const content = pageText();
  assert.ok(content.includes('100 exports'));
  assert.ok(content.includes('€19'));
});

test('pricing page contains 500 exports and €79', () => {
  const content = pageText();
  assert.ok(content.includes('500 exports'));
  assert.ok(content.includes('€79'));
});

test('pricing page contains Pro price', () => {
  const content = pageText();
  assert.ok(content.includes('Pro (coming soon)'));
  assert.ok(content.includes('€29/month'));
});

test('pricing page contains API coming soon section', () => {
  const content = pageText();
  assert.equal(content.includes('API (coming soon)') || content.includes('API coming soon'), true);
});

test('pricing page has back to app link', () => {
  assert.equal('Back to app', PRICING_PAGE_COPY.backToApp);
  assert.equal(PRICING_PAGE_COPY.backToAppHref, '/');
});
