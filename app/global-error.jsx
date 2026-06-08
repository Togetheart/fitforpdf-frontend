'use client';

// Last-resort boundary for an error thrown in the ROOT layout itself. It REPLACES
// the layout, so globals.css and the fonts are not available — every style here is
// inlined and dependency-free so this fallback can never itself fail.
export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '-apple-system, "Segoe UI", Roboto, sans-serif',
          background: '#FAF8F5',
          color: '#0F172A',
        }}
      >
        <div style={{ textAlign: 'center', padding: 24, maxWidth: 420 }}>
          <p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Something went wrong.</p>
          <p style={{ fontSize: 14, color: '#64748B', marginTop: 8, lineHeight: 1.5 }}>
            The page failed to load. Nothing you uploaded is stored.
          </p>
          <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                height: 40,
                padding: '0 20px',
                borderRadius: 999,
                border: 'none',
                background: '#2563EB',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                height: 40,
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0 20px',
                borderRadius: 999,
                border: '1px solid rgba(0,0,0,0.1)',
                color: '#0F172A',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Back to home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
