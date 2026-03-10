'use client';

import React from 'react';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function HeroHeadline() {
  const accentRef = useRef(null);

  const hasWindow = typeof window !== 'undefined';
  const reducedMotion =
    hasWindow && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  useEffect(() => {
    if (!hasWindow || reducedMotion) return;

    const accentNode = accentRef.current;
    if (!accentNode) return;

    let timeline = null;
    timeline = gsap.timeline({
      repeat: -1,
      yoyo: true,
      defaults: { ease: 'sine.inOut' },
    });

    timeline.to(accentNode, {
      backgroundPosition: '100% 50%',
      filter: 'brightness(1.08)',
      duration: 12,
    });

    return () => {
      if (timeline) {
        timeline.kill();
      }
    };
  }, [hasWindow, reducedMotion]);

  return (
    <>
    <div className="hero-headline-line flex justify-center mb-4">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 py-1 text-xs font-[600] uppercase tracking-[0.08em] text-black/50">
        Rendering engine for wide business tables
      </span>
    </div>
    <h1 className="mx-auto flex w-full max-w-[1220px] flex-col space-y-2 leading-[1.15] tracking-tight text-[2.25rem] font-semibold sm:text-5xl">
      <span className="hero-headline-line block">
        <span
          ref={accentRef}
          data-testid="hero-headline-accent"
          data-anim={reducedMotion ? 'off' : 'on'}
          className="hero-accent hero-accent--sections inline-block"
        >
          Readable
        </span>
        <span className="text-slate-900"> PDFs</span>
      </span>
      <span className="hero-headline-line block text-slate-900">
        for wide Excel &amp; CSV tables.
      </span>
    </h1>
    </>
  );
}
