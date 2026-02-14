'use client';

import { PRICING_CARDS, PRICING_PAGE_COPY } from '../siteCopy.mjs';
import { UI_TOKENS } from '../ui/tokens.mjs';

function renderAction(plan) {
  if (plan.actionType === 'link' && !plan.disabled) {
    return (
      <a className="planAction planActionPrimary" href={plan.actionHref}>
        {plan.actionLabel}
      </a>
    );
  }

  if (plan.actionType === 'link') {
    return (
      <a className="planAction planActionDisabled" href={plan.actionHref} aria-disabled="true">
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
          --accent: ${UI_TOKENS.accent};
          min-height: 100vh;
          background: ${UI_TOKENS.bg};
          color: #111827;
          padding: ${UI_TOKENS.spacing.x24};
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif;
          font-size: ${UI_TOKENS.text.body.size};
          line-height: ${UI_TOKENS.text.body.lineHeight};
        }
        .container {
          max-width: ${UI_TOKENS.contentMaxWidth};
          margin: 0 auto;
          display: grid;
          gap: ${UI_TOKENS.spacing.x24};
        }
        .back {
          width: fit-content;
          border: ${UI_TOKENS.border};
          border-radius: ${UI_TOKENS.radius.pill};
          padding: 0.45rem 0.8rem;
          text-decoration: none;
          color: #111827;
          transition: transform ${UI_TOKENS.motion.duration} ease, opacity ${UI_TOKENS.motion.duration} ease;
        }
        .back:hover {
          transform: translateY(1px);
          opacity: 0.9;
        }
        .hero {
          display: grid;
          gap: 0.4rem;
        }
        .title {
          margin: 0;
          font-size: ${UI_TOKENS.text.h1.sizeMobile};
          font-weight: ${UI_TOKENS.text.h1.weight};
          letter-spacing: 0.01em;
        }
        .subtitle,
        .muted {
          margin: 0;
          color: ${UI_TOKENS.text.muted};
        }
        .plans {
          display: grid;
          gap: ${UI_TOKENS.spacing.x12};
        }
        .planCard {
          border: ${UI_TOKENS.border};
          border-radius: ${UI_TOKENS.radius.card};
          padding: ${UI_TOKENS.spacing.x24};
          display: grid;
          gap: 0.5rem;
          background: #fff;
        }
        .planCardRecommended {
          border-color: rgba(200, 30, 30, 0.55);
          outline: 1px solid rgba(200, 30, 30, 0.15);
        }
        .planTitle {
          margin: 0;
          font-size: 1.08rem;
        }
        .planPrice {
          margin: 0;
          color: var(--accent);
          font-weight: 650;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .planAction {
          border: ${UI_TOKENS.border};
          border-radius: ${UI_TOKENS.radius.pill};
          padding: 0.5rem 0.9rem;
          background: #fff;
          color: #111827;
          text-decoration: none;
          font-weight: 600;
          width: fit-content;
          transition: transform ${UI_TOKENS.motion.duration} ease, opacity ${UI_TOKENS.motion.duration} ease;
          cursor: pointer;
        }
        .planAction:hover:not(:disabled) {
          transform: translateY(1px);
          opacity: 0.9;
        }
        .planActionPrimary {
          background: var(--accent);
          border-color: var(--accent);
          color: #fff;
        }
        .planActionDisabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .planAction[disabled] {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .planList {
          margin: 0;
          padding-left: 1.1rem;
          display: grid;
          gap: 0.35rem;
          color: ${UI_TOKENS.text.muted};
        }
        .faq {
          border: ${UI_TOKENS.border};
          border-radius: ${UI_TOKENS.radius.card};
          padding: 0.95rem;
          display: grid;
          gap: 0.6rem;
        }

        @media (min-width: 781px) {
          .pricing-page {
            padding: ${UI_TOKENS.spacing.x32};
          }
          .title {
            font-size: ${UI_TOKENS.text.h1.sizeDesktop};
          }
          .plans {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="container">
        <a className="back" href={PRICING_PAGE_COPY.backToAppHref}>
          {PRICING_PAGE_COPY.backToApp}
        </a>

        <header className="hero">
          <h1 className="title">{PRICING_PAGE_COPY.pageTitle}</h1>
          <p className="subtitle">{PRICING_PAGE_COPY.pageSubtitle}</p>
        </header>

        <section className="plans" aria-label="Plans">
          {PRICING_CARDS.map((plan) => (
            <article className={`planCard ${plan.recommended ? 'planCardRecommended' : ''}`} key={plan.id}>
              <h2 className="planTitle">{plan.title}</h2>
              <p className="planPrice">{plan.priceLine}</p>
              {plan.points.length ? (
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
          <h2 style={{ margin: 0, fontSize: '1.05rem' }}>FAQ</h2>
          <ol className="planList">
            {PRICING_PAGE_COPY.faq.map((item) => (
              <li key={item.question}>
                <p style={{ margin: '0 0 0.25rem' }}><strong>{item.question}</strong></p>
                <p style={{ margin: 0 }}>{item.answer}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
