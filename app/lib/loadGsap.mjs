// Lazy-load GSAP with crash containment.
//
// The logo + headline intro animations are DECORATIVE — the SVG and headline
// already render in their final state without GSAP. So a failure to load the
// gsap chunk must be SWALLOWED, never allowed to become an uncaught
// "gsap is not defined"-class rejection that white-screens the page. (That class
// of crash has reached prod twice; see app/error.jsx / the global net in layout.js.)
//
// The launch-day case this specifically defends: a redeploy mid-session
// invalidates the old hashed chunk, so an import('gsap') issued from
// already-loaded HTML throws a ChunkLoadError. We reload ONCE
// (sessionStorage-guarded — never a loop) to pick up the fresh asset manifest;
// any other failure resolves to null and the caller simply skips the animation.

const RELOAD_KEY = 'ffp-chunk-reloaded';

function isChunkLoadError(err) {
  const name = (err && err.name) || '';
  const msg = (err && err.message) || '';
  return (
    name === 'ChunkLoadError' ||
    /Loading chunk|dynamically imported module|Importing a module script failed/i.test(msg)
  );
}

let cached = null;

export default function loadGsap() {
  if (cached) return cached;
  cached = import('gsap')
    .then((mod) => mod.default || mod.gsap || mod)
    .catch((err) => {
      cached = null; // allow a later attempt
      if (
        isChunkLoadError(err) &&
        typeof window !== 'undefined' &&
        typeof sessionStorage !== 'undefined'
      ) {
        try {
          if (!sessionStorage.getItem(RELOAD_KEY)) {
            sessionStorage.setItem(RELOAD_KEY, '1');
            window.location.reload();
          }
        } catch {
          /* sessionStorage blocked (private mode / cookies off) — fall through */
        }
      }
      return null; // decorative: caller skips the animation
    });
  return cached;
}
