'use client';

import React from 'react';
import SpreadsheetCellsBackdrop from './SpreadsheetCellsBackdrop';

const NOISE_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.86' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect x='0' y='0' width='36' height='36' filter='url(%23n)' opacity='.12'/%3E%3C/svg%3E";

export default function AppBackdrop() {
  const hasMatchMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function';
  const motionQuery = hasMatchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const reducedMotion = Boolean(motionQuery?.matches);

  return (
    <div
      data-testid="app-backdrop"
      data-motion={reducedMotion ? 'off' : 'on'}
      aria-hidden="true"
      className="app-backdrop pointer-events-none"
      style={{
        '--app-noise-uri': `url("${NOISE_URI}")`,
      }}
    >
      <span
        data-testid="app-backdrop-layer-1"
        className="app-bg-layer app-bg-layer-1 app-bg-layer-app motion-safe:animate-appMeshA motion-reduce:animate-none"
      />
      <span
        data-testid="app-backdrop-layer-2"
        className="app-bg-layer app-bg-layer-2 app-bg-layer-app motion-safe:animate-appMeshB motion-reduce:animate-none"
      />
      <SpreadsheetCellsBackdrop />
      <span
        data-testid="app-backdrop-noise"
        className="app-bg-noise app-noise pointer-events-none motion-safe:animate-appNoise motion-reduce:animate-none"
      />
    </div>
  );
}
