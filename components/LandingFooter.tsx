export function LandingFooter() {
  return (
    <footer className="border-t border-[var(--border)] mt-16">
      <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-[var(--muted)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span>© {new Date().getFullYear()} Demetrio Quiñones · SaaS API Portfolio</span>
        <div className="flex gap-4">
          <a
            href="https://github.com/demetrioq"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            GitHub
          </a>
          <span>.NET 9 · Next.js 16 · Postgres</span>
        </div>
      </div>
    </footer>
  );
}
