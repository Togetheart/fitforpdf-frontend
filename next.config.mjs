/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure no trailing slash — avoids duplicate URLs in Google index
  trailingSlash: false,

  // Force permanent redirects for non-www → www
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'fitforpdf.com' }],
        destination: 'https://www.fitforpdf.com/:path*',
        permanent: true, // 308 permanent redirect
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
