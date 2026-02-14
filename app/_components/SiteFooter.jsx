export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-black/5 bg-gray-50">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-black/60">© {new Date().getFullYear()} FitForPDF</div>
        <nav className="flex items-center gap-6 text-sm text-black/70">
          <a className="transition hover:text-black" href="/pricing">
            Pricing
          </a>
          <a className="transition hover:text-black" href="/privacy">
            Privacy
          </a>
          <a
            className="transition hover:text-black"
            href="https://t.me/CrabiAssistantBot"
            target="_blank"
            rel="noreferrer"
          >
            Try on Telegram
          </a>
        </nav>
      </div>
    </footer>
  );
}
