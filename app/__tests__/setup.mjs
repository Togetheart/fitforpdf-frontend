/**
 * Vitest global setup – runs before every test file's imports.
 *
 * GSAP ScrollTrigger calls window.matchMedia at module scope
 * (during gsap.registerPlugin), so the polyfill must exist
 * before any component import.
 */
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => true,
    }),
  });
}

// JSDOM does not implement IntersectionObserver. Provide a no-op stub so
// components using it (SiteHeader scroll detection, SocialProofStrip dock
// logic, etc.) can mount without crashing during tests.
if (typeof window !== 'undefined' && !window.IntersectionObserver) {
  class IntersectionObserverStub {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IntersectionObserverStub,
  });
}
