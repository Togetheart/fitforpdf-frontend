import assert from 'node:assert/strict';
import test from 'node:test';
import { createHandler } from './handler.mjs';

function withMockFetch(handler) {
  const calls = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url, options });
    return handler({ url, options, index: calls.length - 1 });
  };
  return {
    calls,
    restore: () => { globalThis.fetch = original; },
  };
}

function initRequest(id = 1) {
  return { jsonrpc: '2.0', id, method: 'initialize', params: { protocolVersion: '2024-11-05' } };
}

test('initialize returns server capabilities and protocol version', async () => {
  const h = createHandler({ apiKey: 'k', baseUrl: 'https://x.test' });
  const res = await h.handle(initRequest(7));
  assert.equal(res.jsonrpc, '2.0');
  assert.equal(res.id, 7);
  assert.ok(res.result.capabilities);
  assert.equal(res.result.serverInfo.name, 'fitforpdf-mcp');
  assert.equal(typeof res.result.serverInfo.version, 'string');
});

test('tools/list advertises render_pdf with input schema', async () => {
  const h = createHandler({ apiKey: 'k', baseUrl: 'https://x.test' });
  const res = await h.handle({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
  assert.equal(res.id, 2);
  const tools = res.result.tools;
  assert.ok(Array.isArray(tools));
  const render = tools.find((t) => t.name === 'render_pdf');
  assert.ok(render);
  assert.equal(render.inputSchema.type, 'object');
  assert.ok(render.inputSchema.properties.file_url);
  assert.ok(render.inputSchema.required.includes('file_url'));
});

test('tools/call render_pdf forwards to /api/agent/render and returns tool content', async () => {
  const h = createHandler({ apiKey: 'test-key', baseUrl: 'https://x.test' });
  const { calls, restore } = withMockFetch(async () => (
    new Response(JSON.stringify({
      render_id: 'rid_9',
      pdf_base64: 'JVBERi0=',
      pages: 12,
      verdict: 'OK',
      score: 100,
      render_ms: 321,
    }), { status: 200, headers: { 'content-type': 'application/json' } })
  ));
  const res = await h.handle({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'render_pdf',
      arguments: { file_url: 'https://example.com/data.csv', mode: 'compact' },
    },
  });

  assert.equal(res.id, 3);
  assert.ok(Array.isArray(res.result.content));
  const textBlock = res.result.content.find((c) => c.type === 'text');
  assert.ok(textBlock);
  assert.match(textBlock.text, /rid_9/);
  assert.match(textBlock.text, /verdict.*OK/);
  assert.match(textBlock.text, /12/);

  // Outbound call
  assert.equal(calls.length, 1);
  assert.match(String(calls[0].url), /\/api\/agent\/render$/);
  const reqOptions = calls[0].options;
  assert.equal(reqOptions.method, 'POST');
  assert.equal(reqOptions.headers['content-type'], 'application/json');
  assert.equal(reqOptions.headers['X-FITFORPDF-KEY'], 'test-key');
  const body = JSON.parse(reqOptions.body);
  assert.equal(body.file_url, 'https://example.com/data.csv');
  assert.equal(body.mode, 'compact');

  restore();
});

test('tools/call returns isError on upstream failure', async () => {
  const h = createHandler({ apiKey: 'k', baseUrl: 'https://x.test' });
  const { restore } = withMockFetch(async () => (
    new Response(JSON.stringify({ error: 'page_burden_high', recommendations: ['mode_compact'] }), {
      status: 422,
      headers: { 'content-type': 'application/json' },
    })
  ));
  const res = await h.handle({
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: { name: 'render_pdf', arguments: { file_url: 'https://example.com/big.csv' } },
  });
  assert.equal(res.result.isError, true);
  const textBlock = res.result.content.find((c) => c.type === 'text');
  assert.match(textBlock.text, /page_burden_high/);
  restore();
});

test('tools/call rejects unknown tool with JSON-RPC error', async () => {
  const h = createHandler({ apiKey: 'k', baseUrl: 'https://x.test' });
  const res = await h.handle({
    jsonrpc: '2.0', id: 5, method: 'tools/call',
    params: { name: 'does_not_exist', arguments: {} },
  });
  assert.ok(res.error);
  assert.equal(res.error.code, -32602);
});

test('unknown method returns JSON-RPC method not found', async () => {
  const h = createHandler({ apiKey: 'k', baseUrl: 'https://x.test' });
  const res = await h.handle({ jsonrpc: '2.0', id: 6, method: 'weird/thing' });
  assert.equal(res.error.code, -32601);
});

test('missing apiKey fails fast at construction', () => {
  assert.throws(() => createHandler({ baseUrl: 'https://x.test' }), /apiKey/);
});
