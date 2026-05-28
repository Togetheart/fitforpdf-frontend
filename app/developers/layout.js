import { JsonLd } from '../components/JsonLd';
import { SEO } from '../siteCopy.mjs';

export const metadata = {
  title: SEO.developers.title,
  description: SEO.developers.description,
  alternates: { canonical: '/developers' },
  openGraph: {
    title: SEO.developers.title,
    description: SEO.developers.description,
    url: 'https://www.fitforpdf.com/developers',
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.developers.title,
    description: SEO.developers.description,
  },
};

const techArticleLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: SEO.developers.title,
  description: SEO.developers.description,
  url: 'https://www.fitforpdf.com/developers',
  author: { '@type': 'Organization', name: 'fitforpdf', url: 'https://www.fitforpdf.com' },
  publisher: { '@type': 'Organization', name: 'fitforpdf', url: 'https://www.fitforpdf.com' },
};

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.fitforpdf.com' },
    { '@type': 'ListItem', position: 2, name: 'API', item: 'https://www.fitforpdf.com/developers' },
  ],
};

export default function DevelopersLayout({ children }) {
  return (
    <>
      <JsonLd data={techArticleLd} />
      <JsonLd data={breadcrumbLd} />
      {children}
    </>
  );
}
