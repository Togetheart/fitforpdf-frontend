export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function badGateway(message) {
  return new Response(message, { status: 502 });
}

export async function GET() {
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
