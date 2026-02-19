'use client';

import React, { useEffect, useState } from 'react';

/**
 * Cloud-upload icon with animated draw-on effect on mount.
 * Matches the lucide-react CloudUpload / UploadCloud paths exactly.
 */
export default function AnimatedCloudIcon({ size = 32, className = 'text-slate-500' }) {
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Approximate total stroke length for each path at viewBox 24×24
  // Cloud arc: ~55, vertical line: ~8, chevron: ~11
  const cloudLength = 55;
  const lineLength = 8;
  const chevronLength = 11;

  const transition = drawn
    ? 'stroke-dashoffset 0.55s cubic-bezier(0.4,0,0.2,1)'
    : 'none';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* Cloud outline */}
      <path
        d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"
        strokeDasharray={cloudLength}
        strokeDashoffset={drawn ? 0 : cloudLength}
        style={{ transition, transitionDelay: drawn ? '0s' : '0s' }}
      />
      {/* Vertical arrow line */}
      <path
        d="M12 13v8"
        strokeDasharray={lineLength}
        strokeDashoffset={drawn ? 0 : lineLength}
        style={{ transition, transitionDelay: drawn ? '0.15s' : '0s' }}
      />
      {/* Arrow chevron */}
      <path
        d="m8 17 4-4 4 4"
        strokeDasharray={chevronLength}
        strokeDashoffset={drawn ? 0 : chevronLength}
        style={{ transition, transitionDelay: drawn ? '0.25s' : '0s' }}
      />
    </svg>
  );
}
