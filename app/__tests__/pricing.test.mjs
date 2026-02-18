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

test('pricing contains 100 exports and €19', () => {
  const content = pricingText();
  assert.ok(content.includes('100 exports'));
  assert.ok(content.includes('€19'));
});

test('pricing contains 500 exports and €79', () => {
  const content = pricingText();
  assert.ok(content.includes('500 exports'));
  assert.ok(content.includes('€79'));
});

test('pricing contains only Free and Credits plans', () => {
  const content = pricingText();
  assert.equal(content.includes('Pro + API'), false);
  assert.equal(content.includes('€29/month'), false);
});

test('pricing exposes only free and credits plan cards', () => {
  assert.equal(PRICING_CARDS.length, 2);
  const planIds = PRICING_CARDS.map((card) => card.id);
  assert.deepEqual(planIds, ['free', 'credits']);
});

test('pricing has back to app link', () => {
  assert.equal(PRICING_PAGE_COPY.backToApp, 'Back to app');
  assert.equal(PRICING_PAGE_COPY.backToAppHref, '/');
});
