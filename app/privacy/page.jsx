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

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Section id="privacy-hero" index={0}>
        <h1 className="text-[44px] font-[650] leading-tight tracking-tight sm:text-6xl">
          {PRIVACY_PAGE_COPY.pageTitle}
        </h1>
        <p className="max-w-[58ch] text-sm text-slate-600">
          {PRIVACY_PAGE_COPY.intro}
        </p>
      </Section>

      <Section id="privacy-data" index={1} bg="bg-gray-50">
        <h2 className="text-2xl font-semibold">Data processed</h2>
        <BulletList values={PRIVACY_PAGE_COPY.dataProcessed} />
      </Section>

      <Section id="privacy-retention" index={2}>
        <h2 className="text-2xl font-semibold">Retention</h2>
        <BulletList values={PRIVACY_PAGE_COPY.retention} />
        <p className="mt-4 text-sm font-medium text-slate-700">
          {PRIVACY_PAGE_COPY.sensitiveDataNote}
        </p>
      </Section>

      <Section id="privacy-logs" index={3} bg="bg-gray-50">
        <h2 className="text-2xl font-semibold">Logs</h2>
        <BulletList values={PRIVACY_PAGE_COPY.logs} />
      </Section>

      <Section id="privacy-contact" index={4}>
        <h2 className="text-2xl font-semibold">Contact</h2>
        <a
          className="inline-flex w-fit rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold transition hover:bg-slate-100"
          href={`mailto:${PRIVACY_PAGE_COPY.contactEmail}`}
        >
          {PRIVACY_PAGE_COPY.contactEmail}
        </a>
      </Section>
    </div>
  );
}
