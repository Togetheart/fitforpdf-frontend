'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Wraps an <img> and makes it clickable.
 * On click → fullscreen overlay (portaled to <body>) with the image maximised.
 * Close on click anywhere, Escape key, or the × button.
 */
export default function ImageLightbox({ src, alt, className, children, ...rest }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, close]);

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={`group relative cursor-zoom-in border-0 bg-transparent p-0 ${className || ''}`}
        aria-label={`View ${alt || 'image'} fullscreen`}
        {...rest}
      >
        {children || (
          <img src={src} alt={alt} className="h-auto w-full rounded-lg object-cover" />
        )}
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition-colors duration-200 group-hover:bg-black/5">
          <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 opacity-0 shadow-sm backdrop-blur transition-opacity duration-200 group-hover:opacity-100">
            Click to enlarge
          </span>
        </span>
      </button>

      {isOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-[9999] bg-white/90 backdrop-blur-xl"
              onClick={close}
              role="dialog"
              aria-modal="true"
              aria-label={alt || 'Image preview'}
            >
              {/* Close button */}
              <button
                type="button"
                onClick={close}
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white shadow-lg transition hover:bg-accent-hover"
                aria-label="Close preview"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Image — fills viewport with padding */}
              <div className="absolute inset-6 top-14 flex items-center justify-center">
                <img
                  src={src}
                  alt={alt}
                  className="h-full w-full rounded-xl object-contain drop-shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
