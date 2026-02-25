'use client';
import { useState, useEffect, useRef } from 'react';

const REASONS = [
  { key: 'layout',  label: '📐 Mise en page' },
  { key: 'content', label: '📝 Contenu' },
  { key: 'font',    label: '🔤 Police' },
  { key: 'slow',    label: '🐌 Lent' },
  { key: 'other',   label: '❓ Autre' },
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

  // Auto-hide 60s after appearing in idle — hide immediately (no animation needed)
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
      aria-label="Feedback sur le PDF"
      className={`fixed bottom-4 left-1/2 z-[200] w-[calc(100%-2rem)] max-w-[480px] -translate-x-1/2 rounded-2xl bg-[#1a1a2e] px-5 py-4 shadow-2xl backdrop-blur-[8px] ${
        exiting ? 'feedback-bar-exit' : 'feedback-bar-enter'
      }`}
      onAnimationEnd={handleExitEnd}
    >
      {phase === 'idle' && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-white/80">Ce PDF vous convient ?</p>
          <div className="flex gap-2">
            <button
              onClick={() => submit('up')}
              className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white transition hover:scale-105 hover:bg-white/20"
            >
              👍 OK
            </button>
            <button
              onClick={() => setPhase('reasons')}
              className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white transition hover:scale-105 hover:bg-white/20"
            >
              👎 Problème
            </button>
          </div>
        </div>
      )}

      {phase === 'reasons' && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-white/80">Quel problème ?</p>
          <div className="flex flex-wrap gap-2">
            {REASONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => key === 'other' ? setPhase('comment') : submit('down', key)}
                className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:scale-105 hover:bg-white/20"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'comment' && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-white/80">Dites-nous en plus :</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 140))}
            placeholder="Max 140 caractères"
            rows={2}
            className="w-full resize-none rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setPhase('reasons')}
              className="rounded-full px-3 py-1 text-xs text-white/50 hover:text-white/80"
            >
              Retour
            </button>
            <button
              disabled={!comment.trim()}
              onClick={() => submit('down', 'other', comment.trim())}
              className="rounded-full bg-white/20 px-4 py-1 text-xs font-semibold text-white disabled:opacity-40 hover:bg-white/30"
            >
              Envoyer
            </button>
          </div>
        </div>
      )}

      {phase === 'submitting' && (
        <p className="text-center text-sm text-white/60">Envoi…</p>
      )}

      {phase === 'thanks' && (
        <p className="text-center text-sm font-semibold text-white">Merci ! 🙏</p>
      )}

      {phase === 'already_sent' && (
        <p className="text-center text-sm text-white/70">Déjà envoyé ✓</p>
      )}
    </div>
  );
}
