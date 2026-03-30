import Section from '../components/ui/Section';
import PageHero from '../components/PageHero';

const CHANGELOG = [
  { date: '2026-03-30', title: 'fitforpdf GPT on ChatGPT Store', description: 'Ask questions about fitforpdf, get usage tips, and explore features directly from ChatGPT.', link: 'https://chatgpt.com/g/g-69cab3c8703c819198473179392510ca-fitforpdf' },
  { date: '2026-03-26', title: 'Shareable review links', description: 'Copy a secure review link after generating a PDF. Anyone with the link can view it until it expires.' },
  { date: '2026-03-01', title: 'API Beta Launch', description: 'REST API now available for early access. 50 free exports included with every API key.' },
  { date: '2026-02-15', title: 'Pro Plan', description: 'Monthly subscription with 500 exports/month. Designed for teams and power users.' },
  { date: '2026-01-20', title: 'Public Launch', description: 'fitforpdf is live. Upload Excel or CSV, get structured PDFs instantly. 3 free exports to start.' },
];

export default function ChangelogPage() {
  return (
    <>
      <PageHero variant="default" title="Changelog" subtitle="What's new in fitforpdf." height="h-auto" contentClassName="items-center text-center py-16" />
      <Section id="changelog" index={0}>
        <div className="mx-auto max-w-2xl space-y-8">
          {CHANGELOG.map((entry) => (
            <div key={entry.date} className="flex gap-6 border-b border-[var(--color-border)] pb-8 last:border-0">
              <time className="shrink-0 text-sm font-medium text-[var(--color-muted)]">{entry.date}</time>
              <div>
                <h3 className="text-lg font-semibold">{entry.title}</h3>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{entry.description}</p>
                {entry.link && (
                  <a
                    href={entry.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm font-medium text-[var(--color-text)] underline underline-offset-4 decoration-1 transition-colors hover:text-cta"
                  >
                    Try it →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
