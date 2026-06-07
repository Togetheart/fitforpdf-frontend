/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure no trailing slash — avoids duplicate URLs in Google index
  trailingSlash: false,

  // Allow PostHog SDK to POST to /ingest/e/ with trailing slash
  // without being 308-redirected by Next.js
  skipTrailingSlashRedirect: true,

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
