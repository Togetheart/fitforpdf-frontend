export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/leads — soft email capture from the post-render modal.
 *
 * Current behaviour (stub):
 *   - Validate the payload shape + email format.
 *   - Forward to BACKEND_URL /v1/leads if CLEAN_SHEET_API_URL is configured
 *     AND BACKEND has /v1/leads (it does NOT yet — see backend TODO).
 *   - Otherwise return { ok: true, stored: false } so the frontend modal
 *     completes the success path while the backend table + cron get built.
 *
 * Once the backend ships:
 *   - Drop the fallback branch.
 *   - Backend stores { email, source, render_id, ip_hash, created_at } in
 *     a `download_leads` table, picks up by a daily cron for J+1/J+7 emails
 *     via Resend.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function getUpstreamUrl() {
  const upstream = process.env.CLEAN_SHEET_API_URL;
  if (!upstream) return null;
  return `${upstream.replace(/\/+$/, '')}/v1/leads`;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, {
      error: { code: 'invalid_json', message: 'Invalid JSON body' },
    });
  }

  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const source = typeof body?.source === 'string' ? body.source.slice(0, 64) : 'unknown';
  const renderId = body?.renderId != null ? String(body.renderId).slice(0, 128) : null;

  if (!email) {
    return jsonResponse(400, {
      error: { code: 'missing_email', message: 'Email is required.' },
    });
  }
  if (!EMAIL_RE.test(email)) {
    return jsonResponse(400, {
      error: { code: 'invalid_email', message: 'Please enter a valid email address.' },
    });
  }

  const url = getUpstreamUrl();
  if (!url) {
    // No backend endpoint yet → accept locally so the UX stays smooth.
    // Real persistence ships with backend `POST /v1/leads`.
    return jsonResponse(200, { ok: true, stored: false });
  }

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, source, renderId }),
    });
    const text = await upstream.text();
    // Backend is allowed to return 404 (route not implemented yet) — treat
    // as "stored: false" success so the modal closes cleanly.
    if (upstream.status === 404) {
      return jsonResponse(200, { ok: true, stored: false, reason: 'backend_route_missing' });
    }
    return new Response(text, {
      status: upstream.status,
      headers: { 'content-type': upstream.headers.get('content-type') || 'application/json' },
    });
  } catch {
    // Network blip on a fire-and-forget capture → don't punish the user.
    return jsonResponse(200, { ok: true, stored: false, reason: 'upstream_unreachable' });
  }
}
