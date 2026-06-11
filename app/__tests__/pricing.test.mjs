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

test('pricing contains the single pack (1 export, $4.90)', () => {
  const content = pricingText();
  assert.ok(content.includes('1 export'));
  assert.ok(content.includes('$4.90'));
});

test('pricing contains the starter pack (10 exports, $19)', () => {
  const content = pricingText();
  assert.ok(content.includes('10 exports'));
  assert.ok(content.includes('$19'));
});

test('pricing drops the retired Volume pack', () => {
  const content = pricingText();
  assert.equal(content.includes('Pro + API'), false);
  assert.equal(content.includes('Volume'), false);
  assert.equal(content.includes('$79'), false);
});

test('pricing exposes free and pay-as-you-go plan cards', () => {
  assert.equal(PRICING_CARDS.length, 3);
  const planIds = PRICING_CARDS.map((card) => card.id);
  assert.deepEqual(planIds, ['free', 'single', 'payg-starter']);
});

test('pricing has back to app link', () => {
  assert.equal(PRICING_PAGE_COPY.backToApp, 'Back to app');
  assert.equal(PRICING_PAGE_COPY.backToAppHref, '/');
});
