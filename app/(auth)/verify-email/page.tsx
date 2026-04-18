"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { verifyEmail } from "@/lib/auth";
import { ApiError } from "@/lib/types";

type State =
  | { kind: "verifying" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>({ kind: "verifying" });

  useEffect(() => {
    if (!token) {
      setState({ kind: "error", message: "Missing verification token." });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await verifyEmail(token);
        if (!cancelled) setState({ kind: "success" });
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 400) {
          setState({ kind: "error", message: "This verification link is invalid or has expired." });
          return;
        }
        setState({ kind: "error", message: err instanceof Error ? err.message : "Verification failed." });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state.kind === "verifying") {
    return (
      <>
        <h1 className="text-2xl font-semibold tracking-tight">Verifying your email…</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">Hang tight for a moment.</p>
      </>
    );
  }

  if (state.kind === "success") {
    return (
      <>
        <h1 className="text-2xl font-semibold tracking-tight">Email verified</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Your account is ready. You can now sign in.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-[var(--brand)] px-6 py-2.5 text-sm font-medium text-[var(--brand-contrast)] hover:opacity-90"
        >
          Go to sign in
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Verification failed</h1>
      <p className="mt-3 text-sm text-[var(--muted)]">{state.message}</p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-md border border-[var(--border)] px-4 py-2 text-sm hover:border-[var(--brand)]"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="inline-flex items-center justify-center rounded-md border border-[var(--border)] px-4 py-2 text-sm hover:border-[var(--brand)]"
        >
          Start over
        </Link>
      </div>
    </>
  );
}
