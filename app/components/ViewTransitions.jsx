'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * Hooks into Next.js App Router client-side navigations to trigger
 * the View Transitions API (fade cross-page). Falls back gracefully
 * on browsers that don't support it — the page just renders instantly.
 */
export default function ViewTransitions() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;

    // Skip if browser doesn't support View Transitions or user prefers reduced motion
    if (
      typeof document.startViewTransition !== 'function' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    // The DOM has already updated (React committed), so we just need
    // to wrap the "reveal" in a view transition snapshot.
    document.startViewTransition(() => {
      // No-op — React has already updated the DOM.
      // The transition captures old → new snapshots automatically.
    });
  }, [pathname]);

  return null;
}
