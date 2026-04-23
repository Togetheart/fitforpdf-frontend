export const runtime = 'nodejs';
export const dynamic = 'force-static';

const SITE_URL = 'https://www.fitforpdf.com';
const API_URL = 'https://api.fitforpdf.com';

const OPENAPI = {
  openapi: '3.1.0',
  info: {
    title: 'FitForPDF API',
    version: '1.0.0',
    summary: 'Turn CSV/XLSX into a client-ready PDF.',
    description:
      'Deterministic PDF rendering for tabular data. No LLM, zero storage, EU-hosted. Same input always produces the same PDF.',
    contact: { email: 'hello@fitforpdf.com', url: `${SITE_URL}/developers` },
    license: { name: 'Proprietary' },
  },
  servers: [
    { url: `${API_URL}/v1`, description: 'Production' },
    { url: `${SITE_URL}/api/agent`, description: 'Agent-compat proxy (JSON in/out, file_url)' },
  ],
  components: {
    securitySchemes: {
      FitForPdfKey: {
        type: 'apiKey',
        in: 'header',
        name: 'X-FITFORPDF-KEY',
      },
    },
    schemas: {
      RenderRequest: {
        type: 'object',
        required: ['file_url'],
        properties: {
          file_url: {
            type: 'string',
            format: 'uri',
            description: 'Public HTTPS URL of the CSV or XLSX file (max 10 MB).',
          },
          mode: {
            type: 'string',
            enum: ['normal', 'compact', 'optimized'],
            default: 'normal',
          },
          branding: { type: 'boolean', default: false },
          truncate_long_text: { type: 'boolean', default: false },
          locale: { type: 'string', enum: ['en', 'fr'], default: 'en' },
        },
      },
      RenderResponse: {
        type: 'object',
        properties: {
          render_id: { type: 'string' },
          pdf_base64: { type: 'string', description: 'Base64-encoded PDF bytes.' },
          pages: { type: 'integer' },
          verdict: { type: 'string', enum: ['OK', 'WARN', 'FAIL'] },
          score: { type: 'number' },
          render_ms: { type: 'integer' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          details: { type: 'object' },
        },
      },
    },
  },
  security: [{ FitForPdfKey: [] }],
  paths: {
    '/v1/render': {
      post: {
        operationId: 'render_pdf',
        summary: 'Render a PDF from a spreadsheet file.',
        description:
          'Accepts a JSON body with file_url (preferred for agents) or a multipart/form-data body with a file field.',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RenderRequest' } },
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: {
                  file: { type: 'string', format: 'binary' },
                  mode: { type: 'string', enum: ['normal', 'compact', 'optimized'] },
                  branding: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'PDF generated successfully.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/RenderResponse' } },
              'application/pdf': { schema: { type: 'string', format: 'binary' } },
            },
          },
          400: { description: 'Bad request', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Missing API key' },
          402: { description: 'Quota exhausted' },
          413: { description: 'File too large (10 MB max)' },
          415: { description: 'Unsupported file type (CSV or XLSX only)' },
          422: { description: 'Document too large to render (reduce rows/columns or use compact mode)' },
          429: { description: 'Rate limited' },
        },
      },
    },
    '/v1/quota': {
      get: {
        operationId: 'get_quota',
        summary: 'Current plan and remaining quota.',
        responses: {
          200: {
            description: 'Quota',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    plan: { type: 'string' },
                    remaining: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/health': {
      get: {
        operationId: 'get_health',
        summary: 'Service health (no auth).',
        security: [],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    version: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export async function GET() {
  return new Response(JSON.stringify(OPENAPI, null, 2), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
