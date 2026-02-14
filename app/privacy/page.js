'use client';

import { PRIVACY_PAGE_COPY } from '../siteCopy.mjs';

export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <style jsx>{`
        .privacy-page {
          --accent: #c81e1e;
          min-height: 100vh;
          background: #ffffff;
          color: #111827;
          padding: clamp(1.25rem, 2.6vw, 2.5rem);
          font-family: 'Avenir Next', 'Avenir', 'Segoe UI', sans-serif;
        }
        .container {
          max-width: 58rem;
          margin: 0 auto;
          display: grid;
          gap: 1rem;
        }
        .header {
          display: grid;
          gap: 0.45rem;
        }
        .title {
          margin: 0;
          font-size: 2rem;
          letter-spacing: 0.01em;
          color: #0f172a;
        }
        .intro {
          margin: 0;
          color: #374151;
          line-height: 1.45;
          max-width: 64ch;
        }
        .section {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1rem;
          background: #fff;
          display: grid;
          gap: 0.65rem;
        }
        .sectionTitle {
          margin: 0;
          color: #0f172a;
        }
        .list {
          margin: 0;
          padding-left: 1.2rem;
          display: grid;
          gap: 0.4rem;
          color: #334155;
        }
        .note {
          border-left: 3px solid var(--accent);
          padding: 0.55rem 0.7rem;
          border-radius: 8px;
          background: #fff7f7;
          color: #7f1d1d;
          font-weight: 600;
        }
        .muted {
          color: #334155;
          margin: 0;
        }
        .contact {
          display: inline-block;
          width: fit-content;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 0.45rem 0.85rem;
          color: #111827;
          text-decoration: none;
          font-weight: 600;
          transition: transform 140ms ease, opacity 140ms ease;
        }
        .contact:hover {
          transform: translateY(-1px);
          opacity: 0.95;
          text-decoration: underline;
        }
      `}</style>

      <div className="container">
        <header className="header">
          <h1 className="title">{PRIVACY_PAGE_COPY.pageTitle}</h1>
          <p className="intro">{PRIVACY_PAGE_COPY.intro}</p>
        </header>

        <section className="section" aria-label="Data processed">
          <h2 className="sectionTitle">Data processed</h2>
          <ul className="list">
            {PRIVACY_PAGE_COPY.dataProcessed.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="section" aria-label="Retention">
          <h2 className="sectionTitle">Retention</h2>
          <ul className="list">
            {PRIVACY_PAGE_COPY.retention.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="note">{PRIVACY_PAGE_COPY.sensitiveDataNote}</p>
        </section>

        <section className="section" aria-label="Logs">
          <h2 className="sectionTitle">Logs</h2>
          <ul className="list">
            {PRIVACY_PAGE_COPY.logs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="section" aria-label="Security">
          <h2 className="sectionTitle">Security</h2>
          <ul className="list">
            {PRIVACY_PAGE_COPY.security.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="section" aria-label="Contact">
          <h2 className="sectionTitle">Contact</h2>
          <p className="muted">If you need legal or data-related support:</p>
          <a href={`mailto:${PRIVACY_PAGE_COPY.contactEmail}`} className="contact">
            {PRIVACY_PAGE_COPY.contactEmail}
          </a>
        </section>
      </div>
    </main>
  );
}
