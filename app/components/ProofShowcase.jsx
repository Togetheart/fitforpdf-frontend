'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import BeforeAfterSlider from './BeforeAfterSlider';
import { LANDING_COPY } from '../siteCopy.mjs';
import StatPill from './ui/StatPill';

const AUTOPLAY_SEQUENCE = [0, 1, 2, 3, 4, 5]; // Overview → A → B → C → D → E
const AUTOPLAY_INTERVAL = 4000; // ms per tab

const FEATURES = [
  {
    title: 'Overview page',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="9" x2="9" y2="21" />
      </svg>
    ),
    color: '#2563EB',
  },
  {
    title: 'Columns grouped into readable sections',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="18" rx="1.5" />
        <rect x="14" y="3" width="7" height="18" rx="1.5" />
      </svg>
    ),
    color: '#2563EB',
  },
  {
    title: 'Key columns repeated automatically',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="17" x2="12" y2="21" />
        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
      </svg>
    ),
    color: '#2563EB',
  },
  {
    title: 'Clear page numbers and row ranges',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="9" x2="20" y2="9" />
        <line x1="4" y1="15" x2="20" y2="15" />
        <line x1="10" y1="3" x2="8" y2="21" />
        <line x1="16" y1="3" x2="14" y2="21" />
      </svg>
    ),
    color: '#2563EB',
  },
  {
    title: 'Section names generated automatically',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v2m0 14v2M5.636 5.636l1.414 1.414m9.9 9.9 1.414 1.414M3 12h2m14 0h2M5.636 18.364l1.414-1.414m9.9-9.9 1.414-1.414" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
    color: '#2563EB',
  },
  {
    title: 'No manual work — jump to any section',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    color: '#2563EB',
  },
];

const CSV_TABS = [
  {
    id: 'overview',
    label: 'Overview',
    src: '/CSV/proof/overview.webp',
    srcSet: '/CSV/proof/overview.webp 1x, /CSV/proof/overview@2x.webp 2x',
    alt: 'fitforpdf structured document — overview page with all columns',
  },
  {
    id: 'section-a',
    label: 'Section A',
    src: '/CSV/proof/section-a.webp',
    srcSet: '/CSV/proof/section-a.webp 1x, /CSV/proof/section-a@2x.webp 2x',
    alt: 'fitforpdf structured document — section A: Contact information',
  },
  {
    id: 'section-b',
    label: 'Section B',
    src: '/CSV/proof/section-b.webp',
    srcSet: '/CSV/proof/section-b.webp 1x, /CSV/proof/section-b@2x.webp 2x',
    alt: 'fitforpdf structured document — section B: Financial details',
  },
  {
    id: 'section-c',
    label: 'Section C',
    src: '/CSV/proof/section-c.webp',
    srcSet: '/CSV/proof/section-c.webp 1x, /CSV/proof/section-c@2x.webp 2x',
    alt: 'fitforpdf structured document — section C: Invoice ID, Client, Payment Terms',
  },
  {
    id: 'section-d',
    label: 'Section D',
    src: '/CSV/proof/section-d.webp',
    srcSet: '/CSV/proof/section-d.webp 1x, /CSV/proof/section-d@2x.webp 2x',
    alt: 'fitforpdf structured document — section D: Descriptions',
  },
  {
    id: 'section-e',
    label: 'Section E',
    src: '/CSV/proof/section-e.webp',
    srcSet: '/CSV/proof/section-e.webp 1x, /CSV/proof/section-e@2x.webp 2x',
    alt: 'fitforpdf structured document — section E: Notes & comments',
  },
];

const XLSX_TABS = [
  {
    id: 'overview',
    label: 'Overview',
    src: '/proof/overview.webp',
    srcSet: '/proof/overview.webp 1x, /proof/overview@2x.webp 2x',
    alt: 'fitforpdf structured document from Excel — overview page with all sections',
  },
  {
    id: 'section-a',
    label: 'Section A',
    src: '/proof/section-a.webp',
    srcSet: '/proof/section-a.webp 1x, /proof/section-a@2x.webp 2x',
    alt: 'fitforpdf structured document from Excel — section A: Contact details',
  },
  {
    id: 'section-b',
    label: 'Section B',
    src: '/proof/section-b.webp',
    srcSet: '/proof/section-b.webp 1x, /proof/section-b@2x.webp 2x',
    alt: 'fitforpdf structured document from Excel — section B: Location & address',
  },
  {
    id: 'section-c',
    label: 'Section C',
    src: '/proof/section-c.webp',
    srcSet: '/proof/section-c.webp 1x, /proof/section-c@2x.webp 2x',
    alt: 'fitforpdf structured document from Excel — section C: Text content',
  },
  {
    id: 'section-d',
    label: 'Section D',
    src: '/proof/section-d.webp',
    srcSet: '/proof/section-d.webp 1x, /proof/section-d@2x.webp 2x',
    alt: 'fitforpdf structured document from Excel — section D: Descriptions',
  },
  {
    id: 'section-e',
    label: 'Section E',
    src: '/proof/section-e.webp',
    srcSet: '/proof/section-e.webp 1x, /proof/section-e@2x.webp 2x',
    alt: 'fitforpdf structured document from Excel — section E: Role & position',
  },
];

const FORMAT_CONFIGS = {
  csv: {
    id: 'csv',
    label: 'CSV',
    icon: '/csv_icon.svg',
    inputLabel: 'Source spreadsheet',
    inputDescription: 'Column overflow and unreadable structure.',
    beforeImage: '/CSV/enterprise-invoices-demo.csv.webp',
    beforeSrcSet: '/CSV/enterprise-invoices-demo.csv.webp 1x, /CSV/enterprise-invoices-demo.csv@2x.webp 2x',
    beforeAlt: 'CSV input preview',
    sourceLink: '/CSV/enterprise-invoices-demo.csv',
    sourceLinkLabel: 'Download source CSV ↗',
    tabs: CSV_TABS,
    outputLabel: 'Client-ready PDF',
    statLine: '16 columns. Automatically split into 5 readable sections.',
  },
  xlsx: {
    id: 'xlsx',
    label: 'XLSX',
    icon: '/Microsoft_Office_Excel_(2025–present).svg',
    inputLabel: 'Source spreadsheet',
    inputDescription: 'Hard to read at full width.',
    beforeImage: '/Excel/xlxs.webp',
    beforeSrcSet: '/Excel/xlxs.webp 1x, /Excel/xlxs@2x.webp 2x',
    beforeAlt: 'Excel file exported as PDF — unreadable overflow',
    sourceLink: null,
    sourceLinkLabel: null,
    tabs: XLSX_TABS,
    outputLabel: 'Client-ready PDF',
    statLine: '9 columns. Automatically split into 5 readable sections.',
  },
};

const FORMATS = ['xlsx', 'csv'];

// Matches SECTION_COLOR_PALETTE from pdfRenderer.js (index 0–4)
const TAB_COLORS_HEX = [
  '#FFFFFF',   // Overview
  '#2563EB',   // Section A — blue
  '#22C55E',   // Section B — green
  '#F59E0B',   // Section C — amber
  '#EF4444',   // Section D — red
  '#8B5CF6',   // Section E — violet
];

export default function ProofShowcase() {
  const [activeFormat, setActiveFormat] = useState('xlsx');
  const [activeTab, setActiveTab] = useState(0);
  const tabRefs = useRef([]);
  const formatRefs = useRef([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const [formatIndicator, setFormatIndicator] = useState({ left: 0, width: 0 });
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const cardRef = useRef(null);
  const config = FORMAT_CONFIGS[activeFormat];
  const currentTab = config.tabs[activeTab];

  // Intersection observer — detect visibility + trigger entrance
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated]);

  // Auto-play: cycle tabs when visible & user hasn't interacted
  useEffect(() => {
    if (!isVisible || userPaused || !hasAnimated) return;
    const timer = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setActiveTab((prev) => {
          const next = (prev + 1) % AUTOPLAY_SEQUENCE.length;
          return AUTOPLAY_SEQUENCE[next];
        });
        setTransitioning(false);
      }, 200);
    }, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [isVisible, userPaused, hasAnimated]);

  useEffect(() => {
    const el = tabRefs.current[activeTab];
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [activeTab, activeFormat, config.tabs.length]);

  useEffect(() => {
    const idx = FORMATS.indexOf(activeFormat);
    const el = formatRefs.current[idx];
    if (el) {
      setFormatIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [activeFormat]);

  const handleTabClick = useCallback((i) => {
    setUserPaused(true);
    setTransitioning(true);
    setTimeout(() => {
      setActiveTab(i);
      setTransitioning(false);
    }, 150);
  }, []);

  function handleFormatChange(formatId) {
    setUserPaused(true);
    setActiveFormat(formatId);
    setTransitioning(true);
    setTimeout(() => {
      setActiveTab(0);
      setTransitioning(false);
    }, 150);
  }

  return (
    <div className="w-full space-y-8">
      {/* Section heading */}
      <h2 className="text-center text-3xl sm:text-[2.5rem] font-semibold tracking-tight text-[var(--color-text)]">
        See how fitforpdf transforms your file.
      </h2>
      <p className="text-center text-sm text-muted -mt-2">
        {LANDING_COPY.proofSourceLine}
      </p>

      {/* Time-saved benefit pill */}
      <p className="text-center -mt-2">
        <StatPill>{LANDING_COPY.proofTimeSaved}</StatPill>
      </p>

      {/* Format selector — segmented control */}
      <div
        data-testid="format-selector"
        className="flex items-center justify-center"
        role="radiogroup"
        aria-label="Source file type"
      >
        <div className="relative inline-flex items-center rounded-full border border-[var(--color-border)] bg-black/[0.03] p-1">
          {/* Sliding pill */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full bg-[var(--color-bg)] shadow-[0_1px_4px_rgba(0,0,0,0.12)] border border-[var(--color-border)]"
            style={{
              left: formatIndicator.left,
              width: formatIndicator.width,
              top: '4px',
              bottom: '4px',
              transition: 'left 300ms cubic-bezier(0.25,0.1,0.25,1), width 300ms cubic-bezier(0.25,0.1,0.25,1)',
            }}
          />
          {FORMATS.map((formatId, i) => {
            const fmt = FORMAT_CONFIGS[formatId];
            const isActive = formatId === activeFormat;
            return (
              <button
                key={formatId}
                type="button"
                role="radio"
                aria-checked={isActive}
                ref={(el) => (formatRefs.current[i] = el)}
                onClick={() => handleFormatChange(formatId)}
                className="relative z-10 flex items-center gap-2.5 rounded-full px-5 py-2.5"
              >
                <span
                  className={`text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors duration-200 ${
                    isActive ? 'text-[var(--color-text)]' : 'text-[var(--color-muted)]'
                  }`}
                >
                  {fmt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main card */}
      <div
        ref={cardRef}
        data-testid="home-preview-card"
        className="home-preview-float w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 md:p-8 shadow-sm transition-shadow duration-300 hover:shadow-[0_2px_40px_rgba(0,0,0,0.11)]"
      >
        {/* Tab buttons — Apple pill style */}
        <div
          className="w-full overflow-x-auto scrollbar-none rounded-full"
          style={{ backgroundColor: '#0F172A' }}
        >
          <div
            role="tablist"
            className="relative flex items-center rounded-full p-1"
            style={{ minWidth: '100%' }}
          >
            {/* Sliding indicator — colored pill */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute rounded-full"
              style={{
                left: indicator.left,
                width: indicator.width,
                top: '4px',
                bottom: '4px',
                backgroundColor: TAB_COLORS_HEX[activeTab] ?? TAB_COLORS_HEX[0],
                boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                transition: 'left 300ms cubic-bezier(0.25,0.1,0.25,1), width 300ms cubic-bezier(0.25,0.1,0.25,1), background-color 200ms ease',
              }}
            />
            {config.tabs.map((tab, i) => (
              <button
                key={tab.id}
                id={`proof-tab-${tab.id}`}
                role="tab"
                type="button"
                aria-selected={i === activeTab}
                aria-controls="proof-tabpanel"
                ref={el => tabRefs.current[i] = el}
                onClick={() => handleTabClick(i)}
                className="relative z-10 flex-1 text-center rounded-full px-2 py-2.5 sm:px-3 text-sm font-semibold transition-colors duration-200 whitespace-nowrap"
                style={{
                  color: i === activeTab
                    ? (TAB_COLORS_HEX[i] === '#FFFFFF' ? '#0F172A' : '#ffffff')
                    : 'rgba(235,235,245,0.55)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Micro-copy */}
        <p className="mt-4 mb-2 text-center text-xs text-muted">
          Explore how your table is automatically structured
        </p>

        {/* Before/After Slider */}
        <div
          id="proof-tabpanel"
          role="tabpanel"
          aria-labelledby={`proof-tab-${currentTab.id}`}
          style={{
            opacity: hasAnimated && !transitioning ? 1 : 0,
            transform: transitioning ? 'translateX(8px)' : 'translateX(0)',
            transition: 'opacity 300ms ease, transform 300ms ease',
          }}
        >
          <BeforeAfterSlider
            key={`${activeFormat}-${currentTab.id}`}
            beforeSrc={config.beforeImage}
            beforeSrcSet={config.beforeSrcSet}
            beforeAlt={config.beforeAlt}
            afterSrc={currentTab.src}
            afterSrcSet={currentTab.srcSet}
            afterAlt={currentTab.alt}
            initialPosition={35}
            className="shadow-[0_2px_20px_rgba(0,0,0,0.06)]"
          />
        </div>

        {/* Stat line */}
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-muted">{config.statLine}</p>
          <p className="text-[11px] text-muted/70">
            Drag to compare
          </p>
        </div>

        {/* CTA */}
        <div className="mt-6 flex justify-center">
          <a
            href="#tool"
            className="inline-flex items-center gap-2 rounded-full bg-[#0F172A] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#1E293B] hover:shadow-md"
          >
            {LANDING_COPY.heroCta}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </a>
        </div>

        {/* Feature strip */}
        <div
          className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl sm:grid-cols-3"
          style={{ backgroundColor: 'var(--color-border)' }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex flex-col items-center gap-3 px-4 py-5 text-center"
              style={{ backgroundColor: 'var(--color-bg-hero)' }}
            >
              <span style={{ color: f.color }}>{f.icon}</span>
              <span className="text-xs font-medium leading-tight text-muted">
                {f.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
