import { NextResponse } from 'next/server';

/**
 * Trailing-slash redirect middleware (308 Permanent Redirect).
 *
 * Prevents Google from discovering duplicate URLs like /pricing/ alongside
 * /pricing. Without this, `skipTrailingSlashRedirect: true` in next.config.mjs
 * (needed for PostHog /ingest/e/) lets all trailing-slash URLs serve HTTP 200
 * instead of redirecting — creating "Autre page avec balise canonique correcte"
 * issues in Search Console.
 *
 * Excluded paths:
 *   - /ingest/*  → PostHog reverse proxy (needs trailing slash on /ingest/e/)
 *   - /_next/*   → Next.js internal assets
 *   - /api/*     → API route handlers
 *   - Static files (favicon, images, fonts, etc.)
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip excluded paths
  if (
    pathname.startsWith('/ingest') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Redirect trailing slash → non-trailing slash (308 Permanent)
  if (pathname.length > 1 && pathname.endsWith('/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(0, -1);
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  // Only run on page routes — skip static files, images, fonts
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|fonts|proof|examples|og-image|fitforpdf).*)',
  ],
};
