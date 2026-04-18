"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AuthField } from "@/components/auth/AuthField";
import { useStore } from "@/contexts/StoreContext";
import { resendVerification, verifyEmail } from "@/lib/auth";
import { ApiError } from "@/lib/types";

type State =
  | { kind: "verifying" }
  | { kind: "success" }
  | { kind: "error"; message: string };

type ResendState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const token = params.get("token");
  const store = useStore();
  const storeName = store?.name ?? "the store";

  const [state, setState] = useState<State>(() =>
    token ? { kind: "verifying" } : { kind: "error", message: "Missing verification token." }
  );
  const [email, setEmail] = useState("");
  const [resend, setResend] = useState<ResendState>({ kind: "idle" });

  useEffect(() => {
    if (!token) return;
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

  const handleResend = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setResend({ kind: "submitting" });
    try {
      await resendVerification(email.trim());
      setResend({ kind: "sent" });
    } catch (err) {
      setResend({
        kind: "error",
        message: err instanceof ApiError ? err.message : "Couldn't send the email. Try again shortly.",
      });
    }
  };

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
        <h1 className="text-2xl font-semibold tracking-tight">Welcome to {storeName}!</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Your email is confirmed. You can now sign in to start shopping.
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

  if (resend.kind === "sent") {
    return (
      <>
        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          If an account exists for <strong className="text-[var(--foreground)]">{email}</strong>, we sent a
          new verification link. It may take a minute to arrive.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-[var(--brand)] px-6 py-2.5 text-sm font-medium text-[var(--brand-contrast)] hover:opacity-90"
        >
          Back to sign in
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Verification failed</h1>
      <p className="mt-3 text-sm text-[var(--muted)]">{state.message}</p>

      <form onSubmit={handleResend} className="mt-6 flex flex-col gap-3 rounded-md border border-[var(--border)] p-4">
        <p className="text-sm font-medium">Send a new verification link</p>
        <AuthField
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {resend.kind === "error" && (
          <p className="text-xs text-red-600 dark:text-red-400">{resend.message}</p>
        )}
        <button
          type="submit"
          disabled={resend.kind === "submitting" || !email.trim()}
          className="inline-flex items-center justify-center rounded-full bg-[var(--brand)] px-5 py-2 text-sm font-medium text-[var(--brand-contrast)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resend.kind === "submitting" ? "Sending…" : "Send new link"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        <Link href="/login" className="text-[var(--muted)] hover:underline">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
