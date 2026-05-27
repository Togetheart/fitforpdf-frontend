'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const BASE_URL = 'https://api.fitforpdf.com/v1';

const ENDPOINTS = [
  {
    method: 'POST',
    path: '/v1/render',
    auth: true,
    summary: 'Generate a PDF',
    description: 'Render a readable PDF from a wide CSV or XLSX table (max 10 MB).',
    example: `curl -X POST \\
  -H "X-FITFORPDF-KEY: ffp_live_..." \\
  -F file=@data.csv \\
  -F 'options={"mode":"compact","branding":false}' \\
  ${BASE_URL}/render \\
  -o output.pdf`,
    response: 'Binary PDF (application/pdf)',
  },
  {
    method: 'GET',
    path: '/v1/quota',
    auth: true,
    summary: 'Check your quota',
    description: 'Returns your current plan, usage, and remaining exports.',
    example: `curl -H "X-FITFORPDF-KEY: ffp_live_..." \\
  ${BASE_URL}/quota`,
    response: `{
  "plan": "credits",
  "free": { "limit": 50, "used": 0, "remaining": 50 },
  "credits": { "remaining": 8 },
  "pro": { "monthlyCap": 500, "usedInPeriod": 0 }
}`,
  },
  {
    method: 'GET',
    path: '/v1/health',
    auth: false,
    summary: 'Health check',
    description: 'Returns API status. No authentication required.',
    example: `curl ${BASE_URL}/health`,
    response: `{
  "status": "ok",
  "version": "1"
}`,
  },
];

const RENDER_OPTIONS = [
  { key: 'mode', type: 'string', values: 'normal, compact, optimized', def: 'normal' },
  { key: 'branding', type: 'boolean', values: 'true, false', def: 'true' },
  { key: 'columnMap', type: 'string', values: 'off, auto, force', def: 'off' },
  { key: 'truncateLongText', type: 'boolean', values: 'true, false', def: 'false' },
  { key: 'locale', type: 'string', values: 'en, fr', def: 'en' },
  { key: 'pagination', type: 'boolean', values: 'true, false', def: 'true' },
  { key: 'compress', type: 'boolean', values: 'true, false', def: 'false' },
];

const ERROR_CODES = [
  { http: 401, code: 'api_key_missing', desc: 'No X-FITFORPDF-KEY header' },
  { http: 403, code: 'api_key_invalid', desc: 'Invalid or revoked API key' },
  { http: 402, code: 'free_quota_exhausted', desc: 'Free plan exports used up' },
  { http: 402, code: 'credits_exhausted', desc: 'No credits remaining' },
  { http: 429, code: 'rate_limited', desc: 'Rate limit exceeded (60 req/min)' },
  { http: 413, code: 'file_too_large', desc: 'File exceeds 10 MB limit' },
  { http: 415, code: 'invalid_file_type', desc: 'Not a .csv or .xlsx file' },
];

const RESPONSE_HEADERS = [
  { header: 'X-Request-Id', desc: 'Unique request identifier' },
  { header: 'X-FitForPDF-Score', desc: 'Quality score (0\u2013100)' },
  { header: 'X-FitForPDF-Verdict', desc: 'excellent, good, fair, or poor' },
  { header: 'X-FitForPDF-Plan', desc: 'Your current plan' },
  { header: 'X-FitForPDF-Remaining', desc: 'Remaining exports' },
  { header: 'X-Render-MS', desc: 'Render time in milliseconds' },
];

const USE_CASES = [
  { label: 'SaaS reporting', desc: 'Generate PDF reports from your product data on demand' },
  { label: 'CRM exports', desc: 'Turn wide CRM tables into client-ready documents' },
  { label: 'Financial exports', desc: 'Render financial data with clean pagination and layout' },
  { label: 'Analytics tables', desc: 'Export analytics dashboards as structured PDFs' },
  { label: 'Inventory reports', desc: 'Convert inventory data into readable, shareable PDFs' },
];

const DIFFERENTIATORS = [
  { label: 'Splits wide tables into sections', desc: 'No more cut-off columns — wide tables are restructured into readable grouped sections.' },
  { label: 'Preserves key columns across sections', desc: 'Identifier columns stay visible on every section so records stay linked.' },
  { label: 'Full-width text rendering', desc: 'Every column gets the space it needs. No cramped cells or truncated values.' },
  { label: 'Automatic pagination', desc: 'Page breaks follow record boundaries, not arbitrary row counts.' },
];

function MethodBadge({ method }) {
  const color = method === 'GET'
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-sky-100 text-sky-700';
  return (
    <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${color}`}>
      {method}
    </span>
  );
}

function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="group relative">
      <pre className="overflow-x-auto rounded-xl bg-[#0F172A] p-4 text-sm leading-relaxed text-white/90">
        <code>{children}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 rounded-md bg-white/10 px-2 py-1 text-xs text-white/50 opacity-0 transition hover:bg-white/20 hover:text-white/80 group-hover:opacity-100"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

function EndpointCard({ endpoint }) {
  return (
    <div className="space-y-3 border-t border-[var(--color-border)] py-6" id={endpoint.path.replace(/\//g, '-').slice(1)}>
      <div className="flex items-center gap-3">
        <MethodBadge method={endpoint.method} />
        <code className="text-sm font-semibold text-[var(--color-text)]">{endpoint.path}</code>
        {endpoint.auth && (
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-[500] text-blue-700">
            auth required
          </span>
        )}
      </div>
      <p className="text-sm text-[var(--color-muted)]">{endpoint.description}</p>
      <CodeBlock>{endpoint.example}</CodeBlock>
      {endpoint.response && (
        <details className="group">
          <summary className="cursor-pointer text-xs font-[500] text-[var(--color-muted)] transition hover:text-[var(--color-text)]">
            Response
          </summary>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-[var(--color-bg-hero)] p-4 text-sm leading-relaxed text-[var(--color-text)]">
            <code>{endpoint.response}</code>
          </pre>
        </details>
      )}
    </div>
  );
}

function RequestAccessForm() {
  const [form, setForm] = useState({ name: '', email: '', useCase: '' });
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/request-access', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        const msg = data?.error?.message || data?.message || 'Something went wrong. Please try again.';
        setErrorMsg(msg);
        setStatus('error');
        return;
      }

      setStatus('success');
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <section id="request-access" className="rounded-2xl bg-[var(--color-bg-hero)] px-6 py-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-semibold text-[var(--color-text)]">You&apos;re on the list</h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          We&apos;ll send your API key to{' '}
          <strong className="font-semibold text-[var(--color-text)]">{form.email}</strong>{' '}
          once your access is approved.
        </p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Early users get <strong className="font-semibold text-[var(--color-text)]">50 free exports</strong> to start.
        </p>
        <a
          href="/"
          className="mt-6 inline-block rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-6 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg-hero)]"
        >
          Try the web app while you wait
        </a>
      </section>
    );
  }

  return (
    <section id="request-access" className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-sm">
      <div className="flex flex-col md:flex-row">
        {/* Left — value props */}
        <div className="flex-1 px-6 py-8 md:px-10 md:py-12 bg-[var(--color-bg-hero)]">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-600">
            Early access
          </p>
          <h2 className="mt-3 text-2xl font-bold leading-tight text-[var(--color-text)] sm:text-3xl">
            Get your API key
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted)]">
            We&apos;re onboarding developers in small batches to ensure
            quality and support. Early users get:
          </p>
          <ul className="mt-6 space-y-3">
            {[
              '50 free exports to test your integration',
              'Direct access to the engineering team',
              'Priority feature requests',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-[var(--color-text)]">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="h-3 w-3 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-[var(--color-border)]" />

        {/* Right — form */}
        <div className="flex-1 border-t border-[var(--color-border)] bg-[var(--color-bg)] px-6 py-8 md:border-t-0 md:px-10 md:py-12">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="ra-name" className="block text-xs font-semibold text-[var(--color-text)]">
                Name
              </label>
              <input
                id="ra-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                minLength={2}
                value={form.name}
                onChange={handleChange}
                placeholder="Jane Smith"
                className="mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-hero)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)]/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label htmlFor="ra-email" className="block text-xs font-semibold text-[var(--color-text)]">
                Work email
              </label>
              <input
                id="ra-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="jane@company.com"
                className="mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-hero)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)]/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label htmlFor="ra-usecase" className="block text-xs font-semibold text-[var(--color-text)]">
                What are you building? <span className="font-[400] text-[var(--color-muted)]">(optional)</span>
              </label>
              <textarea
                id="ra-usecase"
                name="useCase"
                rows={2}
                value={form.useCase}
                onChange={handleChange}
                placeholder="e.g. Auto-generating client reports from our CRM"
                className="mt-1.5 w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-hero)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)]/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {errorMsg && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-xs text-red-700">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full rounded-xl bg-cta px-6 py-3.5 text-sm font-semibold text-cta-text transition hover:bg-cta-hover active:scale-[0.98] disabled:opacity-50"
            >
              {status === 'submitting' ? 'Submitting\u2026' : 'Request early access'}
            </button>

            <p className="text-center text-xs text-[var(--color-muted)]">
              Most requests approved within a few hours.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-hero)]">
    <div className="mx-auto max-w-[720px] px-4 py-20 sm:px-6">

      {/* Hero */}
      <div className="mb-14">
        {/* Brand visual — converted from raw <img> (1.4 MB PNG, was the LCP
            element for this page) to <Image> with priority + automatic
            webp/avif conversion. Cuts the image payload by ~80% on this
            high-engagement page (8.5 pages/visitor — see mobile audit). */}
        <div className="mb-8 relative h-48 sm:h-56 overflow-hidden rounded-2xl">
          <Image
            // brand-origami.webp = 58K vs .png 1.4MB (24× smaller).
            // next/image still picks the best variant for the client based on
            // the request, but serving the smaller source short-circuits
            // re-encoding cost on the Vercel image pipeline.
            src="/brand-origami.webp"
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 720px"
            className="object-cover"
          />
        </div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-blue-600">
          Developer API
        </p>
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-[var(--color-text)] sm:text-4xl">
          Render readable PDFs<br className="hidden sm:block" /> from wide tables
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--color-muted)]">
          Use the fitforpdf API to generate structured PDFs from Excel exports, CSV datasets,
          and database tables. Built specifically for wide business tables that break normal PDF rendering.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <code className="rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] font-mono">
            {BASE_URL}
          </code>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-[500] text-emerald-700">
            No HTML templates. No PDF layout code.
          </span>
        </div>

        {/* Primary hero CTA — Free API key.
            Pushed up here because /developers landings used to bury this anchor
            at the very bottom of the page. Promoted to first-fold to convert
            the high-intent dev audience (8.5 pages/visitor) before they bounce. */}
        <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <a
            href="#request-access"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
          >
            Get your free API key
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
          <p className="text-xs text-[var(--color-muted)]">
            <span className="font-semibold text-[var(--color-text)]">50 free renders</span>{' '}
            to start. No credit card. Most requests approved within hours.
          </p>
        </div>
      </div>

      {/* Try it in 10 seconds */}
      <section className="mb-14 border-t border-[var(--color-border)] pt-10">
        <p className="mb-3 text-sm font-semibold text-[var(--color-text)]">Try it in 10 seconds</p>
        <CodeBlock>{`curl -X POST https://api.fitforpdf.com/v1/render \\
  -H "X-FITFORPDF-KEY: YOUR_KEY" \\
  -F "file=@sample.csv" \\
  --output report.pdf`}</CodeBlock>
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm">
          <span className="font-mono text-[var(--color-muted)]">sample.csv</span>
          <span className="text-xs text-[var(--color-muted)]">14 cols × 2k rows</span>
          <span className="text-[var(--color-muted)]">→</span>
          <span className="font-semibold text-[var(--color-text)]">structured PDF sections</span>
        </div>
        <a href="#request-access" className="mt-3 inline-block text-xs text-[var(--color-muted)] underline underline-offset-2 hover:text-[var(--color-text)]">
          Request access →
        </a>
      </section>

      {/* For AI agents */}
      <section
        data-testid="developers-agents-section"
        id="for-ai-agents"
        className="mb-14 border-t border-[var(--color-border)] pt-10"
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-blue-600">
          For AI agents
        </p>
        <h2 className="mb-4 text-xl font-bold leading-tight text-[var(--color-text)]">
          Agent-native PDF rendering
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-[var(--color-muted)]">
          Deterministic, reproducible, and LLM-free. Discover the tool via the
          manifest, then call <code className="font-mono text-[var(--color-text)]">/api/agent/render</code>
          {' '}with a JSON body containing <code className="font-mono text-[var(--color-text)]">file_url</code>.
          No multipart boilerplate. Response is JSON with a base64 PDF plus the render verdict.
        </p>

        <div className="mb-6 flex flex-wrap gap-3 text-sm">
          <a
            href="/.well-known/ai-plugin.json"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 font-mono text-xs text-[var(--color-text)] hover:bg-[var(--color-bg-hero)]"
          >
            /.well-known/ai-plugin.json
          </a>
          <a
            href="/api/openapi.json"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 font-mono text-xs text-[var(--color-text)] hover:bg-[var(--color-bg-hero)]"
          >
            /api/openapi.json
          </a>
        </div>

        <p className="mb-2 text-sm font-semibold text-[var(--color-text)]">Claude (Anthropic SDK)</p>
        <div data-testid="agent-snippet-claude">
          <CodeBlock>{`import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic();

const tools = [{
  name: "render_pdf",
  description: "Render a client-ready PDF from a CSV or XLSX file URL.",
  input_schema: {
    type: "object",
    required: ["file_url"],
    properties: {
      file_url: { type: "string" },
      mode: { type: "string", enum: ["normal", "compact", "optimized"] }
    }
  }
}];

// When Claude decides to call render_pdf, hit:
// POST https://www.fitforpdf.com/api/agent/render
// Header: X-FITFORPDF-KEY: ffp_live_...
// Body:   { "file_url": "...", "mode": "normal" }`}</CodeBlock>
        </div>

        <p className="mb-2 mt-6 text-sm font-semibold text-[var(--color-text)]">OpenAI function calling</p>
        <div data-testid="agent-snippet-openai">
          <CodeBlock>{`import OpenAI from "openai";
const openai = new OpenAI();

const tools = [{
  type: "function",
  function: {
    name: "render_pdf",
    description: "Render a client-ready PDF from a CSV/XLSX URL.",
    parameters: {
      type: "object",
      required: ["file_url"],
      properties: {
        file_url: { type: "string" },
        mode: { type: "string", enum: ["normal", "compact", "optimized"] }
      }
    }
  }
}];

const response = await openai.chat.completions.create({
  model: "gpt-4o",
  tools,
  messages: [{ role: "user", content: "Turn this export into a PDF" }]
});`}</CodeBlock>
        </div>

        <p className="mb-2 mt-6 text-sm font-semibold text-[var(--color-text)]">LangChain (Python)</p>
        <div data-testid="agent-snippet-langchain">
          <CodeBlock>{`from langchain_core.tools import tool
import httpx, os

@tool
def render_pdf(file_url: str, mode: str = "normal") -> dict:
    """Render a client-ready PDF from a CSV/XLSX URL."""
    r = httpx.post(
        "https://www.fitforpdf.com/api/agent/render",
        json={"file_url": file_url, "mode": mode},
        headers={"X-FITFORPDF-KEY": os.environ["FITFORPDF_KEY"]},
        timeout=60,
    )
    r.raise_for_status()
    return r.json()  # { pdf_base64, pages, verdict, score, render_id }`}</CodeBlock>
        </div>
      </section>

      {/* Why fitforpdf exists */}
      <section className="mb-14 border-t border-[var(--color-border)] pt-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
          Why fitforpdf exists
        </p>
        <h2 className="mb-4 text-xl font-bold leading-tight text-[var(--color-text)]">
          Wide tables break every PDF renderer
        </h2>
        <div className="space-y-3 text-sm leading-relaxed text-[var(--color-muted)]">
          <p>
            Standard PDF libraries — wkhtmltopdf, Puppeteer, ReportLab — were built for documents,
            not data. Feed them a 20-column CRM export and you get cut-off columns, microscopic text,
            and broken page flows that no client wants to read.
          </p>
          <p>
            fitforpdf was built specifically for this problem. The rendering engine analyses your table
            structure, splits wide tables into readable sections, and produces a PDF that actually
            communicates the data inside it.
          </p>
        </div>
      </section>

      {/* Typical API use cases */}
      <section className="mb-14 border-t border-[var(--color-border)] pt-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
          Typical use cases
        </p>
        <h2 className="mb-6 text-xl font-bold leading-tight text-[var(--color-text)]">
          Built for SaaS products and data-heavy workflows
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {USE_CASES.map((uc) => (
            <div key={uc.label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-hero)] px-4 py-4">
              <p className="text-sm font-semibold text-[var(--color-text)]">{uc.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">{uc.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What makes fitforpdf different */}
      <section className="mb-14 border-t border-[var(--color-border)] pt-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
          What makes fitforpdf different
        </p>
        <h2 className="mb-6 text-xl font-bold leading-tight text-[var(--color-text)]">
          Designed around the wide-table problem
        </h2>
        <div className="space-y-4">
          {DIFFERENTIATORS.map((d) => (
            <div key={d.label} className="flex gap-3">
              <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-hero)]">
                <svg className="h-3 w-3 text-[var(--color-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">{d.label}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-[var(--color-muted)]">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick start */}
      <section className="mb-12 border-t border-[var(--color-border)] pt-10">
        <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]"><code aria-hidden="true" className="mr-2 rounded bg-[#0F172A] px-1.5 py-0.5 text-sm font-normal text-white">[-]</code>Quick start</h2>
        <p className="mb-4 text-sm text-[var(--color-muted)]">
          Generate a PDF in one command:
        </p>
        <CodeBlock>{`curl -X POST \\
  -H "X-FITFORPDF-KEY: ffp_live_..." \\
  -F file=@your-data.csv \\
  ${BASE_URL}/render \\
  -o report.pdf`}</CodeBlock>
      </section>

      {/* Authentication */}
      <section className="mb-12 border-t border-[var(--color-border)] pt-8">
        <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]"><code aria-hidden="true" className="mr-2 rounded bg-[#0F172A] px-1.5 py-0.5 text-sm font-normal text-white">[-]</code>Authentication</h2>
        <p className="mb-4 text-sm text-[var(--color-muted)]">
          Pass your API key in the <code className="rounded bg-[var(--color-bg-hero)] px-1.5 py-0.5 text-sm">X-FITFORPDF-KEY</code> header.
          Keys are prefixed <code className="rounded bg-[var(--color-bg-hero)] px-1.5 py-0.5 text-sm">ffp_live_</code> and
          should be kept server-side only.
        </p>
        <CodeBlock>{`curl -H "X-FITFORPDF-KEY: ffp_live_..." \\
  ${BASE_URL}/quota`}</CodeBlock>
        <p className="mt-3 text-xs text-[var(--color-muted)]">
          <a href="#request-access" className="underline underline-offset-2 hover:text-[var(--color-text)]">
            Request early access
          </a>{' '}
          to get your key.
        </p>
      </section>

      {/* Endpoints */}
      <section className="mb-12">
        <h2 className="mb-2 text-xl font-semibold text-[var(--color-text)]"><code aria-hidden="true" className="mr-2 rounded bg-[#0F172A] px-1.5 py-0.5 text-sm font-normal text-white">[-]</code>Endpoints</h2>
        {ENDPOINTS.map((ep) => (
          <EndpointCard key={ep.path} endpoint={ep} />
        ))}
      </section>

      {/* Render options */}
      <section className="mb-12 border-t border-[var(--color-border)] pt-8">
        <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]"><code aria-hidden="true" className="mr-2 rounded bg-[#0F172A] px-1.5 py-0.5 text-sm font-normal text-white">[-]</code>Render options</h2>
        <p className="mb-4 text-sm text-[var(--color-muted)]">
          Pass as a JSON string in the <code className="rounded bg-[var(--color-bg-hero)] px-1.5 py-0.5 text-sm">options</code> form field.
        </p>
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-hero)]">
                <th className="px-4 py-2 font-semibold text-[var(--color-text)]">Key</th>
                <th className="px-4 py-2 font-semibold text-[var(--color-text)]">Type</th>
                <th className="px-4 py-2 font-semibold text-[var(--color-text)]">Values</th>
                <th className="px-4 py-2 font-semibold text-[var(--color-text)]">Default</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {RENDER_OPTIONS.map((opt, i) => (
                <tr key={opt.key} className={i % 2 === 1 ? 'bg-[var(--color-bg-hero)]/50' : 'bg-transparent'}>
                  <td className="px-4 py-2"><code className="text-sm">{opt.key}</code></td>
                  <td className="px-4 py-2 text-[var(--color-muted)]">{opt.type}</td>
                  <td className="px-4 py-2 text-[var(--color-muted)]">{opt.values}</td>
                  <td className="px-4 py-2"><code className="text-sm">{opt.def}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Response headers */}
      <section className="mb-12 border-t border-[var(--color-border)] pt-8">
        <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]"><code aria-hidden="true" className="mr-2 rounded bg-[#0F172A] px-1.5 py-0.5 text-sm font-normal text-white">[-]</code>Response headers</h2>
        <p className="mb-4 text-sm text-[var(--color-muted)]">
          Every <code className="rounded bg-[var(--color-bg-hero)] px-1.5 py-0.5 text-sm">/v1/render</code> response includes these headers:
        </p>
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-hero)]">
                <th className="px-4 py-2 font-semibold text-[var(--color-text)]">Header</th>
                <th className="px-4 py-2 font-semibold text-[var(--color-text)]">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {RESPONSE_HEADERS.map((h, i) => (
                <tr key={h.header} className={i % 2 === 1 ? 'bg-[var(--color-bg-hero)]/50' : 'bg-transparent'}>
                  <td className="px-4 py-2"><code className="text-sm">{h.header}</code></td>
                  <td className="px-4 py-2 text-[var(--color-muted)]">{h.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Rate limiting */}
      <section className="mb-12 border-t border-[var(--color-border)] pt-8">
        <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]"><code aria-hidden="true" className="mr-2 rounded bg-[#0F172A] px-1.5 py-0.5 text-sm font-normal text-white">[-]</code>Rate limiting</h2>
        <p className="text-sm text-[var(--color-muted)]">
          <strong>60 requests per minute</strong> per API key.
          Rate limit state is returned in headers:{' '}
          <code className="rounded bg-[var(--color-bg-hero)] px-1.5 py-0.5 text-sm">X-RateLimit-Limit</code>,{' '}
          <code className="rounded bg-[var(--color-bg-hero)] px-1.5 py-0.5 text-sm">X-RateLimit-Remaining</code>, and{' '}
          <code className="rounded bg-[var(--color-bg-hero)] px-1.5 py-0.5 text-sm">Retry-After</code> (on 429).
          Maximum 50 columns and 5,000 rows per request.
        </p>
        <p className="mt-3 text-xs text-[var(--color-muted)]">
          Designed for business reporting exports.
        </p>
      </section>

      {/* Error codes */}
      <section className="mb-14 border-t border-[var(--color-border)] pt-8">
        <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]"><code aria-hidden="true" className="mr-2 rounded bg-[#0F172A] px-1.5 py-0.5 text-sm font-normal text-white">[-]</code>Error codes</h2>
        <p className="mb-4 text-sm text-[var(--color-muted)]">
          All errors use a standard envelope:
        </p>
        <CodeBlock>{`{
  "error": {
    "code": "api_key_missing",
    "message": "Missing X-FITFORPDF-KEY header",
    "requestId": "req-123"
  }
}`}</CodeBlock>
        <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-hero)]">
                <th className="px-4 py-2 font-semibold text-[var(--color-text)]">HTTP</th>
                <th className="px-4 py-2 font-semibold text-[var(--color-text)]">Code</th>
                <th className="px-4 py-2 font-semibold text-[var(--color-text)]">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {ERROR_CODES.map((e, i) => (
                <tr key={e.code} className={i % 2 === 1 ? 'bg-[var(--color-bg-hero)]/50' : 'bg-transparent'}>
                  <td className="px-4 py-2 font-[500]">{e.http}</td>
                  <td className="px-4 py-2"><code className="text-sm">{e.code}</code></td>
                  <td className="px-4 py-2 text-[var(--color-muted)]">{e.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* GitHub examples */}
      <section className="mb-12 border-t border-[var(--color-border)] pt-8">
        <div className="flex items-start gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-hero)] px-5 py-5">
          <svg className="mt-0.5 h-6 w-6 flex-shrink-0 text-[var(--color-text)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--color-text)]">GitHub examples</p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">
              Working API examples in Node.js and Python, plus the full OpenAPI 3.1 spec.
            </p>
            <a
              href="https://github.com/Togetheart/fitforpdf-api-examples"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-xs font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg-hero)]"
            >
              View API examples on GitHub
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* API Pricing */}
      <section className="mb-14 border-t border-[var(--color-border)] pt-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-blue-600">
          API Pricing
        </p>
        <h2 className="mb-2 text-xl font-bold leading-tight text-[var(--color-text)]">
          Start free. Scale when it matters.
        </h2>
        <p className="mb-8 text-sm text-[var(--color-muted)]">
          50 renders included. Then predictable pricing as you grow.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Free */}
          <div className="flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5">
            <p className="text-sm font-semibold text-[var(--color-text)]">Free</p>
            <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">$0</p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--color-muted)]">
              <li className="flex items-center gap-2">
                <svg className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                50 renders
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                60 req/min rate limit
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                fitforpdf watermark
              </li>
            </ul>
            <div className="mt-auto pt-6">
              <a href="#request-access" className="block rounded-full border border-[var(--color-border)] px-6 py-3 text-center text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg-hero)]">
                Get started free
              </a>
            </div>
          </div>

          {/* Starter API */}
          <div className="flex flex-col rounded-xl border-2 border-blue-500/30 bg-[var(--color-bg)] p-5 relative">
            <span className="absolute -top-2.5 right-4 rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white uppercase tracking-wide">Recommended</span>
            <p className="text-sm font-semibold text-[var(--color-text)]">Starter API</p>
            <p className="mt-1"><span className="text-2xl font-bold text-[var(--color-text)]">$49</span><span className="text-sm text-[var(--color-muted)]"> / month</span></p>
            <p className="mt-0.5 text-xs text-[var(--color-muted)]">~$0.098 per render</p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--color-muted)]">
              <li className="flex items-center gap-2">
                <svg className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                500 renders / month
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                No watermark
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                Priority queue
              </li>
            </ul>
            <div className="mt-auto pt-6">
              <a href="#request-access" className="block rounded-full bg-blue-600 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700">
                Get started &rarr;
              </a>
            </div>
          </div>

          {/* Scale API */}
          <div className="flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5">
            <p className="text-sm font-semibold text-[var(--color-text)]">Scale API</p>
            <p className="mt-1"><span className="text-2xl font-bold text-[var(--color-text)]">$99</span><span className="text-sm text-[var(--color-muted)]"> / month</span></p>
            <p className="mt-0.5 text-xs text-[var(--color-muted)]">~$0.033 per render</p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--color-muted)]">
              <li className="flex items-center gap-2">
                <svg className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                3,000 renders / month
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                Faster processing
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                SLA light
              </li>
            </ul>
            <div className="mt-auto pt-6">
              <a href="#request-access" className="block rounded-full border border-[var(--color-border)] px-6 py-3 text-center text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg-hero)]">
                Get started &rarr;
              </a>
            </div>
          </div>

          {/* Enterprise */}
          <div className="flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5">
            <p className="text-sm font-semibold text-[var(--color-text)]">Enterprise</p>
            <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">Custom</p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--color-muted)]">
              <li className="flex items-center gap-2">
                <svg className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                Unlimited renders
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                SLA + dedicated support
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                Custom infra
              </li>
            </ul>
            <div className="mt-auto pt-6">
              <a href="/contact" className="block rounded-full border border-[var(--color-border)] px-6 py-3 text-center text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg-hero)]">
                Contact us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Compare with other tools */}
      <section className="mb-14 border-t border-[var(--color-border)] pt-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
          Compare
        </p>
        <h2 className="mb-6 text-xl font-bold leading-tight text-[var(--color-text)]">
          How fitforpdf compares to other tools
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <a href="/vs-puppeteer" className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-4 transition hover:border-[var(--color-text)]/20 hover:shadow-sm">
            <p className="text-sm font-semibold text-[var(--color-text)]">vs Puppeteer</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">No headless Chrome needed</p>
          </a>
          <a href="/vs-wkhtmltopdf" className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-4 transition hover:border-[var(--color-text)]/20 hover:shadow-sm">
            <p className="text-sm font-semibold text-[var(--color-text)]">vs wkhtmltopdf</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">Table-aware, not generic HTML</p>
          </a>
          <a href="/vs-reportlab" className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-4 transition hover:border-[var(--color-text)]/20 hover:shadow-sm">
            <p className="text-sm font-semibold text-[var(--color-text)]">vs ReportLab</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">No Python code required</p>
          </a>
        </div>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          <a href="/for-saas" className="text-sm text-[var(--color-muted)] underline underline-offset-4 decoration-1 transition hover:text-[var(--color-text)]">For SaaS products</a>
          <a href="/for-finance" className="text-sm text-[var(--color-muted)] underline underline-offset-4 decoration-1 transition hover:text-[var(--color-text)]">For finance teams</a>
          <a href="/pricing" className="text-sm text-[var(--color-muted)] underline underline-offset-4 decoration-1 transition hover:text-[var(--color-text)]">App pricing</a>
        </div>
      </section>

      {/* Integrate in minutes callout */}
      <div className="mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
          Integrate in minutes.
        </p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          One endpoint, one file upload, one PDF back.
        </p>
      </div>

      {/* Request access */}
      <RequestAccessForm />
    </div>
    </div>
  );
}
