'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

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
  const hasMatchMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function';

  const mediaQueryMatches = (query) => {
    if (!hasMatchMedia) return false;
    return window.matchMedia(query).matches;
  };

  const backdropRef = useRef(null);
  const layerOneRef = useRef(null);
  const layerTwoRef = useRef(null);
  const grainRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reducedMotion = mediaQueryMatches('(prefers-reduced-motion: reduce)');
    if (reducedMotion || variant !== 'home') return;

    const layerOne = layerOneRef.current;
    const layerTwo = layerTwoRef.current;
    const grain = grainRef.current;
    const root = backdropRef.current;
    if (!layerOne || !layerTwo || !grain || !root) return;

    const quickToLayerOneX = gsap.quickTo(layerOne, 'x', { duration: 0.75, ease: 'power2.out' });
    const quickToLayerOneY = gsap.quickTo(layerOne, 'y', { duration: 0.75, ease: 'power2.out' });
    const quickToLayerTwoX = gsap.quickTo(layerTwo, 'x', { duration: 0.95, ease: 'power2.out' });
    const quickToLayerTwoY = gsap.quickTo(layerTwo, 'y', { duration: 0.95, ease: 'power2.out' });

    const driftA = gsap.timeline({ repeat: -1, yoyo: true });
    const driftB = gsap.timeline({ repeat: -1, yoyo: true });
    const grainDrift = gsap.timeline({ repeat: -1, yoyo: true });

    driftA
      .to(layerOne, { x: '-12px', y: '8px', rotation: 0.3, scale: 1.015, duration: 26, ease: 'sine.inOut' })
      .to(layerOne, { x: '18px', y: '-4px', rotation: -0.2, scale: 1.01, duration: 26, ease: 'sine.inOut' });

    driftB
      .to(layerTwo, { x: '14px', y: '-10px', rotation: -0.2, scale: 1.01, duration: 30, ease: 'sine.inOut' })
      .to(layerTwo, { x: '-16px', y: '6px', rotation: 0.25, scale: 1.013, duration: 30, ease: 'sine.inOut' });

    grainDrift.to(grain, { x: '8px', y: '-6px', duration: 48, ease: 'none' });

    const onPointerMove = (event) => {
      const bounds = root.getBoundingClientRect();
      const x = ((event.clientX - (bounds.left + bounds.width / 2)) / (bounds.width / 2)) * 12;
      const y = ((event.clientY - (bounds.top + bounds.height / 2)) / (bounds.height / 2)) * 8;
      const clampedX = Math.max(-12, Math.min(12, x));
      const clampedY = Math.max(-8, Math.min(8, y));

      quickToLayerOneX(clampedX);
      quickToLayerOneY(clampedY);
      quickToLayerTwoX(clampedX * -0.5);
      quickToLayerTwoY(clampedY * -0.65);
    };

    const onPointerOut = () => {
      quickToLayerOneX(0);
      quickToLayerOneY(0);
      quickToLayerTwoX(0);
      quickToLayerTwoY(0);
    };

    if (mediaQueryMatches('(pointer: fine)')) {
      root.addEventListener('pointermove', onPointerMove);
      root.addEventListener('pointerleave', onPointerOut);
    }

    return () => {
      driftA.kill();
      driftB.kill();
      grainDrift.kill();
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerleave', onPointerOut);
    };
  }, [variant]);

  const motion = mediaQueryMatches('(prefers-reduced-motion: reduce)') ? 'off' : 'on';

  return (
    <div
      data-testid="hero-backdrop"
      aria-hidden="true"
      data-motion={motion}
      className={`hero-backdrop pointer-events-none absolute inset-0 ${height} overflow-hidden`}
      ref={backdropRef}
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
              className="hero-bg-layer hero-bg-layer-1"
              ref={layerOneRef}
              style={{ backgroundImage: HOME_LAYER_ONE }}
            />
            <span
              data-testid="hero-bg-layer-2"
              className="hero-bg-layer hero-bg-layer-2"
              ref={layerTwoRef}
              style={{ backgroundImage: HOME_LAYER_TWO }}
            />
            <span
              data-testid="hero-bg-grain"
              aria-hidden="true"
              className="hero-bg-grain pointer-events-none"
              ref={grainRef}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
