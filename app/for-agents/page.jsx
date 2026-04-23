import VerticalPage from '../components/VerticalPage';
import { JsonLd } from '../components/JsonLd';

export const metadata = {
  title: 'PDF API for AI agents — FitForPDF',
  description:
    'Deterministic PDF rendering for AI agents. No LLM, no hallucinated numbers, same input always produces the same PDF. OpenAPI spec, MCP server, and agent-ready /render endpoint.',
  alternates: { canonical: '/for-agents' },
  openGraph: {
    title: 'PDF API for AI agents — FitForPDF',
    description:
      'The deterministic PDF layer for AI agents. Send a file_url, get a client-ready PDF back. No LLM. Reproducible.',
    url: 'https://www.fitforpdf.com/for-agents',
  },
  twitter: { card: 'summary_large_image' },
};

const PAIN_POINTS = [
  {
    title: 'LLM PDF output is unreliable',
    description:
      "Agents that generate PDFs by asking an LLM to produce HTML/LaTeX hallucinate numbers, break tables, and drop rows. Output is non-reproducible.",
  },
  {
    title: 'Tabular data is agent kryptonite',
    description:
      'Wide CSVs (30+ columns) lose context in tool results. Without structure, the downstream PDF is unreadable or exceeds reasonable page counts.',
  },
  {
    title: 'No stable contract for rendering',
    description:
      'Most PDF libraries expect files, not URLs. No OpenAPI spec, no MCP integration, no JSON in/out — which forces fragile boilerplate in the agent loop.',
  },
];

const BENEFITS = [
  {
    title: 'Deterministic by design',
    description:
      'No LLM in the rendering path. Same CSV + same options always produce the same PDF, byte-identical. Agents can cache, diff, and verify output.',
  },
  {
    title: 'Agent-native API',
    description:
      'Send a file_url in JSON, get JSON back with a base64 PDF + verdict + page count. Documented at /api/openapi.json and /.well-known/ai-plugin.json for tool discovery.',
  },
  {
    title: 'Built for the agent loop',
    description:
      'Structured error codes (page_burden_high with recommendations), render-quality verdict (OK/WARN/FAIL), and deterministic render IDs so your agent can retry intelligently.',
  },
];

const BREADCRUMB_LD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.fitforpdf.com' },
    { '@type': 'ListItem', position: 2, name: 'For AI agents', item: 'https://www.fitforpdf.com/for-agents' },
  ],
};

const AGENTS_FAQ_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Why use FitForPDF instead of asking an LLM to generate the PDF directly?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Because LLMs hallucinate numbers, break table layouts, and produce non-reproducible output. FitForPDF is deterministic: no LLM in the pipeline, same input always produces the same PDF.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I integrate FitForPDF with Claude, OpenAI function calling, or LangChain?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Expose render_pdf as a tool using the schema at /.well-known/ai-plugin.json. A full OpenAPI 3 spec is available at /api/openapi.json. An MCP server is also published for Claude Desktop.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can agents call the API with a URL instead of uploading the file?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. POST to /api/agent/render with JSON {"file_url": "https://..."}. The service downloads the file server-side and returns a base64 PDF with metadata.',
      },
    },
  ],
};

export default function ForAgentsPage() {
  return (
    <>
      <JsonLd data={BREADCRUMB_LD} />
      <JsonLd data={AGENTS_FAQ_LD} />
      <VerticalPage
        vertical="For AI agents"
        headline="The deterministic PDF layer for AI agents"
        subheadline="No LLM in the rendering pipeline. Send a file_url, get a client-ready PDF back. Reproducible, cacheable, agent-native."
        painPoints={PAIN_POINTS}
        benefits={BENEFITS}
        ctaText="Read the API docs"
      />
      {/* Inline pointer to /developers (required by the agent-facing flow) */}
      <div className="py-8 text-center">
        <a
          href="/developers"
          className="text-sm font-semibold text-[var(--color-text)] underline underline-offset-4 hover:text-cta"
        >
          See the full API contract &middot; OpenAPI spec &middot; MCP server &rarr;
        </a>
      </div>
    </>
  );
}
