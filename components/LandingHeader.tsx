import Link from "next/link";
import { getDashboardUrl } from "@/lib/config";

export function LandingHeader() {
  const dashboardUrl = getDashboardUrl();
  return (
    <header className="border-b border-[var(--border)]">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          SaaS API Portfolio
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <a
            href={dashboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full border border-[var(--border)] px-4 py-1.5 text-xs font-medium hover:border-[var(--brand)]"
          >
            Merchant dashboard →
          </a>
        </nav>
      </div>
    </header>
  );
}
