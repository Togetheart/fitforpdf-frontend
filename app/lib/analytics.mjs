/**
 * PostHog event helpers — frontend only.
 *
 * Backend render events stay in Supabase (render_events table).
 * This module covers the 4 user-behaviour events:
 *   upload_started, demo_file_used, payment_started, payment_completed
 */
import posthog from 'posthog-js';

function isReady() {
  try {
    return typeof window !== 'undefined' && posthog.__loaded;
  } catch {
    return false;
  }
}

function capture(event, properties) {
  if (!isReady()) return;
  posthog.capture(event, properties);
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
