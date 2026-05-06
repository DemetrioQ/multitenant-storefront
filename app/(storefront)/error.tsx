"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui";
import { captureError } from "@/lib/errorMonitoring";

export default function SegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureError(error, { digest: error.digest, scope: "segment-error" });
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-16 text-center">
      <p className="text-xs uppercase tracking-widest text-muted">Something went wrong</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">We hit a snag</h1>
      <p className="mt-4 text-sm text-muted">
        This page couldn&apos;t load right now. It might be a temporary backend hiccup.
      </p>
      {error.digest && <p className="mt-2 text-xs text-muted font-mono">ref: {error.digest}</p>}
      <div className="mt-8 flex justify-center gap-3">
        <Button type="button" onClick={reset} size="pill">
          Try again
        </Button>
        <Button asChild variant="outline" size="pill">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </div>
  );
}
