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
