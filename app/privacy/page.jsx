'use client';

import React from 'react';

import { PRIVACY_PAGE_COPY } from '../siteCopy.mjs';
import Card from '../components/Card';
import Section from '../components/Section';
import Accordion from '../components/Accordion';
import PageHero from '../components/PageHero';

function SectionBullets({ items, compact = false }) {
  const listClassName = compact ? 'space-y-2' : 'space-y-3';

  return (
    <ul className={`${listClassName} text-sm text-slate-700`}>
      {items.map((item) => (
        <li key={item} className="leading-relaxed">
          {item}
        </li>
      ))}
    </ul>
  );
}

function HandlingCard({ title, description, items }) {
  return (
    <Card className="relative border border-slate-200/80 bg-white p-6 sm:p-7">
      <h3 className="mb-2 text-sm font-semibold tracking-[0.08em] text-black/55">{title}</h3>
      <p className="mb-3 text-sm text-slate-700">{description}</p>
      <SectionBullets items={items} compact />
    </Card>
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

      <Section id="privacy-handling" index={1} className="py-20 sm:py-24">
        <div className="mx-auto max-w-4xl space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight">{PRIVACY_PAGE_COPY.handlingTitle}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <HandlingCard
              title={PRIVACY_PAGE_COPY.files.title}
              description={PRIVACY_PAGE_COPY.files.bullets[0]}
              items={[]}
            />
            <HandlingCard
              title={PRIVACY_PAGE_COPY.generatedPdf.title}
              description={PRIVACY_PAGE_COPY.generatedPdf.bullets[0]}
              items={PRIVACY_PAGE_COPY.generatedPdf.bullets.slice(1)}
            />
          </div>
        </div>
      </Section>

      <Section id="privacy-logs" index={2} bg="bg-gray-50" className="py-20 sm:py-24">
        <div className="mx-auto max-w-4xl space-y-4">
          <h2 className="text-3xl font-semibold tracking-tight">{PRIVACY_PAGE_COPY.logs.title}</h2>
          <Card className="p-6 sm:p-8">
            <SectionBullets items={PRIVACY_PAGE_COPY.logs.bullets} />
          </Card>
        </div>
      </Section>

      <Section id="privacy-sensitive" index={3} className="py-16 sm:py-20">
        <div className="mx-auto flex max-w-4xl">
          <div
            data-testid="privacy-sensitive-callout"
            className="w-full rounded-2xl border border-[#D92D2A]/25 bg-[#D92D2A]/5 px-6 py-4"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#B62622]">
              Safety note
            </p>
            <p className="mt-1 text-sm text-slate-800">{PRIVACY_PAGE_COPY.sensitiveDataNote}</p>
          </div>
        </div>
      </Section>

      <Section id="privacy-legal" index={4} bg="bg-gray-50" className="py-16 sm:py-20">
        <div className="mx-auto flex max-w-4xl flex-col gap-2 text-sm text-slate-600">
          <p>{PRIVACY_PAGE_COPY.legalFooter}</p>
          <a
            className="w-fit text-sm font-medium text-slate-700 underline underline-offset-4"
            href={`mailto:${PRIVACY_PAGE_COPY.contactEmail}`}
          >
            {PRIVACY_PAGE_COPY.contactLabel}
          </a>
        </div>
      </Section>

      <Section id="privacy-faq" index={5} className="py-20 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <Accordion title="Frequently asked questions" items={PRIVACY_PAGE_COPY.faq} />
        </div>
      </Section>
    </div>
  );
}
