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
import ConversionTool from '../components/ConversionTool';

export default function AppPage() {
  return (
    <div
      data-testid="app-workbench"
      className="mx-auto flex w-full max-w-[860px] flex-col px-4 py-10 sm:py-14"
    >
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Turn a messy export into a readable PDF
        </h1>
        <p className="mx-auto mt-2 max-w-[52ch] text-sm text-muted sm:text-base">
          Drop a wide Excel or CSV. Wide tables get split into sections, anchor
          columns repeat, and you get a clean table of contents. No cut-off columns.
        </p>
      </div>

      <div
        data-testid="tool"
        className="apple-grid-card relative mx-auto w-full p-6 sm:p-8"
      >
        <ConversionTool toolTitle="Upload your spreadsheet" variant="light" />
      </div>

      <p className="mt-5 text-center text-xs text-muted">
        No storage · No LLM in the data path · EU-hosted ·{' '}
        <Link href="/developers" className="font-medium text-blue-600 hover:underline">
          Automate recurring exports with the API →
        </Link>
      </p>
    </div>
  );
}
