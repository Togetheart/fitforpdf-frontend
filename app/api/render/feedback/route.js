import { getNeatExportApiKey } from '../../../lib/backendKeys.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const upstream = process.env.CLEAN_SHEET_API_URL;
  const apiKey = getNeatExportApiKey();

  if (!upstream || !apiKey) {
    return new Response(JSON.stringify({ error: 'Missing env vars' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(`${upstream}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-NEATEXPORT-KEY': apiKey,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Upstream unreachable' }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }

  const text = await upstreamResponse.text();
  return new Response(text, {
    status: upstreamResponse.status,
    headers: { 'content-type': 'application/json' },
  });
}
