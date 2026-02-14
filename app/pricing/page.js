'use client';

import { PRICING_CARDS, PRICING_FAQ, PRICING_PAGE_COPY } from '../siteCopy.mjs';

export function getPricingPageSections() {
  return {
    title: PRICING_PAGE_COPY.pageTitle,
    subtitle: PRICING_PAGE_COPY.pageSubtitle,
    cards: PRICING_CARDS,
    faq: PRICING_FAQ,
    backToAppLabel: PRICING_PAGE_COPY.backToApp,
    backToAppHref: PRICING_PAGE_COPY.backToAppHref,
    retentionTitle: PRICING_PAGE_COPY.retentionTitle,
    retention: [
      PRICING_PAGE_COPY.filesDeleted,
      PRICING_PAGE_COPY.pdfsDeleted,
      PRICING_PAGE_COPY.noLogs,
    ],
    plannedLabel: PRICING_PAGE_COPY.plannedLabel,
  };
}

function renderAction(plan) {
  if (plan.actionType === 'link' && !plan.disabled) {
    return (
      <a href={plan.actionHref} className={`planAction ${plan.id === 'api' ? 'planActionPrimary' : ''}`}>
        {plan.actionLabel}
      </a>
    );
  }

  if (plan.actionType === 'link' && plan.disabled) {
    return (
      <a href={plan.actionHref} className="planAction planActionDisabled" aria-disabled="true">
        {plan.actionLabel}
      </a>
    );
  }

  return (
    <button
      type="button"
      className="planAction"
      disabled={plan.disabled}
      title={plan.tooltip}
    >
      {plan.actionLabel}
    </button>
  );
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
          padding: clamp(1.25rem, 2.6vw, 2.5rem);
          font-family: 'Avenir Next', 'Avenir', 'Segoe UI', sans-serif;
        }
        .container {
          max-width: 60rem;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
        }
        .backToApp {
          width: fit-content;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 0.45rem 0.85rem;
          color: #0f172a;
          text-decoration: none;
          font-weight: 600;
          transition: opacity 140ms ease, transform 140ms ease;
        }
        .backToApp:hover {
          transform: translateY(-1px);
          opacity: 0.95;
          text-decoration: underline;
        }
        .hero {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
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
        .plans {
          margin-top: 0.2rem;
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }
        .planCard {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1rem;
          background: #fff;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          transition: transform 140ms ease, box-shadow 140ms ease;
        }
        .planCard:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 18px rgba(2, 6, 23, 0.06);
        }
        .planCardRecommended {
          border-color: rgba(200, 30, 30, 0.45);
          outline: 1px solid rgba(200, 30, 30, 0.15);
        }
        .planTitle {
          margin: 0;
          font-size: 1.05rem;
          color: #0f172a;
        }
        .planPrice {
          margin: 0;
          color: var(--accent);
          font-weight: 700;
        }
        .planList {
          margin: 0;
          padding-left: 1.2rem;
          color: #334155;
          display: grid;
          gap: 0.25rem;
        }
        .planAction {
          margin-top: auto;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 0.55rem 0.9rem;
          background: #fff;
          color: #111827;
          text-align: center;
          text-decoration: none;
          font-weight: 600;
          transition: transform 140ms ease, opacity 140ms ease;
          width: fit-content;
        }
        .planAction:hover:not(:disabled) {
          transform: translateY(-1px);
          opacity: 0.95;
        }
        .planActionPrimary {
          background: var(--accent);
          color: #fff;
          border-color: var(--accent);
        }
        .planAction:disabled,
        .planActionDisabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .faq,
        .privacy {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1rem;
          background: #fff;
          display: grid;
          gap: 0.8rem;
        }
        .sectionTitle {
          margin: 0;
        }
        .faqList,
        .privacyList {
          margin: 0;
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
      `}</style>

      <div className="container">
        <a href={getPricingPageSections().backToAppHref} className="backToApp">
          {getPricingPageSections().backToAppLabel}
        </a>

        <header className="hero">
          <h1 className="title">{PRICING_PAGE_COPY.pageTitle}</h1>
          <p className="subtitle">{PRICING_PAGE_COPY.pageSubtitle}</p>
        </header>

        <section className="plans" aria-label="Pricing plans">
          {PRICING_CARDS.map((plan) => (
            <article className={`planCard ${plan.recommended ? 'planCardRecommended' : ''}`} key={plan.id}>
              <h2 className="planTitle">{plan.title}</h2>
              <p className="planPrice">{plan.priceLine}</p>
              {plan.points.length > 0 ? (
                <ul className="planList">
                  {plan.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              ) : null}
              {renderAction(plan)}
            </article>
          ))}
        </section>

        <section className="faq" aria-label="FAQ">
          <h2 className="sectionTitle">FAQ</h2>
          <ol className="faqList">
            {PRICING_FAQ.map((item) => (
              <li key={item.question}>
                <p style={{ margin: 0, fontWeight: 600 }}>{item.question}</p>
                {item.link ? (
                  <p style={{ margin: '0.3rem 0 0' }}>
                    {item.answer} <a href={item.link}>Privacy page</a>.
                  </p>
                ) : (
                  <p style={{ margin: '0.3rem 0 0' }}>{item.answer}</p>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section className="privacy" aria-label="Privacy and retention">
          <h2 className="sectionTitle">{PRICING_PAGE_COPY.retentionTitle}</h2>
          <ul className="privacyList">
            {[
              PRICING_PAGE_COPY.filesDeleted,
              PRICING_PAGE_COPY.pdfsDeleted,
              PRICING_PAGE_COPY.noLogs,
            ].map((item) => (
              <li key={item}>
                {item}
                <span className="pending">{PRICING_PAGE_COPY.plannedLabel}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
