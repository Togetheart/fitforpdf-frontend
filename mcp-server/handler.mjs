/**
 * FitForPDF MCP server — handler (transport-agnostic).
 *
 * Implements the JSON-RPC 2.0 subset required by Model Context Protocol:
 *   - initialize
 *   - tools/list
 *   - tools/call
 *
 * The handler is transport-agnostic on purpose: index.mjs wires it to stdio
 * for Claude Desktop, but the same handler can be driven by tests or any
 * other transport (HTTP, WebSocket, etc.).
 */

export const PROTOCOL_VERSION = '2024-11-05';
export const SERVER_NAME = 'fitforpdf-mcp';
export const SERVER_VERSION = '0.1.0';

const RENDER_TOOL = {
  name: 'render_pdf',
  description:
    'Render a client-ready PDF from a CSV or XLSX file URL. Deterministic, no LLM involved. Returns render_id, page count, verdict (OK/WARN/FAIL), and a base64-encoded PDF.',
  inputSchema: {
    type: 'object',
    required: ['file_url'],
    properties: {
      file_url: {
        type: 'string',
        description: 'HTTPS URL of a CSV or XLSX file (max 10 MB).',
      },
      mode: {
        type: 'string',
        enum: ['normal', 'compact', 'optimized'],
        description: 'Layout density. Use "compact" for very large tables.',
      },
      branding: { type: 'boolean' },
      truncate_long_text: { type: 'boolean' },
      locale: { type: 'string', enum: ['en', 'fr'] },
    },
  },
};

const TOOLS = [RENDER_TOOL];

function jsonRpcResult(id, result) {
  return { jsonrpc: '2.0', id, result };
}

function jsonRpcError(id, code, message, data) {
  const error = { code, message };
  if (data !== undefined) error.data = data;
  return { jsonrpc: '2.0', id: id ?? null, error };
}

/**
 * Create a new MCP handler.
 * @param {object} opts
 * @param {string} opts.apiKey - FitForPDF API key (X-FITFORPDF-KEY header)
 * @param {string} [opts.baseUrl=https://www.fitforpdf.com] - base URL of the site
 */
export function createHandler({ apiKey, baseUrl = 'https://www.fitforpdf.com' } = {}) {
  if (!apiKey) {
    throw new Error('createHandler requires apiKey (FitForPDF X-FITFORPDF-KEY value)');
  }
  const normalizedBase = baseUrl.replace(/\/$/, '');

  async function callRenderPdf(args) {
    const res = await fetch(`${normalizedBase}/api/agent/render`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'X-FITFORPDF-KEY': apiKey,
      },
      body: JSON.stringify(args),
    });

    let body;
    try {
      body = await res.json();
    } catch {
      body = { error: 'non_json_response', status: res.status };
    }

    if (!res.ok) {
      const summary = {
        error: body.error || 'upstream_error',
        status: res.status,
        recommendations: body.recommendations,
        details: body.details,
      };
      return {
        isError: true,
        content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }],
      };
    }

    /* Success — surface a human-readable summary for the LLM, plus the
     * structured payload so downstream agent code can pick fields. */
    const summary = [
      `render_id: ${body.render_id}`,
      `verdict: ${body.verdict ?? 'unknown'}`,
      `pages: ${body.pages ?? 'unknown'}`,
      `score: ${body.score ?? 'unknown'}`,
      `render_ms: ${body.render_ms ?? 'unknown'}`,
      body.pdf_base64 ? `pdf_base64: (${body.pdf_base64.length} chars)` : 'pdf_base64: missing',
    ].join('\n');

    return {
      content: [
        { type: 'text', text: summary },
        /* The MCP client gets the raw JSON too so the agent can
         * base64-decode the PDF or address fields programmatically. */
        { type: 'text', text: JSON.stringify(body) },
      ],
    };
  }

  async function handle(message) {
    if (!message || typeof message !== 'object' || message.jsonrpc !== '2.0') {
      return jsonRpcError(message?.id ?? null, -32600, 'Invalid Request');
    }
    const { id, method, params } = message;

    if (method === 'initialize') {
      return jsonRpcResult(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
      });
    }

    if (method === 'tools/list') {
      return jsonRpcResult(id, { tools: TOOLS });
    }

    if (method === 'tools/call') {
      const name = params?.name;
      const args = params?.arguments || {};
      if (name !== 'render_pdf') {
        return jsonRpcError(id, -32602, `Unknown tool: ${name}`);
      }
      try {
        const toolResult = await callRenderPdf(args);
        return jsonRpcResult(id, toolResult);
      } catch (err) {
        return jsonRpcResult(id, {
          isError: true,
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'tool_execution_failed',
              message: err instanceof Error ? err.message : 'unknown',
            }),
          }],
        });
      }
    }

    return jsonRpcError(id, -32601, `Method not found: ${method}`);
  }

  return { handle, tools: TOOLS };
}
