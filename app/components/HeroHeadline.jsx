'use client';

import React from 'react';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function HeroHeadline() {
  const firstLineRef = useRef(null);
  const sectionWordRef = useRef(null);

  const hasWindow = typeof window !== 'undefined';
  const reducedMotion =
    hasWindow && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  useEffect(() => {
    if (!hasWindow || reducedMotion) return;

    const accentNode = sectionWordRef.current;
    const firstNode = firstLineRef.current;
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
      if (timeline) {
        timeline.kill();
      }
      if (introTween && typeof introTween.kill === 'function') introTween.kill();
    };
  }, [hasWindow, reducedMotion]);

  return (
    <>
    <div className="hero-headline-line flex items-center justify-center gap-2 mb-4" style={{ animationDelay: '0ms', animationDuration: '0.6s' }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="16" y2="17" />
      </svg>
      <span className="text-2xl font-semibold tracking-tight text-slate-900">FitForPDF</span>
    </div>
    <h1 className="leading-[1.08] tracking-tight text-[2.25rem] font-semibold sm:text-5xl">
      <span ref={firstLineRef} className="hero-headline-line block text-slate-900" style={{ animationDelay: '0ms' }}>
        Your spreadsheet.
      </span>
      <span
        className="hero-headline-line block text-slate-900"
        style={{ animationDelay: '0ms' }}
      >
        Reorganized into readable{' '}
        <span
          ref={sectionWordRef}
          data-testid="hero-headline-accent"
          data-anim={reducedMotion ? 'off' : 'on'}
          className="hero-accent hero-accent--sections inline-block"
        >
          sections.
        </span>
      </span>
      <span
        className="hero-headline-line block text-slate-900"
        style={{ animationDelay: '0ms' }}
      >
        Ready to send.
      </span>
    </h1>
    </>
  );
}
