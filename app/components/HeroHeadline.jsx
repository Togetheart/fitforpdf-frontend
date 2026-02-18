'use client';

import React from 'react';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function HeroHeadline() {
  const firstLineRef = useRef(null);
  const secondLineRef = useRef(null);

  const hasWindow = typeof window !== 'undefined';
  const reducedMotion =
    hasWindow && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  useEffect(() => {
    if (!hasWindow || reducedMotion) return;

    const accentNode = secondLineRef.current;
    const firstNode = firstLineRef.current;
    if (!accentNode) return;

    const timeline = gsap.timeline({
      repeat: -1,
      yoyo: true,
      defaults: { ease: 'sine.inOut' },
    });

    timeline.to(accentNode, {
      backgroundPosition: '100% 50%',
      filter: 'brightness(1.08)',
      duration: 12,
    });

    let introTween = null;
    if (firstNode) {
      introTween = gsap.fromTo(
        firstNode,
        { opacity: 0.95, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay: 0.05,
          ease: 'power2.out',
        },
      );
    }

    return () => {
      timeline.kill();
      if (introTween && typeof introTween.kill === 'function') introTween.kill();
    };
  }, [hasWindow, reducedMotion]);

  return (
    <h1 className="leading-tight tracking-tight text-4xl font-semibold sm:text-6xl">
      <span ref={firstLineRef} className="hero-headline-line block text-slate-900">
        Your spreadsheet.
      </span>
      <span
        className="hero-headline-line block text-slate-900"
      >
        Reorganized into readable sections.
      </span>
      <span
        ref={secondLineRef}
        data-testid="hero-headline-accent"
        data-anim={reducedMotion ? 'off' : 'on'}
        className="hero-accent hero-accent--sections hero-headline-line block"
      >
        Ready to send.
      </span>
    </h1>
  );
}
