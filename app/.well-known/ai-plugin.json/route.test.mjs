import assert from 'node:assert/strict';
import test from 'node:test';
import { GET } from './route.js';

test('ai-plugin manifest returns 200 and application/json', async () => {
  const res = await GET();
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type') || '', /application\/json/);
});

test('ai-plugin manifest declares the fitforpdf tool identity', async () => {
  const res = await GET();
  const body = await res.json();
  assert.equal(body.schema_version, 'v1');
  assert.equal(body.name_for_model, 'fitforpdf');
  assert.equal(typeof body.description_for_model, 'string');
  assert.ok(body.description_for_model.length > 40, 'description should be substantial');
  assert.ok(body.contact_email);
  assert.ok(body.legal_info_url);
});

test('ai-plugin manifest advertises the render_pdf tool with a valid JSON schema', async () => {
  const res = await GET();
  const body = await res.json();
  assert.ok(Array.isArray(body.tools), 'tools must be an array');
  const renderTool = body.tools.find((t) => t.name === 'render_pdf');
  assert.ok(renderTool, 'render_pdf tool must exist');
  assert.equal(typeof renderTool.description, 'string');
  assert.equal(renderTool.input_schema?.type, 'object');
  assert.ok(renderTool.input_schema.properties.file_url, 'file_url property required');
  assert.ok(Array.isArray(renderTool.input_schema.required));
  assert.ok(renderTool.input_schema.required.includes('file_url'));
});

test('ai-plugin manifest points to the OpenAPI spec', async () => {
  const res = await GET();
  const body = await res.json();
  assert.equal(body.api?.type, 'openapi');
  assert.match(String(body.api?.url || ''), /openapi\.json$/);
});

test('ai-plugin manifest sets Cache-Control for public caching', async () => {
  const res = await GET();
  const cache = res.headers.get('cache-control') || '';
  assert.match(cache, /public/);
});
