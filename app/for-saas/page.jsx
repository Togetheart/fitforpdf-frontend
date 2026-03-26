import VerticalPage from '../components/VerticalPage';

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

export default function ForSaasPage() {
  return (
    <VerticalPage
      vertical="For SaaS Companies"
      headline="PDF exports your users will actually use"
      subheadline="Plug fitforpdf into your product and ship professional PDF reports without building a rendering engine."
      painPoints={PAIN_POINTS}
      benefits={BENEFITS}
      ctaText="Try the API"
    />
  );
}
