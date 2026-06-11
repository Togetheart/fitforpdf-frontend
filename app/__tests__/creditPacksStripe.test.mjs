/**
 * TDD — PAYG_PACKS must expose a stripePackId field mapping each pack
 * to a valid back-end pack identifier accepted by the checkout API routes.
 *
 * RED: all tests fail until stripePackId is added to siteCopy.mjs.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { PAYG_PACKS } from '../siteCopy.mjs';

const VALID_STRIPE_PACK_IDS = new Set([
  'credits_1',
  'credits_10',
  'credits_100',
  'credits_500',
]);

test('every PAYG_PACK has a stripePackId field', () => {
  for (const pack of PAYG_PACKS) {
    assert.ok(
      Object.prototype.hasOwnProperty.call(pack, 'stripePackId'),
      `Pack "${pack.id}" is missing a stripePackId field`,
    );
  }
});

test('every PAYG_PACK stripePackId is a valid checkout API pack identifier', () => {
  for (const pack of PAYG_PACKS) {
    assert.ok(
      VALID_STRIPE_PACK_IDS.has(pack.stripePackId),
      `Pack "${pack.id}" has invalid stripePackId: "${pack.stripePackId}"`,
    );
  }
});

test('"single" pack maps to credits_1', () => {
  const single = PAYG_PACKS.find((p) => p.id === 'single');
  assert.ok(single, 'single pack not found');
  assert.equal(single.stripePackId, 'credits_1');
});

test('"payg-starter" pack maps to credits_10', () => {
  const starter = PAYG_PACKS.find((p) => p.id === 'payg-starter');
  assert.ok(starter, 'payg-starter pack not found');
  assert.equal(starter.stripePackId, 'credits_10');
});

test('the retired Volume pack is no longer offered on the pricing page', () => {
  const volume = PAYG_PACKS.find((p) => p.id === 'volume');
  assert.equal(volume, undefined, 'Volume pack should be removed from PAYG_PACKS');
});
