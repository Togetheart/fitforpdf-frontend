export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function getSaveUrl() {
  const upstream = process.env.CLEAN_SHEET_API_URL;
  if (!upstream) return null;
  return `${upstream.replace(/\/+$/, '')}/v1/interviews`;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON' });
  }

  const { email, transcript } = body;
  if (!email || !email.includes('@')) {
    return jsonResponse(400, { error: 'A valid email is required' });
  }
  if (!Array.isArray(transcript) || transcript.length === 0) {
    return jsonResponse(400, { error: 'Transcript required' });
  }

  const saveUrl = getSaveUrl();

  // Try saving to backend if available
  if (saveUrl) {
    try {
      const res = await fetch(saveUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, transcript }),
      });
      if (res.ok) {
        return jsonResponse(200, { saved: true });
      }
    } catch {
      // Fall through to local logging
    }
  }

  // Fallback: log to console (visible in Vercel function logs)
  console.log('[interview-save]', JSON.stringify({ email, transcript, timestamp: new Date().toISOString() }));
  return jsonResponse(200, { saved: true, method: 'log' });
}
