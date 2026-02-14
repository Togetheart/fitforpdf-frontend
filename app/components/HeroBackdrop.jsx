'use client';

import React from 'react';

export default function HeroBackdrop({
  variant = 'home',
  height = 'min-h-[360px] sm:min-h-[460px]',
}) {
  const reducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div
      data-testid="hero-backdrop"
      aria-hidden="true"
      data-motion={reducedMotion ? 'off' : 'on'}
      className={`hero-backdrop pointer-events-none absolute inset-0 ${height} overflow-hidden`}
    >
      <div data-testid="hero-bg" className="hero-bg pointer-events-none" aria-hidden="true">
        <div
          data-testid="hero-bg-gradients"
          className={`hero-bg-gradients hero-bg-gradients--${variant}`}
        />
      </div>
    </div>
  );
}
