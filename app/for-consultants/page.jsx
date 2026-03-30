import VerticalPage from '../components/VerticalPage';
import { JsonLd } from '../components/JsonLd';

export const metadata = {
  title: 'Excel to PDF for Consultants',
  description:
    'Stop manually formatting client deliverables. fitforpdf converts Excel spreadsheets to professional, consistent PDFs with drag-and-drop simplicity.',
  alternates: { canonical: '/for-consultants' },
  openGraph: {
    title: 'Excel to PDF for Consultants',
    description:
      'Stop manually formatting client deliverables. fitforpdf converts Excel spreadsheets to professional, consistent PDFs.',
    url: 'https://www.fitforpdf.com/for-consultants',
  },
  twitter: { card: 'summary_large_image' },
};

const PAIN_POINTS = [
  {
    title: 'Manual formatting for every client',
    description:
      'Each deliverable requires adjusting column widths, margins, and page breaks before it looks presentable.',
  },
  {
    title: 'Inconsistent output across projects',
    description:
      'Different analysts produce different-looking PDFs, undermining your firm\'s professional image.',
  },
  {
    title: 'Last-minute revisions break the layout',
    description:
      'A single data change means re-doing all the formatting work to get the PDF right again.',
  },
];

const BENEFITS = [
  {
    title: 'Drag-and-drop conversion',
    description:
      'Upload any Excel file and get a paginated, print-ready PDF in seconds, no formatting skills required.',
  },
  {
    title: 'Professional, consistent output',
    description:
      'Every PDF follows the same clean structure regardless of who on your team generates it.',
  },
  {
    title: 'Instant re-export on changes',
    description:
      'When the data changes, upload the new file and get an updated PDF immediately, no re-formatting needed.',
  },
];

const BREADCRUMB_LD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.fitforpdf.com' },
    { '@type': 'ListItem', position: 2, name: 'For Consultants', item: 'https://www.fitforpdf.com/for-consultants' },
  ],
};

const CONSULTANTS_FAQ_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can fitforpdf produce consistent PDFs across my team?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Every PDF follows the same clean structure regardless of who on your team generates it. No manual formatting differences.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens when the data changes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Upload the updated file and get a new PDF immediately. No re-formatting needed — the layout adapts automatically.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need to reformat my spreadsheet before uploading?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Upload the file you already have. fitforpdf handles column grouping, pagination, and layout automatically.',
      },
    },
  ],
};

export default function ForConsultantsPage() {
  return (
    <>
      <JsonLd data={BREADCRUMB_LD} />
      <JsonLd data={CONSULTANTS_FAQ_LD} />
      <VerticalPage
      vertical="For Consultants"
      headline="Client deliverables, formatted in seconds"
      subheadline="Convert Excel spreadsheets to polished PDFs without touching a single column width."
      painPoints={PAIN_POINTS}
      benefits={BENEFITS}
      ctaText="Try it free"
    />
    </>
  );
}
