'use client';

import React, { useState, useCallback } from 'react';

const CURL_LINES = [
  { type: 'comment', text: '# Convert any HTML to a pixel-perfect PDF' },
  { type: 'command', parts: [
    { cls: 'code-keyword', text: 'curl' },
    { cls: null, text: ' -X ' },
    { cls: 'code-keyword', text: 'POST' },
    { cls: null, text: ' ' },
    { cls: 'code-string', text: 'https://api.fitforpdf.com/v1/render' },
    { cls: null, text: ' \\' },
  ]},
  { type: 'flag', parts: [
    { cls: null, text: '  -H ' },
    { cls: 'code-string', text: '"Authorization: Bearer $API_KEY"' },
    { cls: null, text: ' \\' },
  ]},
  { type: 'flag', parts: [
    { cls: null, text: '  -H ' },
    { cls: 'code-string', text: '"Content-Type: application/json"' },
    { cls: null, text: ' \\' },
  ]},
  { type: 'flag', parts: [
    { cls: null, text: '  -d ' },
    { cls: 'code-string', text: '\'{"url": "https://example.com/invoice"}\'' },
  ]},
];

const CURL_RAW = `curl -X POST https://api.fitforpdf.com/v1/render \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com/invoice"}'`;

const RESPONSE_JSON = `{
  "status": "success",
  "pdf_url": "https://api.fitforpdf.com/v1/files/abc123.pdf",
  "pages": 2,
  "size_bytes": 184320
}`;

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-150 border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-accent/40"
      aria-label={copied ? 'Copied' : 'Copy to clipboard'}
    >
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

function CodeLine({ line }) {
  if (line.type === 'comment') {
    return <div className="code-comment">{line.text}</div>;
  }
  return (
    <div>
      {line.parts.map((part, i) =>
        part.cls ? (
          <span key={i} className={part.cls}>{part.text}</span>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </div>
  );
}

export default function ApiTeaserWidget({ variant } = {}) {
  const [showResponse, setShowResponse] = useState(false);
  const isDark = variant === 'dark';

  const wrapCls = isDark ? 'w-full' : 'w-full max-w-2xl mx-auto';
  const cardCls = isDark
    ? 'rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.06]'
    : 'glass-elevated rounded-xl overflow-hidden';
  const headerBorder = isDark ? 'border-white/[0.06]' : 'border-[var(--color-border)]';
  const mutedText = isDark ? 'text-slate-500' : 'text-[var(--color-muted)]';
  const codeText = isDark ? 'text-slate-300' : 'text-[var(--color-text)]';
  const btnCls = isDark
    ? 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/25'
    : 'bg-accent/10 text-accent hover:bg-accent/20';
  const respCardCls = isDark
    ? 'bg-white/[0.04] border border-white/[0.06] rounded-xl overflow-hidden'
    : 'glass rounded-xl overflow-hidden';
  const respMuted = isDark ? 'text-slate-500' : 'text-[var(--color-muted)]';
  const copyBtnCls = isDark
    ? 'border-white/10 bg-white/[0.04] text-slate-500 hover:text-slate-300 hover:border-white/20'
    : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-accent/40';

  return (
    <div className={wrapCls}>
      {/* Request block */}
      <div className={cardCls}>
        {/* Header bar */}
        <div className={`flex items-center justify-between px-4 py-2.5 border-b ${headerBorder}`}>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-400/70" />
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-400/70" />
            <span className={`ml-2 text-xs font-medium ${mutedText}`}>Terminal</span>
          </div>
          <button
            onClick={async () => {
              try { await navigator.clipboard.writeText(CURL_RAW); } catch {}
            }}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-150 border ${copyBtnCls}`}
            aria-label="Copy to clipboard"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy
          </button>
        </div>

        {/* Code body */}
        <pre className={`px-4 py-4 text-[13px] leading-relaxed overflow-x-auto font-mono ${codeText}`}>
          <code>
            {CURL_LINES.map((line, i) => (
              <CodeLine key={i} line={line} />
            ))}
          </code>
        </pre>

        {/* Run button */}
        <div className="px-4 pb-4">
          <button
            onClick={() => setShowResponse((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ${btnCls}`}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className={`transition-transform duration-200 ${showResponse ? 'rotate-90' : ''}`}
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            {showResponse ? 'Hide response' : 'Run'}
          </button>
        </div>
      </div>

      {/* Response block */}
      <div
        className={`mt-3 ${respCardCls} transition-all duration-300 ${
          showResponse
            ? 'opacity-100 max-h-60 translate-y-0'
            : 'opacity-0 max-h-0 translate-y-2 pointer-events-none'
        }`}
      >
        <div className={`flex items-center gap-2 px-4 py-2 border-b ${headerBorder}`}>
          <span className="inline-flex items-center rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold text-green-400">
            200 OK
          </span>
          <span className={`text-xs ${respMuted}`}>application/json</span>
        </div>
        <pre className={`px-4 py-3 text-[13px] leading-relaxed overflow-x-auto font-mono ${codeText}`}>
          <code>
            <span className="code-comment">{'// Response'}</span>
            {'\n'}
            {RESPONSE_JSON.split('\n').map((line, i) => {
              const highlighted = line
                .replace(/"(\w+)":/g, '<key>"$1"</key>:')
                .replace(/: "(.*?)"/g, ': <str>"$1"</str>');

              if (highlighted.includes('<key>') || highlighted.includes('<str>')) {
                const parts = [];
                let remaining = highlighted;
                let key = 0;
                while (remaining.length > 0) {
                  const keyMatch = remaining.match(/^(.*?)<key>(.*?)<\/key>/);
                  const strMatch = remaining.match(/^(.*?)<str>(.*?)<\/str>/);

                  if (keyMatch && (!strMatch || keyMatch.index <= strMatch.index)) {
                    if (keyMatch[1]) parts.push(<span key={key++}>{keyMatch[1]}</span>);
                    parts.push(<span key={key++} className="code-keyword">{keyMatch[2]}</span>);
                    remaining = remaining.slice(keyMatch[0].length);
                  } else if (strMatch) {
                    if (strMatch[1]) parts.push(<span key={key++}>{strMatch[1]}</span>);
                    parts.push(<span key={key++} className="code-string">{strMatch[2]}</span>);
                    remaining = remaining.slice(strMatch[0].length);
                  } else {
                    parts.push(<span key={key++}>{remaining}</span>);
                    break;
                  }
                }
                return <div key={i}>{parts}</div>;
              }
              return <div key={i}>{line}</div>;
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}
