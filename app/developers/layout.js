import { JsonLd } from '../components/JsonLd';

export const metadata = {
  title: 'fitforpdf API — Excel & CSV to PDF for Developers',
  description:
    'REST API to convert wide Excel and CSV tables into structured, readable PDFs. Built for SaaS reporting, CRM exports, and data-heavy workflows. 60 req/min, up to 50 columns.',
  alternates: { canonical: '/developers' },
  openGraph: {
    title: 'fitforpdf API — Excel & CSV to PDF for Developers',
    description: 'REST API to convert wide Excel and CSV tables into structured, readable PDFs. Built for SaaS reporting and data-heavy workflows.',
    url: 'https://www.fitforpdf.com/developers',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'fitforpdf API — Excel & CSV to PDF for Developers',
    description: 'REST API to convert wide Excel and CSV tables into structured, readable PDFs.',
  },
};

const techArticleLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'fitforpdf API — Excel & CSV to PDF for Developers',
  description:
    'REST API to convert wide Excel and CSV tables into structured, readable PDFs. Built for SaaS reporting, CRM exports, and data-heavy workflows.',
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
