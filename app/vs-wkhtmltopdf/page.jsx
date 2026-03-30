import VsPage from '../components/VsPage';
import { JsonLd } from '../components/JsonLd';

export const metadata = {
  title: 'fitforpdf vs wkhtmltopdf – Spreadsheet to PDF comparison',
  description:
    'Compare fitforpdf and wkhtmltopdf for converting spreadsheets to PDF. See how automatic column grouping and layout intelligence beat manual HTML-to-PDF configuration.',
  alternates: { canonical: '/vs-wkhtmltopdf' },
  openGraph: {
    title: 'fitforpdf vs wkhtmltopdf – Spreadsheet to PDF comparison',
    description:
      'Compare fitforpdf and wkhtmltopdf for converting spreadsheets to PDF. Automatic column grouping vs manual HTML-to-PDF configuration.',
    url: 'https://www.fitforpdf.com/vs-wkhtmltopdf',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'fitforpdf vs wkhtmltopdf',
    description:
      'Compare fitforpdf and wkhtmltopdf for converting spreadsheets to PDF.',
  },
};

const COMPARISON_ROWS = [
  ['Column handling', 'No column intelligence', 'Auto-groups wide columns into sections'],
  ['Layout', 'Manual HTML + CSS configuration', 'Automatic structured layout'],
  ['Page breaks', 'Relies on HTML page-break rules', 'Intelligent automatic pagination'],
  ['Reference columns', 'Must be coded into each page', 'Pinned and repeated automatically'],
  ['Setup', 'Install binary + write HTML templates', 'Upload a file, done'],
  ['Maintenance', 'Deprecated, no active development', 'Managed service, always up to date'],
  ['Table awareness', 'None — renders raw HTML', 'Built for tabular data'],
];

const PROS_AND_CONS = {
  pros: [
    'Open-source with a long track record',
    'Converts any HTML to PDF',
    'Works as a CLI tool in automated pipelines',
    'No runtime cost — runs locally',
  ],
  cons: [
    'Officially deprecated — no longer maintained',
    'No column intelligence or table-aware layout',
    'Requires writing and maintaining HTML templates',
    'Page breaks must be manually configured in CSS',
    'Wide tables are truncated or shrunk to unreadable sizes',
  ],
};

const BREADCRUMB_LD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.fitforpdf.com' },
    { '@type': 'ListItem', position: 2, name: 'fitforpdf vs wkhtmltopdf', item: 'https://www.fitforpdf.com/vs-wkhtmltopdf' },
  ],
};

export default function VsWkhtmltopdfPage() {
  return (
    <>
      <JsonLd data={BREADCRUMB_LD} />
      <VsPage
      tool="wkhtmltopdf"
      toolDescription="wkhtmltopdf converts HTML to PDF using a WebKit engine. It is open-source but deprecated. fitforpdf is purpose-built for tabular data with automatic column grouping and pagination."
      comparisonRows={COMPARISON_ROWS}
      prosAndCons={PROS_AND_CONS}
      ctaText="Try fitforpdf free"
    />
    </>
  );
}
