"use client";

import React from 'react';

const NOISE_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.95' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect x='0' y='0' width='48' height='48' filter='url(%23n)' opacity='.15'/%3E%3C/svg%3E";
const HOME_LAYER_ONE =
  'radial-gradient(circle at 8% 16%, rgba(239,68,68,0.18), transparent 45%), radial-gradient(circle at 70% 5%, rgba(239,68,68,0.08), transparent 55%)';

const HOME_LAYER_TWO =
  'radial-gradient(circle at 82% 18%, rgba(59,130,246,0.14), transparent 46%), radial-gradient(circle at 38% 120%, rgba(217,45,42,0.12), transparent 58%)';

export default function HeroBackdrop({
  variant = 'home',
  height = 'min-h-[360px] sm:min-h-[460px]',
}) {
  return (
    <div
      data-testid="hero-backdrop"
      aria-hidden="true"
      className={`hero-backdrop pointer-events-none absolute inset-0 ${height} overflow-hidden`}
    >
      <div data-testid="hero-bg" className="hero-bg pointer-events-none" aria-hidden="true">
        <div
          data-testid="hero-bg-gradients"
          className={`hero-bg-gradients hero-bg-gradients--${variant}`}
        />
        <span
          data-testid="hero-bg-noise"
          className="hero-bg-noise"
          style={{ '--hero-noise-uri': `url("${NOISE_URI}")` }}
        />

        {variant === 'home' ? (
          <>
            <span
              data-testid="hero-bg-layer-1"
              className="hero-bg-layer hero-bg-layer-1 motion-safe:animate-heroMeshA motion-reduce:animate-none"
              style={{ backgroundImage: HOME_LAYER_ONE }}
            />
            <span
              data-testid="hero-bg-layer-2"
              className="hero-bg-layer hero-bg-layer-2 motion-safe:animate-heroMeshB motion-reduce:animate-none"
              style={{ backgroundImage: HOME_LAYER_TWO }}
            />
            <span
              data-testid="hero-bg-grain"
              aria-hidden="true"
              className="hero-bg-grain pointer-events-none motion-safe:animate-heroGrain motion-reduce:animate-none"
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
