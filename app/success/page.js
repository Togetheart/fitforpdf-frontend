export default function SuccessPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '2rem',
        display: 'grid',
        placeItems: 'center',
        background: '#fff',
        color: '#111827',
        fontFamily: '"Avenir Next", "Avenir", "Segoe UI", sans-serif',
      }}
    >
      <section style={{
        maxWidth: '28rem',
        textAlign: 'center',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '1.25rem',
      }}>
        <h1 style={{ marginTop: 0, color: '#c81e1e' }}>Payment received.</h1>
        <p style={{ margin: '0 0 1rem' }}>Credits will be available shortly.</p>
        <a
          href="/"
          style={{
            display: 'inline-block',
            color: '#c81e1e',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Return to FitForPDF
        </a>
      </section>
    </main>
  );
}
