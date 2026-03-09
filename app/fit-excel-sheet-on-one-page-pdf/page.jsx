import { SEO } from '../siteCopy.mjs';

export const metadata = {
  title: SEO.fitOnePage.title,
  description: SEO.fitOnePage.description,
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
    a: 'For sheets with many columns, landscape orientation and margin reduction help — but structured sectioning (grouping columns by theme) produces far more readable results.',
  },
  {
    q: 'Is fitting everything on one page always the best approach?',
    a: 'Not always. For sheets with many columns, structuring into readable sections often produces better results than shrinking to one page.',
  },
  {
    q: 'How does fitforpdf handle large sheets?',
    a: 'fitforpdf groups columns into sections with repeated reference columns — each section fits on a page without scaling distortion.',
  },
];

export default function FitOnePagePage() {
  return (
    <main className="mx-auto max-w-[720px] px-4 py-20 sm:px-6">
      <h1 className="mb-6 text-[2rem] font-[650] leading-[1.1] tracking-tight text-[#1A1A1A] sm:text-[2.5rem]">
        How to fit a large Excel sheet on one PDF page
      </h1>
      <p className="mb-10 text-[1.0625rem] leading-relaxed text-[#6B6B6B]">
        If your sheet is too wide, Excel&#39;s default export may shrink or cut content. Learn
        manual steps and better automated solutions for large spreadsheets.
      </p>

      <h2 className="mb-3 text-xl font-[650] text-[#1A1A1A]">Step 1 — Page layout &amp; scaling</h2>
      <p className="mb-8 leading-relaxed text-[#4B4B4B]">
        Go to Page Layout → Scale to Fit and set Width to 1 page. This forces Excel to compress
        the sheet horizontally, but very wide sheets become unreadable.
      </p>

      <h2 className="mb-3 text-xl font-[650] text-[#1A1A1A]">Step 2 — Landscape orientation</h2>
      <p className="mb-8 leading-relaxed text-[#4B4B4B]">
        Switch to Landscape in Page Layout → Orientation. This gives you more horizontal space
        and works well for sheets up to about 15 columns.
      </p>

      <h2 className="mb-3 text-xl font-[650] text-[#1A1A1A]">Step 3 — Adjust margins &amp; page breaks</h2>
      <p className="mb-8 leading-relaxed text-[#4B4B4B]">
        Narrow margins (File → Print → Custom Margins) and manual page breaks (View → Page Break
        Preview) let you control where content splits — but it requires careful manual tuning.
      </p>

      <h2 className="mb-3 text-xl font-[650] text-[#1A1A1A]">Limitations of fitting on one page</h2>
      <p className="mb-8 leading-relaxed text-[#4B4B4B]">
        For sheets with 20+ columns, fitting on one page means tiny, unreadable text. Clients
        receiving these PDFs often can&#39;t read the data without zooming in. Structured sectioning
        is often a better alternative.
      </p>

      <h2 className="mb-3 text-xl font-[650] text-[#1A1A1A]">Smarter alternative: structured sections</h2>
      <p className="mb-8 leading-relaxed text-[#4B4B4B]">
        Instead of squeezing everything on one page, fitforpdf automatically splits wide sheets
        into readable sections — each with its own page, repeated reference columns, and clear
        row ranges. The result is a professional, client-ready document.
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
        <h2 className="mb-2 text-xl font-[650] text-[#1A1A1A]">Ready to export your sheet cleanly?</h2>
        <p className="mb-5 text-[#6B6B6B]">
          Upload your Excel file and get a structured, readable PDF in seconds. 3 free exports.
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
