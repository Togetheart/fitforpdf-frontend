import { SEO } from '../siteCopy.mjs';

export const metadata = {
  title: SEO.privacy.title,
  description: SEO.privacy.description,
  openGraph: {
    title: SEO.privacy.title,
    description: SEO.privacy.description,
    url: `${SEO.siteUrl}/privacy`,
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.privacy.title,
    description: SEO.privacy.description,
  },
};

export default function PrivacyLayout({ children }) {
  return children;
}
