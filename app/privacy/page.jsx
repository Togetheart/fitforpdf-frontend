import React from 'react';

import { PRIVACY_PAGE_COPY } from '../siteCopy.mjs';
import Section from '../components/Section';

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
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {PRIVACY_PAGE_COPY.heroLabel}
          </p>
          <h1 className="mt-4 text-4xl font-[650] leading-tight tracking-tight sm:text-[56px]">
            <span className="block">{PRIVACY_PAGE_COPY.pageTitle}</span>
            <span className="block text-slate-600">{PRIVACY_PAGE_COPY.pageTitleAccent}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-[46ch] text-sm text-slate-700 sm:text-base">
            {PRIVACY_PAGE_COPY.pageSubtitle}
          </p>
          <p className="mt-3 text-sm text-slate-500">{PRIVACY_PAGE_COPY.microLine}</p>
        </div>
      </Section>

      <Section id="privacy-handling" index={1} className="py-28">
        <div className="mx-auto max-w-4xl space-y-6">
          <h2 className="text-3xl font-semibold">{PRIVACY_PAGE_COPY.handlingTitle}</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <PillarCard title={PRIVACY_PAGE_COPY.files.title} bullets={PRIVACY_PAGE_COPY.files.bullets} />
            <PillarCard
              title={PRIVACY_PAGE_COPY.generatedPdf.title}
              bullets={PRIVACY_PAGE_COPY.generatedPdf.bullets}
            />
            <PillarCard title={PRIVACY_PAGE_COPY.logs.title} bullets={PRIVACY_PAGE_COPY.logs.bullets} />
          </div>
        </div>
      </Section>

      <Section id="privacy-dont-do" index={2} className="py-28">
        <div className="mx-auto max-w-4xl space-y-4">
          <h2 className="text-3xl font-semibold">{PRIVACY_PAGE_COPY.dontDoTitle}</h2>
          <BulletList values={PRIVACY_PAGE_COPY.dontDo} />
        </div>
      </Section>

      <Section id="privacy-infrastructure" index={3} className="py-28">
        <div className="mx-auto max-w-4xl space-y-4">
          <h2 className="text-3xl font-semibold">{PRIVACY_PAGE_COPY.infrastructureTitle}</h2>
          <BulletList values={PRIVACY_PAGE_COPY.infrastructure} />
        </div>
      </Section>

      <Section id="privacy-legal" index={4} className="py-12">
        <div className="mx-auto flex max-w-4xl flex-col gap-3">
          <p className="text-sm text-slate-500">{PRIVACY_PAGE_COPY.legalFooter}</p>
          <a
            className="inline-flex w-fit text-sm font-medium text-slate-700 underline underline-offset-4"
            href={`mailto:${PRIVACY_PAGE_COPY.contactEmail}`}
          >
            {PRIVACY_PAGE_COPY.contactLabel}
          </a>
          <p className="text-sm text-slate-600">{PRIVACY_PAGE_COPY.sensitiveDataNote}</p>
        </div>
      </Section>
    </div>
  );
}
