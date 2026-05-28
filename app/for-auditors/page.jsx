import VerticalPage from '../components/VerticalPage';
import { JsonLd } from '../components/JsonLd';
import { SEO } from '../siteCopy.mjs';

export const metadata = {
  title: SEO.forAuditors.title,
  description: SEO.forAuditors.description,
  alternates: { canonical: '/for-auditors' },
  openGraph: {
    title: SEO.forAuditors.title,
    description: SEO.forAuditors.description,
    url: 'https://www.fitforpdf.com/for-auditors',
  },
  twitter: { card: 'summary_large_image' },
};

const PAIN_POINTS = [
  {
    title: 'Wide tables get cut off',
    description:
      'Audit reports with dozens of columns are truncated when exported to PDF, leaving critical data invisible to clients and regulators.',
  },
  {
    title: 'Manual reformatting wastes hours',
    description:
      'Auditors spend time splitting sheets, adjusting column widths, and re-exporting just to get a readable PDF.',
  },
  {
    title: 'Reference columns disappear',
    description:
      'When you split wide tables across pages, entity names and account references are lost on continuation pages.',
  },
];

const BENEFITS = [
  {
    title: 'Automatic column grouping',
    description:
      'fitforpdf detects wide tables and splits them into logical column groups that fit cleanly on each page.',
  },
  {
    title: 'Reference columns preserved',
    description:
      'Key identifier columns are repeated on every continuation page so readers always know what they are looking at.',
  },
  {
    title: 'Clean pagination',
    description:
      'Page breaks are placed intelligently between logical sections, not in the middle of a data row.',
  },
];

const BREADCRUMB_LD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.fitforpdf.com' },
    { '@type': 'ListItem', position: 2, name: 'For Auditors', item: 'https://www.fitforpdf.com/for-auditors' },
  ],
};

const AUDITORS_FAQ_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can fitforpdf handle audit reports with dozens of columns?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. fitforpdf automatically splits wide tables into readable sections, grouping columns logically and preserving reference columns on every page.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are reference columns preserved across pages?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Key identifier columns like entity names and account references are automatically repeated on every continuation page.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my audit data secure?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Files are processed in France, deleted immediately after conversion, and no content is stored. GDPR compliant.',
      },
    },
  ],
};

export default function ForAuditorsPage() {
  return (
    <>
      <JsonLd data={BREADCRUMB_LD} />
      <JsonLd data={AUDITORS_FAQ_LD} />
      <VerticalPage
      vertical="For Auditors"
      headline="Audit reports that actually fit on the page"
      subheadline="Convert wide Excel audit tables to clean, paginated PDFs without losing a single column."
      painPoints={PAIN_POINTS}
      benefits={BENEFITS}
      ctaText="Try it free"
    />
    </>
  );
}
