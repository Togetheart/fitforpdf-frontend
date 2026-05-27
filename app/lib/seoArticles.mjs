/**
 * Long-tail SEO articles for fitforpdf.
 *
 * Why this file exists: /excel-to-pdf-columns-cut-off had a 0% bounce rate and
 * was the only page bringing organic Google traffic. We're cloning that pattern
 * for 10 more long-tail queries with high search intent and low competition.
 *
 * Each entry produces one page at /<slug>, sharing the SeoArticle template.
 * Add new entries here + run `node scripts/check-seo-pages.mjs` (TODO) if you
 * add automation later.
 *
 * Each article has:
 *   slug         — URL segment (also the directory under /app)
 *   title        — <title> + OG title
 *   description  — meta description (~155 chars max)
 *   eyebrow      — small label above the H1
 *   h1           — page title
 *   lead         — first paragraph below H1
 *   sections     — list of {h2, body?, list?}
 *   faqs         — list of {q, a} for FAQ schema
 *   related      — internal cross-links
 *   cta          — final CTA block
 */

export const SEO_ARTICLES = [
  // ────────────────────────────────────────────────────────────────────
  {
    slug: 'excel-to-pdf-keep-headers-repeat',
    eyebrow: 'Excel → PDF',
    title: 'Keep Excel Headers Repeating on Every PDF Page',
    description:
      'How to make Excel header rows repeat on every PDF page — both manually via Print Titles and automatically with fitforpdf for multi-section reports.',
    h1: 'How to keep Excel headers repeating on every PDF page',
    lead:
      'A 200-row export with the header row only on page 1 is useless to a reader. Here is the manual fix in Excel, where it breaks, and how to automate it for wide tables.',
    sections: [
      {
        h2: 'The manual fix in Excel: Print Titles',
        body:
          'Page Layout → Print Titles → "Rows to repeat at top". Click the row selector and pick row 1 (or whichever row holds your headers). Save the workbook. From now on every printed/exported page reprints those rows at the top.',
      },
      {
        h2: 'Where Print Titles stops working',
        list: [
          'Wide tables that get split into column groups — the header rows repeat, but the column subset changes per page and the headers no longer match.',
          'Multi-sheet workbooks — Print Titles is per-sheet, so combined PDFs lose consistency.',
          'Custom report sections where you want different headers per section.',
        ],
      },
      {
        h2: 'The structured-section alternative',
        body:
          'Instead of repeating the same flat header row, fitforpdf renders a section header for each column group with the relevant columns named at the top, and the identifier columns repeated on every page within that group. This stays readable regardless of how many columns you started with.',
      },
    ],
    faqs: [
      {
        q: 'How do I make Excel repeat the header row on every printed page?',
        a: 'Open Page Layout → Print Titles → set "Rows to repeat at top" to $1:$1 (or the row range that contains your headers). The setting is saved with the workbook.',
      },
      {
        q: 'Why do my Excel headers stop repeating after the first page in PDF?',
        a: 'Most often because the headers were set as a freeze pane in the view, not as Print Titles. Freeze panes only affect on-screen scrolling — for printing/PDF you need the Page Layout → Print Titles dialog.',
      },
      {
        q: 'Can I repeat both rows and columns when exporting to PDF?',
        a: 'Yes — Print Titles has separate fields for "Rows to repeat at top" and "Columns to repeat at left". Use the columns option when you have wide tables where readers need an identifier column on every page.',
      },
    ],
    related: [
      { label: 'Fix cut-off columns in Excel PDF export', href: '/excel-to-pdf-columns-cut-off' },
      { label: 'Export audit Excel sheets to PDF — best practices', href: '/audit-report-excel-to-pdf-tips' },
      { label: 'Convert CSV to structured, readable PDF', href: '/csv-to-structured-pdf' },
    ],
    cta: {
      title: 'Headers always in place — automatically.',
      body: 'Upload your Excel file and get a PDF where headers + identifier columns stay visible on every page. 3 free exports.',
      label: 'Generate your first PDF — free',
    },
  },
  // ────────────────────────────────────────────────────────────────────
  {
    slug: 'wide-table-pdf-export',
    eyebrow: 'Wide tables',
    title: 'How to Export Wide Tables to PDF (Without Losing Columns)',
    description:
      'Wide tables (20+ columns) break standard PDF exporters. Learn the manual workarounds, where they stop scaling, and the structured approach with fitforpdf.',
    h1: 'Exporting wide tables to PDF without losing columns',
    lead:
      'Most PDF exporters were built for documents, not data. Once your table crosses ~15 columns, the result is cut-off columns or microscopic text. Here is the realistic playbook.',
    sections: [
      {
        h2: 'Why every PDF exporter breaks on wide tables',
        body:
          'Standard PDF tools (Excel print, Word, Puppeteer, wkhtmltopdf) work within a fixed page width. They either truncate (clip the rightmost columns) or scale (shrink everything to fit), both of which destroy readability on tables wider than ~15 columns.',
      },
      {
        h2: 'Manual workarounds and where they hit their limit',
        list: [
          'Landscape A4 — buys you ~15 columns at readable size, then collapses.',
          'A3 paper / custom 11×17 page — works if your reader prints to A3, but most don\'t.',
          'Scale to Fit — works to ~25 columns but the result is unreadable (6pt text).',
          'Split into print areas — works but breaks the audit trail (rows lose their identifier on the secondary print).',
        ],
      },
      {
        h2: 'Section-based layout: the only thing that scales',
        body:
          'For 20+ columns, the only readable output is one where the table is split horizontally into named sections, each repeating the identifier columns. fitforpdf does this automatically — analysing your table and producing an overview page + sectioned PDF, with the identifier columns (like ID, Name, Date) reprinted on every section.',
      },
    ],
    faqs: [
      {
        q: 'What counts as a "wide" table for PDF export?',
        a: 'Practically: anything above 12-15 visible columns on a landscape A4 page starts to break at readable font sizes. Above 20 columns, no scaling strategy works without sectioning.',
      },
      {
        q: 'Can I export a 30-column Excel sheet to PDF and still read it?',
        a: 'Not with scale-to-fit. The only readable result for 30 columns is a sectioned PDF — three or four column groups, with the identifier columns (e.g. ID and Name) repeated on each section.',
      },
      {
        q: 'Do I need to restructure my spreadsheet before using fitforpdf?',
        a: 'No. fitforpdf reads the original file as-is and decides the sectioning automatically based on column count and content. The source spreadsheet is never modified.',
      },
    ],
    related: [
      { label: 'Fix cut-off columns in Excel PDF export', href: '/excel-to-pdf-columns-cut-off' },
      { label: 'Convert 30+ column Excel to PDF (keep all columns)', href: '/xlsx-to-pdf-keep-all-columns' },
      { label: 'How to fit a large Excel sheet on one PDF page', href: '/fit-excel-sheet-on-one-page-pdf' },
    ],
    cta: {
      title: 'Wide tables, readable PDFs.',
      body: 'Upload a CSV or XLSX with up to 50 columns. Get a structured, readable PDF. 3 free exports.',
      label: 'Try with your wide table — free',
    },
  },
  // ────────────────────────────────────────────────────────────────────
  {
    slug: 'xlsx-to-pdf-keep-all-columns',
    eyebrow: 'XLSX → PDF',
    title: 'Convert XLSX to PDF and Keep All Columns',
    description:
      'Stop losing columns when converting XLSX to PDF. The Excel print settings to try first, when they fail, and the structured alternative with fitforpdf.',
    h1: 'Convert XLSX to PDF without losing columns',
    lead:
      'Excel\'s default PDF export silently clips columns that don\'t fit the page width. Here is how to verify what\'s being clipped, how to fix it for narrow files, and what to do when manual fixes give up.',
    sections: [
      {
        h2: 'Step 1 — check what Excel is actually clipping',
        body:
          'File → Print → Preview. Use the page navigation to walk every page. If your data goes past page 1 horizontally, Excel either splits it across separate pages (acceptable) or clips it entirely (broken). Most clipped exports never even get noticed until the client emails back.',
      },
      {
        h2: 'Step 2 — manual fixes for ≤ 15 columns',
        list: [
          'Page Layout → Orientation → Landscape.',
          'Page Layout → Margins → Narrow.',
          'Page Layout → Scale to Fit → set Width to 1 page (but never set Height to 1).',
          'Hide internal helper columns before exporting.',
        ],
      },
      {
        h2: 'Step 3 — for 16+ columns, switch strategy',
        body:
          'Scale-to-fit beyond 15 columns produces unreadable PDFs. The reliable approach is column-group sectioning: split the columns into thematic groups, each with the identifier columns repeated. fitforpdf does this without configuration — upload the XLSX, get the sectioned PDF.',
      },
    ],
    faqs: [
      {
        q: 'Why does Excel cut off columns when I save as PDF?',
        a: 'Excel exports content within the page width defined by your printer/page setup. Anything wider is either pushed to additional pages or clipped, depending on the Scale to Fit setting.',
      },
      {
        q: 'How do I export XLSX to PDF without losing data?',
        a: 'For narrow files (≤15 cols): landscape + narrow margins + scale to 1 page wide. For wider files: section-based tools like fitforpdf are the only reliable option.',
      },
      {
        q: 'Does fitforpdf handle XLSX files with formulas?',
        a: 'Yes. fitforpdf reads the calculated values (what you see in the cells), not the raw formulas. Hidden helper columns are typically excluded automatically.',
      },
    ],
    related: [
      { label: 'Fix cut-off columns in Excel PDF export', href: '/excel-to-pdf-columns-cut-off' },
      { label: 'How to export wide tables to PDF', href: '/wide-table-pdf-export' },
      { label: 'Excel multiple sheets to single PDF', href: '/excel-multiple-sheets-to-single-pdf' },
    ],
    cta: {
      title: 'Keep every column. No manual layout.',
      body: 'Upload your XLSX. Every column preserved, every row traceable. 3 free exports.',
      label: 'Try with your XLSX — free',
    },
  },
  // ────────────────────────────────────────────────────────────────────
  {
    slug: 'excel-print-area-too-wide-pdf',
    eyebrow: 'Excel print error',
    title: 'Fix: "Excel Print Area Too Wide" in PDF Exports',
    description:
      'The "print area too wide" warning in Excel means your data won\'t fit. Here\'s what causes it, the manual fixes, and the structured-section solution.',
    h1: '"Print area too wide" in Excel — what it means and how to fix it',
    lead:
      'You hit Print, Excel warns the print area is too wide for the page, the PDF comes out clipped. The cause is almost always the same: too many columns for a single page. Here are your options.',
    sections: [
      {
        h2: 'What "print area too wide" actually means',
        body:
          'Excel measures the width of your selected print area against the printable area of the page. If the data is wider, it splits across multiple horizontal pages (page 1, page 1.1, page 1.2…). Most users don\'t notice the secondary pages and the PDF appears clipped.',
      },
      {
        h2: 'Quick manual fixes',
        list: [
          'Switch to landscape: Page Layout → Orientation → Landscape.',
          'Narrow margins: Page Layout → Margins → Narrow.',
          'Reset the print area: Page Layout → Print Area → Clear, then re-select only what you need.',
          'Hide non-essential columns (right-click → Hide) before exporting.',
        ],
      },
      {
        h2: 'When manual fixes are not enough',
        body:
          'Beyond ~15 columns, scaling further shrinks text below readable size. The reliable solution is to keep print scale at 100% and let the table flow into multiple sectioned pages, with identifier columns repeated on each. fitforpdf does this automatically — no Print Titles configuration needed.',
      },
    ],
    faqs: [
      {
        q: 'How do I check what Excel will print before exporting to PDF?',
        a: 'File → Print → Print Preview. Walk every page (← →) and watch the column footer for "Page 1 of N". If N > 1 horizontally, your print area is too wide.',
      },
      {
        q: 'Why does Excel ignore my Scale to Fit setting?',
        a: 'Scale to Fit has a minimum scale (typically 10%). Above that lower bound, Excel cannot shrink further and falls back to multi-page splitting. The warning usually means you\'ve hit that floor.',
      },
      {
        q: 'Is there a tool that handles "print area too wide" automatically?',
        a: 'Yes — fitforpdf reads the file, decides on column-group sections instead of scaling, and produces a PDF where every column stays at readable size.',
      },
    ],
    related: [
      { label: 'Fix cut-off columns in Excel PDF export', href: '/excel-to-pdf-columns-cut-off' },
      { label: 'Wide table PDF export', href: '/wide-table-pdf-export' },
      { label: 'Excel PDF text too small — fix', href: '/excel-pdf-text-too-small-fix' },
    ],
    cta: {
      title: 'No more "too wide" warnings.',
      body: 'Drop the file in fitforpdf. Every column at readable size, every page numbered. 3 free exports.',
      label: 'Fix your too-wide export — free',
    },
  },
  // ────────────────────────────────────────────────────────────────────
  {
    slug: 'convert-large-csv-to-pdf',
    eyebrow: 'Large CSV',
    title: 'Convert Large CSV Files (1000+ Rows) to PDF',
    description:
      'How to convert large CSV files to a readable, paginated PDF — avoiding the formatting collapse that happens with Excel or generic converters.',
    h1: 'Converting a large CSV to a readable PDF',
    lead:
      'A 5,000-row CSV pasted into Excel and exported to PDF gives you a 200-page document with no headers on most pages, no row ranges, and broken column widths. Here is what to do instead.',
    sections: [
      {
        h2: 'Why large CSV files break standard exports',
        body:
          'CSV files have no formatting. When you open one in Excel, columns auto-size to their first few cells — usually wrong for the whole file. Header rows don\'t repeat unless you configure Print Titles. The resulting PDF is a wall of data with no structure.',
      },
      {
        h2: 'Manual setup for clean CSV-to-PDF',
        list: [
          'Open the CSV in Excel, then save as .xlsx.',
          'Auto-fit column widths: select all, Home → Format → AutoFit Column Width.',
          'Set Print Titles to repeat row 1 on every page.',
          'Add a footer with "Page N of M" and the file name.',
          'Switch orientation based on column count (portrait ≤8 cols, landscape ≤15).',
        ],
      },
      {
        h2: 'Or: pipe the CSV directly to fitforpdf',
        body:
          'fitforpdf accepts .csv directly — no XLSX conversion needed. It detects the delimiter, auto-fits columns, repeats headers on every page, paginates with row ranges ("Rows 1–50 of 5000 · Page 1 / 100"), and adds an overview page. For datasets above 5,000 rows, the API endpoint accepts streaming uploads.',
      },
    ],
    faqs: [
      {
        q: 'What\'s the maximum CSV size fitforpdf can handle?',
        a: 'The web app handles files up to 10 MB. The API endpoint supports up to 5,000 rows and 50 columns per request. For larger datasets, split by logical groups (per region, per month) or contact for enterprise limits.',
      },
      {
        q: 'How are CSV delimiters detected?',
        a: 'fitforpdf auto-detects comma, semicolon, tab, and pipe delimiters. UTF-8 BOM and quoted strings with embedded commas/newlines are handled.',
      },
      {
        q: 'Can I include a summary or totals page when converting CSV to PDF?',
        a: 'The PDF includes an overview page with the column list and row ranges per section. For computed totals (sums, averages), pre-compute them in your source data — fitforpdf renders what\'s in the CSV, it doesn\'t calculate.',
      },
    ],
    related: [
      { label: 'CSV to structured, readable PDF', href: '/csv-to-structured-pdf' },
      { label: 'Wide table PDF export', href: '/wide-table-pdf-export' },
      { label: 'XLSX to PDF keep all columns', href: '/xlsx-to-pdf-keep-all-columns' },
    ],
    cta: {
      title: 'Large CSV → readable PDF in seconds.',
      body: 'Upload your CSV (any delimiter, up to 10 MB). Get a paginated, sectioned PDF. 3 free exports.',
      label: 'Convert your CSV — free',
    },
  },
  // ────────────────────────────────────────────────────────────────────
  {
    slug: 'excel-pdf-text-too-small-fix',
    eyebrow: 'Excel PDF symptom',
    title: 'Fix Excel PDF Export with Text Too Small to Read',
    description:
      'Microscopic text in your Excel PDF? It\'s a symptom of Scale to Fit on a wide table. Here\'s how to fix it and stop sacrificing readability.',
    h1: 'Excel PDF export text is too small to read — how to fix it',
    lead:
      'If your exported PDF requires zooming to 200% just to read cell values, the cause is almost always Scale to Fit applied to a table that\'s too wide for the page. Fixing the scale alone isn\'t enough.',
    sections: [
      {
        h2: 'Why "Scale to Fit" produces unreadable text',
        body:
          'Excel\'s Scale to Fit shrinks the entire sheet — including font sizes — until it fits the page dimensions you specified. A 25-column sheet on landscape A4 gets crushed to roughly 6pt, where letters lose definition and decimal alignment becomes meaningless.',
      },
      {
        h2: 'The fix: stop scaling, start sectioning',
        list: [
          'Page Layout → Scale to Fit → reset to Width: Automatic, Height: Automatic, Scaling: 100%.',
          'Pick the orientation that fits your widest natural section (landscape for >8 cols).',
          'If the table still overflows: split into column groups before printing, OR switch to a sectioning tool.',
        ],
      },
      {
        h2: 'fitforpdf preserves text size automatically',
        body:
          'Because fitforpdf splits wide tables horizontally into sections, every column gets the full page width to render at a readable size (10pt+ baseline). No scaling, no zoom required — the PDF is built to be read at 100%.',
      },
    ],
    faqs: [
      {
        q: 'What font size is too small for an Excel PDF?',
        a: 'Below 8pt becomes hard to read printed. Below 6pt is illegible. Most "Scale to Fit" exports of wide tables end up around 4-6pt, which is the symptom users notice as "the text is too small".',
      },
      {
        q: 'Can I just zoom in on the PDF and call it done?',
        a: 'You can — but clients reading on a phone, projecting in a meeting, or printing won\'t. The right fix is to produce a PDF that\'s readable at 100% scale.',
      },
      {
        q: 'What\'s the minimum font size fitforpdf uses?',
        a: 'fitforpdf targets a baseline of 9pt for data cells (10pt for headers). If a table is so wide that even sectioning can\'t hit that baseline, the engine emits a warning instead of producing an unreadable PDF.',
      },
    ],
    related: [
      { label: 'Fix cut-off columns in Excel PDF export', href: '/excel-to-pdf-columns-cut-off' },
      { label: 'Excel print area too wide PDF', href: '/excel-print-area-too-wide-pdf' },
      { label: 'How to fit a large Excel sheet on one PDF page', href: '/fit-excel-sheet-on-one-page-pdf' },
    ],
    cta: {
      title: 'Stop shrinking. Start sectioning.',
      body: 'fitforpdf keeps every cell at readable size by structuring wide tables into sections. 3 free exports.',
      label: 'Get a readable PDF — free',
    },
  },
  // ────────────────────────────────────────────────────────────────────
  {
    slug: 'crm-export-to-pdf',
    eyebrow: 'CRM workflows',
    title: 'Convert a CRM Export (HubSpot, Salesforce, Pipedrive) to PDF',
    description:
      'Turn a wide CRM CSV export into a clean, client-ready PDF. Works with HubSpot, Salesforce, Pipedrive, Zoho — and any tool that exports wide contact/deal data.',
    h1: 'CRM export → client-ready PDF in seconds',
    lead:
      'CRM exports typically come with 20-40 columns: contact, account, deal, owner, stage, dates, source, custom fields, and a handful of UTM/metadata. They\'re unreadable in Excel\'s default PDF export. Here\'s the structured approach.',
    sections: [
      {
        h2: 'Why CRM exports are particularly painful',
        body:
          'Tools like HubSpot and Salesforce optimize their exports for re-import or BI tools, not for human reading. Custom fields balloon the column count. UTM and lifecycle metadata add five more columns no one needs in the PDF. The result: 30+ columns per row.',
      },
      {
        h2: 'Pre-export hygiene (no matter the tool)',
        list: [
          'Hide internal-only columns (raw IDs, lifecycle scores, system timestamps).',
          'Reorder so identifier columns (Contact Name, Company, Deal Name) come first.',
          'Group related columns (all dates together, all amounts together).',
          'Save as .csv or .xlsx — UTF-8 encoded.',
        ],
      },
      {
        h2: 'fitforpdf for CRM exports',
        body:
          'Upload your CRM export. fitforpdf groups the columns into thematic sections (Contact info, Deal info, Activity dates, Source/UTM, etc.), repeats the identifier columns on each section, and produces a PDF that\'s actually presentable to a client or board.',
      },
    ],
    faqs: [
      {
        q: 'Does fitforpdf integrate directly with HubSpot or Salesforce?',
        a: 'Not yet via a native app. Today you export the CSV/XLSX from your CRM and upload it. For automated pipelines, the developer API handles the same files programmatically.',
      },
      {
        q: 'What about sensitive CRM data?',
        a: 'Files are processed on EU servers, deleted immediately after rendering, and never touched by any LLM. The full pipeline is deterministic and EU-hosted.',
      },
      {
        q: 'How does fitforpdf decide the column groups?',
        a: 'The engine analyses column types, header names, and content density. Identifier-looking columns (containing "ID", "Name", "Account") are detected as anchors and repeated on every section. Other columns are split into balanced groups for readability.',
      },
    ],
    related: [
      { label: 'FitForPDF for SaaS products', href: '/for-saas' },
      { label: 'Wide table PDF export', href: '/wide-table-pdf-export' },
      { label: 'Financial report spreadsheet to PDF', href: '/financial-report-spreadsheet-to-pdf' },
    ],
    cta: {
      title: 'Send a CRM export your client can read.',
      body: 'Export from your CRM, upload to fitforpdf, get a clean PDF. 3 free exports.',
      label: 'Convert your CRM export — free',
    },
  },
  // ────────────────────────────────────────────────────────────────────
  {
    slug: 'financial-report-spreadsheet-to-pdf',
    eyebrow: 'Finance',
    title: 'Convert Financial Reports from Spreadsheet to PDF',
    description:
      'Best practices for converting financial spreadsheets — P&L, balance sheets, rollforwards — to client-ready PDFs with proper pagination and totals visible.',
    h1: 'From spreadsheet to client-ready financial PDF',
    lead:
      'Finance teams ship the same export every month: a wide P&L or balance sheet, a quarterly rollforward, monthly KPIs. The PDF either gets cut off mid-account or shrunk to unreadable. Here\'s the pattern that works.',
    sections: [
      {
        h2: 'What makes financial reports different',
        list: [
          'Account hierarchies (Revenue → Subscription → MRR) that must stay together.',
          'Subtotal and total rows that need clear visual weight.',
          'Period columns (12 months + YTD + Variance + %) that pile up fast.',
          'Decimal alignment that breaks the moment a table is scaled.',
        ],
      },
      {
        h2: 'Manual setup that helps',
        body:
          'Freeze the account column. Set Print Titles to repeat the header row + the account column. Print at 100% scale. Add a footer with the report period and the entity. Switch to landscape and accept that you\'ll have multiple horizontal pages — that\'s a feature, not a bug.',
      },
      {
        h2: 'The structured-section approach',
        body:
          'fitforpdf renders financial reports with the account column repeated on every section, separates period groups (Actuals / Budget / Variance), and preserves decimal alignment by keeping every column at readable size. The output has an overview page with jumpable links to each section.',
      },
    ],
    faqs: [
      {
        q: 'How do I keep subtotals visually distinct in a PDF export?',
        a: 'Use Excel\'s built-in cell styles (Total, Heading 4) before exporting — fitforpdf preserves these styles by default. Avoid custom conditional formatting that depends on specific cell positions, since it doesn\'t survive sectioning.',
      },
      {
        q: 'Can I include a board-meeting cover page automatically?',
        a: 'Today, fitforpdf adds an overview page with the column list and section index, but doesn\'t generate a custom cover page. For now: combine the fitforpdf PDF with a 1-page cover via your PDF tool of choice (or via the API in a workflow).',
      },
      {
        q: 'Is the rendering audit-grade (deterministic)?',
        a: 'Yes — same input file produces the same PDF, byte-identical, every time. No LLM step, no probabilistic layout decisions.',
      },
    ],
    related: [
      { label: 'FitForPDF for finance teams', href: '/for-finance' },
      { label: 'Audit report Excel to PDF — best practices', href: '/audit-report-excel-to-pdf-tips' },
      { label: 'Wide table PDF export', href: '/wide-table-pdf-export' },
    ],
    cta: {
      title: 'Board-ready financial PDFs.',
      body: 'Upload your P&L or rollforward. Get a sectioned, decimal-aligned PDF in seconds. 3 free exports.',
      label: 'Convert your financial report — free',
    },
  },
  // ────────────────────────────────────────────────────────────────────
  {
    slug: 'excel-multiple-sheets-to-single-pdf',
    eyebrow: 'Multi-sheet Excel',
    title: 'Combine Multiple Excel Sheets into a Single PDF',
    description:
      'How to combine multiple Excel sheets into one PDF with consistent formatting — using Excel\'s built-in option and an automated alternative.',
    h1: 'Combine multiple Excel sheets into a single PDF',
    lead:
      'A workbook with 6 tabs and 6 different layouts. You need one PDF that flows naturally between them. Here\'s the manual approach and where it falls short.',
    sections: [
      {
        h2: 'Excel\'s built-in option: Print Active Sheets',
        body:
          'File → Print → Print Active Sheets → set to "Entire Workbook". This generates a single PDF with all sheets included in their tab order. The catch: every sheet keeps its own page setup, so if one is landscape and another portrait, the PDF will be mixed.',
      },
      {
        h2: 'Pre-export consistency checklist',
        list: [
          'Group all sheets (Ctrl+click each tab), then set page setup once — applies to all.',
          'Set Print Titles per sheet (since they\'re not shared across the group).',
          'Add a unified footer with workbook name + sheet name + page numbers.',
          'Verify each sheet\'s print area is set correctly — Page Layout → Print Area → Set.',
        ],
      },
      {
        h2: 'Automated multi-sheet handling',
        body:
          'fitforpdf reads multi-sheet XLSX files and produces a single PDF with an overview page listing every sheet and a section per sheet. Each section gets its own sectioning logic based on the sheet\'s width — so a narrow summary tab stays portrait, a wide detail tab gets sectioned automatically.',
      },
    ],
    faqs: [
      {
        q: 'How do I export multiple Excel sheets to one PDF?',
        a: 'File → Print → choose "Print Entire Workbook" instead of "Print Active Sheets", then Save as PDF. Make sure every sheet has the same page setup (orientation, margins) for visual consistency.',
      },
      {
        q: 'Why do my multi-sheet PDFs have inconsistent formatting?',
        a: 'Because each sheet has its own page setup. Use sheet grouping (Ctrl+click tabs) to apply settings once, or hard-set Page Layout per tab before exporting.',
      },
      {
        q: 'Does fitforpdf preserve sheet names in the multi-sheet PDF?',
        a: 'Yes — each sheet becomes a section with its tab name as the section title, and the overview page lists every sheet with page references.',
      },
    ],
    related: [
      { label: 'Wide table PDF export', href: '/wide-table-pdf-export' },
      { label: 'XLSX to PDF keep all columns', href: '/xlsx-to-pdf-keep-all-columns' },
      { label: 'Excel PDF page break control', href: '/pdf-export-excel-page-break-control' },
    ],
    cta: {
      title: 'Multi-sheet workbook → one structured PDF.',
      body: 'Upload your XLSX (any number of sheets). Get a single PDF with an overview + section per sheet. 3 free exports.',
      label: 'Combine your workbook — free',
    },
  },
  // ────────────────────────────────────────────────────────────────────
  {
    slug: 'pdf-export-excel-page-break-control',
    eyebrow: 'Excel page breaks',
    title: 'Control Page Breaks When Exporting Excel to PDF',
    description:
      'Stop Excel from breaking your PDF mid-row. How to insert and manage page breaks manually, and the automated approach for wide tables.',
    h1: 'Controlling page breaks in Excel-to-PDF exports',
    lead:
      'Page break lands mid-record. Header on page 1, data on page 2. Section title separated from its content. Here\'s how to take back control of where the page break happens.',
    sections: [
      {
        h2: 'Excel page break basics',
        body:
          'Excel inserts page breaks automatically based on row height and the page size. To override: View → Page Break Preview. Drag the blue lines to manually set where pages split. Insert hard page breaks via Page Layout → Breaks → Insert Page Break (it inserts above the selected row).',
      },
      {
        h2: 'Common page-break problems and fixes',
        list: [
          'Break mid-record: insert a hard break BEFORE each major section or record group.',
          'Header on page 1 only: Page Layout → Print Titles → "Rows to repeat at top".',
          'Section title orphaned: use the "Keep with next" workaround by inserting a hard break before the section, never after.',
          'Page break in the middle of a long text cell: that\'s a row-height issue — set explicit row heights and use word wrap.',
        ],
      },
      {
        h2: 'When automated breaks are smarter',
        body:
          'fitforpdf decides page breaks based on record boundaries, not arbitrary row counts. Multi-line cells stay together. Section titles stay attached to their content. Footer rows include "Rows 1–50 of 200 · Page 1 / 4" so the reader always knows what they\'re looking at.',
      },
    ],
    faqs: [
      {
        q: 'How do I insert a page break in Excel before exporting to PDF?',
        a: 'Select the row where you want the break, then Page Layout → Breaks → Insert Page Break. To preview/adjust: View → Page Break Preview.',
      },
      {
        q: 'Why does Excel ignore my manual page breaks in PDF export?',
        a: 'Two common causes: the page setup is set to "Fit to 1 page" (which overrides manual breaks), or the breaks are above hidden rows (Excel may relocate them). Reset Scale to 100%.',
      },
      {
        q: 'Can fitforpdf respect a column or row I\'ve marked as a break?',
        a: 'fitforpdf currently uses its own pagination logic based on record boundaries. For explicit per-section control, the API accepts a `pagination` option to override defaults.',
      },
    ],
    related: [
      { label: 'Fix cut-off columns in Excel PDF export', href: '/excel-to-pdf-columns-cut-off' },
      { label: 'Excel multiple sheets to single PDF', href: '/excel-multiple-sheets-to-single-pdf' },
      { label: 'Keep Excel headers repeating on every PDF page', href: '/excel-to-pdf-keep-headers-repeat' },
    ],
    cta: {
      title: 'Page breaks that respect your data.',
      body: 'fitforpdf paginates by record boundaries, with row ranges and section markers on every page. 3 free exports.',
      label: 'Try better pagination — free',
    },
  },
];

/**
 * Lookup an article by slug. Throws if not found (defensive — surfaces typos
 * in page imports rather than silently rendering an empty article).
 */
export function getArticleBySlug(slug) {
  const article = SEO_ARTICLES.find((a) => a.slug === slug);
  if (!article) {
    throw new Error(`Unknown SEO article slug: ${slug}`);
  }
  return article;
}
