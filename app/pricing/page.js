'use client';

import { PRICING_CARDS, PRICING_PAGE_COPY } from '../siteCopy.mjs';

export function getPricingPageSections() {
  return {
    title: PRICING_PAGE_COPY.pageTitle,
    subtitle: PRICING_PAGE_COPY.pageSubtitle,
    cards: PRICING_CARDS,
    retentionTitle: PRICING_PAGE_COPY.retentionTitle,
    apiTitle: PRICING_PAGE_COPY.apiTitle,
    apiCopy: PRICING_PAGE_COPY.apiCopy,
  };
}

export default function PricingPage() {
  return (
    <main className="pricing-page">
      <style jsx>{`
        .pricing-page {
          --accent: #c81e1e;
          min-height: 100vh;
          background: #fff;
          color: #111827;
          padding: clamp(1.25rem, 2.5vw, 2.5rem);
          font-family: "Avenir Next", "Avenir", "Segoe UI", sans-serif;
        }
        .container {
          max-width: 60rem;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .back {
          color: #111827;
          text-decoration: none;
          font-weight: 600;
          width: fit-content;
          border: 1px solid #e5e7eb;
          padding: 0.45rem 0.85rem;
          border-radius: 10px;
          transition: transform 140ms ease, opacity 140ms ease;
        }
        .back:hover {
          transform: translateY(-1px);
          opacity: 0.94;
          text-decoration: underline;
        }
        .header {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .title {
          margin: 0;
          font-size: 2rem;
          letter-spacing: 0.01em;
          color: #0f172a;
        }
        .subtitle {
          margin: 0;
          color: #475569;
          max-width: 56ch;
        }
        .grid {
          margin-top: 0.8rem;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.75rem;
        }
        .planCard {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1rem;
          background: #fff;
        }
        .planTitle {
          margin: 0;
          font-size: 1.05rem;
          color: #0f172a;
        }
        .planPrice {
          margin: 0.5rem 0;
          color: var(--accent);
          font-weight: 700;
        }
        .planList {
          margin: 0.75rem 0 0;
          padding-left: 1.2rem;
          color: #334155;
          display: grid;
          gap: 0.25rem;
        }
        .action {
          margin-top: 0.9rem;
          border: 1px solid #e5e7eb;
          background: #fff;
          color: #111827;
          border-radius: 10px;
          padding: 0.55rem 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 140ms ease;
        }
        .action:hover:not(:disabled) {
          opacity: 0.94;
        }
        .action:disabled {
          opacity: 0.5;
          cursor: default;
        }
        .section {
          margin-top: 0.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1rem;
          background: #fff;
        }
        .sectionTitle {
          margin: 0;
        }
        .retentionList {
          margin: 0.75rem 0 0;
          padding-left: 1.2rem;
          color: #334155;
          display: grid;
          gap: 0.35rem;
        }
        .pending {
          font-size: 0.75rem;
          margin-left: 0.5rem;
          color: #991b1b;
          border: 1px solid #fecaca;
          background: #fff5f5;
          border-radius: 999px;
          padding: 0.1rem 0.45rem;
        }
        @media (max-width: 880px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div className="container">
        <a href="/" className="back">
          {PRICING_PAGE_COPY.backToApp}
        </a>

        <header className="header">
          <h1 className="title">{PRICING_PAGE_COPY.pageTitle}</h1>
          <p className="subtitle">{PRICING_PAGE_COPY.pageSubtitle}</p>
        </header>

        <section className="grid" aria-label="Plans">
          {PRICING_CARDS.map((plan) => (
            <article className="planCard" key={plan.id}>
              <h2 className="planTitle">{plan.title}</h2>
              {plan.priceLine ? <p className="planPrice">{plan.priceLine}</p> : null}
              <ul className="planList">
                {plan.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              {plan.id === 'free' ? null : (
                <button type="button" className="action" disabled>
                  {PRICING_PAGE_COPY.disabledButtonLabel}
                </button>
              )}
            </article>
          ))}
        </section>

        <section className="section" aria-label="API">
          <h2 className="sectionTitle">{PRICING_PAGE_COPY.apiTitle}</h2>
          <p style={{ marginTop: '0.5rem', color: '#334155' }}>{PRICING_PAGE_COPY.apiCopy}</p>
        </section>

        <section className="section" aria-label="Privacy">
          <h2 className="sectionTitle">{PRICING_PAGE_COPY.retentionTitle}</h2>
          <ul className="retentionList">
            <li>
              {PRICING_PAGE_COPY.filesDeleted}
              <span className="pending">{PRICING_PAGE_COPY.plannedLabel}</span>
            </li>
            <li>
              {PRICING_PAGE_COPY.pdfsDeleted}
              <span className="pending">{PRICING_PAGE_COPY.plannedLabel}</span>
            </li>
            <li>
              {PRICING_PAGE_COPY.noLogs}
              <span className="pending">{PRICING_PAGE_COPY.plannedLabel}</span>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
