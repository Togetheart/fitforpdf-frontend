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

if (typeof window !== 'undefined' && !window.requestAnimationFrame) {
  const now = () => Date.now();
  const rafStore = new Map();
  let rafId = 0;

  window.requestAnimationFrame = (callback) => {
    const id = ++rafId;
    const timeoutId = window.setTimeout(() => {
      callback(now());
    }, 16);
    rafStore.set(id, timeoutId);
    return id;
  };

  window.cancelAnimationFrame = (id) => {
    const timeoutId = rafStore.get(id);
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
      rafStore.delete(id);
    }
  };
}

if (typeof globalThis.requestAnimationFrame !== 'function') {
  globalThis.requestAnimationFrame = window.requestAnimationFrame;
}

if (typeof globalThis.cancelAnimationFrame !== 'function') {
  globalThis.cancelAnimationFrame = window.cancelAnimationFrame;
}

// JSDOM does not implement Element.scrollTo. Components like ProofShowcase
// call el.scrollTo() which crashes in tests without this stub.
if (typeof window !== 'undefined' && !Element.prototype.scrollTo) {
  Element.prototype.scrollTo = function () {};
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

// JSDOM does not implement ResizeObserver. react-resizable-panels (the
// workbench resizable panels) observes its group element on mount, so the
// desktop PanelGroup branch crashes in tests without this no-op stub.
if (!global.ResizeObserver) {
  class ResizeObserverStub {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  global.ResizeObserver = ResizeObserverStub;
}
