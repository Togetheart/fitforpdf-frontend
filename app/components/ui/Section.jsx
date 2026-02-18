'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Section({
  id,
  index = 0,
  children,
  testId,
  className = '',
  bg,
  maxWidth = 'max-w-[960px]',
}) {
  const resolvedBg = bg ?? (index % 2 === 0 ? 'bg-white' : 'bg-gray-50');
  const testIdValue = testId ?? `section-${id}`;
  const innerRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const el = innerRef.current;
    if (!el) return;

    // Animate direct children with staggered reveal
    const targets = el.children;
    if (!targets || targets.length === 0) return;

    gsap.set(targets, { opacity: 0, y: 24 });

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(targets, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power2.out',
        });
      },
    });

    return () => {
      trigger.kill();
      // Reset to visible in case component unmounts mid-animation
      gsap.set(targets, { opacity: 1, y: 0 });
    };
  }, []);

  return (
    <section
      id={id}
      className={`${resolvedBg} ${className}`}
      data-section-bg={resolvedBg === 'bg-gray-50' ? 'gray' : 'white'}
      data-testid={testIdValue}
    >
      <div
        ref={innerRef}
        className={`mx-auto flex w-full flex-col gap-6 ${maxWidth} px-4 py-10 sm:px-6 sm:py-12`}
      >
        {children}
      </div>
    </section>
  );
}
