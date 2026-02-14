"use client";

import React, { useEffect, useState } from 'react';

const NOISE_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.95' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect x='0' y='0' width='48' height='48' filter='url(%23n)' opacity='.15'/%3E%3C/svg%3E";

const HOME_GRADIENT =
  "radial-gradient(1200px circle at 20% 20%, rgba(239,68,68,0.06), transparent 60%), radial-gradient(900px circle at 80% 30%, rgba(59,130,246,0.04), transparent 60%)";

export default function HeroBackdrop({
  variant = 'home',
  height = 'min-h-[360px] sm:min-h-[460px]',
}) {
  const [allowMotion, setAllowMotion] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      setAllowMotion(true);
      return;
    }

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const applyPreference = (event) => {
      setAllowMotion(!event.matches);
    };

    applyPreference(media);

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', applyPreference);
      return () => {
        media.removeEventListener('change', applyPreference);
      };
    }

    media.addListener(applyPreference);
    return () => {
      media.removeListener(applyPreference);
    };
  }, []);

  return (
    <div
      data-testid="hero-backdrop"
      aria-hidden="true"
      className={`hero-backdrop pointer-events-none absolute inset-0 ${height} overflow-hidden`}
    >
      <div data-testid="hero-bg" className="hero-bg pointer-events-none" aria-hidden="true">
        <div
          data-testid="hero-bg-gradients"
          className={`hero-bg-gradients hero-bg-gradients--${variant}${allowMotion ? ' hero-bg-animate' : ''}`}
          style={variant === 'home' ? { backgroundImage: HOME_GRADIENT } : undefined}
        />
        <div
          data-testid="hero-bg-noise"
          className="hero-bg-noise"
          style={{ '--hero-noise-uri': `url("${NOISE_URI}")` }}
        />
      </div>
    </div>
  );
}
