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
