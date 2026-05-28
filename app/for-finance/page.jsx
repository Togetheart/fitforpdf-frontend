import VerticalPage from '../components/VerticalPage';
import { JsonLd } from '../components/JsonLd';
import { SEO } from '../siteCopy.mjs';

export const metadata = {
  title: SEO.forFinance.title,
  description: SEO.forFinance.description,
  alternates: { canonical: '/for-finance' },
  openGraph: {
    title: SEO.forFinance.title,
    description: SEO.forFinance.description,
    url: 'https://www.fitforpdf.com/for-finance',
  },
  twitter: { card: 'summary_large_image' },
};

const PAIN_POINTS = [
  {
    title: 'Financial tables get truncated',
    description:
      'Balance sheets and P&L statements with many period columns are cut off at the page edge, hiding critical figures.',
  },
  {
    title: 'Page breaks land in the wrong place',
    description:
      'Standard PDF export splits rows mid-section, separating totals from their line items and confusing stakeholders.',
  },
  {
    title: 'No overview of multi-page reports',
    description:
      'When a financial report spans several pages, readers lose track of how the pieces fit together.',
  },
];

const BENEFITS = [
  {
    title: 'Intelligent column splitting',
    description:
      'fitforpdf detects period columns and groups them logically so every page shows a complete, readable slice of your data.',
  },
  {
    title: 'Automatic pagination',
    description:
      'Page breaks respect section boundaries, keeping subtotals and headers together where they belong.',
  },
  {
    title: 'Overview page included',
    description:
      'Multi-page outputs start with a summary page so readers immediately understand the full scope of the report.',
  },
];

const BREADCRUMB_LD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.fitforpdf.com' },
    { '@type': 'ListItem', position: 2, name: 'For Finance Teams', item: 'https://www.fitforpdf.com/for-finance' },
  ],
};

const FINANCE_FAQ_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can fitforpdf handle financial reports with 40+ columns?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. fitforpdf automatically splits wide tables into readable sections, preserving all columns across multiple pages with repeated headers.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is the data secure?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. All files are processed in France, deleted immediately after conversion, and no content is stored. GDPR compliant.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does it work with Excel P&L statements?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Profit and loss statements, balance sheets, and any wide financial spreadsheet can be converted into clean, paginated PDFs.',
      },
    },
  ],
};

export default function ForFinancePage() {
  return (
    <>
      <JsonLd data={BREADCRUMB_LD} />
      <JsonLd data={FINANCE_FAQ_LD} />
      <VerticalPage
        vertical="For Finance Teams"
        headline="Financial reports that print perfectly"
        subheadline="Turn wide Excel financial statements into clean, multi-page PDFs with every column intact."
        painPoints={PAIN_POINTS}
        benefits={BENEFITS}
        ctaText="Try it free"
      />
    </>
  );
}
