// Single choke point that converts ANY upstream/proxy checkout failure into a
// client-safe response. The backend echoes the Stripe SDK's raw error message
// verbatim (e.g. "Expired API Key provided: sk_live_***..."); before this, the
// proxy routes forwarded that message — and the entire upstream payload via a
// `details` field — straight to the pricing/workbench UI. Never return upstream
// text to the browser; log the real detail server-side for support correlation.

const SUPPORT_EMAIL = 'support@fitforpdf.com';

/**
 * Client-safe error body for a failed checkout. Carries no upstream text — only
 * a friendly message (+ trace id for support). The message leads with "nothing
 * was charged" because that is the buyer's real question at the pay moment.
 */
export function sanitizedCheckoutError(status, requestId) {
  const message = status === 429
    ? 'Too many checkout attempts — please wait a moment and try again.'
    : `We couldn’t start checkout — nothing was charged. Please try again, or email ${SUPPORT_EMAIL} if it keeps happening.`;
  return requestId ? { error: message, requestId } : { error: message };
}

/**
 * Record the real upstream failure server-side (Vercel logs) so support can
 * correlate via requestId. Defensive: never throws, never blocks the response.
 */
export function logCheckoutFailure(scope, { status, requestId, payload } = {}) {
  let detail = payload;
  try {
    if (payload && typeof payload === 'object') {
      detail = JSON.stringify(payload).slice(0, 2000);
    }
  } catch {
    detail = '[unserializable payload]';
  }
  console.error(`[checkout:${scope}] upstream failure`, { status, requestId, detail });
}
