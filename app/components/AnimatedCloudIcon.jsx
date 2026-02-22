'use client';

import React, { useEffect, useState } from 'react';

/**
 * Cloud-upload icon with animated draw-on effect on mount.
 * Matches the lucide-react CloudUpload / UploadCloud paths exactly.
 */
export default function AnimatedCloudIcon({ size = 32, className = 'text-muted' }) {
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 2500);
    return () => clearTimeout(t);
  }, []);

  // Cloud arc stroke length at viewBox 24×24
  const cloudLength = 55;

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
      {/* Cloud outline — animated draw-on */}
      <path
        d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"
        strokeDasharray={cloudLength}
        strokeDashoffset={drawn ? 0 : cloudLength}
        style={{
          transition: drawn ? 'stroke-dashoffset 0.55s cubic-bezier(0.4,0,0.2,1)' : 'none',
        }}
      />
      {/* Arrow — static, always visible */}
      <path d="M12 13v8" />
      <path d="m8 17 4-4 4 4" />
    </svg>
  );
}
