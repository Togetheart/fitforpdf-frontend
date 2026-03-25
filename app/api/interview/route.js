export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are conducting a customer discovery interview for a SaaS tool that converts Excel/CSV files into properly formatted, client-ready PDFs (solving cut-off columns, awkward page breaks, layout issues).

Your goal is to understand the interviewee's pain points around PDF exports from spreadsheets. Follow this interview script naturally,don't be robotic, adapt to their answers, ask follow-ups when interesting:

SCRIPT:
1. Context & Role: Ask about their role and what kind of deliverables they produce regularly.
2. Trigger: Ask what tool they use when they need to export data as a PDF (Excel, Google Sheets, other?), and who the PDF is for.
3. Pain: Ask them to walk you through the process from "I have my data" to "I send the PDF." Then ask what's most annoying about it. Then ask how long it takes and how often.
4. Workarounds: Ask if they've tried anything to fix it,tools, templates, workarounds,and why it didn't fully solve it.
5. Impact: Ask what would change if this problem disappeared,exports always client-ready on first try.
6. The Ask: Ask if they'd be willing to share an anonymized example file.

RULES:
- Detect the language of the user's response and always reply in that same language (French or English). If they write in French, respond in French. If in English, respond in English.
- Start with a warm, natural introduction. Don't list questions,ask one or two at a time, naturally.
- Be curious and empathetic, not salesy. Never pitch the product.
- When they mention something interesting, dig deeper before moving on.
- After ~6-8 exchanges, wrap up warmly with a thank you message. Mention they'll be among the first to test the product.
- Keep messages concise,max 4-5 sentences per reply.
- Do NOT mention FitForPDF by name or pitch anything during the interview.`;

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export async function POST(request) {
  const apiKey = process.env.INTERVIEW_FIT;
  if (!apiKey) {
    return jsonResponse(500, { error: 'Interview service not configured' });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON' });
  }

  const { messages } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return jsonResponse(400, { error: 'Messages required' });
  }

  // Limit conversation length to prevent abuse
  if (messages.length > 30) {
    return jsonResponse(400, { error: 'Conversation too long' });
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => 'Unknown error');
      return jsonResponse(502, { error: 'AI service error', details: err });
    }

    const data = await res.json();
    const reply = data.content?.find(b => b.type === 'text')?.text || '';
    return jsonResponse(200, { reply });
  } catch (error) {
    return jsonResponse(502, { error: 'Failed to reach AI service' });
  }
}
