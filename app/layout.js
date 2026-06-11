import Script from 'next/script';
import './globals.css';
import SiteShellGate from './components/SiteShellGate';
import ViewTransitions from './components/ViewTransitions';
import { Analytics } from '@vercel/analytics/next';
import { SEO } from './siteCopy.mjs';
import { JsonLd } from './components/JsonLd';

export const metadata = {
  title: {
    default: SEO.home.title,
    template: '%s | fitforpdf',
  },
  description: SEO.home.description,
  metadataBase: new URL(SEO.siteUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: SEO.home.title,
    description: SEO.home.description,
    url: SEO.siteUrl,
    siteName: 'fitforpdf',
    images: [{ url: SEO.ogImage, width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.home.title,
    description: SEO.home.description,
    images: [SEO.ogImage],
  },
  icons: {
    // Safari/legacy read the .ico, modern browsers prefer the crisp SVG, iOS
    // needs a real raster apple-touch-icon (it ignores SVG, so the tab/home
    // screen was blank before). Generated from fitforpdf-icon.svg.
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/fitforpdf-icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

/* ── Structured data (JSON-LD) ── */
const softwareAppLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'fitforpdf',
  url: SEO.siteUrl,
  description: SEO.home.description,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: '0',
    highPrice: '79',
    priceCurrency: 'USD',
    offerCount: 4,
  },
};

// WebSite with SearchAction — helps Google associate "fitforpdf" as a
// searchable brand name and enables the sitelinks search box in SERPs.
const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'fitforpdf',
  alternateName: ['FitForPDF', 'Fit For PDF'],
  url: SEO.siteUrl,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SEO.siteUrl}/?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'fitforpdf',
  url: SEO.siteUrl,
  logo: `${SEO.siteUrl}/og-image.jpg`,
  sameAs: [
    'https://www.biofor.ai/org/fitforpdf',
    'https://www.linkedin.com/company/fitforpdf/',
    'https://x.com/fitforpdf',
  ],
  founder: {
    '@type': 'Person',
    name: 'Sébastien Neusch',
    sameAs: ['https://www.biofor.ai/sebastienneusch'],
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@fitforpdf.com',
    contactType: 'customer support',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Warm up the PostHog analytics origins so the deferred array.js +
            ingestion calls skip the DNS+TLS handshake on first capture. */}
        <link rel="preconnect" href="https://eu-assets.i.posthog.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://eu.i.posthog.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://eu-assets.i.posthog.com" />
        <link rel="dns-prefetch" href="https://eu.i.posthog.com" />
        <link
          rel="preload"
          href="/fonts/satoshi-400.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* The hero H1 (LCP element) is font-semibold, served by the Satoshi
            500 face (the @font-face spans 500–600). Preload it too, or the
            most-visible weight swaps in late → FOUT + layout shift. */}
        <link
          rel="preload"
          href="/fonts/satoshi-500.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/satoshi-700.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Global last-resort net for the async-crash class. A redeploy mid-spike
            invalidates old hashed chunks → a dynamic import() from already-loaded
            HTML throws a ChunkLoadError (unhandled rejection). Reload ONCE to pick
            up the fresh manifest, sessionStorage-guarded so it can never loop.
            Anything else is left alone. ~8 lines, no dependency. */}
        <Script id="error-net" strategy="beforeInteractive">{`
  (function(){
    var KEY='ffp-chunk-reloaded';
    function isChunk(msg,name){return name==='ChunkLoadError'||/Loading chunk|dynamically imported module|Importing a module script failed/i.test(msg||'');}
    function reloadOnce(){try{if(!sessionStorage.getItem(KEY)){sessionStorage.setItem(KEY,'1');location.reload();}}catch(e){}}
    window.addEventListener('unhandledrejection',function(e){var r=e&&e.reason;if(isChunk(r&&r.message,r&&r.name))reloadOnce();});
    window.addEventListener('error',function(e){var x=e&&e.error;if(isChunk(e&&e.message,x&&x.name))reloadOnce();},true);
  })();
`}</Script>
        <Script id="theme-init" strategy="beforeInteractive">{`
  (function() {
    var t = localStorage.getItem('theme');
    if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', t);
  })();
`}</Script>
        <Script id="posthog-snippet" strategy="afterInteractive">
          {`(function(){
  // Hostname gate — never init on localhost/preview. Stops dev sessions
  // (and the Aug 2026 issue where localhost:3001 was showing up in our
  // PostHog "Referring domain" report) from polluting prod analytics.
  var host = (typeof location !== 'undefined' ? location.hostname : '').toLowerCase();
  if (!host || /^(localhost|127\\.0\\.0\\.1|0\\.0\\.0\\.0)$/.test(host) || host.endsWith('.local') || /\\.vercel\\.app$/.test(host)) {
    window.posthog = { capture: function(){}, identify: function(){}, opt_out_capturing: function(){}, _stub: true };
    return;
  }
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  // Config: disable modules we don't actively use to cut bundle size +
  // request volume. We DO use autocapture + session_recording (Clarity-like
  // behaviour replays) so they stay on. Surveys/feature-flags/heatmaps:
  // not used today → off.
  posthog.init('phc_VugqXLKg2IhTsgi8ram73QMs4QV0GljLSlqQrZwBdh1', {
    api_host: 'https://eu.i.posthog.com',
    defaults: '2026-01-30',
    disable_surveys: true,
    capture_heatmaps: false,
    enable_recording_console_log: false,
    advanced_disable_feature_flags: true,
    advanced_disable_feature_flags_on_first_load: true,
    autocapture: { dom_event_allowlist: ['click', 'submit', 'change'] }
  });
})();`}
        </Script>
      </head>
      <body className="bg-[var(--color-bg)] text-[var(--color-text)]">
        {/* JSON-LD structured data for search engines & AI */}
        <JsonLd data={softwareAppLd} />
        <JsonLd data={websiteLd} />
        <JsonLd data={organizationLd} />
        <ViewTransitions />
        <SiteShellGate>{children}</SiteShellGate>
        <Analytics />
        {/* Microsoft Clarity removed (perf): it was a SECOND full session
            recorder running alongside PostHog's session_recording, redundant
            DOM-serialization + a separate third-party origin. PostHog is the
            system of record; re-enable Clarity only if its heatmaps are needed. */}
      </body>
    </html>
  );
}
