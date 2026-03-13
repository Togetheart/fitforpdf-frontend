import VerticalPage from '../components/VerticalPage';

export const metadata = {
  title: 'Excel to PDF for Auditors | fitforpdf',
  description:
    'Stop losing audit table columns in PDF exports. fitforpdf automatically groups columns, preserves reference data, and produces clean paginated PDFs from wide Excel audit reports.',
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

export default function ForAuditorsPage() {
  return (
    <VerticalPage
      vertical="For Auditors"
      headline="Audit reports that actually fit on the page"
      subheadline="Convert wide Excel audit tables to clean, paginated PDFs without losing a single column."
      painPoints={PAIN_POINTS}
      benefits={BENEFITS}
      ctaText="Try it free"
    />
  );
}
