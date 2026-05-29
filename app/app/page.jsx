'use client';

/*
 * /app — the tool-first Workbench (V2), shell step.
 *
 * Decision D1 (eng-review): Configure -> Generate -> View. One render.
 * The landing (/) stays the marketing + SEO entry; /app is the focused tool
 * destination. Reuses the existing conversion engine via <ConversionTool/> —
 * no rebuild.
 *
 * Chrome note: every route is wrapped by the root layout's <SiteShell> (global
 * SiteHeader + <main> + SiteFooter). This page therefore renders NO <header>
 * and NO <main> of its own — it presents only the focused tool inside the
 * shared shell, with all marketing sections stripped. The fully-immersive
 * workbench chrome (slim tool top-bar, sidebar, inspector) is the next
 * iteration and needs a route-group layout decision (touches shared layout).
 */

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Code2 } from 'lucide-react';
import ConversionTool from '../components/ConversionTool';

export default function AppPage() {
  return (
    <main
      aria-label="fitforpdf conversion workbench"
      data-testid="app-workbench"
      className="min-h-screen bg-[#FAF8F5] text-[#0F172A]"
    >
      <header
        data-testid="app-toolbar"
        className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#FAF8F5]/90 backdrop-blur-xl"
      >
        <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-5">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-slate-700 transition hover:bg-white/70 hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            fitforpdf.com
          </Link>

          <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
              No storage
            </span>
            <span>No LLM in the data path</span>
            <span>EU-hosted</span>
          </div>

          <Link
            href="/developers"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white/70 px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
          >
            <Code2 className="h-4 w-4" aria-hidden="true" />
            API
          </Link>
        </div>
      </header>

      <ConversionTool layout="workbench" toolTitle="Upload your spreadsheet" variant="light" showInspector />
    </main>
  );
}
