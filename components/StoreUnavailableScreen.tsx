type Props = {
  mode: "notfound" | "unavailable";
  message?: string;
  bareHostUrl: string;
};

export function StoreUnavailableScreen({ mode, message, bareHostUrl }: Props) {
  const isNotFound = mode === "notfound";
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <div className="max-w-lg text-center">
        <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
          {isNotFound ? "Store not available" : "Temporarily unavailable"}
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
          {isNotFound ? "This store isn't ready yet" : "We can't reach this store right now"}
        </h1>
        <p className="mt-5 text-[var(--muted)] leading-relaxed">
          {isNotFound
            ? "The store at this subdomain either hasn't been set up or has been deactivated. If you're the merchant, sign in to your dashboard to activate it."
            : "The backend is momentarily unreachable. Give it a few seconds and try again — no action needed on your end."}
        </p>
        {!isNotFound && message && (
          <p className="mt-3 text-xs text-[var(--muted)] font-mono">{message}</p>
        )}
        <div className="mt-8 flex justify-center gap-3">
          {!isNotFound && (
            <a
              href="."
              className="inline-flex items-center rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-medium text-[var(--brand-contrast)] hover:opacity-90"
            >
              Retry
            </a>
          )}
          <a
            href={bareHostUrl}
            className="inline-flex items-center rounded-full border border-[var(--border)] px-5 py-2.5 text-sm hover:border-[var(--brand)]"
          >
            Browse other stores
          </a>
        </div>
      </div>
    </div>
  );
}
