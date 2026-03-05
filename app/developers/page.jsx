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
    description: 'Upload a CSV or XLSX file (max 10 MB) and receive a client-ready PDF.',
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

export default function DevelopersPage() {
  return (
    <main className="mx-auto max-w-[720px] px-4 py-20 sm:px-6">
      {/* Hero */}
      <div className="mb-12">
        <p className="mb-3 text-xs font-[650] uppercase tracking-[0.12em] text-[#7D6B58]">
          Developer API
        </p>
        <h1 className="text-3xl font-[700] leading-tight tracking-tight text-[#1A1A1A] sm:text-4xl">
          Turn spreadsheets into PDFs with one API call
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[#4B4B4B]">
          Send a CSV or XLSX file, get back a client-ready PDF.
          Built for automation, agents, and developer workflows.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <code className="rounded-lg bg-[#F5F3EE] px-3 py-2 text-sm text-[#1A1A1A]">
            {BASE_URL}
          </code>
        </div>
      </div>

      {/* Quick start */}
      <section className="mb-12">
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
          To request an API key, contact us via{' '}
          <a href="https://t.me/CrabiAssistantBot" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-[#1A1A1A]">
            Telegram
          </a>.
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
        </p>
      </section>

      {/* Error codes */}
      <section className="mb-12 border-t border-black/10 pt-8">
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

      {/* CTA */}
      <section className="rounded-2xl bg-[#F5F3EE] px-6 py-8 text-center">
        <h2 className="text-lg font-[650] text-[#1A1A1A]">Ready to integrate?</h2>
        <p className="mt-2 text-sm text-[#4B4B4B]">
          Get your API key and start generating PDFs in minutes.
        </p>
        <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href="https://t.me/CrabiAssistantBot"
            target="_blank"
            rel="noreferrer"
            className="inline-block rounded-xl bg-[#1A1A1A] px-6 py-3 text-sm font-[600] text-white transition hover:bg-[#374151]"
          >
            Request an API key
          </a>
          <a
            href="/"
            className="inline-block rounded-xl border border-black/10 bg-white px-6 py-3 text-sm font-[600] text-[#1A1A1A] transition hover:bg-[#FAFAF8]"
          >
            Try the web app
          </a>
        </div>
      </section>
    </main>
  );
}
