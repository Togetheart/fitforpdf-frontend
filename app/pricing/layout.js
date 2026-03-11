import { SEO, PRICING_PAGE_COPY } from '../siteCopy.mjs';
import { JsonLd } from '../components/JsonLd';

export const metadata = {
  title: SEO.pricing.title,
  description: SEO.pricing.description,
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: SEO.pricing.title,
    description: SEO.pricing.description,
    url: `${SEO.siteUrl}/pricing`,
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.pricing.title,
    description: SEO.pricing.description,
  },
};

const pricingFaqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PRICING_PAGE_COPY.faq.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

export default function PricingLayout({ children }) {
  return (
    <>
      <JsonLd data={pricingFaqLd} />
      {children}
    </>
  );
}
