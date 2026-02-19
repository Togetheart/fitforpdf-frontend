'use client';

import React from 'react';

import { PRIVACY_PAGE_COPY, LANDING_COPY } from '../siteCopy.mjs';
import Section from '../components/ui/Section';
import Accordion from '../components/Accordion';
import PageHero from '../components/PageHero';
import AnimatedShieldIcon from '../components/AnimatedShieldIcon';

/* ─── SVG icons — même style que landing (stroke, no fill) ─ */
const ICONS = {
  delete: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  ),
  clock: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 15" />
    </svg>
  ),
  log: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
    </svg>
  ),
  eye: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
  cpu: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" />
      <line x1="20" y1="14" x2="23" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="14" x2="4" y2="14" />
    </svg>
  ),
  ban: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  ),
  shield: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
};

/* ─── Feature card — même pattern que landing ──────────── */
function PrivacyFeatureCard({ icon, title, description }) {
  return (
    <div className="feature-card-hover flex flex-col items-start gap-4 rounded-xl p-6 glass-subtle">
      <span className="text-emerald-600" aria-hidden="true">{icon}</span>
      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold leading-tight text-slate-900">{title}</h3>
        <p className="text-[13px] leading-relaxed text-slate-500">{description}</p>
      </div>
    </div>
  );
}


/* ─── Trust pill — même style exact que landing ────────── */
function TrustPill() {
  return (
    <p className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50/50 px-4 py-1.5 text-xs font-medium text-emerald-700">
      <span aria-label="European Union flag">🇪🇺</span>
      {LANDING_COPY.heroTrustLine}
    </p>
  );
}

/* ─── Log item — clean, stroke icon ────────────────────── */
function LogItem({ icon, label, muted = false }) {
  return (
    <div className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
      <span className={muted ? 'text-slate-300' : 'text-emerald-600'} aria-hidden="true">{icon}</span>
      <span className={`text-sm leading-relaxed ${muted ? 'italic text-slate-400' : 'text-slate-700'}`}>{label}</span>
    </div>
  );
}

/* ─── "What we don't do" row ────────────────────────────── */
function DontDoRow({ icon, text }) {
  return (
    <div className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
      <span className="mt-0.5 text-slate-400" aria-hidden="true">{icon}</span>
      <p className="text-sm leading-relaxed text-slate-700">{text}</p>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ── Hero — même structure que landing, section privacy ── */}
      <PageHero
        variant="privacy"
        align="center"
        className="py-16 sm:py-20 w-full"
        contentClassName="items-center space-y-5 text-center"
      >
        <div className="flex items-center gap-2">
          <AnimatedShieldIcon animateOnMount={true} />
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900" data-testid="privacy-h1">
            Privacy
          </h1>
        </div>
        <p className="text-[2.5rem] sm:text-5xl font-[650] leading-[1.06] tracking-tight text-slate-900 max-w-[20ch]">
          <span className="block">{PRIVACY_PAGE_COPY.pageTitle}</span>
          <span className="block">{PRIVACY_PAGE_COPY.pageTitleAccent}</span>
        </p>
        <div className="mt-3">
          <TrustPill />
        </div>
      </PageHero>

      {/* ── File handling — même grid pattern que "Client-ready means" ── */}
      <Section id="privacy-handling" index={1} bg="bg-gray-50" className="py-16 sm:py-24">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {PRIVACY_PAGE_COPY.handlingTitle}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          <PrivacyFeatureCard
            icon={ICONS.delete}
            title={PRIVACY_PAGE_COPY.files.title}
            description={PRIVACY_PAGE_COPY.files.bullets[0]}
          />
          <PrivacyFeatureCard
            icon={ICONS.clock}
            title={PRIVACY_PAGE_COPY.generatedPdf.title}
            description={[
              PRIVACY_PAGE_COPY.generatedPdf.bullets[0],
              PRIVACY_PAGE_COPY.generatedPdf.bullets[1],
            ].join(' ')}
          />
        </div>
      </Section>

      {/* ── What we log + What we don't do — grille 2 colonnes ── */}
      <Section id="privacy-logs" index={2} bg="bg-white" maxWidth="max-w-4xl">
        {/* Enfant unique du Section → grille 2 col avec hauteur égale */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
          {/* Bloc 1 : What we log */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900" data-testid="privacy-logs-card">
              {PRIVACY_PAGE_COPY.logs.title}
            </h2>
            <div className="flex-1 rounded-xl glass-elevated divide-y divide-slate-100/80 px-6">
              <LogItem icon={ICONS.clock} label="Request timestamp" />
              <LogItem icon={ICONS.log} label="File type (CSV or XLSX)" />
              <LogItem icon={ICONS.cpu} label="Row and column counts" />
              <LogItem icon={ICONS.log} label="Processing verdict and score" />
              <LogItem icon={ICONS.shield} label="File contents are never stored in logs." />
            </div>
          </div>

          {/* Bloc 2 : What we don't do */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              {PRIVACY_PAGE_COPY.dontDoTitle}
            </h2>
            <div className="flex-1 rounded-xl glass-elevated divide-y divide-slate-100/80 px-6">
              <DontDoRow icon={ICONS.eye} text={PRIVACY_PAGE_COPY.dontDo[0]} />
              <DontDoRow icon={ICONS.cpu} text={PRIVACY_PAGE_COPY.dontDo[1]} />
              <DontDoRow icon={ICONS.ban} text={PRIVACY_PAGE_COPY.dontDo[2]} />
            </div>
          </div>
        </div>
      </Section>

      {/* ── Sensitive note + legal ── */}
      <Section id="privacy-sensitive" index={3} bg="bg-gray-50">
        <div
          data-testid="privacy-sensitive-callout"
          className="rounded-xl glass px-6 py-5"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
            Safety note
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
            {PRIVACY_PAGE_COPY.sensitiveDataNote}
          </p>
        </div>
        <div className="flex flex-col items-center gap-2 text-center text-sm text-slate-500">
          <p>{PRIVACY_PAGE_COPY.legalFooter}</p>
          <a
            className="w-fit text-sm font-medium text-slate-700 underline underline-offset-4 transition-colors hover:text-accent"
            href={`mailto:${PRIVACY_PAGE_COPY.contactEmail}`}
          >
            {PRIVACY_PAGE_COPY.contactLabel}
          </a>
        </div>
      </Section>

      {/* ── FAQ — même pattern exact que landing ── */}
      <Section id="privacy-faq" index={4} bg="bg-white" className="py-16 sm:py-24">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Frequently asked questions
        </h2>
        <div className="divide-y divide-slate-200 rounded-xl glass-elevated">
          <Accordion items={PRIVACY_PAGE_COPY.faq} itemClassName="py-3" />
        </div>
      </Section>

    </div>
  );
}
