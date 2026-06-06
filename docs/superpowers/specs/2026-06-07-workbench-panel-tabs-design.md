# Workbench panel tabs (Phase 3)

**Date:** 2026-06-07 · **Status:** Approved · **Frontend-only** · builds on Phase 1/2 (panels in `main`)

## Goal
Organize each side panel with a small **segmented tab control** at its top (style ref:
the "Chat | Cowork | Code" switcher), to cut scrolling and group related controls.

- **Left rail** (`WorkbenchRail`): tabs **`Sections` | `Recent Exports`**.
  - `Sections` = the rendered-sections list (label + title).
  - `Recent Exports` = the recent-export history list + the "New export" button.
  - Default tab: `Recent Exports`. The "Processed ephemerally" footer + the collapse toggle stay outside the tabs (toggle in the tab-bar row).
- **Right inspector** (`ConversionInspector`): tabs **`Sections` | `Export`**.
  - `Sections` = the **Column grouping** block (Off/Auto toggle + pills + Custom sections) **and** the **Section name & color** editor.
  - `Export` = **Report title** + **Branding** (logo · accent color · footer text).
  - Default tab: `Sections`. The header ("Adjust output" + collapse toggle), the quota line, and the sticky action footer (Update preview / Download) stay **outside** the tabs (always visible).

## Implementation
- Add a small reusable accessible segmented control, e.g. `PanelTabs({ tabs:[{id,label}], value, onChange, 'aria-label' })` — `role="tablist"`, each button `role="tab"` + `aria-selected`, left/right arrow-key nav, active style matching the workbench (light theme for the inspector; dark theme for the rail — accept a `tone` prop or className). Reuse it in both panels.
- Each panel holds `useState` for its active tab; render only the active tab's content.
- Keep all existing behavior: the Column-grouping Off→hide-section-UI logic stays within the right `Sections` tab; mobile (stacked) and desktop (PanelGroup) both work — tabs live inside the shared panel components so both layouts get them.
- Persist the chosen tab? Optional/nice-to-have (localStorage) — fine to skip in this phase; default tabs as above.

## Tests
- New: a `PanelTabs` interaction test + assert the left rail shows both tabs and switches content; the right inspector shows `Sections`/`Export` tabs and switches content.
- **Existing tests will break where moved content is now behind a non-default tab** — fix them by SELECTING the tab first, never by weakening assertions:
  - Right inspector **default = Sections**, so Column-grouping / Custom sections / Section name & color tests keep working as-is.
  - Tests asserting **Branding / accent color / Report title / footer / logo** (e.g. `inspectorBranding.ui.test.jsx`, and any workbench e2e that checks accentColor/branding in the inspector) must first click the **Export** tab (e.g. `fireEvent.click(screen.getByRole('tab', { name: 'Export' }))`) before asserting.
  - Left rail: tests asserting recent-exports vs the sections list must select the matching tab.
- Run `npm test` — fully green. Do not weaken or delete assertions to make them pass.

## Out of scope
Phase 2 mobile drawers (separate). Per-column colors. Persisting active tab (optional).
