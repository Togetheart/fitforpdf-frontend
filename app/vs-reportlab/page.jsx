import VsPage from '../components/VsPage';
import { JsonLd } from '../components/JsonLd';

export const metadata = {
  title: 'fitforpdf vs ReportLab – Spreadsheet to PDF comparison',
  description:
    'Compare fitforpdf and ReportLab for turning spreadsheet data into PDFs. See how automatic layout replaces hundreds of lines of Python code.',
  alternates: { canonical: '/vs-reportlab' },
  openGraph: {
    title: 'fitforpdf vs ReportLab – Spreadsheet to PDF comparison',
    description:
      'Compare fitforpdf and ReportLab for spreadsheet-to-PDF conversion. Automatic layout vs verbose Python code.',
    url: 'https://www.fitforpdf.com/vs-reportlab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'fitforpdf vs ReportLab',
    description:
      'Compare fitforpdf and ReportLab for converting spreadsheets to PDF.',
  },
};

const COMPARISON_ROWS = [
  ['Developer experience', 'Verbose Python API', 'Upload or single API call'],
  ['Table handling', 'Manual table construction cell by cell', 'Automatic table detection and layout'],
  ['Column splitting', 'Must code column grouping logic manually', 'Automatic section grouping'],
  ['Page breaks', 'Manual calculation of row heights', 'Intelligent automatic pagination'],
  ['Output quality', 'High — full pixel control', 'High — structured, client-ready documents'],
  ['Learning curve', 'Steep — Platypus framework, Flowables, etc.', 'None — upload and go'],
  ['Language dependency', 'Python only', 'Language-agnostic REST API'],
];

const PROS_AND_CONS = {
  pros: [
    'Native Python library — no external dependencies',
    'Fine-grained control over every element on the page',
    'Mature and battle-tested in enterprise environments',
    'Can generate complex multi-section reports',
  ],
  cons: [
    'Verbose code — even simple tables require dozens of lines',
    'Manual table splitting across pages is error-prone',
    'Steep learning curve with Platypus, Flowables, and Frames',
    'No automatic column intelligence for wide datasets',
    'Python-only — not usable from other tech stacks without wrappers',
  ],
};

const BREADCRUMB_LD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.fitforpdf.com' },
    { '@type': 'ListItem', position: 2, name: 'fitforpdf vs ReportLab', item: 'https://www.fitforpdf.com/vs-reportlab' },
  ],
};

export default function VsReportlabPage() {
  return (
    <>
      <JsonLd data={BREADCRUMB_LD} />
      <VsPage
      tool="ReportLab"
      toolDescription="ReportLab is a Python library for programmatic PDF generation with fine-grained layout control. fitforpdf replaces hundreds of lines of table-splitting code with a single API call."
      comparisonRows={COMPARISON_ROWS}
      prosAndCons={PROS_AND_CONS}
      ctaText="Try fitforpdf free"
    />
    </>
  );
}
