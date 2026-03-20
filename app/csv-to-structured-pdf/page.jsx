import { SEO } from '../siteCopy.mjs';
import { JsonLd } from '../components/JsonLd';

export const metadata = {
  title: SEO.csvPdf.title,
  description: SEO.csvPdf.description,
  alternates: { canonical: `/${SEO.csvPdf.slug}` },
  openGraph: {
    title: SEO.csvPdf.title,
    description: SEO.csvPdf.description,
    url: `${SEO.siteUrl}/${SEO.csvPdf.slug}`,
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.csvPdf.title,
    description: SEO.csvPdf.description,
  },
};

const faqs = [
  {
    q: 'Why are wide CSV files hard to export as PDF?',
    a: 'CSV has no layout metadata. PDF converters render raw text with no table structure, resulting in columns that spill off the page.',
  },
  {
    q: 'How do I convert a CSV file to a formatted PDF?',
    a: 'Import the CSV into Excel or Google Sheets, apply print layout settings, then export. Or upload directly to fitforpdf which handles formatting automatically.',
  },
  {
    q: 'How do I make a CSV look professional as a PDF?',
    a: 'The key is adding structure: column groupings, an overview page, paginated sections with row ranges, and repeated reference columns. fitforpdf does all of this automatically.',
  },
  {
    q: 'What is the best way to convert a large CSV to PDF?',
    a: 'For large CSVs with many columns, a sectioned approach works best. fitforpdf splits wide data into manageable column groups, each with its own page.',
  },
  {
    q: 'Will fitforpdf preserve my CSV column structure?',
    a: 'Yes — fitforpdf reads the CSV, groups columns into sections, and produces a paginated PDF where every column is readable.',
  },
];

const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: SEO.csvPdf.title,
  description: SEO.csvPdf.description,
  url: `${SEO.siteUrl}/${SEO.csvPdf.slug}`,
  publisher: { '@type': 'Organization', name: 'fitforpdf', url: SEO.siteUrl },
};

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SEO.siteUrl },
    { '@type': 'ListItem', position: 2, name: SEO.csvPdf.title, item: `${SEO.siteUrl}/${SEO.csvPdf.slug}` },
  ],
};

export default function CsvPdfPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-hero)]">
    <main className="mx-auto max-w-[720px] px-4 py-20 sm:px-6">
      <JsonLd data={articleLd} />
      <JsonLd data={faqLd} />
      <JsonLd data={breadcrumbLd} />
      <h1 className="mb-6 text-[2rem] font-semibold leading-[1.1] tracking-tight text-[var(--color-text)] sm:text-[2.5rem]">
        Convert CSV files to a structured, readable PDF
      </h1>
      <p className="mb-10 text-[1.0625rem] leading-relaxed text-[var(--color-muted)]">
        Large CSV files are hard to share as PDFs — columns overflow and layout breaks. This guide
        shows how to convert CSV to a clean, structured PDF with proper sections and pagination.
      </p>

      <h2 className="mb-3 text-xl font-semibold text-[var(--color-text)]">Why CSV to PDF is hard</h2>
      <p className="mb-8 leading-relaxed text-[var(--color-muted)]">
        CSV files contain only raw data — no layout metadata. When you export a CSV directly to
        PDF, the result is an unformatted text dump with no columns, no headers, and no pagination.
      </p>

      <h2 className="mb-3 text-xl font-semibold text-[var(--color-text)]">Manual workarounds</h2>
      <ul className="mb-8 list-disc pl-6 leading-relaxed text-[var(--color-muted)]">
        <li>Import CSV into Excel, then adjust print layout</li>
        <li>Use Google Sheets → File → Download → PDF (limited control)</li>
        <li>Use a PDF printer with page fit options</li>
      </ul>

      <h2 className="mb-3 text-xl font-semibold text-[var(--color-text)]">Limitations of manual methods</h2>
      <p className="mb-8 leading-relaxed text-[var(--color-muted)]">
        For CSVs with many columns, manual methods require significant formatting work. Column
        widths need adjustment, headers may not repeat across pages, and wide data gets truncated.
      </p>

      <h2 className="mb-3 text-xl font-semibold text-[var(--color-text)]">Structured PDF with fitforpdf</h2>
      <p className="mb-8 leading-relaxed text-[var(--color-muted)]">
        fitforpdf reads your CSV, detects wide column layouts, and automatically produces a
        sectioned PDF — with an overview page, grouped column sections, and row ranges on every
        page. No configuration needed.
      </p>

      <section data-testid="seo-faq" className="mb-12 border-t border-[var(--color-border)]">
        <h2 className="py-6 text-xl font-semibold text-[var(--color-text)]">Frequently asked questions</h2>
        <div className="divide-y divide-[var(--color-border)]">
          {faqs.map(({ q, a }) => (
            <div key={q} className="py-5">
              <h3 className="mb-1 font-semibold text-[var(--color-text)]">{q}</h3>
              <p className="leading-relaxed text-[var(--color-muted)]">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <section data-testid="seo-cta" className="rounded-2xl bg-[var(--color-bg-hero)] px-6 py-8 text-center">
        <h2 className="mb-2 text-xl font-semibold text-[var(--color-text)]">Convert your CSV to PDF now</h2>
        <p className="mb-5 text-[var(--color-muted)]">
          Upload your CSV and get a clean, structured PDF in seconds. 3 free exports. No account needed.
        </p>
        <a
          href="/"
          className="inline-block rounded-xl bg-[#0F172A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/80"
        >
          Generate your first PDF — free
        </a>
      </section>
    </main>
    </div>
  );
}
