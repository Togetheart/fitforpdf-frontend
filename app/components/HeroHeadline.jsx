'use client';

import React from 'react';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function HeroHeadline() {
  const secondLineRef = useRef(null);

  const hasWindow = typeof window !== 'undefined';
  const reducedMotion =
    hasWindow && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  useEffect(() => {
    if (!hasWindow || reducedMotion) return;

    const accentNode = secondLineRef.current;
    if (!accentNode) return;

    const timeline = gsap.timeline({
      repeat: -1,
      yoyo: true,
    });

    timeline.to(accentNode, {
      backgroundPosition: '100% 50%',
      duration: 6,
      ease: 'sine.inOut',
    });

    return () => {
      timeline.kill();
    };
  }, [hasWindow, reducedMotion]);

  return (
    <h1 className="leading-tight tracking-tight text-4xl font-semibold sm:text-6xl">
      <span className="block">Client-ready PDFs.</span>
      <span
        ref={secondLineRef}
        data-testid="hero-headline-accent"
        data-anim={reducedMotion ? 'off' : 'on'}
        className="hero-accent block text-slate-700"
      >
        From raw data.
      </span>
    </h1>
  );
}
