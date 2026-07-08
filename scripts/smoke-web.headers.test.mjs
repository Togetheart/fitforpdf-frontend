import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSmokeRequestHeaders } from './smoke-web.mjs';

test('smoke render is unmarked when no monitor token is configured', () => {
  assert.deepEqual(buildSmokeRequestHeaders({}), {
    'X-FitForPDF-Source-Filename': 'customers-100.csv',
  });
});

test('smoke render carries X-Synthetic-Monitor when the token is configured', () => {
  assert.deepEqual(buildSmokeRequestHeaders({ SYNTHETIC_MONITOR_TOKEN: 'tok' }), {
    'X-FitForPDF-Source-Filename': 'customers-100.csv',
    'X-Synthetic-Monitor': 'tok',
  });
});
