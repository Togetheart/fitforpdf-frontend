import VerticalPage from '../components/VerticalPage';

export const metadata = {
  title: 'Excel to PDF for Consultants | fitforpdf',
  description:
    'Stop manually formatting client deliverables. fitforpdf converts Excel spreadsheets to professional, consistent PDFs with drag-and-drop simplicity.',
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

export default function ForConsultantsPage() {
  return (
    <VerticalPage
      vertical="For Consultants"
      headline="Client deliverables, formatted in seconds"
      subheadline="Convert Excel spreadsheets to polished PDFs without touching a single column width."
      painPoints={PAIN_POINTS}
      benefits={BENEFITS}
      ctaText="Try it free"
    />
  );
}
