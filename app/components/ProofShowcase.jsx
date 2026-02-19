'use client';

import React, { useState } from 'react';
import ImageLightbox from './ImageLightbox';

const CSV_TABS = [
  {
    id: 'overview',
    label: 'Overview',
    src: '/CSV/enterprise-invoices-demo-overview.webp',
    alt: 'FitForPDF structured document — overview page with all columns',
  },
  {
    id: 'section-a',
    label: 'Section A',
    src: '/CSV/enterprise-invoices-demo-sectionA.webp',
    alt: 'FitForPDF structured document — section A columns',
  },
  {
    id: 'section-b',
    label: 'Section B',
    src: '/CSV/enterprise-invoices-demo-sectionB.webp',
    alt: 'FitForPDF structured document — section B columns',
  },
  {
    id: 'section-c',
    label: 'Section C',
    src: '/CSV/enterprise-invoices-demo-sectionC.webp',
    alt: 'FitForPDF structured document — section C columns',
  },
  {
    id: 'section-d',
    label: 'Section D',
    src: '/CSV/enterprise-invoices-demo-sectionD.webp',
    alt: 'FitForPDF structured document — section D columns',
  },
];

const XLSX_TABS = [
  {
    id: 'overview',
    label: 'Overview',
    src: '/Excel/3mb_small_overview.webp',
    alt: 'FitForPDF structured document from Excel — overview page with all columns',
  },
  {
    id: 'section-a',
    label: 'Section A',
    src: '/Excel/3mb_small_sectionA.webp',
    alt: 'FitForPDF structured document from Excel — section A columns',
  },
  {
    id: 'section-b',
    label: 'Section B',
    src: '/Excel/3mb_small_sectionB.webp',
    alt: 'FitForPDF structured document from Excel — section B columns',
  },
  {
    id: 'section-c',
    label: 'Section C',
    src: '/Excel/3mb_small_sectionC.webp',
    alt: 'FitForPDF structured document from Excel — section C columns',
  },
  {
    id: 'section-d',
    label: 'Section D',
    src: '/Excel/3mb_small_sectionD.webp',
    alt: 'FitForPDF structured document from Excel — section D columns',
  },
  {
    id: 'section-e',
    label: 'Section E',
    src: '/Excel/3mb_small_sectionE.webp',
    alt: 'FitForPDF structured document from Excel — section E columns',
  },
];

const FORMAT_CONFIGS = {
  csv: {
    id: 'csv',
    label: 'CSV',
    icon: '/csv_icon.svg',
    inputLabel: 'CSV INPUT',
    inputDescription: 'Raw spreadsheet data — columns overflow, no structure.',
    beforeImage: '/before_csv.webp',
    beforeAlt: 'CSV input preview',
    tabs: CSV_TABS,
    outputLabel: 'STRUCTURED PDF',
    statLine: '16 columns. Automatically split into 4 readable sections.',
  },
  xlsx: {
    id: 'xlsx',
    label: 'XLSX',
    icon: '/Microsoft_Office_Excel_(2025–present).svg',
    inputLabel: 'XLSX INPUT',
    inputDescription: 'Excel exported to PDF — unreadable column overflow.',
    beforeImage: '/Excel/xlxs.webp',
    beforeAlt: 'Excel file exported as PDF — unreadable overflow',
    tabs: XLSX_TABS,
    outputLabel: 'STRUCTURED PDF',
    statLine: '11 columns. Automatically split into 5 readable sections.',
  },
};

const FORMATS = ['xlsx', 'csv'];

export default function ProofShowcase() {
  const [activeFormat, setActiveFormat] = useState('xlsx');
  const [activeTab, setActiveTab] = useState(0);

  const config = FORMAT_CONFIGS[activeFormat];
  const currentTab = config.tabs[activeTab];

  function handleFormatChange(formatId) {
    setActiveFormat(formatId);
    setActiveTab(0);
  }

  return (
    <div className="space-y-8">
      {/* Format selector */}
      <div
        data-testid="format-selector"
        className="flex items-center justify-center gap-8"
        role="radiogroup"
        aria-label="Input file format"
      >
        {FORMATS.map((formatId) => {
          const fmt = FORMAT_CONFIGS[formatId];
          const isActive = formatId === activeFormat;
          return (
            <button
              key={formatId}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => handleFormatChange(formatId)}
              className={`group flex flex-col items-center gap-1.5 rounded-lg px-5 py-2.5 transition-all duration-200 ${
                isActive
                  ? 'scale-105 opacity-100'
                  : 'opacity-35 hover:opacity-60'
              }`}
            >
              <img
                src={fmt.icon}
                alt={`${fmt.label} format icon`}
                className="h-10 w-10 object-contain"
              />
              <span
                className={`text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors duration-200 ${
                  isActive ? 'text-accent' : 'text-slate-400'
                }`}
              >
                {fmt.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Section heading */}
      <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        From raw data to structured document.
      </h2>

      {/* Glass card */}
      <div
        data-testid="home-preview-card"
        className="home-preview-float mx-auto max-w-7xl rounded-xl glass-elevated p-4 md:p-8"
      >
        <div className="grid gap-6 sm:grid-cols-[3fr_7fr]">
          {/* Left: Input (30%) */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {config.inputLabel}
            </p>
            <ImageLightbox
              src={config.beforeImage}
              alt={config.beforeAlt}
              className="mt-3 block w-full overflow-hidden rounded-lg border border-slate-200"
            >
              <img
                src={config.beforeImage}
                alt={config.beforeAlt}
                className="h-auto w-full rounded-lg object-cover"
              />
            </ImageLightbox>
            <p className="mt-2 text-xs text-slate-400">
              {config.inputDescription}
            </p>
          </div>

          {/* Right: Tabbed PDF Output (70%) */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {config.outputLabel}
            </p>

            {/* Tab buttons */}
            <div role="tablist" className="mt-3 flex gap-1.5">
              {config.tabs.map((tab, i) => (
                <button
                  key={tab.id}
                  id={`proof-tab-${tab.id}`}
                  role="tab"
                  type="button"
                  aria-selected={i === activeTab}
                  onClick={() => setActiveTab(i)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    i === activeTab
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Active tab image */}
            <div
              role="tabpanel"
              aria-labelledby={`proof-tab-${currentTab.id}`}
            >
              <ImageLightbox
                src={currentTab.src}
                alt={currentTab.alt}
                className="proof-tab-image mt-3 block w-full overflow-hidden rounded-lg border border-slate-200"
                data-testid="proof-pdf-image"
                key={`${activeFormat}-${activeTab}`}
              >
                <img
                  src={currentTab.src}
                  alt={currentTab.alt}
                  className="h-auto w-full rounded-lg object-cover"
                />
              </ImageLightbox>
            </div>

            {/* Stat line */}
            <p className="mt-3 text-xs text-slate-400">
              {config.statLine}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
