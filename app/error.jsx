'use client';

import { useEffect } from 'react';

// Route-segment error boundary. Catches RENDER-phase throws inside the app shell
// (the async-callback class — e.g. a dynamic import().then — is contained at the
// call sites + the global net in layout.js; React error boundaries do not catch
// those). Kept dependency-free and on-brand so the fallback itself cannot fail.
export default function Error({ error, reset }) {
  useEffect(() => {
    // Surface to the console for now; a real tracker (Sentry / PostHog error
    // tracking) can hook in here later.
    if (typeof console !== 'undefined') console.error('App error boundary:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
        Something went wrong.
      </p>
      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--color-muted)]">
        A part of the page failed to load. Nothing you uploaded is stored, your data was not affected.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex h-10 items-center rounded-full bg-[var(--color-cta-bg)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--color-cta-hover)]"
        >
          Try again
        </button>
        <a
          href="/"
          className="inline-flex h-10 items-center rounded-full border border-[var(--color-line)] px-5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-sunken)]"
        >
          Back to home
        </a>
      </div>
    </div>
  );
}
