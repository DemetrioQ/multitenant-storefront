import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <p className="text-xs uppercase tracking-widest text-[var(--muted)]">404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-4 text-[var(--muted)]">
        The page you&apos;re looking for doesn&apos;t exist or is no longer available.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-medium text-[var(--brand-contrast)] hover:opacity-90"
      >
        Back home
      </Link>
    </div>
  );
}
