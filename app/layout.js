import Script from 'next/script';
import './globals.css';
import SiteShell from './components/SiteShell';
import { SEO, HOME_FAQ } from './siteCopy.mjs';
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
    highPrice: '29',
    priceCurrency: 'USD',
    offerCount: 4,
  },
};

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'fitforpdf',
  url: SEO.siteUrl,
  logo: `${SEO.siteUrl}/og-image.png`,
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@fitforpdf.com',
    contactType: 'customer support',
  },
};

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: HOME_FAQ.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

export default function RootLayout({ children }) {
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/satoshi-400.woff2"
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
        <Script id="posthog-snippet" strategy="afterInteractive">
          {`!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);posthog.init('phc_VugqXLKg2IhTsgi8ram73QMs4QV0GljLSlqQrZwBdh1',{api_host:'https://eu.i.posthog.com',defaults:'2026-01-30'})`}
        </Script>
      </head>
      <body className="bg-white text-black">
        {/* JSON-LD structured data for search engines & AI */}
        <JsonLd data={softwareAppLd} />
        <JsonLd data={organizationLd} />
        <JsonLd data={faqLd} />
        <SiteShell>{children}</SiteShell>
        {clarityId && (
          <Script
            id="microsoft-clarity"
            strategy="afterInteractive"
          >
            {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarityId}")`}
          </Script>
        )}
      </body>
    </html>
  );
}
