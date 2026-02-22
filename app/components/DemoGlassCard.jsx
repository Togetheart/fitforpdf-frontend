import React, { useState } from 'react';

const DEMO_IFRAME_SRC = 'https://www.fitforpdf.com/?utm_source=homepage&utm_medium=glass-demo';

export default function DemoGlassCard({
  label = 'Interactive demo',
  hint = 'No signup',
}) {
  const [isLoading, setIsLoading] = useState(true);

  function handleIframeLoad() {
    setIsLoading(false);
  }

  return (
    <section
      data-testid="demo-glass-card"
      className="relative mx-auto mt-6 flex w-full max-w-5xl flex-col gap-3 overflow-hidden rounded-3xl border border-black/10 bg-white/55 bg-gradient-to-b from-white/60 to-white/30 p-4 backdrop-blur-xl sm:p-6"
    >
      <div
        data-testid="demo-glass-highlight"
        className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-white/50 to-transparent"
      />
      <div className="relative">
        <header className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          <span>{label}</span>
          {hint ? <span>{hint}</span> : null}
        </header>
        <div
          data-testid="demo-glass-embed"
          className="aspect-[16/9] relative overflow-hidden rounded-xl bg-white/40"
        >
          {isLoading ? (
            <div
              data-testid="demo-glass-skeleton"
              className="absolute inset-0 animate-pulse bg-slate-200/80"
              aria-label="demo-loading"
            >
              <div className="h-full w-full bg-gradient-to-r from-white/30 via-white/60 to-white/30" />
            </div>
          ) : null}
          <iframe
            data-testid="demo-glass-iframe"
            src={DEMO_IFRAME_SRC}
            loading="lazy"
            title="FitForPDF interactive demo"
            className="h-full w-full border-0 bg-white/40"
            sandbox="allow-scripts allow-same-origin allow-forms"
            onLoad={handleIframeLoad}
          />
        </div>
      </div>
    </section>
  );
}
