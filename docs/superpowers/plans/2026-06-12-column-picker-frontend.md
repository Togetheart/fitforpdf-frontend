# Columns Picker + Wide-File Banner (Frontend PR2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Columns" picker to the /app workbench inspector (a checklist of all columns, all checked by default, with search + Select-all/Clear + counter) plus a wide-file banner, so a wide CRM/Apollo export becomes a short PDF by sending the backend's `includeColumns` render option.

**Architecture:** The backend already accepts `includeColumns: string[]` on `POST /render` (frontend PR1, merged). This PR is purely frontend. Column names are known ONLY post-render (parsed from the `X-CleanSheet-Sections` / `X-CleanSheet-Frozen-Columns` response headers into `sectionDraft`/`frozenDraft`), exactly like the existing Custom-Sections control — there is no client-side file parse. So the picker lives in the inspector and is available after the first render; the wide-file banner sits on the rendered canvas. We add a stable `allColumnsMaster` (the full column set captured from the first, unfiltered render) so unchecking a column and re-rendering does not make that column vanish from the list. State lives in the `useConversion` hook; the user's selection is sent on the next "Update preview"/render. We model selection as the set of EXCLUDED (unchecked) column names — default empty = all included = field omitted (byte-unchanged for un-curated files).

**Tech Stack:** Next.js 14 (App Router), React 18, vitest 2 + @testing-library/react 14 (jsdom), `node:test` for pure-function modules, Tailwind (CSS variable tokens), lucide-react icons, react-resizable-panels.

**Repo / branch:** worktree `/tmp/ffp-cols-fe`, branch `feat/columns-picker` (off `origin/main`). Spec: `docs/superpowers/specs/2026-06-12-column-selection-design.md`.

**Node + test commands (use exactly):**
- Put Node on PATH first: `export PATH="/Users/sneusch/.nvm/versions/node/v22.22.3/bin:$PATH"` (node v22.22.3).
- Pure-function tests: `cd /tmp/ffp-cols-fe && node --test app/pageUiLogic.test.mjs`
- A single vitest UI test file: `cd /tmp/ffp-cols-fe && npx vitest run app/__tests__/<file>.test.jsx`
- Full suite (node tests + vitest): `cd /tmp/ffp-cols-fe && npm test`

**Commit hygiene:** NEVER `git add -A` / `git add .` (a `node_modules` symlink/dir lives in the worktree). Add files by EXPLICIT path. After each commit run `git ls-files | grep -c node_modules` and confirm it prints `0`.

---

## File Structure

| File | Responsibility | Change |
|------|----------------|--------|
| `app/pageUiLogic.mjs` | Pure helpers for the workbench (URL/payload builders). | Add `buildIncludeColumns()` (Task 1). |
| `app/pageUiLogic.test.mjs` | `node:test` tests for the pure helpers. | Add tests for `buildIncludeColumns` (Task 1). |
| `app/components/ConversionTool.jsx` | The workbench UI: inspector, controls, layouts. | Add `ColumnsControl` + its `InspectorSection`, and the wide-file banner + `WIDE_FILE_COLUMN_THRESHOLD` (Tasks 2 & 4). |
| `app/hooks/useConversion.mjs` | All workbench state + the `submitRender` FormData assembly. | Add `allColumnsMaster` + `excludedColumns` state, setters, master-capture, reset-on-new-file, FormData append, and expose them (Task 3). |
| `app/__tests__/columnsControl.ui.test.jsx` | Component test for `ColumnsControl` (via `ConversionInspector`). | Create (Task 2). |
| `app/__tests__/columnsPicker.e2e.test.jsx` | End-to-end test: pick columns → `includeColumns` sent. | Create (Task 3). |
| `app/__tests__/wideFileBanner.ui.test.jsx` | Component test for the wide-file banner. | Create (Task 4). |

### Data contract (used across tasks — keep names consistent)
- `conversion.allColumnsMaster: string[]` — the stable, full, de-duplicated list of column names (the picker's source). Empty until the first successful render.
- `conversion.excludedColumns: string[]` — the column names the user has UNCHECKED. Default `[]`.
- `conversion.toggleColumnIncluded(name: string): void` — toggle a column in/out of `excludedColumns`.
- `conversion.includeAllColumns(): void` — set `excludedColumns = []` (Select all).
- `conversion.excludeAllColumns(): void` — set `excludedColumns = allColumnsMaster.slice()` (Clear).
- `buildIncludeColumns({ allColumns, excludedColumns }): string[] | null` — the kept columns to send, or `null` to OMIT the field.

---

## Task 1: `buildIncludeColumns` pure helper

**Files:**
- Modify: `app/pageUiLogic.mjs` (add an exported function near `buildGroupingPayload`, ~line 179+)
- Test: `app/pageUiLogic.test.mjs` (a `node:test` file; add a new `test(...)` block)

- [ ] **Step 1: Write the failing tests**

Add this block to `app/pageUiLogic.test.mjs` (the file already does `import test from 'node:test'` and `import assert from 'node:assert/strict'`; add `buildIncludeColumns` to the existing import list from `./pageUiLogic.mjs`):

```js
test('buildIncludeColumns: omits when nothing is excluded (render all)', () => {
  assert.equal(buildIncludeColumns({ allColumns: ['a', 'b', 'c'], excludedColumns: [] }), null);
});

test('buildIncludeColumns: returns the kept columns when some are excluded', () => {
  assert.deepEqual(
    buildIncludeColumns({ allColumns: ['a', 'b', 'c', 'd'], excludedColumns: ['b', 'd'] }),
    ['a', 'c'],
  );
});

test('buildIncludeColumns: omits when every column is excluded (never send an empty list)', () => {
  assert.equal(buildIncludeColumns({ allColumns: ['a', 'b'], excludedColumns: ['a', 'b'] }), null);
});

test('buildIncludeColumns: omits when the master list is empty', () => {
  assert.equal(buildIncludeColumns({ allColumns: [], excludedColumns: ['a'] }), null);
});

test('buildIncludeColumns: stale excluded names (not in master) do not curate', () => {
  // excluded names that are not in allColumns -> kept === all -> omit
  assert.equal(buildIncludeColumns({ allColumns: ['a', 'b'], excludedColumns: ['x', 'y'] }), null);
});

test('buildIncludeColumns: tolerates missing / malformed args', () => {
  assert.equal(buildIncludeColumns(), null);
  assert.equal(buildIncludeColumns({}), null);
  assert.equal(buildIncludeColumns({ allColumns: ['a'], excludedColumns: null }), null);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `export PATH="/Users/sneusch/.nvm/versions/node/v22.22.3/bin:$PATH" && cd /tmp/ffp-cols-fe && node --test app/pageUiLogic.test.mjs`
Expected: FAIL — `buildIncludeColumns is not a function` (or an import error for the new named import).

- [ ] **Step 3: Implement `buildIncludeColumns`**

Add to `app/pageUiLogic.mjs` (right after the `buildGroupingPayload` function, ~line 199):

```js
/**
 * Decide the `includeColumns` payload from the picker selection.
 * Returns the list of columns to KEEP, or null to OMIT the field entirely
 * (which makes the backend render all columns — the byte-unchanged default).
 *
 * @param {{ allColumns?: string[], excludedColumns?: string[] }} [opts]
 * @returns {string[] | null}
 */
export function buildIncludeColumns({ allColumns, excludedColumns } = {}) {
  const all = Array.isArray(allColumns) ? allColumns.filter((c) => typeof c === 'string') : [];
  if (all.length === 0) return null;
  const excludedSet = new Set(Array.isArray(excludedColumns) ? excludedColumns : []);
  if (excludedSet.size === 0) return null; // nothing curated -> render all
  const kept = all.filter((c) => !excludedSet.has(c));
  if (kept.length === 0) return null; // never send an empty list -> render all
  if (kept.length === all.length) return null; // excluded only stale names -> no-op
  return kept;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `export PATH="/Users/sneusch/.nvm/versions/node/v22.22.3/bin:$PATH" && cd /tmp/ffp-cols-fe && node --test app/pageUiLogic.test.mjs`
Expected: PASS (all existing tests + the 6 new ones).

- [ ] **Step 5: Commit**

```bash
cd /tmp/ffp-cols-fe && git add app/pageUiLogic.mjs app/pageUiLogic.test.mjs && git commit -m "feat(columns): buildIncludeColumns helper — omit when uncurated/empty"
git ls-files | grep -c node_modules   # must print 0
```

---

## Task 2: `ColumnsControl` UI component + inspector placement

**Files:**
- Modify: `app/components/ConversionTool.jsx` (add a `ColumnsControl` function near `CustomGroupsControl` ~line 321; mount a new `InspectorSection` as the FIRST control in the `activeTab === 'sections'` branch of `ConversionInspector` ~line 592)
- Test: `app/__tests__/columnsControl.ui.test.jsx` (create)

The component MIRRORS `CustomGroupsControl` (same row/label idiom, same `trackControlUsed` call, same Tailwind tokens) but renders checkboxes and reads the new data contract. It sources columns from `conversion.allColumnsMaster` (NOT `sectionDraft`, so the list is stable across filtered re-renders).

- [ ] **Step 1: Write the failing component test**

Create `app/__tests__/columnsControl.ui.test.jsx`:

```jsx
import { afterEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';

import { ConversionInspector } from '../components/ConversionTool.jsx';

// Mock conversion covering the fields the Columns picker reads.
function makeConversion(overrides = {}) {
  return {
    pdfBlob: new Blob(['%PDF']),
    file: new File(['a,b\n1,2'], 'a.csv', { type: 'text/csv' }),
    isLoading: false,
    reportTitle: '', setReportTitle: () => {},
    columnMap: 'auto', setColumnMap: () => {},
    renderedSections: [
      { label: 'A', title: 'Info', columns: ['Name', 'Email'] },
      { label: 'B', title: 'Orders', columns: ['Phone', 'Keywords'] },
    ],
    renderedFrozenColumns: ['Name'],
    sectionDraft: [
      { title: 'Info', columns: ['Name', 'Email'] },
      { title: 'Orders', columns: ['Phone', 'Keywords'] },
    ],
    frozenDraft: ['Name'],
    allColumnsMaster: ['Name', 'Email', 'Phone', 'Keywords'],
    excludedColumns: [],
    toggleColumnIncluded: vi.fn(),
    includeAllColumns: vi.fn(),
    excludeAllColumns: vi.fn(),
    reassignSectionColumn: () => {}, reorderSection: () => {}, renameSection: () => {},
    setSectionColor: () => {},
    accentColor: '', setAccentColor: () => {},
    logoFile: null, setLogoFile: () => {},
    footerText: '', setFooterText: () => {},
    handleSubmit: () => {}, handleDownloadAnyway: () => {}, handleRenderAnother: () => {},
    ...overrides,
  };
}

const quota = { planType: 'free', freeExportsLeft: 2, isQuotaLocked: false, loaded: true };

afterEach(() => cleanup());

describe('Columns picker', () => {
  test('lists every master column as a checkbox, all checked by default', () => {
    render(<ConversionInspector conversion={makeConversion()} quota={quota} />);
    const picker = screen.getByTestId('app-columns-picker');
    const boxes = within(picker).getAllByRole('checkbox');
    expect(boxes).toHaveLength(4);
    expect(boxes.every((b) => b.checked)).toBe(true);
  });

  test('counter shows included / total', () => {
    render(<ConversionInspector conversion={makeConversion({ excludedColumns: ['Keywords'] })} quota={quota} />);
    expect(screen.getByTestId('app-columns-counter').textContent).toContain('3 / 4');
  });

  test('an excluded column renders unchecked', () => {
    render(<ConversionInspector conversion={makeConversion({ excludedColumns: ['Keywords'] })} quota={quota} />);
    const picker = screen.getByTestId('app-columns-picker');
    const kw = within(picker).getByRole('checkbox', { name: 'Keywords' });
    expect(kw.checked).toBe(false);
  });

  test('toggling a checkbox calls toggleColumnIncluded with the column name', () => {
    const conversion = makeConversion();
    render(<ConversionInspector conversion={conversion} quota={quota} />);
    const picker = screen.getByTestId('app-columns-picker');
    fireEvent.click(within(picker).getByRole('checkbox', { name: 'Email' }));
    expect(conversion.toggleColumnIncluded).toHaveBeenCalledWith('Email');
  });

  test('Clear and Select all call the right handlers', () => {
    const conversion = makeConversion({ excludedColumns: ['Email'] });
    render(<ConversionInspector conversion={conversion} quota={quota} />);
    const picker = screen.getByTestId('app-columns-picker');
    fireEvent.click(within(picker).getByRole('button', { name: /clear/i }));
    expect(conversion.excludeAllColumns).toHaveBeenCalled();
    fireEvent.click(within(picker).getByRole('button', { name: /select all/i }));
    expect(conversion.includeAllColumns).toHaveBeenCalled();
  });

  test('search filters the visible columns', () => {
    render(<ConversionInspector conversion={makeConversion()} quota={quota} />);
    const picker = screen.getByTestId('app-columns-picker');
    fireEvent.change(within(picker).getByLabelText('Search columns'), { target: { value: 'mail' } });
    const boxes = within(picker).getAllByRole('checkbox');
    expect(boxes).toHaveLength(1);
    expect(within(picker).getByRole('checkbox', { name: 'Email' })).toBeTruthy();
  });

  test('a frozen column shows a "fixed" badge', () => {
    render(<ConversionInspector conversion={makeConversion()} quota={quota} />);
    const picker = screen.getByTestId('app-columns-picker');
    // "Name" is in frozenDraft -> a fixed badge appears in its row
    const nameRow = within(picker).getByRole('checkbox', { name: 'Name' }).closest('label');
    expect(within(nameRow).getByText(/fixed/i)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `export PATH="/Users/sneusch/.nvm/versions/node/v22.22.3/bin:$PATH" && cd /tmp/ffp-cols-fe && npx vitest run app/__tests__/columnsControl.ui.test.jsx`
Expected: FAIL — `Unable to find an element by: [data-testid="app-columns-picker"]` (the control does not exist yet).

- [ ] **Step 3a: Implement the `ColumnsControl` component**

Add this function to `app/components/ConversionTool.jsx`, immediately AFTER the `CustomGroupsControl` function (so it sits with the other inspector controls, ~line 398). `trackControlUsed` is already imported and used in this file.

```jsx
function ColumnsControl({ conversion }) {
  const allColumns = Array.isArray(conversion.allColumnsMaster) ? conversion.allColumnsMaster : [];
  const excluded = Array.isArray(conversion.excludedColumns) ? conversion.excludedColumns : [];
  const frozenSet = new Set(Array.isArray(conversion.frozenDraft) ? conversion.frozenDraft : []);
  const [query, setQuery] = React.useState('');

  if (allColumns.length === 0) {
    return (
      <p className="mt-1 text-[11.5px] leading-5 text-[var(--color-text-subtle)]">
        Update the preview once to choose which columns to include.
      </p>
    );
  }

  const excludedSet = new Set(excluded);
  const includedCount = allColumns.filter((c) => !excludedSet.has(c)).length;
  const q = query.trim().toLowerCase();
  const visible = q ? allColumns.filter((c) => c.toLowerCase().includes(q)) : allColumns;

  return (
    <div data-testid="app-columns-picker" className="mt-2 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span data-testid="app-columns-counter" className="text-[11.5px] font-medium text-[var(--color-text-subtle)]">
          {includedCount} / {allColumns.length} included
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => { trackControlUsed({ control: 'columns_select_all', surface: 'workbench' }); conversion.includeAllColumns(); }}
            className="rounded-md px-1.5 py-0.5 text-[11.5px] font-semibold text-[var(--color-text)] underline decoration-[var(--color-text-subtle)] underline-offset-2 hover:decoration-[var(--color-text)]"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={() => { trackControlUsed({ control: 'columns_clear', surface: 'workbench' }); conversion.excludeAllColumns(); }}
            className="rounded-md px-1.5 py-0.5 text-[11.5px] font-semibold text-[var(--color-text)] underline decoration-[var(--color-text-subtle)] underline-offset-2 hover:decoration-[var(--color-text)]"
          >
            Clear
          </button>
        </div>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search columns"
        placeholder="Search columns"
        className="min-h-11 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-2 text-[12.5px] text-[var(--color-text)] outline-none focus:border-[var(--color-line-strong)] lg:min-h-9"
      />

      <div className="flex max-h-72 flex-col gap-0.5 overflow-y-auto overscroll-contain">
        {visible.map((col) => (
          <label key={col} className="flex min-h-11 items-center gap-2 rounded-md px-1 text-[12.5px] text-[var(--color-text)] hover:bg-[var(--color-surface-sunken)] lg:min-h-9">
            <input
              type="checkbox"
              aria-label={col}
              checked={!excludedSet.has(col)}
              onChange={() => { trackControlUsed({ control: 'columns_picker', surface: 'workbench' }); conversion.toggleColumnIncluded(col); }}
              className="h-4 w-4 shrink-0 accent-[var(--color-primary,#2563eb)]"
            />
            <span className="min-w-0 flex-1 truncate">{col}</span>
            {frozenSet.has(col) ? (
              <span className="shrink-0 rounded bg-[var(--color-surface-sunken)] px-1 py-0.5 text-[9.5px] font-medium uppercase tracking-wide text-[var(--color-text-subtle)]">
                fixed
              </span>
            ) : null}
          </label>
        ))}
        {visible.length === 0 ? (
          <p className="px-1 py-2 text-[11.5px] text-[var(--color-text-subtle)]">No columns match “{query}”.</p>
        ) : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 3b: Mount it as the first control in the Sections tab**

In `ConversionInspector`, inside the `activeTab === 'sections'` branch (the `<>...</>` that currently starts with `<InspectorSection title="Column grouping" ...>`, ~line 631), add this NEW section as the FIRST child, BEFORE "Column grouping":

```jsx
<InspectorSection
  title="Columns"
  hint="Choose which columns appear in the PDF. Unchecked columns are dropped — the row number column is always kept."
  defaultOpen
>
  <ColumnsControl conversion={conversion} />
</InspectorSection>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `export PATH="/Users/sneusch/.nvm/versions/node/v22.22.3/bin:$PATH" && cd /tmp/ffp-cols-fe && npx vitest run app/__tests__/columnsControl.ui.test.jsx`
Expected: PASS (7 tests).

Then confirm you did not break the sibling inspector tests:
Run: `npx vitest run app/__tests__/sectionColorEditor.ui.test.jsx app/__tests__/appCustomGroups.e2e.test.jsx`
Expected: PASS. (If a pre-existing test asserted a specific number of `InspectorSection`s or used an ambiguous `getByRole('checkbox')` at the inspector level, scope it — but do not weaken the new test.)

- [ ] **Step 5: Commit**

```bash
cd /tmp/ffp-cols-fe && git add app/components/ConversionTool.jsx app/__tests__/columnsControl.ui.test.jsx && git commit -m "feat(columns): Columns picker control in the workbench inspector"
git ls-files | grep -c node_modules   # must print 0
```

---

## Task 3: Wire selection state into `useConversion` + send `includeColumns`

**Files:**
- Modify: `app/hooks/useConversion.mjs` (add state ~line 444 after `frozenDraft`; capture master + reset in the response/new-file paths; append in `submitRender` ~line 588; expose in the return object ~line 1159)
- Test: `app/__tests__/columnsPicker.e2e.test.jsx` (create — end-to-end through the real `AppPage`)

This is the integration task: the state added here is consumed by the `ColumnsControl` (Task 2) and turned into the `includeColumns` field. `buildIncludeColumns` (Task 1) decides the payload. The proxy route `app/api/render/route.js` forwards FormData generically — NO change needed there.

- [ ] **Step 1: Write the failing end-to-end test**

Create `app/__tests__/columnsPicker.e2e.test.jsx`. It renders the real workbench, mocks `fetch`, performs a first render (which establishes the column list), unchecks a column, updates the preview, and asserts the second `/api/render` call carries the right `includeColumns`. **Open `app/__tests__/appCustomGroups.e2e.test.jsx` and copy its import block, its `installFetch()` / `bodyEntries()` helpers, its PDF-response builder, and how it mounts the page (`AppPage`) and triggers a render verbatim** — then adapt the response to be wide and add the assertions below. Use this as the skeleton (fill the `// MIRROR …` parts from that file):

```jsx
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

// MIRROR appCustomGroups.e2e.test.jsx: import AppPage (the /app page component) and any helpers.
import AppPage from '../app/page.jsx';

const WIDE_COLS = Array.from({ length: 30 }, (_, i) => `col${i + 1}`);

// Build a successful wide-render Response. MIRROR the PDF-response builder in
// appCustomGroups.e2e.test.jsx (same status, content-type, and any headers it sets);
// only change the sections header so the file has 30 columns across 2 sections.
function wideRenderResponse() {
  const sections = [
    { label: 'A', title: '', columns: WIDE_COLS.slice(0, 15) },
    { label: 'B', title: '', columns: WIDE_COLS.slice(15) },
  ];
  const headers = {
    'content-type': 'application/pdf',
    'x-cleansheet-sections': JSON.stringify(sections),
    'x-cleansheet-frozen-columns': '[]',
    // MIRROR: include any other headers appCustomGroups' helper sets (confidence/debug-metrics/filename).
  };
  return new Response(new Blob(['%PDF-1.4 test']), { status: 200, headers });
}

let renderCalls;
function installFetch() {
  renderCalls = [];
  const original = global.fetch;
  global.fetch = vi.fn(async (url, options) => {
    const u = String(url);
    if (u.includes('/api/render')) { renderCalls.push(options); return wideRenderResponse(); }
    if (u.includes('/api/quota')) return new Response(JSON.stringify({ planType: 'free', freeExportsLeft: 5 }), { status: 200, headers: { 'content-type': 'application/json' } });
    return new Response('', { status: 404 });
  });
  return () => { global.fetch = original; };
}

function bodyEntries(options) {
  const out = {};
  if (options?.body && typeof options.body.entries === 'function') {
    for (const [k, v] of options.body.entries()) out[k] = v;
  }
  return out;
}

let restoreFetch;
beforeEach(() => { restoreFetch = installFetch(); });
afterEach(() => { restoreFetch?.(); cleanup(); });

describe('Columns picker end-to-end', () => {
  test('first render sends NO includeColumns; after unchecking, the next render sends the kept columns', async () => {
    render(<AppPage />);

    // MIRROR appCustomGroups.e2e.test.jsx: select a file + click Generate to perform the first render.
    // (e.g. upload a File to the dropzone input, then fireEvent.click the Generate button.)
    // ... first-render trigger here ...

    await waitFor(() => expect(renderCalls.length).toBe(1));
    expect(bodyEntries(renderCalls[0]).includeColumns).toBeUndefined(); // uncurated -> omitted

    // Open the inspector if needed (desktop: already visible; otherwise click the Options control),
    // then uncheck one column in the Columns picker.
    const picker = await screen.findByTestId('app-columns-picker');
    fireEvent.click(within(picker).getByRole('checkbox', { name: 'col2' }));

    // MIRROR: click "Update preview" to trigger the second render.
    // ... update-preview trigger here ...

    await waitFor(() => expect(renderCalls.length).toBe(2));
    const sent = JSON.parse(bodyEntries(renderCalls[1]).includeColumns);
    expect(sent).toEqual(WIDE_COLS.filter((c) => c !== 'col2'));
    expect(sent).not.toContain('col2');
    expect(sent).toHaveLength(29);
  });
});
```

> If mounting `AppPage` proves heavy to drive (file upload + button wiring), an acceptable alternative is to render `ConversionTool` with `layout="workbench"` exactly as `appCustomGroups.e2e.test.jsx` does — mirror whichever that file uses. The assertions (first call omits `includeColumns`; second call sends the kept 29) must stay.

- [ ] **Step 2: Run the test to verify it fails**

Run: `export PATH="/Users/sneusch/.nvm/versions/node/v22.22.3/bin:$PATH" && cd /tmp/ffp-cols-fe && npx vitest run app/__tests__/columnsPicker.e2e.test.jsx`
Expected: FAIL — the second render call has no `includeColumns` field (state + wiring not present yet), so `JSON.parse(undefined)` throws / assertion fails.

- [ ] **Step 3a: Add state + setters**

In `app/hooks/useConversion.mjs`, immediately after the `const [frozenDraft, setFrozenDraft] = useState([]);` line (~line 444), add:

```js
  // Columns picker: the full, stable column list (captured from the first unfiltered
  // render) and the set of column names the user has unchecked.
  const [allColumnsMaster, setAllColumnsMaster] = useState([]);
  const [excludedColumns, setExcludedColumns] = useState([]);

  const toggleColumnIncluded = useCallback((name) => {
    setExcludedColumns((prev) => (prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]));
  }, []);
  const includeAllColumns = useCallback(() => setExcludedColumns([]), []);
  const excludeAllColumns = useCallback(() => setExcludedColumns(allColumnsMaster.slice()), [allColumnsMaster]);
```

> `useCallback` is already imported in this file (it's used for other handlers). If a lint/ref error says otherwise, add it to the existing `react` import.

- [ ] **Step 3b: Capture the master list on the first render; reset on a new file**

Find the response-parsing block in `submitRender` where `setSectionDraft(...)` and `setFrozenDraft(...)` are called from the parsed headers (~lines 669–683; uses `nextSections` and `nextFrozen`). Immediately AFTER `setFrozenDraft(...)`, add:

```js
        // Establish the stable full column list once per file (the first render is always
        // unfiltered, so its response carries every column). Later filtered renders never shrink it.
        setAllColumnsMaster((prev) => {
          if (prev.length) return prev;
          const sectionCols = (Array.isArray(nextSections) ? nextSections : []).flatMap((s) => (Array.isArray(s.columns) ? s.columns : []));
          const frozenCols = Array.isArray(nextFrozen) ? nextFrozen : [];
          return [...new Set([...sectionCols, ...frozenCols])];
        });
```

Then find where a NEW file resets the drafts (grep for `setSectionDraft([])` — used by "Change file"/`handleRenderAnother` and/or the new-file selection handler). At EACH place that resets `setSectionDraft([])` for a new file, also add:

```js
        setAllColumnsMaster([]);
        setExcludedColumns([]);
```

> Run `grep -n "setSectionDraft(\[\])" app/hooks/useConversion.mjs` to find every reset site. Add the two resets next to each one (do NOT add them to the post-render parsing path from Step 3b — only to the new-file reset paths).

- [ ] **Step 3c: Append `includeColumns` in the FormData**

In `submitRender`, find the block that appends `columnGroups`/`sectionTitles`/`sectionColors` (~lines 574–588). Immediately AFTER that block (after the `sectionColors` append, before the `fetch(...)` call ~line 590), add:

```js
      const includeColumns = buildIncludeColumns({ allColumns: allColumnsMaster, excludedColumns });
      if (includeColumns) {
        formData.append('includeColumns', JSON.stringify(includeColumns));
      }
```

Add `buildIncludeColumns` to the existing import from `../pageUiLogic.mjs` at the top of the file (it already imports `buildRenderUrl`, `buildGroupingPayload`, etc. — add `buildIncludeColumns` to that list).

- [ ] **Step 3d: Expose the new state in the hook's return object**

In the object returned by `useConversion` (the big `return { ... }` ~line 1130+, near where `renderedSections`, `renderedFrozenColumns`, `sectionDraft`, `frozenDraft` are exposed), add:

```js
    allColumnsMaster,
    excludedColumns,
    toggleColumnIncluded,
    includeAllColumns,
    excludeAllColumns,
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `export PATH="/Users/sneusch/.nvm/versions/node/v22.22.3/bin:$PATH" && cd /tmp/ffp-cols-fe && npx vitest run app/__tests__/columnsPicker.e2e.test.jsx`
Expected: PASS (first render omits `includeColumns`; second sends the 29 kept columns).

Then re-run Task 2's test to confirm the real wiring still satisfies the component contract:
Run: `npx vitest run app/__tests__/columnsControl.ui.test.jsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /tmp/ffp-cols-fe && git add app/hooks/useConversion.mjs app/__tests__/columnsPicker.e2e.test.jsx && git commit -m "feat(columns): thread includeColumns selection through useConversion"
git ls-files | grep -c node_modules   # must print 0
```

---

## Task 4: Wide-file banner on the rendered canvas

**Files:**
- Modify: `app/components/ConversionTool.jsx` (add a module-level `WIDE_FILE_COLUMN_THRESHOLD` constant near the top with the other consts ~line 60; insert the banner inside `WorkbenchRenderedCanvas` ~line 1553, after the file-info card and any condense notes, before the "Preview" label)
- Test: `app/__tests__/wideFileBanner.ui.test.jsx` (create)

The banner is informational and only shows when the file is wide AND the user has not curated yet (`excludedColumns` empty). Its action calls the existing `onEditOptions` callback, which opens the inspector (desktop expands the right panel; mobile opens the Options drawer).

- [ ] **Step 1: Write the failing test**

Create `app/__tests__/wideFileBanner.ui.test.jsx`:

```jsx
import { afterEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { WorkbenchRenderedCanvas } from '../components/ConversionTool.jsx';

function makeConversion(overrides = {}) {
  return {
    pdfBlob: new Blob(['%PDF']),
    file: new File(['a'], 'wide.csv', { type: 'text/csv' }),
    resolvedPdfFilename: 'wide.pdf',
    handleRenderAnother: () => {},
    debugMetrics: {},
    confidence: {},
    renderedSections: [],
    frozenDraft: [],
    allColumnsMaster: Array.from({ length: 30 }, (_, i) => `col${i + 1}`),
    excludedColumns: [],
    ...overrides,
  };
}

afterEach(() => cleanup());

describe('Wide-file banner', () => {
  test('shows for a wide, uncurated file and reports the column count', () => {
    render(<WorkbenchRenderedCanvas conversion={makeConversion()} quota={{}} onEditOptions={() => {}} />);
    const banner = screen.getByTestId('app-wide-file-banner');
    expect(banner.textContent).toContain('30 columns');
  });

  test('clicking the action calls onEditOptions', () => {
    const onEditOptions = vi.fn();
    render(<WorkbenchRenderedCanvas conversion={makeConversion()} quota={{}} onEditOptions={onEditOptions} />);
    fireEvent.click(screen.getByRole('button', { name: /choose which columns/i }));
    expect(onEditOptions).toHaveBeenCalled();
  });

  test('hidden once the user has curated (excludedColumns non-empty)', () => {
    render(<WorkbenchRenderedCanvas conversion={makeConversion({ excludedColumns: ['col5'] })} quota={{}} onEditOptions={() => {}} />);
    expect(screen.queryByTestId('app-wide-file-banner')).toBeNull();
  });

  test('hidden for a narrow file', () => {
    render(<WorkbenchRenderedCanvas conversion={makeConversion({ allColumnsMaster: ['a', 'b', 'c'] })} quota={{}} onEditOptions={() => {}} />);
    expect(screen.queryByTestId('app-wide-file-banner')).toBeNull();
  });
});
```

> If `WorkbenchRenderedCanvas` is not currently exported, add it to that component's declaration: change `function WorkbenchRenderedCanvas(` to `export function WorkbenchRenderedCanvas(` (same pattern as the exported `ConversionInspector`). Verify `onEditOptions` is already a parameter of `WorkbenchRenderedCanvas`; if it is only threaded to `PdfPreviewPane`, it is already in scope.

- [ ] **Step 2: Run the test to verify it fails**

Run: `export PATH="/Users/sneusch/.nvm/versions/node/v22.22.3/bin:$PATH" && cd /tmp/ffp-cols-fe && npx vitest run app/__tests__/wideFileBanner.ui.test.jsx`
Expected: FAIL — `app-wide-file-banner` not found (and possibly an import error until `WorkbenchRenderedCanvas` is exported).

- [ ] **Step 3a: Add the threshold constant**

Near the top of `app/components/ConversionTool.jsx`, with the other module-level constants (~line 60, before `InspectorSection`), add:

```jsx
const WIDE_FILE_COLUMN_THRESHOLD = 25;
```

- [ ] **Step 3b: Insert the banner**

Inside `WorkbenchRenderedCanvas`, AFTER the file-info card `</div>` and the optional condense/condensed notes, and BEFORE the `<div ...>Preview ...</div>` label (~line 1553), insert:

```jsx
      {(() => {
        const cols = Array.isArray(conversion.allColumnsMaster) ? conversion.allColumnsMaster.length : 0;
        const curated = Array.isArray(conversion.excludedColumns) && conversion.excludedColumns.length > 0;
        if (cols <= WIDE_FILE_COLUMN_THRESHOLD || curated) return null;
        return (
          <div
            data-testid="app-wide-file-banner"
            className="mb-[18px] flex items-center gap-3 rounded-[10px] border border-[var(--color-line)] bg-[var(--color-surface-sunken)] px-4 py-3"
          >
            <FileText className="h-5 w-5 shrink-0 text-[var(--color-text-subtle)]" aria-hidden="true" />
            <p className="min-w-0 flex-1 text-[12.5px] leading-5 text-[var(--color-text)]">
              {cols} columns — this PDF will be long. Choose which columns to include for a shorter, cleaner export.
            </p>
            <button
              type="button"
              onClick={onEditOptions}
              className="shrink-0 whitespace-nowrap rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-[12.5px] font-semibold text-[var(--color-text)] transition hover:border-[var(--color-line-strong)]"
            >
              Choose which columns →
            </button>
          </div>
        );
      })()}
```

> `FileText` is already imported and used in `WorkbenchRenderedCanvas`. If `onEditOptions` is undefined in this scope, thread it through from the caller the same way `PdfPreviewPane` receives it (it already does in the snippet).

- [ ] **Step 4: Run the test to verify it passes**

Run: `export PATH="/Users/sneusch/.nvm/versions/node/v22.22.3/bin:$PATH" && cd /tmp/ffp-cols-fe && npx vitest run app/__tests__/wideFileBanner.ui.test.jsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
cd /tmp/ffp-cols-fe && git add app/components/ConversionTool.jsx app/__tests__/wideFileBanner.ui.test.jsx && git commit -m "feat(columns): wide-file banner linking to the Columns picker"
git ls-files | grep -c node_modules   # must print 0
```

---

## Task 5: Full suite + build verification

**Files:** none (verification only; fix fixtures only if a pre-existing test was calibrated to the old inspector and your additions legitimately shifted it).

- [ ] **Step 1: Run the full test suite**

Run: `export PATH="/Users/sneusch/.nvm/versions/node/v22.22.3/bin:$PATH" && cd /tmp/ffp-cols-fe && npm test`
Expected: all `node --test` files PASS and `vitest run` PASS.
- If a pre-existing inspector/e2e test breaks ONLY because a new "Columns" section was added (e.g. an over-broad `getByRole('checkbox')` that now matches picker checkboxes, or a hard-coded section count), fix THAT test minimally (scope its query) — do not weaken the Task 2–4 tests. Report any such fix.

- [ ] **Step 2: Production build**

Run: `export PATH="/Users/sneusch/.nvm/versions/node/v22.22.3/bin:$PATH" && cd /tmp/ffp-cols-fe && npm run build`
Expected: build succeeds (no type/lint errors from the new code).

- [ ] **Step 3: Commit any fixture fixes**

```bash
cd /tmp/ffp-cols-fe && git add <explicit fixed test path(s)> && git commit -m "test: scope inspector queries for the new Columns section"
git ls-files | grep -c node_modules   # must print 0
```
(Skip if nothing needed fixing.)

---

## Spec coverage check (self-review)

- "Dedicated Columns control, checklist, all checked by default" → Task 2 (`ColumnsControl`, `checked={!excludedSet.has(col)}`, default `excludedColumns=[]`).
- "Search + Select-all/Clear + counter (12/68)" → Task 2 (search input, both buttons, `app-columns-counter`).
- "Send includeColumns = checked; omit when all checked" → Tasks 1 + 3 (`buildIncludeColumns` returns `null` when nothing curated; FormData append only when non-null).
- "`#` row-index implicit, never listed" → it never appears in `sectionDraft.columns`/`frozenDraft`, so it is never in `allColumnsMaster`; nothing to do.
- "Wide-file banner when >~25 columns, links to picker" → Task 4 (`WIDE_FILE_COLUMN_THRESHOLD = 25`, `onEditOptions`).
- "Backward compatible / byte-unchanged for un-curated files" → Task 1 (omit) + Task 3 (append only when curated) + Task 3 e2e first-render assertion.
- Edge "hiding a frozen/pinned column drops it" → frozen columns are normal checkboxes in the picker (with a cosmetic "fixed" badge); unchecking one excludes it like any other (the backend already drops it per PR1).

**Deviation from the spec (intentional, design-preserving):** the spec implies the column list/count is known from a pre-render client parse. There is no client-side parse — columns are known only after the first render (response headers). So the picker and banner are post-render, matching the existing render-first workbench flow. A stable `allColumnsMaster` (captured from the first unfiltered render) keeps the list complete across subsequent filtered renders. Behavior and intent are unchanged.

## Out of scope (per spec)
- Auto/smart pre-selection of "important" columns.
- Column reorder/rename (the Sections control already covers grouping/renaming).
- Virtualization for files with hundreds of columns (the list scrolls; revisit only if a real file makes it slow).
