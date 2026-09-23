import { SEO } from '../siteCopy.mjs';
import { JsonLd } from '../components/JsonLd';

export const metadata = {
  title: SEO.excelCutoff.title,
  description: SEO.excelCutoff.description,
  alternates: { canonical: `/${SEO.excelCutoff.slug}` },
  openGraph: {
    title: SEO.excelCutoff.title,
    description: SEO.excelCutoff.description,
    url: `${SEO.siteUrl}/${SEO.excelCutoff.slug}`,
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.excelCutoff.title,
    description: SEO.excelCutoff.description,
  },
};

const faqs = [
  {
    q: 'Why does Excel cut off columns in PDF exports?',
    a: 'Check the print area, hidden columns and page breaks. Columns outside the print area are excluded, while a wide print area can continue onto additional pages or shrink depending on scaling settings.',
  },
  {
    q: 'How do I stop Excel from cutting off columns when printing to PDF?',
    a: 'Check that the print area includes the intended columns. In Page Layout → Scale to Fit, setting Width to 1 page can fit them horizontally, but inspect the text size. You can also allow more pages or split the table into sections.',
  },
  {
    q: 'Why does my Excel PDF only show half the columns?',
    a: 'The print area may exclude columns, some columns may be hidden, or the remaining columns may be on later pages. Inspect Print Preview and adjust the print area before changing tools.',
  },
  {
    q: 'Can I fix cut-off columns without a tool?',
    a: 'Yes. Adjust the print area, scaling, orientation and margins, then inspect all pages in Print Preview. Allowing more pages can preserve text size.',
  },
  {
    q: 'Does fitforpdf preserve all columns?',
    a: 'fitforpdf distributes the selected table columns across sections and repeats key columns for context. For XLSX files, it reads the first worksheet only; hidden or excluded columns are not included. Check the preview against your source table.',
  },
];

const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: SEO.excelCutoff.title,
  description: SEO.excelCutoff.description,
  url: `${SEO.siteUrl}/${SEO.excelCutoff.slug}`,
  dateModified: '2026-09-23',
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
    { '@type': 'ListItem', position: 2, name: SEO.excelCutoff.title, item: `${SEO.siteUrl}/${SEO.excelCutoff.slug}` },
  ],
};

export default function ExcelCutoffPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-hero)]">
    <div className="mx-auto max-w-[720px] px-4 py-20 sm:px-6">
      <JsonLd data={articleLd} />
      <JsonLd data={faqLd} />
      <JsonLd data={breadcrumbLd} />
      <h1 className="mb-6 text-3xl font-semibold leading-[1.1] tracking-tight text-[var(--color-text)] sm:text-4xl">
        Why Excel cuts off columns when exporting to PDF (And how to fix it)
      </h1>
      <p className="mb-10 text-base leading-relaxed text-[var(--color-muted)]">
        Exporting a wide Excel sheet to PDF often results in cut-off columns. This guide explains
        why it happens and how to fix it, with and without external tools.
      </p>

      <h2 className="mb-3 text-xl font-semibold text-[var(--color-text)]">Why Excel PDF export breaks on wide sheets</h2>
      <p className="mb-8 leading-relaxed text-[var(--color-muted)]">
        Excel exports the configured print area using the selected page size and scaling.
        Columns can be excluded by the print area, continue onto later pages, or become
        small when the whole table is scaled down. Inspect the preview to identify which applies.
      </p>

      <h2 className="mb-3 text-xl font-semibold text-[var(--color-text)]">Manual workarounds</h2>
      <ul className="mb-8 list-disc pl-6 leading-relaxed text-[var(--color-muted)]">
        <li>Check that the print area includes the columns you want</li>
        <li>Compare scaling to one page wide with allowing several pages</li>
        <li>Switch orientation to Landscape</li>
        <li>Adjust column widths and margins while checking text size</li>
        <li>Repeat identifier columns with Print Titles when using several pages</li>
      </ul>

      <h2 className="mb-3 text-xl font-semibold text-[var(--color-text)]">Limitations of manual fixes</h2>
      <p className="mb-8 leading-relaxed text-[var(--color-muted)]">
        Scaling can make text too small. Landscape adds width, but the result also depends on
        column widths and page size. If you split the table across pages, repeated identifiers
        help readers connect the data.
      </p>

      <h2 className="mb-3 text-xl font-semibold text-[var(--color-text)]">Structured export with fitforpdf</h2>
      <p className="mb-8 leading-relaxed text-[var(--color-muted)]">
        fitforpdf creates a new table layout with column sections and repeated key columns.
        Sections can span several pages. Upload a tabular CSV or XLSX with a clear header row;
        for XLSX, only the first worksheet is read. Review the preview before sharing.
      </p>

      <section data-testid="seo-example" className="mb-12">
        <h2 className="mb-3 text-xl font-semibold text-[var(--color-text)]">Conceptual example</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <figure className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
            <figcaption className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              A source table with contact and deal fields
            </figcaption>
            <pre className="overflow-x-auto whitespace-pre-wrap text-[11px] leading-snug text-[var(--color-muted)]">
{`Name | Company | Email | Stage | Deal value
Check that the Excel print area includes every field you need.`}
            </pre>
          </figure>
          <figure className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
            <figcaption className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              Possible groups with repeated identifiers
            </figcaption>
            <pre className="overflow-x-auto whitespace-pre-wrap text-[11px] leading-snug text-[var(--color-muted)]">
{`Contact fields: Name | Company | Email
Deal fields:    Name | Company | Stage | Deal value
Actual grouping and pagination depend on the file and settings.`}
            </pre>
          </figure>
        </div>
        <p className="mt-2 text-xs text-[var(--color-muted)]">Conceptual diagram, not a measured result. Check the PDF produced from your own file.</p>
      </section>

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

      <nav className="mb-12 border-t border-[var(--color-border)] pt-8">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Related guides</h2>
        <ul className="space-y-2 text-sm">
          <li><a href="/fit-excel-sheet-on-one-page-pdf" className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-cta)]">How to fit a large Excel sheet on one PDF page</a></li>
          <li><a href="/excel-multiple-sheets-to-single-pdf" className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-cta)]">Combine multiple Excel sheets into a single PDF</a></li>
          <li><a href="/excel-pdf-text-too-small-fix" className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-cta)]">Fix Excel PDF export text that's too small to read</a></li>
          <li><a href="/csv-to-structured-pdf" className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-cta)]">Convert CSV to structured, readable PDF</a></li>
          <li><a href="/audit-report-excel-to-pdf-tips" className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-cta)]">Export audit Excel sheets to PDF, best practices</a></li>
        </ul>
      </nav>

      <section data-testid="seo-cta" className="rounded-2xl bg-[var(--color-bg-hero)] px-6 py-8 text-center">
        <h2 className="mb-2 text-xl font-semibold text-[var(--color-text)]">Fix your Excel export now</h2>
        <p className="mb-5 text-[var(--color-muted)]">
          Try a new layout for your table and inspect the preview. 3 free exports with a watermark.
        </p>
        <a
          href="/"
          className="inline-block rounded-xl bg-[#0F172A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/80"
        >
          Generate your first PDF, free
        </a>
      </section>
    </div>
    </div>
  );
}
