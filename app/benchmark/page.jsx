import { JsonLd } from '../components/JsonLd';
import Button from '../components/ui/Button';
import results from '../lib/benchmarkResults.json';

const PAGE_URL = 'https://www.fitforpdf.com/benchmark';
const DATA_URL = 'https://www.fitforpdf.com/benchmark/results.json';
const HARNESS_URL = 'https://github.com/Togetheart/fitforpdf-backend/tree/main/benchmark';

export const metadata = {
  title: 'Wide table → client-ready PDF: the benchmark | FitForPDF',
  description:
    'An open, reproducible benchmark for turning wide spreadsheets into legible client-ready PDFs. Real adversarial CSVs, one deterministic scorer for every tool, no fabricated numbers. FitForPDF vs a generic headless-Chrome render.',
  alternates: { canonical: '/benchmark' },
  openGraph: {
    title: 'Wide table → client-ready PDF: the benchmark',
    description:
      'Same corpus, same scorer, every tool. FitForPDF vs the generic "print the HTML table" approach on real wide-table CSVs.',
    url: PAGE_URL,
  },
  twitter: { card: 'summary_large_image' },
};

const VERDICT_CLASS = {
  OK: 'border-[var(--color-success-border)] bg-[var(--color-success-bg)] text-[var(--color-success-text)]',
  WARN: 'border-[var(--color-warn-border)] bg-[var(--color-warn-bg)] text-[var(--color-warn-text)]',
  FAIL: 'border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]',
};

function ScoreCell({ r }) {
  if (!r || r.error) {
    return <span className="text-[var(--color-text-subtle)]">—</span>;
  }
  const cls = VERDICT_CLASS[r.verdict] || VERDICT_CLASS.WARN;
  return (
    <span className="inline-flex items-center gap-2">
      <span className="tabular-nums font-semibold text-[var(--color-text)]">{r.score}</span>
      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cls}`}>
        {r.verdict}
      </span>
    </span>
  );
}

const REASON_LABEL = {
  column_collapse: 'columns collapsed/clipped',
  small_font: 'font shrunk to illegible',
  high_wrap_rate: 'heavy text wrapping',
  high_truncation: 'cells truncated',
  missing_rows: 'rows dropped',
  blank_pages: 'blank pages',
  key_truncation: 'key column truncated',
};

export default function BenchmarkPage() {
  const tools = results.tools || [];
  const cases = results.cases || [];
  const ff = (c) => c.results?.fitforpdf || {};
  const nc = (c) => c.results?.naive_chrome || {};

  const ffWins = cases.filter((c) => (ff(c).score ?? 0) > (nc(c).score ?? 0)).length;
  const ffAllPass = cases.every((c) => ff(c).verdict === 'OK');

  const datasetLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Wide-Table → Client-PDF benchmark',
    description:
      'A reproducible benchmark scoring how well tools turn wide spreadsheets into legible, client-ready PDFs. Same corpus and same deterministic scorer for every tool.',
    url: PAGE_URL,
    creator: { '@type': 'Organization', name: 'FitForPDF', url: 'https://www.fitforpdf.com' },
    isAccessibleForFree: true,
    datePublished: results.generatedAt,
    measurementTechnique:
      'Deterministic PDF quality scorer (scoreV2): 0–100 score plus an OK/WARN/FAIL verdict, read from the rendered PDF.',
    variableMeasured: (results.rubric?.judges) || [],
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'application/json',
      contentUrl: DATA_URL,
    },
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.fitforpdf.com' },
      { '@type': 'ListItem', position: 2, name: 'Benchmark', item: PAGE_URL },
    ],
  };

  return (
    <>
      <JsonLd data={datasetLd} />
      <JsonLd data={breadcrumbLd} />
      <main className="bg-paper min-h-screen pt-28 pb-24">
        <div className="mx-auto w-full max-w-3xl px-5">
          {/* Hero */}
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">Benchmark</p>
          <h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-[var(--color-text)] sm:text-4xl">
            Wide table → client-ready PDF
          </h1>
          <p className="mt-4 text-[17px] leading-7 text-[var(--color-muted)]">
            The hard job: turn a <strong className="text-[var(--color-text)]">wide spreadsheet</strong> into a PDF a
            client can actually read — every column kept, headers repeated, nothing shrunk to illegible or clipped off
            the page. Generic “print the HTML table” tools and one-shot LLM rendering fail this in two predictable ways.
            Here’s the measurement, on real files, with <strong className="text-[var(--color-text)]">one ruler for every tool</strong>.
          </p>

          {/* Scoreboard */}
          <div className="mt-8 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-4">
            <span className="text-sm text-[var(--color-muted)]">On {cases.length} real wide-table files:</span>
            <span className="text-sm font-semibold text-[var(--color-text)]">
              FitForPDF wins {ffWins}/{cases.length}
            </span>
            {ffAllPass ? (
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${VERDICT_CLASS.OK}`}>
                all OK
              </span>
            ) : null}
          </div>

          {/* Results table */}
          <section className="mt-10">
            <h2 className="text-xl font-bold tracking-[-0.01em] text-[var(--color-text)]">Results</h2>
            <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--color-line)]">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-line)] bg-[var(--color-surface-sunken)] text-[var(--color-muted)]">
                    <th className="px-4 py-3 font-semibold">Dataset</th>
                    <th className="px-3 py-3 font-semibold whitespace-nowrap">Size</th>
                    {tools.map((t) => (
                      <th key={t.id} className="px-3 py-3 font-semibold whitespace-nowrap">{t.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c) => (
                    <tr key={c.file} className="border-b border-[var(--color-line)] align-top last:border-0">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[var(--color-text)]">{c.label}</div>
                        <div className="mt-0.5 text-[12px] leading-5 text-[var(--color-text-subtle)]">{c.hard}</div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap tabular-nums text-[var(--color-muted)]">
                        {c.cols}×{c.rows}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <ScoreCell r={ff(c)} />
                        {ff(c).pages ? <div className="mt-1 text-[11px] text-[var(--color-text-subtle)]">{ff(c).pages} pages</div> : null}
                      </td>
                      <td className="px-3 py-3">
                        <ScoreCell r={nc(c)} />
                        {nc(c).pages ? <div className="mt-1 text-[11px] text-[var(--color-text-subtle)]">{nc(c).pages} pages</div> : null}
                        {(nc(c).reasons || []).length ? (
                          <div className="mt-1 text-[11px] leading-4 text-[var(--color-danger-text)]">
                            {nc(c).reasons.map((x) => REASON_LABEL[x] || x).join(' · ')}
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[12.5px] leading-5 text-[var(--color-text-subtle)]">
              Score is 0–100 with an OK / WARN / FAIL verdict. FitForPDF typically uses{' '}
              <strong className="text-[var(--color-muted)]">more pages</strong> — it splits wide tables into sections to
              stay legible rather than cramming everything onto one clipped page. That trade-off is shown, not hidden.
            </p>
          </section>

          {/* Method */}
          <section className="mt-12">
            <h2 className="text-xl font-bold tracking-[-0.01em] text-[var(--color-text)]">How it’s measured</h2>
            <ul className="mt-4 space-y-3 text-[15px] leading-7 text-[var(--color-muted)]">
              <li><strong className="text-[var(--color-text)]">One ruler for everyone.</strong> Every output PDF is scored by the same deterministic scorer, which reads the <em>rendered</em> PDF — it has no idea which tool produced it. It judges column preservation, header repetition, legible font size, clipped/blank pages, and pagination clarity.</li>
              <li><strong className="text-[var(--color-text)]">Real runs only.</strong> The two tools here were actually run: FitForPDF’s engine, and a plain <code className="rounded bg-[var(--color-surface-sunken)] px-1">&lt;table&gt;</code> printed to PDF by headless Chromium — the generic Puppeteer/Gotenberg approach, used the normal way. No numbers are invented.</li>
              <li><strong className="text-[var(--color-text)]">The scorer is ours, and that’s disclosed.</strong> It’s FitForPDF’s production quality gate — open in the harness, so you can audit it, challenge it, or swap your own. The corpus and method don’t change.</li>
            </ul>
            {results.pending?.length ? (
              <p className="mt-4 text-[13px] leading-6 text-[var(--color-text-subtle)]">
                Not yet run (method published, contribute a real run): {results.pending.map((p) => p.label).join(', ')}.
              </p>
            ) : null}
          </section>

          {/* Reproduce + machine-readable */}
          <section className="mt-12 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
            <h2 className="text-lg font-bold tracking-[-0.01em] text-[var(--color-text)]">Reproduce it / read it as data</h2>
            <p className="mt-3 text-[15px] leading-7 text-[var(--color-muted)]">
              The corpus, the runner, and the scorer are open. Run it yourself or add your tool to the table — same
              corpus, same scorer, same options is the whole contract.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <a className="font-semibold text-[var(--color-text)] underline decoration-[var(--color-text-subtle)] underline-offset-4 hover:decoration-[var(--color-text)]" href={HARNESS_URL}>Open harness + corpus →</a>
              <a className="font-semibold text-[var(--color-text)] underline decoration-[var(--color-text-subtle)] underline-offset-4 hover:decoration-[var(--color-text)]" href="/benchmark/results.json">Results as JSON →</a>
              <a className="font-semibold text-[var(--color-text)] underline decoration-[var(--color-text-subtle)] underline-offset-4 hover:decoration-[var(--color-text)]" href="/for-agents">For AI agents →</a>
            </div>
          </section>

          {/* CTA */}
          <section className="mt-12 text-center">
            <h2 className="text-2xl font-bold tracking-[-0.01em] text-[var(--color-text)]">Run your own wide file</h2>
            <p className="mx-auto mt-3 max-w-xl text-[15px] leading-7 text-[var(--color-muted)]">
              Drop a wide spreadsheet and see the client-ready PDF — no cleanup, no clipped columns.
            </p>
            <div className="mt-6 flex justify-center">
              <Button variant="primary" href="/app" className="px-6">Make my export client-ready</Button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
