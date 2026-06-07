/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure no trailing slash — avoids duplicate URLs in Google index
  trailingSlash: false,

  // Allow PostHog SDK to POST to /ingest/e/ with trailing slash
  // without being 308-redirected by Next.js
  skipTrailingSlashRedirect: true,

  // Image optimization. AVIF (~20% smaller than WebP) is negotiated first, then
  // WebP, falling back to the source format. minimumCacheTTL caches the
  // optimized output for a year — the /_next/image responses were previously
  // `max-age=0, must-revalidate` (a conditional request on EVERY navigation).
  // Safe to cache long: each optimized URL is keyed by source+width+quality, so
  // a changed source yields a new URL.
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
  },

  // pdf.js (lazy-loaded for the mobile first-page preview) references the optional
  // Node 'canvas' package in its server code path; the browser uses native canvas,
  // so tell webpack to ignore it (otherwise: "Module not found: Can't resolve 'canvas'").
  webpack: (config) => {
    config.resolve.alias = { ...(config.resolve.alias || {}), canvas: false, encoding: false };
    return config;
  },

  // Security (F-5): baseline security response headers on every route. A strict
  // Content-Security-Policy is intentionally NOT set here — it needs an inline-
  // script/style inventory first (PostHog, theme-init) to avoid breakage, and is
  // tracked as a follow-up. These headers are safe to ship as-is.
  async headers() {
    // Self-hosted fonts never change content under a given filename → cache them
    // immutably for a year. Previously /public assets (incl. /fonts/*.woff2)
    // served `max-age=0, must-revalidate`, forcing a conditional request on
    // every page view.
    const FONT_IMMUTABLE = 'public, max-age=31536000, immutable';
    // Static images can be updated in place (a redesign re-exports the proof
    // screenshots), so they get a long max-age + stale-while-revalidate rather
    // than `immutable`: instant from cache, refreshed in the background, and a
    // new export propagates within a day instead of being pinned for a year.
    const IMAGE_CACHE = 'public, max-age=86400, stale-while-revalidate=2592000';
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // Self-hosted Satoshi woff2 (next/font assets under /_next/static are
        // already immutable, so we only need /public's /fonts here).
        source: '/fonts/:path*',
        headers: [{ key: 'Cache-Control', value: FONT_IMMUTABLE }],
      },
      {
        // Raw /public images served directly via <img> (logo wordmark, proof
        // screenshots, og/cta backgrounds). Excludes /_next so the optimizer's
        // own immutable caching is never downgraded.
        source: '/((?!_next/).*)\\.(webp|avif|png|jpg|jpeg|gif|svg|ico)',
        headers: [{ key: 'Cache-Control', value: IMAGE_CACHE }],
      },
    ];
  },

  // Reverse proxy for PostHog — bypasses ad-blockers
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://eu-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://eu.i.posthog.com/:path*',
      },
      {
        source: '/ingest/decide',
        destination: 'https://eu.i.posthog.com/decide',
      },
    ];
  },
};

export default nextConfig;
