import { JsonLd } from '../components/JsonLd';

export const metadata = {
  title: 'Contact, fitforpdf',
  description: 'Get in touch with the fitforpdf team for questions, partnerships, or support.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact, fitforpdf',
    description: 'Get in touch with the fitforpdf team for questions, partnerships, or support.',
    url: 'https://www.fitforpdf.com/contact',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact, fitforpdf',
    description: 'Get in touch with the fitforpdf team for questions, partnerships, or support.',
  },
};

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.fitforpdf.com' },
    { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://www.fitforpdf.com/contact' },
  ],
};

export default function ContactLayout({ children }) {
  return (
    <>
      <JsonLd data={breadcrumbLd} />
      {children}
    </>
  );
}
