#!/usr/bin/env node
/**
 * FitForPDF MCP server — stdio transport entry point.
 *
 * Claude Desktop, Cursor, and other MCP clients spawn this process and
 * communicate via newline-delimited JSON-RPC 2.0 over stdin/stdout.
 *
 * Configuration via env:
 *   FITFORPDF_KEY        (required)
 *   FITFORPDF_BASE_URL   (optional, defaults to https://www.fitforpdf.com)
 *
 * Example Claude Desktop config:
 *   "fitforpdf": {
 *     "command": "npx",
 *     "args": ["-y", "@fitforpdf/mcp"],
 *     "env": { "FITFORPDF_KEY": "ffp_live_..." }
 *   }
 */
import { createInterface } from 'node:readline';
import { createHandler } from './handler.mjs';

const apiKey = process.env.FITFORPDF_KEY;
if (!apiKey) {
  process.stderr.write(
    'fitforpdf-mcp: FITFORPDF_KEY env var is required. ' +
      'Get one at https://www.fitforpdf.com/developers\n',
  );
  process.exit(1);
}

const handler = createHandler({
  apiKey,
  baseUrl: process.env.FITFORPDF_BASE_URL,
});

const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });

rl.on('line', async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  let message;
  try {
    message = JSON.parse(trimmed);
  } catch {
    process.stdout.write(JSON.stringify({
      jsonrpc: '2.0', id: null,
      error: { code: -32700, message: 'Parse error' },
    }) + '\n');
    return;
  }

  const response = await handler.handle(message);
  /* JSON-RPC notifications (no id) don't get a reply. */
  if (response && message.id !== undefined) {
    process.stdout.write(JSON.stringify(response) + '\n');
  }
});

rl.on('close', () => process.exit(0));
