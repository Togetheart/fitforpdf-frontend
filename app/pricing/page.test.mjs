import assert from 'node:assert/strict';
import test from 'node:test';

import { PRICING_CARDS, PRICING_PAGE_COPY } from '../siteCopy.mjs';

function pricingText() {
  const lines = [
    PRICING_PAGE_COPY.pageTitle,
    PRICING_PAGE_COPY.freeTitle,
    PRICING_PAGE_COPY.creditsTitle,
    PRICING_PAGE_COPY.proTitle,
    PRICING_PAGE_COPY.apiTitle,
    PRICING_PAGE_COPY.apiCopy,
    ...PRICING_CARDS.flatMap((card) => [card.title, card.priceLine || '', ...card.points]),
  ];
  return lines.join(' || ');
}

test('pricing page contains 100 exports and €19', () => {
  const content = pricingText();
  assert.ok(content.includes('100 exports'));
  assert.ok(content.includes('€19'));
});

test('pricing page contains 500 exports and €79', () => {
  const content = pricingText();
  assert.ok(content.includes('500 exports'));
  assert.ok(content.includes('€79'));
});

test('pricing page contains Pro coming soon and €29/month', () => {
  const content = pricingText();
  assert.ok(content.includes('Pro (coming soon)'));
  assert.ok(content.includes('€29/month'));
});

test('pricing page contains API coming soon section', () => {
  assert.equal(PRICING_PAGE_COPY.apiTitle, 'API (coming soon)');
});
