import VerticalPage from '../components/VerticalPage';
import { JsonLd } from '../components/JsonLd';

export const metadata = {
  title: 'PDF Export for SaaS Products',
  description:
    'Automate PDF report generation for your SaaS product. fitforpdf turns exported dashboards and data tables into professionally formatted PDFs via API.',
  alternates: { canonical: '/for-saas' },
  openGraph: {
    title: 'PDF Export for SaaS Products',
    description:
      'Automate PDF report generation for your SaaS product. fitforpdf turns data tables into professionally formatted PDFs via API.',
    url: 'https://www.fitforpdf.com/for-saas',
  },
  twitter: { card: 'summary_large_image' },
};

const PAIN_POINTS = [
  {
    title: 'Exported tables break in PDF',
    description:
      'Dashboard exports and data tables overflow the page, producing PDFs your users cannot read or print.',
  },
  {
    title: 'Manual formatting does not scale',
    description:
      'Every new report layout requires hand-tuning column widths and page breaks before it looks professional.',
  },
  {
    title: 'Inconsistent output across clients',
    description:
      'Different data shapes produce wildly different PDF layouts, making your product look unpolished.',
  },
];

const BENEFITS = [
  {
    title: 'API-first integration',
    description:
      'Send spreadsheet data to the fitforpdf API and receive a print-ready PDF in seconds, no manual steps required.',
  },
  {
    title: 'Automated PDF generation',
    description:
      'Let your users download perfectly formatted reports on demand without any backend PDF logic on your side.',
  },
  {
    title: 'Consistent, professional output',
    description:
      'Every PDF follows the same clean layout regardless of how many columns or rows the data contains.',
  },
];

const BREADCRUMB_LD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.fitforpdf.com' },
    { '@type': 'ListItem', position: 2, name: 'For SaaS Products', item: 'https://www.fitforpdf.com/for-saas' },
  ],
};

const SAAS_FAQ_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can I integrate fitforpdf into my product?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Our REST API lets you render PDFs from Excel, CSV, and database tables programmatically. API plans start at $49/month.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does the API support white-label output?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Paid API plans include white-label output with no fitforpdf branding on generated PDFs.',
      },
    },
    {
      '@type': 'Question',
      name: 'What file formats are supported?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The API accepts Excel (.xlsx), CSV, and TSV files. Output is always a professionally formatted PDF.',
      },
    },
  ],
};

export default function ForSaasPage() {
  return (
    <>
      <JsonLd data={BREADCRUMB_LD} />
      <JsonLd data={SAAS_FAQ_LD} />
      <VerticalPage
        vertical="For SaaS Companies"
        headline="PDF exports your users will actually use"
        subheadline="Plug fitforpdf into your product and ship professional PDF reports without building a rendering engine."
        painPoints={PAIN_POINTS}
        benefits={BENEFITS}
        ctaText="Try the API"
      />
    </>
  );
}
