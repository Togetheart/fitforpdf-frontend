export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

function badGateway(message) {
  return new Response(message, { status: 502 });
}

async function getLocalSampleCsv() {
  const localPath = path.join(process.cwd(), 'public', 'enterprise-invoices-demo.csv');
  try {
    const text = await readFile(localPath, 'utf8');
    if (!text || !text.trim()) return null;
    return text;
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      console.error('[sample/premium] local file read failed:', error);
    }
    return null;
  }
}

export async function GET() {
  const localCsv = await getLocalSampleCsv();
  if (localCsv) {
    return new Response(localCsv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  const upstream = process.env.CLEAN_SHEET_API_URL || 'https://cleansheet-api.neatexport.com';
  const url = `${upstream.replace(/\/+$/, '')}/sample/premium.csv`;

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(url, { cache: 'no-store' });
  } catch (error) {
    return badGateway('Upstream error');
  }

  if (!upstreamResponse.ok) {
    return badGateway('Upstream error');
  }

  const text = await upstreamResponse.text();

  return new Response(text, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
