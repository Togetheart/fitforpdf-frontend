import { SEO } from '../siteCopy.mjs';
import { JsonLd } from '../components/JsonLd';

export const metadata = {
  title: SEO.auditPdf.title,
  description: SEO.auditPdf.description,
  alternates: { canonical: `/${SEO.auditPdf.slug}` },
  openGraph: {
    title: SEO.auditPdf.title,
    description: SEO.auditPdf.description,
    url: `${SEO.siteUrl}/${SEO.auditPdf.slug}`,
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.auditPdf.title,
    description: SEO.auditPdf.description,
  },
};

const faqs = [
  {
    q: 'Why are audit Excel sheets so hard to export to PDF?',
    a: 'Audit working papers carry a lot more than data: tickmarks, sign-off cells, color-coded review notes, cross-references between tabs, and totals that must reconcile. A naive PDF export breaks the visual structure that auditors and reviewers rely on.',
  },
  {
    q: 'How do I export an audit working paper from Excel to PDF without losing the trail?',
    a: 'Set print titles to repeat reference columns (index, lead schedule, sample ID), keep one row per record (avoid wrapping), and switch to landscape with explicit page breaks at section boundaries. For working papers wider than 15 columns, group into multiple sections instead of scaling down.',
  },
  {
    q: 'How can I keep tickmarks, initials, and review marks visible in the PDF?',
    a: 'Print at 100% scale (do NOT use Scale to Fit), use a base font of at least 9pt, and check Page Layout → Sheet Options → Print: "Cell errors as: <blank>" so #N/A or formula errors don\'t obscure tickmarks.',
  },
  {
    q: 'What page setup should I use for an audit leadsheet?',
    a: 'Landscape orientation, narrow margins, repeat columns A:C (typically Index, Account, Description) on every page via Page Layout → Print Titles, fit to 1 page wide (not tall), and add a footer with workpaper reference + page number.',
  },
  {
    q: 'How do I handle audit reports with 30+ columns?',
    a: 'Manual fixes (scale, landscape, hide columns) reach their limit around 15 columns. Beyond that, the cleanest approach is column-group sectioning: split the table into thematic sections (e.g., Identifier + Balances, Identifier + Variances, Identifier + Notes) with the reference columns repeated. fitforpdf does this automatically.',
  },
  {
    q: 'Does fitforpdf preserve audit-trail integrity?',
    a: 'Yes. Files are processed in EU servers, deleted immediately after rendering, never touched by any LLM. Row order, totals, and column data are preserved 1:1, the engine only restructures layout, never data.',
  },
];

const howToLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Export an audit Excel working paper to PDF',
  description:
    'Six concrete steps to export wide audit working papers to a PDF that stakeholders can review without losing the audit trail.',
  totalTime: 'PT10M',
  step: [
    { '@type': 'HowToStep', name: 'Trim what reviewers do not need', text: 'Hide internal formula columns, draft tabs, and scratch calculations before exporting.' },
    { '@type': 'HowToStep', name: 'Lock reference columns to repeat', text: 'Page Layout → Print Titles → Columns to repeat at left: $A:$C (index, lead schedule, sample ID).' },
    { '@type': 'HowToStep', name: 'Pick the right orientation', text: 'Landscape for sheets up to ~15 columns. Beyond that, plan for sectioning.' },
    { '@type': 'HowToStep', name: 'Print at 100% scale', text: 'Do not use Scale to Fit on audit data, small text breaks readability and erases tickmarks.' },
    { '@type': 'HowToStep', name: 'Add a workpaper footer', text: 'Insert → Header & Footer → put the workpaper reference (e.g. A-1.2), date, preparer initials, page number.' },
    { '@type': 'HowToStep', name: 'Section wide tables', text: 'For 20+ columns, split into column groups with the identifier columns repeated. Tools like fitforpdf automate this.' },
  ],
};

const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: SEO.auditPdf.title,
  description: SEO.auditPdf.description,
  url: `${SEO.siteUrl}/${SEO.auditPdf.slug}`,
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
    { '@type': 'ListItem', position: 2, name: SEO.auditPdf.title, item: `${SEO.siteUrl}/${SEO.auditPdf.slug}` },
  ],
};

export default function AuditPdfPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-hero)]">
      <div className="mx-auto max-w-[760px] px-4 py-20 sm:px-6">
        <JsonLd data={articleLd} />
        <JsonLd data={howToLd} />
        <JsonLd data={faqLd} />
        <JsonLd data={breadcrumbLd} />

        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
          Audit Excel → PDF
        </p>
        <h1 className="mb-6 text-3xl font-semibold leading-[1.1] tracking-tight text-[var(--color-text)] sm:text-4xl">
          Exporting audit working papers to PDF: a practical guide
        </h1>
        <p className="mb-10 text-base leading-relaxed text-[var(--color-muted)]">
          Audit reports aren&apos;t marketing decks. They carry tickmarks,
          cross-references, sign-offs, and totals that must reconcile across
          pages. Standard Excel export tools break this structure. Below are
          six tested techniques, and where they hit their limit.
        </p>

        {/* Tip 1 */}
        <h2 className="mb-2 text-xl font-semibold text-[var(--color-text)]">
          1. Trim before you export
        </h2>
        <p className="mb-3 leading-relaxed text-[var(--color-muted)]">
          Reviewers don&apos;t need every working column. Before exporting:
        </p>
        <ul className="mb-8 list-disc space-y-1 pl-6 leading-relaxed text-[var(--color-muted)]">
          <li>Hide internal formula columns (helper columns used for calculations only).</li>
          <li>Hide draft or scratch tabs that aren&apos;t part of the deliverable.</li>
          <li>Clear conditional formatting that doesn&apos;t print well (light pastels become invisible at print scale).</li>
        </ul>

        {/* Tip 2 */}
        <h2 className="mb-2 text-xl font-semibold text-[var(--color-text)]">
          2. Lock the reference columns to repeat
        </h2>
        <p className="mb-3 leading-relaxed text-[var(--color-muted)]">
          This is the single biggest fix for multi-page audit PDFs.
          <strong className="font-semibold text-[var(--color-text)]"> Page Layout → Print Titles → Columns to repeat at left</strong>:
          set this to your identifier columns (typically index, lead schedule
          reference, sample ID).
        </p>
        <p className="mb-8 leading-relaxed text-[var(--color-muted)]">
          Without this, page 2 of a sample-selection schedule shows a list of
          balances with no way to trace each one back to its account or
          tested item.
        </p>

        {/* Tip 3 */}
        <h2 className="mb-2 text-xl font-semibold text-[var(--color-text)]">
          3. Pick the orientation deliberately
        </h2>
        <p className="mb-3 leading-relaxed text-[var(--color-muted)]">
          A quick heuristic:
        </p>
        <ul className="mb-8 list-disc space-y-1 pl-6 leading-relaxed text-[var(--color-muted)]">
          <li><strong className="font-semibold text-[var(--color-text)]">Up to 8 columns</strong>, portrait works fine.</li>
          <li><strong className="font-semibold text-[var(--color-text)]">9 to 15 columns</strong>, landscape, fit-to-1-page-wide.</li>
          <li><strong className="font-semibold text-[var(--color-text)]">16+ columns</strong>, landscape is no longer enough. Plan to section (see tip 6).</li>
        </ul>

        {/* Tip 4 */}
        <h2 className="mb-2 text-xl font-semibold text-[var(--color-text)]">
          4. Don&apos;t Scale to Fit
        </h2>
        <p className="mb-3 leading-relaxed text-[var(--color-muted)]">
          <strong className="font-semibold text-[var(--color-text)]">Scale to Fit</strong>{' '}
          shrinks everything until it crams onto one page. For an audit
          workpaper, this means:
        </p>
        <ul className="mb-3 list-disc space-y-1 pl-6 leading-relaxed text-[var(--color-muted)]">
          <li>Tickmarks become illegible.</li>
          <li>Initials and dates on sign-off cells get lost.</li>
          <li>Decimal alignment on totals breaks.</li>
        </ul>
        <p className="mb-8 leading-relaxed text-[var(--color-muted)]">
          Keep print scale at 100% and add an extra page instead. Reviewers
          will read it, they won&apos;t read 6pt.
        </p>

        {/* Tip 5 */}
        <h2 className="mb-2 text-xl font-semibold text-[var(--color-text)]">
          5. Add a workpaper footer
        </h2>
        <p className="mb-3 leading-relaxed text-[var(--color-muted)]">
          <strong className="font-semibold text-[var(--color-text)]">Insert → Header &amp; Footer</strong>.
          Build a footer that always carries:
        </p>
        <ul className="mb-8 list-disc space-y-1 pl-6 leading-relaxed text-[var(--color-muted)]">
          <li>Workpaper reference (e.g. <code className="rounded bg-[var(--color-bg)] px-1.5 py-0.5 text-sm">A-1.2</code>), left.</li>
          <li>Preparer initials + date, center.</li>
          <li>Page <code className="rounded bg-[var(--color-bg)] px-1.5 py-0.5 text-sm">N of M</code>, right.</li>
        </ul>

        {/* Tip 6, the FitForPDF wedge */}
        <h2 className="mb-2 text-xl font-semibold text-[var(--color-text)]">
          6. For 20+ columns: section instead of shrink
        </h2>
        <p className="mb-3 leading-relaxed text-[var(--color-muted)]">
          When a working paper crosses 20 columns (common for substantive
          testing schedules, tax provision rollforwards, or consolidation
          workings), no amount of margin tweaking saves it. The reliable fix
          is to split horizontally:
        </p>
        <ul className="mb-3 list-disc space-y-1 pl-6 leading-relaxed text-[var(--color-muted)]">
          <li><strong className="font-semibold text-[var(--color-text)]">Section A</strong>, identifier columns + opening balances</li>
          <li><strong className="font-semibold text-[var(--color-text)]">Section B</strong>, identifier columns + variances + tickmarks</li>
          <li><strong className="font-semibold text-[var(--color-text)]">Section C</strong>, identifier columns + notes + sign-off</li>
        </ul>
        <p className="mb-8 leading-relaxed text-[var(--color-muted)]">
          The identifier columns (index, account, amount) appear in every
          section so each row is always traceable. This is the structure that
          actually scales for audit reports.
        </p>

        {/* Reality-check / hand-off */}
        <section className="mb-12 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
            Doing this manually
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
            All six tips above are achievable in Excel, and most senior
            audit teams have a checklist exactly like this. But every export
            still takes 20 to 40 minutes of setup, and the result has to be
            redone every time the source data updates.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
            FitForPDF automates the whole pipeline: trims hidden columns,
            sections by groups, repeats identifiers, adds the structured
            footer, and ships the PDF in seconds. The processing is
            deterministic, EU-hosted, and files are deleted right after
            rendering, built for audit-grade confidentiality.
          </p>
        </section>

        {/* FAQ */}
        <section data-testid="seo-faq" className="mb-12 border-t border-[var(--color-border)]">
          <h2 className="py-6 text-xl font-semibold text-[var(--color-text)]">
            Frequently asked questions
          </h2>
          <div className="divide-y divide-[var(--color-border)]">
            {faqs.map(({ q, a }) => (
              <div key={q} className="py-5">
                <h3 className="mb-1 font-semibold text-[var(--color-text)]">{q}</h3>
                <p className="leading-relaxed text-[var(--color-muted)]">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related */}
        <nav className="mb-12 border-t border-[var(--color-border)] pt-8">
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
            Related guides
          </h2>
          <ul className="space-y-2 text-sm">
            <li><a href="/excel-to-pdf-columns-cut-off" className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-cta)]">Fix cut-off columns in Excel PDF export</a></li>
            <li><a href="/fit-excel-sheet-on-one-page-pdf" className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-cta)]">How to fit a large Excel sheet on one PDF page</a></li>
            <li><a href="/csv-to-structured-pdf" className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-cta)]">Convert CSV to structured, readable PDF</a></li>
            <li><a href="/excel-multiple-sheets-to-single-pdf" className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-cta)]">Combine multiple Excel sheets into a single PDF</a></li>
            <li><a href="/excel-pdf-text-too-small-fix" className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-cta)]">Excel PDF export text too small, fix</a></li>
            <li><a href="/for-auditors" className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-cta)]">FitForPDF for audit firms</a></li>
          </ul>
        </nav>

        {/* Final CTA */}
        <section data-testid="seo-cta" className="rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] px-6 py-8 text-center">
          <h2 className="mb-2 text-xl font-semibold text-[var(--color-text)]">
            Send a working paper that reviewers can actually use.
          </h2>
          <p className="mb-5 text-[var(--color-muted)]">
            Upload your Excel workpaper. Get a sectioned, identifier-locked
            PDF in seconds. 3 free exports, no account needed.
          </p>
          <a
            href="/app"
            className="inline-block rounded-xl bg-[#0F172A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/80"
          >
            Generate your first audit PDF, free
          </a>
        </section>
      </div>
    </div>
  );
}
