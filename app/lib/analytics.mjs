/**
 * PostHog event helpers — frontend only.
 *
 * Backend render events stay in Supabase (render_events table).
 * This module covers the user-behaviour events captured on the web app.
 */
function capture(event, properties) {
  if (typeof window === 'undefined') return;
  if (typeof window.posthog === 'undefined') return;
  try {
    window.posthog.capture(event, properties);
  } catch {
    // PostHog not yet initialized — silently skip
  }
}

// ── Public helpers ──────────────────────────────────────────

export function trackUploadStarted({ fileType, fileSize }) {
  capture('upload_started', { file_type: fileType, file_size: fileSize });
}

export function trackDemoFileUsed() {
  capture('demo_file_used');
}

/**
 * Fired when the demo PDF has actually been generated and shown to the user.
 * Distinct from `demo_file_used` (which tracks the click) — this measures
 * how many visitors actually consume the demo PDF, then drop off without
 * uploading their own file.
 */
export function trackDemoPdfShown() {
  capture('demo_pdf_shown');
}

/**
 * Fired when a user uploads their own real file in the same session as a
 * preceding demo render. Critical funnel signal — demo → upload conversion
 * is currently 0% per the in-app dashboard, so we need to know whether
 * any change actually moves it.
 */
export function trackUploadAfterDemo(context = {}) {
  const { fileType, fileSize } = context || {};
  capture('upload_after_demo', {
    file_type: fileType,
    file_size: fileSize,
  });
}

export function trackPaymentStarted({ plan, pack }) {
  capture('payment_started', { plan, pack });
}

export function trackPaymentCompleted({ plan, pack }) {
  capture('payment_completed', { plan, pack });
}

export function trackShareLinkCopied({ surface, jobId }) {
  capture('share_link_copied', {
    surface,
    job_id: jobId,
  });
}
