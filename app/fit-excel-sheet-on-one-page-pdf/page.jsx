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
    a: 'Because Excel uses strict page boundaries and scales down content, making large sheets either illegible or split unexpectedly.',
  },
  {
    q: 'How do I make Excel print all columns on one page PDF?',
    a: 'In Excel, go to Page Layout → Scale to Fit and set Width to "1 page". This works for sheets up to ~15 columns. Beyond that, text becomes too small to read.',
  },
  {
    q: 'How do I fit a wide Excel spreadsheet into a readable PDF?',
    a: 'For sheets with many columns, landscape orientation and margin reduction help, but structured sectioning (grouping columns by theme) produces far more readable results.',
  },
  {
    q: 'Is fitting everything on one page always the best approach?',
    a: 'Not always. For sheets with many columns, structuring into readable sections often produces better results than shrinking to one page.',
  },
  {
    q: 'How does fitforpdf handle large sheets?',
    a: 'fitforpdf groups columns into sections with repeated reference columns, each section fits on a page without scaling distortion.',
  },
];

const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: SEO.fitOnePage.title,
  description: SEO.fitOnePage.description,
  url: `${SEO.siteUrl}/${SEO.fitOnePage.slug}`,
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
        If your sheet is too wide, Excel&#39;s default export may shrink or cut content. Learn
        manual steps and better automated solutions for large spreadsheets.
      </p>

      <h2 className="mb-3 text-xl font-semibold text-[var(--color-text)]">Step 1, Page layout &amp; scaling</h2>
      <p className="mb-8 leading-relaxed text-[var(--color-muted)]">
        Go to Page Layout → Scale to Fit and set Width to 1 page. This forces Excel to compress
        the sheet horizontally, but very wide sheets become unreadable.
      </p>

      <h2 className="mb-3 text-xl font-semibold text-[var(--color-text)]">Step 2, Landscape orientation</h2>
      <p className="mb-8 leading-relaxed text-[var(--color-muted)]">
        Switch to Landscape in Page Layout → Orientation. This gives you more horizontal space
        and works well for sheets up to about 15 columns.
      </p>

      <h2 className="mb-3 text-xl font-semibold text-[var(--color-text)]">Step 3, Adjust margins &amp; page breaks</h2>
      <p className="mb-8 leading-relaxed text-[var(--color-muted)]">
        Narrow margins (File → Print → Custom Margins) and manual page breaks (View → Page Break
        Preview) let you control where content splits, but it requires careful manual tuning.
      </p>

      <h2 className="mb-3 text-xl font-semibold text-[var(--color-text)]">Limitations of fitting on one page</h2>
      <p className="mb-8 leading-relaxed text-[var(--color-muted)]">
        For sheets with 20+ columns, fitting on one page means tiny, unreadable text. Clients
        receiving these PDFs often can&#39;t read the data without zooming in. Structured sectioning
        is often a better alternative.
      </p>

      <h2 className="mb-3 text-xl font-semibold text-[var(--color-text)]">Smarter alternative: structured sections</h2>
      <p className="mb-8 leading-relaxed text-[var(--color-muted)]">
        Instead of squeezing everything on one page, fitforpdf automatically splits wide sheets
        into readable sections, each with its own page, repeated reference columns, and clear
        row ranges. The result is a professional, client-ready document.
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
          Upload your Excel file and get a structured, readable PDF in seconds. 3 free exports.
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
