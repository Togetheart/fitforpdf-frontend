import { SEO } from '../siteCopy.mjs';

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
    q: 'What makes audit Excel sheets difficult to export?',
    a: 'Audit sheets typically have dozens of columns, hundreds of rows, and inconsistent widths — all of which break standard PDF export.',
  },
  {
    q: 'How do I export a financial audit report from Excel to PDF?',
    a: 'For clean results: hide internal-only columns, use landscape orientation, set print titles to repeat reference columns, and adjust margins. Or use fitforpdf to automate all of this.',
  },
  {
    q: 'How do I make an Excel audit report look professional in PDF?',
    a: 'A professional audit PDF needs: an overview summary, grouped column sections, repeated ID/entity columns on every page, and clear row ranges. These are hard to achieve manually in Excel.',
  },
  {
    q: 'Should I use landscape orientation for audit reports?',
    a: 'Landscape helps for sheets with up to ~15 columns, but for wider data it still truncates. Structured sectioning is more reliable.',
  },
  {
    q: 'How does fitforpdf handle complex audit data?',
    a: 'fitforpdf creates an overview page then groups columns into sections — each with key reference columns repeated for context. No manual setup required.',
  },
];

export default function AuditPdfPage() {
  return (
    <main className="mx-auto max-w-[720px] px-4 py-20 sm:px-6">
      <h1 className="mb-6 text-[2rem] font-[650] leading-[1.1] tracking-tight text-[#1A1A1A] sm:text-[2.5rem]">
        Exporting audit Excel sheets to PDF: best practices
      </h1>
      <p className="mb-10 text-[1.0625rem] leading-relaxed text-[#6B6B6B]">
        Audit reports often span dozens of columns and hundreds of rows. Learn how to export them
        to PDF that clients and stakeholders can actually read.
      </p>

      <h2 className="mb-3 text-xl font-[650] text-[#1A1A1A]">Tip 1 — Know your data first</h2>
      <p className="mb-8 leading-relaxed text-[#4B4B4B]">
        Before exporting, identify which columns are essential for the reader. Audit reports often
        include internal columns (formulas, raw IDs) that don&#39;t need to appear in the PDF.
        Hide non-essential columns before export.
      </p>

      <h2 className="mb-3 text-xl font-[650] text-[#1A1A1A]">Tip 2 — Use landscape and scaling</h2>
      <p className="mb-8 leading-relaxed text-[#4B4B4B]">
        Switch to Landscape orientation and use Page Layout → Scale to Fit for sheets up to 15
        columns. For wider sheets, this produces text too small to read.
      </p>

      <h2 className="mb-3 text-xl font-[650] text-[#1A1A1A]">Tip 3 — Freeze and repeat reference columns</h2>
      <p className="mb-8 leading-relaxed text-[#4B4B4B]">
        In Page Layout → Print Titles, set columns to repeat on every page (e.g., ID, Entity
        Name). This prevents readers from losing context when flipping through pages.
      </p>

      <h2 className="mb-3 text-xl font-[650] text-[#1A1A1A]">Better approach: use structured sectioning</h2>
      <p className="mb-8 leading-relaxed text-[#4B4B4B]">
        For complex audit sheets, the best result comes from structuring the data into column
        groups. fitforpdf does this automatically — producing an overview page, then sectioned
        column groups with repeated reference columns and clear row ranges.
      </p>

      <section data-testid="seo-faq" className="mb-12 border-t border-black/10">
        <h2 className="py-6 text-xl font-[650] text-[#1A1A1A]">Frequently asked questions</h2>
        <div className="divide-y divide-black/10">
          {faqs.map(({ q, a }) => (
            <div key={q} className="py-5">
              <h3 className="mb-1 font-[600] text-[#1A1A1A]">{q}</h3>
              <p className="leading-relaxed text-[#6B6B6B]">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <section data-testid="seo-cta" className="rounded-2xl bg-[#F5F3EE] px-6 py-8 text-center">
        <h2 className="mb-2 text-xl font-[650] text-[#1A1A1A]">Export your audit report cleanly</h2>
        <p className="mb-5 text-[#6B6B6B]">
          Upload your Excel file and get a professional, structured PDF. 3 free exports.
        </p>
        <a
          href="/"
          className="inline-block rounded-xl bg-[#1A1A1A] px-6 py-3 text-sm font-[600] text-white transition hover:bg-black/80"
        >
          Generate your first PDF — free
        </a>
      </section>
    </main>
  );
}
