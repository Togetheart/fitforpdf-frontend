'use client';

import { useState, useRef, useEffect } from 'react';

const WELCOME =
  "Hi! I'm conducting a short research interview about how professionals handle PDF exports from spreadsheets. It'll take about 5 to 10 minutes, and there are no right or wrong answers, I'm just here to listen.\n\nTo start: what's your role, and what kind of documents do you typically produce for clients or stakeholders?";

export default function InterviewPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: WELCOME },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading || done) return;
    setInput('');
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      const reply = data.reply || '';

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);

      const lower = reply.toLowerCase();
      const isEnd =
        lower.includes('first to test') ||
        lower.includes('premiers à tester') ||
        lower.includes('parmi les premiers') ||
        (lower.includes('merci beaucoup') && reply.length > 150) ||
        (lower.includes('thank you so much') && reply.length > 150);
      if (isEnd) setDone(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
        },
      ]);
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <main className="fixed inset-0 z-[9999] bg-[var(--color-bg)]">
      <div className="mx-auto flex h-full max-w-[680px] flex-col px-4 sm:px-6">
        {/* Header */}
        <div className="border-b border-[var(--color-border)] pb-3 pt-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
            Customer Discovery
          </p>
          <h1 className="mt-1 text-lg font-semibold text-[var(--color-text)]">
            Research Interview
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            5 to 10 min · Anonymous · No pitch
          </p>
        </div>

        {/* Messages */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-5">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] whitespace-pre-wrap px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'rounded-2xl rounded-br-sm bg-[#0F172A] text-white'
                    : 'rounded-2xl rounded-bl-sm border border-[var(--color-border)] bg-white text-[var(--color-text)] dark:bg-[#1e293b]'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-1.5 rounded-2xl rounded-bl-sm border border-[var(--color-border)] bg-white px-4 py-3 dark:bg-[#1e293b]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-muted)]" />
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-muted)]"
                  style={{ animationDelay: '0.2s' }}
                />
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-muted)]"
                  style={{ animationDelay: '0.4s' }}
                />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {done ? (
          <div className="pb-6 pt-4 text-center text-sm text-[var(--color-muted)]">
            Interview complete, thank you for your time!
          </div>
        ) : (
          <div className="sticky bottom-0 flex items-end gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] pb-6 pt-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type your answer..."
              rows={2}
              className="flex-1 resize-none rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm leading-relaxed text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:bg-[#1e293b]"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="rounded-xl bg-[#0F172A] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
