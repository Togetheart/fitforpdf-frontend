import assert from 'node:assert/strict';
import test from 'node:test';
import { GET } from './route.js';

test('openapi returns 200 and application/json', async () => {
  const res = await GET();
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type') || '', /application\/json/);
});

test('openapi document is valid OpenAPI 3', async () => {
  const res = await GET();
  const doc = await res.json();
  assert.match(String(doc.openapi || ''), /^3\./);
  assert.equal(typeof doc.info?.title, 'string');
  assert.equal(typeof doc.info?.version, 'string');
  assert.ok(Array.isArray(doc.servers));
  assert.ok(doc.servers.length > 0);
});

test('openapi declares the /v1/render path with POST', async () => {
  const res = await GET();
  const doc = await res.json();
  const renderPath = doc.paths?.['/v1/render'];
  assert.ok(renderPath, '/v1/render path must be declared');
  assert.ok(renderPath.post, 'POST method required');
  assert.equal(renderPath.post.operationId, 'render_pdf');
});

test('openapi declares X-FITFORPDF-KEY security scheme', async () => {
  const res = await GET();
  const doc = await res.json();
  const schemes = doc.components?.securitySchemes;
  assert.ok(schemes, 'securitySchemes required');
  const apiKey = Object.values(schemes).find(
    (s) => s?.type === 'apiKey' && s?.name === 'X-FITFORPDF-KEY',
  );
  assert.ok(apiKey, 'X-FITFORPDF-KEY apiKey scheme required');
});

function resolveRef(doc, ref) {
  if (!ref || typeof ref !== 'string' || !ref.startsWith('#/')) return null;
  const parts = ref.slice(2).split('/');
  return parts.reduce((acc, key) => (acc ? acc[key] : null), doc);
}

test('openapi accepts file_url in request body schema', async () => {
  const res = await GET();
  const doc = await res.json();
  const body = doc.paths?.['/v1/render']?.post?.requestBody;
  const jsonSchema = body?.content?.['application/json']?.schema;
  const resolved = jsonSchema?.$ref ? resolveRef(doc, jsonSchema.$ref) : jsonSchema;
  assert.ok(resolved?.properties?.file_url, 'file_url property required');
  assert.ok(
    Array.isArray(resolved.required) && resolved.required.includes('file_url'),
    'file_url must be required',
  );
});
