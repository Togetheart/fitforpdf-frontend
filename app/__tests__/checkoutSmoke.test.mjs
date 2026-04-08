/**
 * Smoke tests — verify every checkout pack/plan returns a valid Stripe URL
 * from the LIVE backend. Catches "price inactive" regressions before users do.
 *
 * Run:  SMOKE_BACKEND_URL=https://api.fitforpdf.com npm run smoke:checkout
 *
 * These tests hit the real backend but do NOT complete any purchase.
 * Stripe checkout sessions created here expire unused.
 */

import assert from 'node:assert/strict';
import { describe, test, before } from 'node:test';

const BACKEND_URL = process.env.SMOKE_BACKEND_URL || process.env.CLEAN_SHEET_API_URL;
const API_KEY = process.env.NEATEXPORT_API_KEY || '';

const CREDIT_PACKS = ['credits_1', 'credits_10', 'credits_100'];
const PRO_BILLINGS = ['monthly', 'yearly'];

function skip(reason) {
  console.log(`⏭  Skipping checkout smoke tests: ${reason}`);
  return true;
}

describe('checkout smoke tests (live backend)', { skip: !BACKEND_URL && skip('SMOKE_BACKEND_URL not set') }, () => {

  async function postCheckout(path, body) {
    const url = `${BACKEND_URL.replace(/\/+$/, '')}${path}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(API_KEY ? { 'X-NEATEXPORT-KEY': API_KEY } : {}),
      },
      body: JSON.stringify({
        ...body,
        success_url: 'https://www.fitforpdf.com/success?smoke=true',
        cancel_url: 'https://www.fitforpdf.com/?smoke=true',
      }),
    });
    return { status: res.status, data: await res.json().catch(() => ({})) };
  }

  // ── Credit packs ──────────────────────────────────────────────────

  for (const pack of CREDIT_PACKS) {
    test(`POST /credits/purchase/checkout with pack="${pack}" → 200 + Stripe URL`, async () => {
      const { status, data } = await postCheckout('/credits/purchase/checkout', { pack });

      assert.equal(status, 200, `Expected 200 but got ${status}: ${JSON.stringify(data)}`);
      assert.ok(data.url, `Missing checkout URL in response: ${JSON.stringify(data)}`);
      assert.ok(
        data.url.startsWith('https://checkout.stripe.com/'),
        `URL is not a Stripe checkout URL: ${data.url}`,
      );
    });
  }

  // ── Pro subscription ──────────────────────────────────────────────

  for (const billing of PRO_BILLINGS) {
    test(`POST /plan/pro/checkout with billing="${billing}" → 200 + Stripe URL`, async () => {
      const { status, data } = await postCheckout('/plan/pro/checkout', { billing });

      assert.equal(status, 200, `Expected 200 but got ${status}: ${JSON.stringify(data)}`);
      assert.ok(data.url, `Missing checkout URL in response: ${JSON.stringify(data)}`);
      assert.ok(
        data.url.startsWith('https://checkout.stripe.com/'),
        `URL is not a Stripe checkout URL: ${data.url}`,
      );
    });
  }

  // ── Negative: invalid pack returns 400, not 500 ───────────────────

  test('POST /credits/purchase/checkout with invalid pack → 400', async () => {
    const { status } = await postCheckout('/credits/purchase/checkout', { pack: 'credits_9999' });
    assert.equal(status, 400, `Invalid pack should return 400, got ${status}`);
  });

  // ── Price consistency: no "inactive" in error messages ────────────

  for (const pack of CREDIT_PACKS) {
    test(`pack="${pack}" response does not contain "inactive" error`, async () => {
      const { data } = await postCheckout('/credits/purchase/checkout', { pack });
      const responseText = JSON.stringify(data).toLowerCase();
      assert.equal(
        responseText.includes('inactive'),
        false,
        `Response contains "inactive" — Stripe price is archived: ${JSON.stringify(data)}`,
      );
    });
  }
});
