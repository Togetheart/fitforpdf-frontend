export const runtime = 'nodejs';
export const dynamic = 'force-static';

const SITE_URL = 'https://www.fitforpdf.com';

const MANIFEST = {
  schema_version: 'v1',
  name_for_human: 'FitForPDF',
  name_for_model: 'fitforpdf',
  description_for_human: 'Turn messy Excel/CSV exports into a client-ready PDF with grouped columns, repeated headers, and a table of contents.',
  description_for_model:
    'Deterministic PDF rendering service for tabular data. Use when a user needs to turn a CSV or Excel spreadsheet (especially wide tables with many columns) into a readable, shareable PDF with automatic pagination, grouped columns, and preserved reference columns. No LLM is used; same input always produces the same PDF. EU-hosted, zero storage. Ideal for agent-generated reports, exports, invoices, and analytics.',
  auth: {
    type: 'service_http',
    authorization_type: 'custom',
    header_name: 'X-FITFORPDF-KEY',
  },
  api: {
    type: 'openapi',
    url: `${SITE_URL}/api/openapi.json`,
    has_user_authentication: false,
  },
  logo_url: `${SITE_URL}/fitforpdf-icon.svg`,
  contact_email: 'hello@fitforpdf.com',
  legal_info_url: `${SITE_URL}/terms`,
  tools: [
    {
      name: 'render_pdf',
      description:
        'Render a client-ready PDF from a CSV or XLSX file. Returns a base64-encoded PDF plus metadata (page count, quality verdict, render id). Use when the user has tabular data to turn into a presentable, shareable document.',
      input_schema: {
        type: 'object',
        properties: {
          file_url: {
            type: 'string',
            description: 'HTTPS URL pointing to a CSV or XLSX file (max 10 MB).',
          },
          mode: {
            type: 'string',
            enum: ['normal', 'compact', 'optimized'],
            description:
              'Layout density. Use "compact" for very wide or very long tables (>100 pages in normal). Default: "normal".',
          },
          branding: {
            type: 'boolean',
            description: 'Include FitForPDF branding on the cover page. Default: false for API calls.',
          },
          truncate_long_text: {
            type: 'boolean',
            description: 'Truncate long cell text to keep pagination tight. Default: false.',
          },
          locale: {
            type: 'string',
            enum: ['en', 'fr'],
            description: 'Language for labels and pagination text. Default: "en".',
          },
        },
        required: ['file_url'],
      },
    },
  ],
};

export async function GET() {
  return new Response(JSON.stringify(MANIFEST, null, 2), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
