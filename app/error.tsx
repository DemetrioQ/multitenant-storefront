"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function SegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Segment error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-6 py-16 text-center">
      <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Something went wrong</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">We hit a snag</h1>
      <p className="mt-4 text-sm text-[var(--muted)]">
        This page couldn&apos;t load right now. It might be a temporary backend hiccup.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-[var(--muted)] font-mono">ref: {error.digest}</p>
      )}
      <div className="mt-8 flex justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center rounded-full bg-[var(--brand)] px-6 py-2.5 text-sm font-medium text-[var(--brand-contrast)] hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center rounded-full border border-[var(--border)] px-6 py-2.5 text-sm hover:border-[var(--brand)]"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
