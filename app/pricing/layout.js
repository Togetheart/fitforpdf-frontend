import { SEO } from '../siteCopy.mjs';

export const metadata = {
  title: SEO.pricing.title,
  description: SEO.pricing.description,
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

export default function PricingLayout({ children }) {
  return children;
}
