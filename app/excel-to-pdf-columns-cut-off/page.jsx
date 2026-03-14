import { SEO } from '../siteCopy.mjs';

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
    a: 'Because Excel fits content into a fixed page width and cannot expand beyond margin boundaries automatically. Wide sheets get truncated rather than restructured.',
  },
  {
    q: 'How do I stop Excel from cutting off columns when printing to PDF?',
    a: 'Go to Page Layout → Scale to Fit → set Width to 1 page. This compresses the sheet, but makes text very small on wide sheets. A better approach is to group columns into sections.',
  },
  {
    q: 'Why does my Excel PDF only show half the columns?',
    a: 'The sheet is wider than the page size. Excel prints only what fits within the print area. You can extend the print area or switch to a tool that sections wide data automatically.',
  },
  {
    q: 'Can I fix cut-off columns without a tool?',
    a: 'You can adjust page scaling, orientation, and margins — but this often distorts layout for sheets with many columns.',
  },
  {
    q: 'Does fitforpdf preserve all columns?',
    a: 'Yes — fitforpdf restructures the sheet into sections, so no column is cut off. Reference columns (ID, Name) are repeated on each section for context.',
  },
];

export default function ExcelCutoffPage() {
  return (
    <main className="mx-auto max-w-[720px] px-4 py-20 sm:px-6">
      <h1 className="mb-6 text-[2rem] font-[650] leading-[1.1] tracking-tight text-[var(--color-text)] sm:text-[2.5rem]">
        Why Excel cuts off columns when exporting to PDF (And how to fix it)
      </h1>
      <p className="mb-10 text-[1.0625rem] leading-relaxed text-[var(--color-muted)]">
        Exporting a wide Excel sheet to PDF often results in cut-off columns. This guide explains
        why it happens and how to fix it — with and without external tools.
      </p>

      <h2 className="mb-3 text-xl font-[650] text-[var(--color-text)]">Why Excel PDF export breaks on wide sheets</h2>
      <p className="mb-8 leading-relaxed text-[var(--color-muted)]">
        Excel uses a fixed page width when exporting. If your sheet is wider than a standard page,
        Excel truncates content or scales it to unreadable sizes.
      </p>

      <h2 className="mb-3 text-xl font-[650] text-[var(--color-text)]">Manual workarounds</h2>
      <ul className="mb-8 list-disc pl-6 leading-relaxed text-[var(--color-muted)]">
        <li>Page Layout → Scale to Fit → set Width to 1 page</li>
        <li>Switch orientation to Landscape</li>
        <li>Reduce font size and column widths manually</li>
        <li>Split the sheet into multiple print areas</li>
      </ul>

      <h2 className="mb-3 text-xl font-[650] text-[var(--color-text)]">Limitations of manual fixes</h2>
      <p className="mb-8 leading-relaxed text-[var(--color-muted)]">
        Manual scaling breaks readability for wide data. Landscape orientation helps but still
        truncates sheets with 20+ columns. Splitting into areas takes time and breaks context.
      </p>

      <h2 className="mb-3 text-xl font-[650] text-[var(--color-text)]">Structured export with fitforpdf</h2>
      <p className="mb-8 leading-relaxed text-[var(--color-muted)]">
        fitforpdf automatically groups wide columns into readable sections — each section fits on
        a page with the reference columns (ID, Name) repeated. No manual layout needed.
      </p>

      <section data-testid="seo-faq" className="mb-12 border-t border-[var(--color-border)]">
        <h2 className="py-6 text-xl font-[650] text-[var(--color-text)]">Frequently asked questions</h2>
        <div className="divide-y divide-[var(--color-border)]">
          {faqs.map(({ q, a }) => (
            <div key={q} className="py-5">
              <h3 className="mb-1 font-[600] text-[var(--color-text)]">{q}</h3>
              <p className="leading-relaxed text-[var(--color-muted)]">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <section data-testid="seo-cta" className="rounded-2xl bg-[var(--color-bg-warm)] px-6 py-8 text-center">
        <h2 className="mb-2 text-xl font-[650] text-[var(--color-text)]">Fix your Excel export now</h2>
        <p className="mb-5 text-[var(--color-muted)]">
          Upload your spreadsheet. Get a structured PDF in seconds. 3 free exports.
        </p>
        <a
          href="/"
          className="inline-block rounded-xl bg-[#0F172A] px-6 py-3 text-sm font-[600] text-white transition hover:bg-black/80"
        >
          Generate your first PDF — free
        </a>
      </section>
    </main>
  );
}
