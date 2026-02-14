import React from 'react';

import { PRIVACY_PAGE_COPY } from '../siteCopy.mjs';
import Section from '../components/Section';
import Accordion from '../components/Accordion';
import PageHero from '../components/PageHero';

function BulletList({ values }) {
  return (
    <ul className="list-disc space-y-2 pl-6 text-sm text-slate-700">
      {values.map((value) => (
        <li key={value}>{value}</li>
      ))}
    </ul>
  );
}

function PillarCard({ title, bullets }) {
  return (
    <article className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <BulletList values={bullets} />
    </article>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Section id="privacy-hero" index={0} className="py-28">
        <PageHero
          variant="privacy"
          align="center"
          eyebrow={PRIVACY_PAGE_COPY.heroLabel}
          title={(
            <>
              <span className="block">{PRIVACY_PAGE_COPY.pageTitle}</span>
              <span className="block text-slate-600">{PRIVACY_PAGE_COPY.pageTitleAccent}</span>
            </>
          )}
          subtitle={PRIVACY_PAGE_COPY.pageSubtitle}
          trustLine={PRIVACY_PAGE_COPY.microLine}
          titleClassName="mt-4 text-4xl font-[650] leading-tight tracking-tight sm:text-[56px]"
          headingTestId="privacy-h1"
        />
      </Section>

      <Section id="privacy-handling" index={1} className="py-28">
        <div className="mx-auto max-w-4xl space-y-6">
          <h2 className="text-3xl font-semibold">{PRIVACY_PAGE_COPY.handlingTitle}</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <PillarCard title={PRIVACY_PAGE_COPY.files.title} bullets={PRIVACY_PAGE_COPY.files.bullets} />
            <PillarCard
              title={PRIVACY_PAGE_COPY.generatedPdf.title}
              bullets={PRIVACY_PAGE_COPY.generatedPdf.bullets}
            />
          </div>
        </div>
      </Section>

      <Section id="privacy-logs" index={2} bg="bg-white" className="py-20">
        <div className="mx-auto max-w-4xl space-y-4">
          <h2 className="text-3xl font-semibold">{PRIVACY_PAGE_COPY.logs.title}</h2>
          <BulletList values={PRIVACY_PAGE_COPY.logs.bullets} />
        </div>
      </Section>

      <Section id="privacy-dont-do" index={3} className="py-28">
        <div className="mx-auto max-w-4xl space-y-4">
          <h2 className="text-3xl font-semibold">{PRIVACY_PAGE_COPY.dontDoTitle}</h2>
          <BulletList values={PRIVACY_PAGE_COPY.dontDo} />
        </div>
      </Section>

      <Section id="privacy-infrastructure" index={4} className="py-28">
        <div className="mx-auto max-w-4xl space-y-4">
          <h2 className="text-3xl font-semibold">{PRIVACY_PAGE_COPY.infrastructureTitle}</h2>
          <BulletList values={PRIVACY_PAGE_COPY.infrastructure} />
        </div>
      </Section>

      <Section id="privacy-legal" index={5} className="py-12">
        <div className="mx-auto flex max-w-4xl flex-col gap-3">
          <p className="text-sm text-slate-500">{PRIVACY_PAGE_COPY.legalFooter}</p>
          {/* placeholder contact email until full support flow is finalized */}
          <a
            className="inline-flex w-fit text-sm font-medium text-slate-700 underline underline-offset-4"
            href={`mailto:${PRIVACY_PAGE_COPY.contactEmail}`}
          >
            {PRIVACY_PAGE_COPY.contactLabel}
          </a>
          <p className="text-sm text-slate-600">{PRIVACY_PAGE_COPY.sensitiveDataNote}</p>
        </div>
      </Section>
      <Section id="privacy-faq" index={6} className="py-28">
        <div className="mx-auto max-w-4xl">
          <Accordion title="Frequently asked questions" items={PRIVACY_PAGE_COPY.faq} />
        </div>
      </Section>
    </div>
  );
}
