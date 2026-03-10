'use client';

import React, { useState } from 'react';

const BASE_URL = 'https://api.fitforpdf.com/v1';

const ENDPOINTS = [
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
  "free": { "limit": 3, "used": 3, "remaining": 0 },
  "credits": { "remaining": 8 },
  "pro": { "monthlyCap": 500, "usedInPeriod": 0 }
}`,
  },
  {
    method: 'POST',
    path: '/v1/render',
    auth: true,
    summary: 'Generate a PDF',
    description: 'Upload a CSV or XLSX file (max 10 MB) and receive a structured, readable PDF.',
    example: `curl -X POST \\
  -H "X-FITFORPDF-KEY: ffp_live_..." \\
  -F file=@data.csv \\
  -F 'options={"mode":"compact","branding":false}' \\
  ${BASE_URL}/render \\
  -o output.pdf`,
    response: 'Binary PDF (application/pdf)',
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
    <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-[650] uppercase tracking-wide ${color}`}>
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
      <pre className="overflow-x-auto rounded-xl bg-[#1A1A1A] p-4 text-[13px] leading-relaxed text-white/90">
        <code>{children}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 rounded-md bg-white/10 px-2 py-1 text-[11px] text-white/50 opacity-0 transition hover:bg-white/20 hover:text-white/80 group-hover:opacity-100"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

function EndpointCard({ endpoint }) {
  return (
    <div className="space-y-3 border-t border-black/10 py-6" id={endpoint.path.replace(/\//g, '-').slice(1)}>
      <div className="flex items-center gap-3">
        <MethodBadge method={endpoint.method} />
        <code className="text-sm font-[600] text-[#1A1A1A]">{endpoint.path}</code>
        {endpoint.auth && (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-[500] text-amber-700">
            auth required
          </span>
        )}
      </div>
      <p className="text-sm text-[#4B4B4B]">{endpoint.description}</p>
      <CodeBlock>{endpoint.example}</CodeBlock>
      {endpoint.response && (
        <details className="group">
          <summary className="cursor-pointer text-xs font-[500] text-black/40 transition hover:text-black/60">
            Response
          </summary>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-[#F5F3EE] p-4 text-[13px] leading-relaxed text-[#1A1A1A]">
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
      <section id="request-access" className="rounded-2xl bg-[#F5F3EE] px-6 py-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-[650] text-[#1A1A1A]">You&apos;re on the list</h2>
        <p className="mt-2 text-sm text-[#4B4B4B]">
          We&apos;ll send your API key to{' '}
          <strong className="font-[600] text-[#1A1A1A]">{form.email}</strong>{' '}
          once your access is approved.
          Early users get <strong className="font-[600] text-[#1A1A1A]">50 free exports</strong> to start.
        </p>
        <a
          href="/"
          className="mt-6 inline-block rounded-xl border border-black/10 bg-white px-6 py-3 text-sm font-[600] text-[#1A1A1A] transition hover:bg-[#FAFAF8]"
        >
          Try the web app while you wait
        </a>
      </section>
    );
  }

  return (
    <section id="request-access" className="overflow-hidden rounded-2xl bg-[#F5F3EE]">
      <div className="flex flex-col md:flex-row">
        {/* Left — value props */}
        <div className="flex-1 px-6 py-8 md:px-8 md:py-10">
          <p className="text-xs font-[650] uppercase tracking-[0.12em] text-[#7D6B58]">
            Early access
          </p>
          <h2 className="mt-2 text-xl font-[700] leading-tight text-[#1A1A1A]">
            Get your API key
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#4B4B4B]">
            We&apos;re onboarding developers in small batches to ensure
            quality and support. Early users get:
          </p>
          <ul className="mt-4 space-y-2.5">
            {[
              '50 free exports to test your integration',
              'Direct access to the engineering team',
              'Priority feature requests',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-[#4B4B4B]">
                <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right — form */}
        <div className="flex-1 border-t border-black/5 bg-white/50 px-6 py-8 md:border-l md:border-t-0 md:px-8 md:py-10">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="ra-name" className="block text-xs font-[600] text-[#4B4B4B]">
                Name
              </label>
              <input
                id="ra-name"
                name="name"
                type="text"
                required
                minLength={2}
                value={form.name}
                onChange={handleChange}
                placeholder="Jane Smith"
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm text-[#1A1A1A] outline-none transition placeholder:text-black/25 focus:border-[#7D6B58] focus:ring-1 focus:ring-[#7D6B58]"
              />
            </div>
            <div>
              <label htmlFor="ra-email" className="block text-xs font-[600] text-[#4B4B4B]">
                Work email
              </label>
              <input
                id="ra-email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="jane@company.com"
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm text-[#1A1A1A] outline-none transition placeholder:text-black/25 focus:border-[#7D6B58] focus:ring-1 focus:ring-[#7D6B58]"
              />
            </div>
            <div>
              <label htmlFor="ra-usecase" className="block text-xs font-[600] text-[#4B4B4B]">
                What are you building? <span className="font-[400] text-black/30">(optional)</span>
              </label>
              <textarea
                id="ra-usecase"
                name="useCase"
                rows={2}
                value={form.useCase}
                onChange={handleChange}
                placeholder="e.g. Auto-generating client reports from our CRM"
                className="mt-1 w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm text-[#1A1A1A] outline-none transition placeholder:text-black/25 focus:border-[#7D6B58] focus:ring-1 focus:ring-[#7D6B58]"
              />
            </div>

            {errorMsg && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full rounded-xl bg-[#1A1A1A] px-6 py-3 text-sm font-[600] text-white transition hover:bg-[#374151] disabled:opacity-50"
            >
              {status === 'submitting' ? 'Submitting\u2026' : 'Request early access'}
            </button>

            <p className="text-center text-[11px] text-black/30">
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
    <main className="mx-auto max-w-[720px] px-4 py-20 sm:px-6">

      {/* Hero */}
      <div className="mb-14">
        <p className="mb-3 text-xs font-[650] uppercase tracking-[0.12em] text-[#7D6B58]">
          Developer API
        </p>
        <h1 className="text-3xl font-[700] leading-tight tracking-tight text-[#1A1A1A] sm:text-4xl">
          Render readable PDFs<br className="hidden sm:block" /> from wide tables
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[#4B4B4B]">
          Use the fitforpdf API to generate structured PDFs from Excel exports, CSV datasets,
          and database tables. Built specifically for wide business tables that break normal PDF rendering.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <code className="rounded-lg bg-[#F5F3EE] px-3 py-2 text-sm text-[#1A1A1A]">
            {BASE_URL}
          </code>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-[500] text-emerald-700">
            No HTML templates. No PDF layout code.
          </span>
        </div>
      </div>

      {/* Why fitforpdf exists */}
      <section className="mb-14 border-t border-black/10 pt-10">
        <p className="mb-3 text-xs font-[650] uppercase tracking-[0.12em] text-[#7D6B58]">
          Why fitforpdf exists
        </p>
        <h2 className="mb-4 text-xl font-[700] leading-tight text-[#1A1A1A]">
          Wide tables break every PDF renderer
        </h2>
        <div className="space-y-3 text-sm leading-relaxed text-[#4B4B4B]">
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
      <section className="mb-14 border-t border-black/10 pt-10">
        <p className="mb-3 text-xs font-[650] uppercase tracking-[0.12em] text-[#7D6B58]">
          Typical use cases
        </p>
        <h2 className="mb-6 text-xl font-[700] leading-tight text-[#1A1A1A]">
          Built for SaaS products and data-heavy workflows
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {USE_CASES.map((uc) => (
            <div key={uc.label} className="rounded-xl border border-black/8 bg-[#FAFAF8] px-4 py-4">
              <p className="text-sm font-[650] text-[#1A1A1A]">{uc.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-[#6B6B6B]">{uc.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What makes fitforpdf different */}
      <section className="mb-14 border-t border-black/10 pt-10">
        <p className="mb-3 text-xs font-[650] uppercase tracking-[0.12em] text-[#7D6B58]">
          What makes fitforpdf different
        </p>
        <h2 className="mb-6 text-xl font-[700] leading-tight text-[#1A1A1A]">
          Designed around the wide-table problem
        </h2>
        <div className="space-y-4">
          {DIFFERENTIATORS.map((d) => (
            <div key={d.label} className="flex gap-3">
              <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#F5F3EE]">
                <svg className="h-3 w-3 text-[#7D6B58]" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-[650] text-[#1A1A1A]">{d.label}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-[#4B4B4B]">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick start */}
      <section className="mb-12 border-t border-black/10 pt-10">
        <h2 className="mb-4 text-xl font-[650] text-[#1A1A1A]">Quick start</h2>
        <p className="mb-4 text-sm text-[#4B4B4B]">
          Generate a PDF in one command:
        </p>
        <CodeBlock>{`curl -X POST \\
  -H "X-FITFORPDF-KEY: ffp_live_..." \\
  -F file=@your-data.csv \\
  ${BASE_URL}/render \\
  -o report.pdf`}</CodeBlock>
      </section>

      {/* Authentication */}
      <section className="mb-12 border-t border-black/10 pt-8">
        <h2 className="mb-4 text-xl font-[650] text-[#1A1A1A]">Authentication</h2>
        <p className="mb-4 text-sm text-[#4B4B4B]">
          Pass your API key in the <code className="rounded bg-[#F5F3EE] px-1.5 py-0.5 text-[13px]">X-FITFORPDF-KEY</code> header.
          Keys are prefixed <code className="rounded bg-[#F5F3EE] px-1.5 py-0.5 text-[13px]">ffp_live_</code> and
          should be kept server-side only.
        </p>
        <CodeBlock>{`curl -H "X-FITFORPDF-KEY: ffp_live_..." \\
  ${BASE_URL}/quota`}</CodeBlock>
        <p className="mt-3 text-xs text-[#7D6B58]">
          <a href="#request-access" className="underline underline-offset-2 hover:text-[#1A1A1A]">
            Request early access
          </a>{' '}
          to get your key.
        </p>
      </section>

      {/* Endpoints */}
      <section className="mb-12">
        <h2 className="mb-2 text-xl font-[650] text-[#1A1A1A]">Endpoints</h2>
        {ENDPOINTS.map((ep) => (
          <EndpointCard key={ep.path} endpoint={ep} />
        ))}
      </section>

      {/* Render options */}
      <section className="mb-12 border-t border-black/10 pt-8">
        <h2 className="mb-4 text-xl font-[650] text-[#1A1A1A]">Render options</h2>
        <p className="mb-4 text-sm text-[#4B4B4B]">
          Pass as a JSON string in the <code className="rounded bg-[#F5F3EE] px-1.5 py-0.5 text-[13px]">options</code> form field.
        </p>
        <div className="overflow-x-auto rounded-xl border border-black/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 bg-[#FAFAF8]">
                <th className="px-4 py-2 font-[600] text-[#1A1A1A]">Key</th>
                <th className="px-4 py-2 font-[600] text-[#1A1A1A]">Type</th>
                <th className="px-4 py-2 font-[600] text-[#1A1A1A]">Values</th>
                <th className="px-4 py-2 font-[600] text-[#1A1A1A]">Default</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {RENDER_OPTIONS.map((opt) => (
                <tr key={opt.key}>
                  <td className="px-4 py-2"><code className="text-[13px]">{opt.key}</code></td>
                  <td className="px-4 py-2 text-[#6B6B6B]">{opt.type}</td>
                  <td className="px-4 py-2 text-[#6B6B6B]">{opt.values}</td>
                  <td className="px-4 py-2"><code className="text-[13px]">{opt.def}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Response headers */}
      <section className="mb-12 border-t border-black/10 pt-8">
        <h2 className="mb-4 text-xl font-[650] text-[#1A1A1A]">Response headers</h2>
        <p className="mb-4 text-sm text-[#4B4B4B]">
          Every <code className="rounded bg-[#F5F3EE] px-1.5 py-0.5 text-[13px]">/v1/render</code> response includes these headers:
        </p>
        <div className="overflow-x-auto rounded-xl border border-black/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 bg-[#FAFAF8]">
                <th className="px-4 py-2 font-[600] text-[#1A1A1A]">Header</th>
                <th className="px-4 py-2 font-[600] text-[#1A1A1A]">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {RESPONSE_HEADERS.map((h) => (
                <tr key={h.header}>
                  <td className="px-4 py-2"><code className="text-[13px]">{h.header}</code></td>
                  <td className="px-4 py-2 text-[#6B6B6B]">{h.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Rate limiting */}
      <section className="mb-12 border-t border-black/10 pt-8">
        <h2 className="mb-4 text-xl font-[650] text-[#1A1A1A]">Rate limiting</h2>
        <p className="text-sm text-[#4B4B4B]">
          <strong>60 requests per minute</strong> per API key.
          Rate limit state is returned in headers:{' '}
          <code className="rounded bg-[#F5F3EE] px-1.5 py-0.5 text-[13px]">X-RateLimit-Limit</code>,{' '}
          <code className="rounded bg-[#F5F3EE] px-1.5 py-0.5 text-[13px]">X-RateLimit-Remaining</code>, and{' '}
          <code className="rounded bg-[#F5F3EE] px-1.5 py-0.5 text-[13px]">Retry-After</code> (on 429).
          Maximum 50 columns and 5,000 rows per request.
        </p>
        <p className="mt-3 text-xs text-[#7D6B58]">
          Designed for business reporting exports.
        </p>
      </section>

      {/* Error codes */}
      <section className="mb-14 border-t border-black/10 pt-8">
        <h2 className="mb-4 text-xl font-[650] text-[#1A1A1A]">Error codes</h2>
        <p className="mb-4 text-sm text-[#4B4B4B]">
          All errors use a standard envelope:
        </p>
        <CodeBlock>{`{
  "error": {
    "code": "api_key_missing",
    "message": "Missing X-FITFORPDF-KEY header",
    "requestId": "req-123"
  }
}`}</CodeBlock>
        <div className="mt-4 overflow-x-auto rounded-xl border border-black/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 bg-[#FAFAF8]">
                <th className="px-4 py-2 font-[600] text-[#1A1A1A]">HTTP</th>
                <th className="px-4 py-2 font-[600] text-[#1A1A1A]">Code</th>
                <th className="px-4 py-2 font-[600] text-[#1A1A1A]">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {ERROR_CODES.map((e) => (
                <tr key={e.code}>
                  <td className="px-4 py-2 font-[500]">{e.http}</td>
                  <td className="px-4 py-2"><code className="text-[13px]">{e.code}</code></td>
                  <td className="px-4 py-2 text-[#6B6B6B]">{e.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Integrate in minutes callout */}
      <div className="mb-6 text-center">
        <p className="text-xs font-[650] uppercase tracking-[0.12em] text-[#7D6B58]">
          Integrate in minutes.
        </p>
        <p className="mt-1 text-sm text-[#4B4B4B]">
          One endpoint, one file upload, one PDF back.
        </p>
      </div>

      {/* Request access */}
      <RequestAccessForm />
    </main>
  );
}
