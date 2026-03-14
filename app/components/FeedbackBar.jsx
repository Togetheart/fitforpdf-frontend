'use client';
import { useState, useEffect, useRef } from 'react';

const REASONS = [
  { key: 'layout',  label: '📐 Layout' },
  { key: 'content', label: '📝 Content' },
  { key: 'font',    label: '🔤 Font' },
  { key: 'slow',    label: '🐌 Slow' },
  { key: 'other',   label: '❓ Other' },
];

export default function FeedbackBar({ renderId, visible }) {
  const [shown, setShown]     = useState(false);
  const [exiting, setExiting] = useState(false);
  const [phase, setPhase]     = useState('idle');
  const [comment, setComment] = useState('');

  const showTimer    = useRef(null);
  const autoHide     = useRef(null);
  const dismissTimer = useRef(null);

  // Show 2s after PDF arrives
  useEffect(() => {
    if (!visible || !renderId) return;
    showTimer.current = setTimeout(() => setShown(true), 2000);
    return () => clearTimeout(showTimer.current);
  }, [visible, renderId]);

  // Auto-hide 60s after appearing in idle
  useEffect(() => {
    if (!shown || phase !== 'idle') return;
    autoHide.current = setTimeout(() => {
      setShown(false);
      setPhase('idle');
      setComment('');
    }, 60_000);
    return () => clearTimeout(autoHide.current);
  }, [shown, phase]);

  // Cleanup on unmount
  useEffect(() => () => {
    clearTimeout(showTimer.current);
    clearTimeout(autoHide.current);
    clearTimeout(dismissTimer.current);
  }, []);

  function dismiss() {
    clearTimeout(autoHide.current);
    setExiting(true);
  }

  function handleExitEnd() {
    if (!exiting) return;
    setShown(false);
    setExiting(false);
    setPhase('idle');
    setComment('');
  }

  async function submit(vote, reason = null, commentText = null) {
    setPhase('submitting');
    clearTimeout(autoHide.current);
    try {
      const res = await fetch('/api/render/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          renderId,
          vote,
          reason,
          comment: commentText || null,
          channel: 'web',
        }),
      });
      setPhase(res.status === 409 ? 'already_sent' : 'thanks');
    } catch {
      dismiss();
      return;
    }
    dismissTimer.current = setTimeout(dismiss, 2000);
  }

  if (!shown) return null;

  return (
    <div
      role="region"
      aria-label="PDF feedback"
      className={`fixed bottom-5 left-1/2 z-[200] w-[calc(100%-2rem)] max-w-[480px] -translate-x-1/2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-5 py-3.5 shadow-lg ${
        exiting ? 'feedback-bar-exit' : 'feedback-bar-enter'
      }`}
      onAnimationEnd={handleExitEnd}
    >
      {phase === 'idle' && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-[var(--color-text)]">Happy with this PDF?</p>
          <div className="flex gap-2">
            <button
              onClick={() => submit('up')}
              className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              👍 OK
            </button>
            <button
              onClick={() => setPhase('reasons')}
              className="rounded-full border border-[var(--color-border)] px-4 py-1.5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg-warm)]"
            >
              👎 Issue
            </button>
          </div>
        </div>
      )}

      {phase === 'reasons' && (
        <div className="space-y-2.5">
          <p className="text-sm font-medium text-[var(--color-text)]">What went wrong?</p>
          <div className="flex flex-wrap gap-2">
            {REASONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => key === 'other' ? setPhase('comment') : submit('down', key)}
                className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-medium text-[var(--color-text)] transition hover:bg-[var(--color-bg-warm)]"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'comment' && (
        <div className="space-y-2.5">
          <p className="text-sm font-medium text-[var(--color-text)]">Tell us more:</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 140))}
            placeholder="Max 140 characters"
            rows={2}
            className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-warm)] px-3 py-2 text-sm text-[var(--color-text)] placeholder-[var(--color-muted)]/50 outline-none focus:border-[var(--color-border)]"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setPhase('reasons')}
              className="rounded-full px-3 py-1 text-xs text-muted hover:text-[var(--color-text)]"
            >
              Back
            </button>
            <button
              disabled={!comment.trim()}
              onClick={() => submit('down', 'other', comment.trim())}
              className="rounded-full bg-accent px-4 py-1 text-xs font-semibold text-white disabled:opacity-30 hover:bg-accent-hover"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {phase === 'submitting' && (
        <p className="text-center text-sm text-muted">Sending…</p>
      )}

      {phase === 'thanks' && (
        <p className="text-center text-sm font-semibold text-[var(--color-text)]">Thank you! 🙏</p>
      )}

      {phase === 'already_sent' && (
        <p className="text-center text-sm text-muted">Already sent ✓</p>
      )}
    </div>
  );
}
