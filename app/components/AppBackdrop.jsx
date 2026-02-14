import React from 'react';

export default function AppBackdrop() {
  const reducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div
      data-testid="app-backdrop"
      data-motion={reducedMotion ? 'off' : 'on'}
      aria-hidden="true"
      className="app-backdrop app-bg-white"
    >
      {/* Keeps a dedicated global white backdrop for every page. */}
    </div>
  );
}
