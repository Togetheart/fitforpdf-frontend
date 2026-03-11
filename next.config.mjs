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
};

export default nextConfig;
