'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Wraps an <img> and makes it clickable.
 * On click → fullscreen overlay (portaled to <body>) with the image maximised.
 * Close on click anywhere, Escape key, or the × button.
 *
 * Optional gallery mode: pass `images` (array of {src, alt}) and `imageIndex`
 * to enable prev/next navigation with arrow keys and buttons.
 */
export default function ImageLightbox({ src, alt, className, children, images, imageIndex, ...rest }) {
  const [isOpen, setIsOpen] = useState(false);
  const [current, setCurrent] = useState(imageIndex ?? 0);

  const hasGallery = Array.isArray(images) && images.length > 1;

  const open = useCallback(() => {
    setCurrent(imageIndex ?? 0);
    setIsOpen(true);
  }, [imageIndex]);

  const close = useCallback(() => setIsOpen(false), []);

  const prev = useCallback((e) => {
    e?.stopPropagation();
    setCurrent((c) => (c - 1 + images.length) % images.length);
  }, [images]);

  const next = useCallback((e) => {
    e?.stopPropagation();
    setCurrent((c) => (c + 1) % images.length);
  }, [images]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') close();
      if (hasGallery && e.key === 'ArrowLeft') prev();
      if (hasGallery && e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, close, hasGallery, prev, next]);

  // Sync current index when imageIndex prop changes (tab change in parent)
  useEffect(() => {
    if (imageIndex !== undefined) setCurrent(imageIndex);
  }, [imageIndex]);

  const activeSrc = hasGallery ? images[current].src : src;
  const activeAlt = hasGallery ? images[current].alt : alt;
  const activeLabel = hasGallery ? images[current].label : undefined;

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
              aria-label={activeAlt || 'Image preview'}
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
                  src={activeSrc}
                  alt={activeAlt}
                  className="h-full w-full rounded-xl object-contain drop-shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Gallery navigation */}
              {hasGallery && (
                <>
                  {/* Prev */}
                  <button
                    type="button"
                    onClick={prev}
                    className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-lg backdrop-blur transition hover:bg-white"
                    aria-label="Previous image"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>

                  {/* Next */}
                  <button
                    type="button"
                    onClick={next}
                    className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-lg backdrop-blur transition hover:bg-white"
                    aria-label="Next image"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>

                  {/* Label + counter */}
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3">
                    {activeLabel && (
                      <span className="rounded-full bg-black/60 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur">
                        {activeLabel}
                      </span>
                    )}
                    {/* Dots */}
                    <div className="flex items-center gap-1.5">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                          className={`rounded-full transition-all duration-200 ${
                            i === current
                              ? 'h-2 w-5 bg-accent'
                              : 'h-2 w-2 bg-black/25 hover:bg-black/50'
                          }`}
                          aria-label={`Go to image ${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
