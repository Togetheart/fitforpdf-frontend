'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const NOISE_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.95' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect x='0' y='0' width='48' height='48' filter='url(%23n)' opacity='.15'/%3E%3C/svg%3E";
const HOME_LAYER_ONE =
  'radial-gradient(circle at var(--r1x) var(--r1y), rgba(239,68,68,0.18), transparent 45%), radial-gradient(circle at 70% 5%, rgba(239,68,68,0.08), transparent 55%)';

const HOME_LAYER_TWO =
  'radial-gradient(circle at var(--r2x) var(--r2y), rgba(59,130,246,0.14), transparent 46%), radial-gradient(circle at 38% 120%, rgba(217,45,42,0.12), transparent 58%)';

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
  const gradientsRef = useRef(null);

  const isDebugMotion =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('motion') === 'debug';
  const motionMultiplier = isDebugMotion ? 3 : 1;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reducedMotion = mediaQueryMatches('(prefers-reduced-motion: reduce)');
    if (reducedMotion || variant !== 'home') return;

    const layerOne = layerOneRef.current;
    const layerTwo = layerTwoRef.current;
    const grain = grainRef.current;
    const gradients = gradientsRef.current;
    const root = backdropRef.current;
    if (!layerOne || !layerTwo || !grain || !root || !gradients) return;

    const baseR1x = 12;
    const baseR1y = 16;
    const baseR2x = 82;
    const baseR2y = 18;

    const driftR1x = `${Math.min(92, baseR1x + 16 * motionMultiplier)}%`;
    const driftR1y = `${Math.min(92, baseR1y + 16 * motionMultiplier)}%`;
    const driftR2x = `${Math.max(8, baseR2x - 22 * motionMultiplier)}%`;
    const driftR2y = `${Math.min(92, baseR2y + 16 * motionMultiplier)}%`;

    layerOne.style.setProperty('--r1x', `${baseR1x}%`);
    layerOne.style.setProperty('--r1y', `${baseR1y}%`);
    layerTwo.style.setProperty('--r2x', `${baseR2x}%`);
    layerTwo.style.setProperty('--r2y', `${baseR2y}%`);
    grain.style.opacity = '0.10';
    gradients.style.setProperty('--hero-bg-x', '0px');
    gradients.style.setProperty('--hero-bg-y', '0px');

    const driftA = gsap.to(layerOne, {
      '--r1x': driftR1x,
      '--r1y': driftR1y,
      duration: 14,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    const driftB = gsap.to(layerTwo, {
      '--r2x': driftR2x,
      '--r2y': driftR2y,
      duration: 18,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    const grainDrift = gsap.to(grain, {
      opacity: 0.16,
      duration: 22,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });

    const gradientDrift = gsap.to(gradients, {
      x: `${8 * motionMultiplier}px`,
      y: `${6 * motionMultiplier}px`,
      duration: 22,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    const addPointerListeners = mediaQueryMatches('(pointer: fine)');
    let onPointerMove = null;
    let onPointerOut = null;

    if (addPointerListeners) {
      const quickToLayerOneX = gsap.quickTo(layerOne, 'x', { duration: 0.75, ease: 'power2.out' });
      const quickToLayerOneY = gsap.quickTo(layerOne, 'y', { duration: 0.75, ease: 'power2.out' });
      const quickToLayerTwoX = gsap.quickTo(layerTwo, 'x', { duration: 0.95, ease: 'power2.out' });
      const quickToLayerTwoY = gsap.quickTo(layerTwo, 'y', { duration: 0.95, ease: 'power2.out' });
      const quickToGradientX = gsap.quickTo(gradients, 'x', { duration: 0.9, ease: 'power2.out' });
      const quickToGradientY = gsap.quickTo(gradients, 'y', { duration: 0.9, ease: 'power2.out' });

      onPointerMove = (event) => {
        const bounds = root.getBoundingClientRect();
        const x = ((event.clientX - (bounds.left + bounds.width / 2)) / (bounds.width / 2)) * 8;
        const y = ((event.clientY - (bounds.top + bounds.height / 2)) / (bounds.height / 2)) * 6;
        const clampedX = Math.max(-8, Math.min(8, x));
        const clampedY = Math.max(-6, Math.min(6, y));

        quickToLayerOneX(clampedX);
        quickToLayerOneY(clampedY);
        quickToLayerTwoX(clampedX * -0.5);
        quickToLayerTwoY(clampedY * -0.65);
        quickToGradientX(clampedX * 0.6);
        quickToGradientY(clampedY * 0.4);
      };

      onPointerOut = () => {
        quickToLayerOneX(0);
        quickToLayerOneY(0);
        quickToLayerTwoX(0);
        quickToLayerTwoY(0);
        quickToGradientX(0);
        quickToGradientY(0);
      };

      root.addEventListener('pointermove', onPointerMove);
      root.addEventListener('pointerleave', onPointerOut);
    }

    return () => {
      driftA.kill();
      driftB.kill();
      grainDrift.kill();
      gradientDrift.kill();
      if (addPointerListeners) {
        root.removeEventListener('pointermove', onPointerMove);
        root.removeEventListener('pointerleave', onPointerOut);
      }
    };
  }, [variant, isDebugMotion]);

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
          ref={gradientsRef}
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
