import { SEO } from '../siteCopy.mjs';
import { JsonLd } from '../components/JsonLd';

export const metadata = {
  title: SEO.fitOnePage.title,
  description: SEO.fitOnePage.description,
  alternates: { canonical: `/${SEO.fitOnePage.slug}` },
  openGraph: {
    title: SEO.fitOnePage.title,
    description: SEO.fitOnePage.description,
    url: `${SEO.siteUrl}/${SEO.fitOnePage.slug}`,
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.fitOnePage.title,
    description: SEO.fitOnePage.description,
  },
};

const faqs = [
  {
    q: "Why doesn't Excel fit large sheets on one PDF page well?",
    a: 'Fitting a large table onto one page can require shrinking its text. The result depends on column widths, row count, page size and scaling settings.',
  },
  {
    q: 'How do I make Excel print all columns on one page PDF?',
    a: 'In Excel, go to Page Layout → Scale to Fit and set Width to "1 page". Leave Height automatic if rows may continue onto more pages. To request a single page overall, also set Height to "1 page" and check the text size in Print Preview.',
  },
  {
    q: 'How do I fit a wide Excel spreadsheet into a readable PDF?',
    a: 'Compare landscape orientation, margins and scaling in Print Preview. If the text becomes too small, consider more pages or a layout that splits columns into sections with repeated identifiers.',
  },
  {
    q: 'Is fitting everything on one page always the best approach?',
    a: 'Not always. For sheets with many columns, structuring into readable sections often produces better results than shrinking to one page.',
  },
  {
    q: 'How does fitforpdf handle large sheets?',
    a: 'fitforpdf creates column sections with repeated key columns. Sections can span several pages; it does not guarantee a single-page result. For XLSX, it converts the first worksheet only.',
  },
];

const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: SEO.fitOnePage.title,
  description: SEO.fitOnePage.description,
  url: `${SEO.siteUrl}/${SEO.fitOnePage.slug}`,
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
    { '@type': 'ListItem', position: 2, name: SEO.fitOnePage.title, item: `${SEO.siteUrl}/${SEO.fitOnePage.slug}` },
  ],
};

export default function FitOnePagePage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-hero)]">
    <div className="mx-auto max-w-[720px] px-4 py-20 sm:px-6">
      <JsonLd data={articleLd} />
      <JsonLd data={faqLd} />
      <JsonLd data={breadcrumbLd} />
      <h1 className="mb-6 text-3xl font-semibold leading-[1.1] tracking-tight text-[var(--color-text)] sm:text-4xl">
        How to fit a large Excel sheet on one PDF page
      </h1>
      <p className="mb-10 text-base leading-relaxed text-[var(--color-muted)]">
        Excel can fit a worksheet onto one PDF page, but the resulting text size depends on the
        table and page settings. Compare a single page with a layout that uses more pages.
      </p>

      <h2 className="mb-3 text-xl font-semibold text-[var(--color-text)]">Step 1, Page layout &amp; scaling</h2>
      <p className="mb-8 leading-relaxed text-[var(--color-muted)]">
        Go to Page Layout → Scale to Fit. Set Width and Height to 1 page to request a single
        page overall. Setting only Width to 1 page allows rows to continue onto additional pages.
        Check Print Preview: shrinking a large table may make its text too small.
      </p>

      <h2 className="mb-3 text-xl font-semibold text-[var(--color-text)]">Step 2, Landscape orientation</h2>
      <p className="mb-8 leading-relaxed text-[var(--color-muted)]">
        Switch to Landscape in Page Layout → Orientation to give columns more horizontal space.
        Whether they fit depends on their widths, the paper size and the margins.
      </p>

      <h2 className="mb-3 text-xl font-semibold text-[var(--color-text)]">Step 3, Adjust margins &amp; page breaks</h2>
      <p className="mb-8 leading-relaxed text-[var(--color-muted)]">
        Narrow margins (File → Print → Custom Margins) and manual page breaks (View → Page Break
        Preview) let you control where content splits, but it requires careful manual tuning.
      </p>

      <h2 className="mb-3 text-xl font-semibold text-[var(--color-text)]">Limitations of fitting on one page</h2>
      <p className="mb-8 leading-relaxed text-[var(--color-muted)]">
        Column count alone cannot tell you whether a table will be readable on one page.
        Check long values, headings and the intended print size. If the text is too small,
        allow more pages or try a layout that separates column groups.
      </p>

      <h2 className="mb-3 text-xl font-semibold text-[var(--color-text)]">Smarter alternative: structured sections</h2>
      <p className="mb-8 leading-relaxed text-[var(--color-muted)]">
        fitforpdf creates a new layout for tabular data, with column sections and repeated key
        columns. Sections can span several pages. It converts the first worksheet only from an
        XLSX file and does not reproduce the original workbook formatting. Compare the preview
        with your source before sharing it.
      </p>

      <section data-testid="seo-example" className="mb-12">
        <h2 className="mb-3 text-xl font-semibold text-[var(--color-text)]">Conceptual example</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <figure className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
            <figcaption className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              Budget table to lay out
            </figcaption>
            <pre className="overflow-x-auto whitespace-pre-wrap text-[11px] leading-snug text-[var(--color-muted)]">
{`Account | Actual | Budget | Variance | Notes
One-page scaling keeps the table together but may shrink its text.`}
            </pre>
          </figure>
          <figure className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
            <figcaption className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              Possible sections with a repeated account column
            </figcaption>
            <pre className="overflow-x-auto whitespace-pre-wrap text-[11px] leading-snug text-[var(--color-muted)]">
{`Amounts: Account | Actual | Budget | Variance
Notes:   Account | Notes
Actual grouping, text size and pagination depend on your data.`}
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
          <li><a href="/excel-to-pdf-columns-cut-off" className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-cta)]">Fix cut-off columns in Excel PDF export</a></li>
          <li><a href="/excel-multiple-sheets-to-single-pdf" className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-cta)]">Combine multiple Excel sheets into a single PDF</a></li>
          <li><a href="/excel-pdf-text-too-small-fix" className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-cta)]">Fix Excel PDF export text that's too small to read</a></li>
          <li><a href="/csv-to-structured-pdf" className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-cta)]">Convert CSV to structured, readable PDF</a></li>
          <li><a href="/audit-report-excel-to-pdf-tips" className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-cta)]">Export audit Excel sheets to PDF, best practices</a></li>
        </ul>
      </nav>

      <section data-testid="seo-cta" className="rounded-2xl bg-[var(--color-bg-hero)] px-6 py-8 text-center">
        <h2 className="mb-2 text-xl font-semibold text-[var(--color-text)]">Ready to export your sheet cleanly?</h2>
        <p className="mb-5 text-[var(--color-muted)]">
          Try a sectioned layout for your table and inspect the preview. 3 free exports with a watermark.
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
