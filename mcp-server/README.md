# @fitforpdf/mcp

MCP server for [FitForPDF](https://www.fitforpdf.com) — deterministic PDF rendering for AI agents.

## Install (Claude Desktop)

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "fitforpdf": {
      "command": "npx",
      "args": ["-y", "@fitforpdf/mcp"],
      "env": {
        "FITFORPDF_KEY": "ffp_live_..."
      }
    }
  }
}
```

## Tools

### `render_pdf`

Render a client-ready PDF from a CSV or XLSX file URL.

| arg | type | required |
|---|---|---|
| `file_url` | string | yes |
| `mode` | `normal` \| `compact` \| `optimized` | no |
| `branding` | boolean | no |
| `truncate_long_text` | boolean | no |
| `locale` | `en` \| `fr` | no |

Returns a human-readable summary + a JSON payload with:

- `render_id` — stable identifier
- `verdict` — `OK` / `WARN` / `FAIL`
- `pages` — page count
- `score` — quality score (0–100)
- `pdf_base64` — the PDF content (decode to bytes)

## Development

```bash
cd mcp-server
npm test
```
