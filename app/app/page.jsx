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
import ConversionTool from '../components/ConversionTool';

export default function AppPage() {
  return (
    <main
      aria-label="fitforpdf conversion workbench"
      data-testid="app-workbench"
      className="h-screen overflow-hidden bg-[#F7F4F0] text-[#0F172A]"
    >
      <ConversionTool layout="workbench" toolTitle="Upload your spreadsheet" variant="light" showInspector />
    </main>
  );
}
