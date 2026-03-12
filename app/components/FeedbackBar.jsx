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
      className={`fixed bottom-5 left-1/2 z-[200] w-[calc(100%-2rem)] max-w-[480px] -translate-x-1/2 rounded-2xl border border-black/10 bg-white px-5 py-3.5 shadow-lg ${
        exiting ? 'feedback-bar-exit' : 'feedback-bar-enter'
      }`}
      onAnimationEnd={handleExitEnd}
    >
      {phase === 'idle' && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-[#0F172A]">Happy with this PDF?</p>
          <div className="flex gap-2">
            <button
              onClick={() => submit('up')}
              className="rounded-full bg-[#0F172A] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#1E293B]"
            >
              👍 OK
            </button>
            <button
              onClick={() => setPhase('reasons')}
              className="rounded-full border border-black/20 px-4 py-1.5 text-sm font-semibold text-[#0F172A] transition hover:bg-black/5"
            >
              👎 Issue
            </button>
          </div>
        </div>
      )}

      {phase === 'reasons' && (
        <div className="space-y-2.5">
          <p className="text-sm font-medium text-[#0F172A]">What went wrong?</p>
          <div className="flex flex-wrap gap-2">
            {REASONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => key === 'other' ? setPhase('comment') : submit('down', key)}
                className="rounded-full border border-black/15 px-3 py-1 text-xs font-medium text-[#0F172A] transition hover:bg-black/5"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'comment' && (
        <div className="space-y-2.5">
          <p className="text-sm font-medium text-[#0F172A]">Tell us more:</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 140))}
            placeholder="Max 140 characters"
            rows={2}
            className="w-full resize-none rounded-xl border border-black/10 bg-black/[0.03] px-3 py-2 text-sm text-[#0F172A] placeholder-black/30 outline-none focus:border-black/20"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setPhase('reasons')}
              className="rounded-full px-3 py-1 text-xs text-[#64748B] hover:text-[#0F172A]"
            >
              Back
            </button>
            <button
              disabled={!comment.trim()}
              onClick={() => submit('down', 'other', comment.trim())}
              className="rounded-full bg-[#0F172A] px-4 py-1 text-xs font-semibold text-white disabled:opacity-30 hover:bg-[#1E293B]"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {phase === 'submitting' && (
        <p className="text-center text-sm text-[#64748B]">Sending…</p>
      )}

      {phase === 'thanks' && (
        <p className="text-center text-sm font-semibold text-[#0F172A]">Thank you! 🙏</p>
      )}

      {phase === 'already_sent' && (
        <p className="text-center text-sm text-[#64748B]">Already sent ✓</p>
      )}
    </div>
  );
}
