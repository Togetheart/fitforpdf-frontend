'use client';

/*
 * /app — the tool-first Workbench (V2), shell step.
 *
 * Decision D1 (eng-review): Configure -> Generate -> View. One render.
 * The landing (/) stays the marketing + SEO entry; /app is the focused tool
 * destination. Reuses the existing conversion engine via <ConversionTool/> —
 * no rebuild.
 *
 * Chrome: SiteShellGate (app/components/SiteShellGate.jsx) detects the /app
 * route via usePathname and renders children WITHOUT the marketing SiteShell
 * (no SiteHeader / SiteFooter / shell <main>). So /app owns its own single
 * <main> below and provides its own immersive chrome (toolbar, left rail,
 * inspector) inside <ConversionTool layout="workbench">. There is exactly one
 * <main> on the page — the shell's is bypassed here.
 */

import React from 'react';
import ConversionTool from '../components/ConversionTool';

export default function AppPage() {
  return (
    <main
      aria-label="fitforpdf conversion workbench"
      data-testid="app-workbench"
      className="min-h-screen overflow-x-hidden bg-[#F7F4F0] text-[#0F172A] lg:h-screen lg:overflow-hidden"
    >
      <ConversionTool layout="workbench" toolTitle="Upload your spreadsheet" variant="light" showInspector />
    </main>
  );
}
