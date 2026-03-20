import VerticalPage from '../components/VerticalPage';

export const metadata = {
  title: 'Excel to PDF for Finance Teams | fitforpdf',
  description:
    'Convert wide financial statements and reports to paginated PDFs without truncated columns. Intelligent splitting, automatic pagination, and overview pages.',
  alternates: { canonical: '/for-finance' },
  openGraph: {
    title: 'Excel to PDF for Finance Teams | fitforpdf',
    description:
      'Convert wide financial statements and reports to paginated PDFs without truncated columns.',
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

export default function ForFinancePage() {
  return (
    <VerticalPage
      vertical="For Finance Teams"
      headline="Financial reports that print perfectly"
      subheadline="Turn wide Excel financial statements into clean, multi-page PDFs with every column intact."
      painPoints={PAIN_POINTS}
      benefits={BENEFITS}
      ctaText="Try it free"
    />
  );
}
