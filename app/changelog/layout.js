import { JsonLd } from '../components/JsonLd';

export const metadata = {
  title: 'Changelog, fitforpdf',
  description: "What's new in fitforpdf. Latest updates and features.",
  alternates: { canonical: '/changelog' },
  openGraph: {
    title: 'Changelog, fitforpdf',
    description: "What's new in fitforpdf. Latest updates and features.",
    url: 'https://www.fitforpdf.com/changelog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Changelog, fitforpdf',
    description: "What's new in fitforpdf. Latest updates and features.",
  },
};

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.fitforpdf.com' },
    { '@type': 'ListItem', position: 2, name: 'Changelog', item: 'https://www.fitforpdf.com/changelog' },
  ],
};

export default function ChangelogLayout({ children }) {
  return (
    <>
      <JsonLd data={breadcrumbLd} />
      {children}
    </>
  );
}
