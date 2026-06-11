'use client';

// Re-opens the consent banner so a visitor can change or withdraw their choice
// as easily as they gave it (CNIL). Listened for by ConsentBanner.
export default function CookiePreferencesButton({ className = '' }) {
  return (
    <button
      type="button"
      onClick={() => {
        try { window.dispatchEvent(new Event('ffp:open-consent')); } catch {}
      }}
      className={className}
    >
      Cookie preferences
    </button>
  );
}
