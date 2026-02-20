import assert from 'node:assert/strict';
import test from 'node:test';

import { PRICING_CARDS, PRICING_PAGE_COPY } from '../siteCopy.mjs';

function pricingText() {
  return [
    PRICING_PAGE_COPY.pageTitle,
    PRICING_PAGE_COPY.pageSubtitle,
    ...PRICING_CARDS.map(
      (card) => `${card.title} ${card.priceLines.join(' ')} ${card.points.join(' ')}`,
    ),
  ].join(' ');
}

test('pricing contains 100 exports and 100-credit pack price', () => {
  const content = pricingText();
  assert.ok(content.includes('100 exports'));
  assert.ok(content.includes('$49'));
});

test('pricing contains 500 exports and 500-credit messaging', () => {
  const content = pricingText();
  assert.ok(content.includes('10 exports'));
  assert.ok(content.includes('$15'));
});

test('pricing contains no legacy free-tier-only assertions', () => {
  const content = pricingText();
  assert.equal(content.includes('Pro + API'), false);
  assert.equal(content.includes('Volume'), true);
});

test('pricing exposes free and pay-as-you-go plan cards', () => {
  assert.equal(PRICING_CARDS.length, 3);
  const planIds = PRICING_CARDS.map((card) => card.id);
  assert.deepEqual(planIds, ['free', 'payg-starter', 'volume']);
});

test('pricing has back to app link', () => {
  assert.equal(PRICING_PAGE_COPY.backToApp, 'Back to app');
  assert.equal(PRICING_PAGE_COPY.backToAppHref, '/');
});
