'use client';

import { useEffect, useState } from 'react';

/*
 * useIsDesktop — true when the viewport is at least `min-width:1024px` (the `lg`
 * Tailwind breakpoint). Starts `false` so the server render and the first client
 * render agree (no hydration mismatch); a layout effect upgrades it to the real
 * value after mount and keeps it in sync with matchMedia changes.
 *
 * The workbench uses this to switch between the desktop resizable PanelGroup and
 * the unchanged mobile stacked layout.
 */
const DESKTOP_QUERY = '(min-width:1024px)';

export default function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const mql = window.matchMedia(DESKTOP_QUERY);
    const update = () => setIsDesktop(mql.matches);
    update();
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', update);
      return () => mql.removeEventListener('change', update);
    }
    // Older Safari fallback.
    mql.addListener(update);
    return () => mql.removeListener(update);
  }, []);

  return isDesktop;
}
