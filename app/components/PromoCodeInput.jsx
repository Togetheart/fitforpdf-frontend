'use client';

import React, { useState } from 'react';
import { Gift, Loader2, Check, X } from 'lucide-react';
import { cn } from '../lib/cn.mjs';

export default function PromoCodeInput({ onSuccess }) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/promo/redeem', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setStatus('success');
        setMessage(data.message || `${data.credits_granted} credits added!`);
        if (onSuccess) onSuccess(data);
      } else {
        setStatus('error');
        const errMsg =
          data?.error?.message || data?.message || 'Invalid promo code.';
        setMessage(errMsg);
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  }

  const isLoading = status === 'loading';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Gift className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted/50" />
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (status !== 'idle' && status !== 'loading') {
                setStatus('idle');
                setMessage('');
              }
            }}
            placeholder="Promo code"
            disabled={isLoading || isSuccess}
            className={cn(
              'w-full rounded-full border pl-9 pr-4 py-2.5 text-sm font-medium tracking-wide',
              'bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-muted/40',
              'outline-none transition-all duration-150',
              isSuccess
                ? 'border-green-400/60'
                : isError
                  ? 'border-red-400/60'
                  : 'border-[var(--color-border)] focus:border-accent/50',
              (isLoading || isSuccess) && 'opacity-60 cursor-not-allowed',
            )}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || isSuccess || !code.trim()}
          className={cn(
            'shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold tracking-tight transition-all duration-150 active:scale-[0.98]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            isSuccess
              ? 'bg-green-500 text-white'
              : 'bg-accent text-white hover:bg-accent-hover',
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isSuccess ? (
            <Check className="h-4 w-4" />
          ) : (
            'Apply'
          )}
        </button>
      </form>

      {/* Feedback message */}
      {message ? (
        <p
          className={cn(
            'mt-2 text-center text-sm font-medium transition-all',
            isSuccess ? 'text-green-600' : 'text-red-500',
          )}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
