"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AuthField } from "@/components/auth/AuthField";
import { useAuth } from "@/contexts/AuthContext";
import { resendVerification } from "@/lib/auth";
import { formatDuration, parseUtcDate } from "@/lib/dates";
import { ApiError, type EmailNotVerifiedProblem } from "@/lib/types";

type Submission =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string }
  | { kind: "unverified"; email: string; canResendAt: Date | null };

function useCooldown(target: Date | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  if (!target) return 0;
  return Math.max(0, Math.ceil((target.getTime() - now) / 1000));
}

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("next") ?? "/";
  const { login, status } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submission, setSubmission] = useState<Submission>({ kind: "idle" });
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const unverified = submission.kind === "unverified" ? submission : null;
  const cooldown = useCooldown(unverified?.canResendAt ?? null);

  useEffect(() => {
    if (status === "authenticated") router.replace(redirectTo);
  }, [status, router, redirectTo]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmission({ kind: "submitting" });
    try {
      await login(email, password);
      router.replace(redirectTo);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 403) {
          const problem = err.problem as EmailNotVerifiedProblem | undefined;
          if (problem?.errorCode === "EMAIL_NOT_VERIFIED") {
            setSubmission({
              kind: "unverified",
              email,
              canResendAt: problem.canResendAt ? parseUtcDate(problem.canResendAt) : null,
            });
            return;
          }
        }
        if (err.status === 401) {
          setSubmission({ kind: "error", message: "Invalid email or password." });
          return;
        }
        if (err.status === 429) {
          setSubmission({ kind: "error", message: "Too many attempts. Try again in a minute." });
          return;
        }
        setSubmission({ kind: "error", message: err.message });
        return;
      }
      setSubmission({ kind: "error", message: "Something went wrong. Try again." });
    }
  };

  const handleResend = async () => {
    if (!unverified) return;
    setResendState("sending");
    try {
      await resendVerification(unverified.email);
      setResendState("sent");
    } catch {
      setResendState("error");
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="underline">Create one</Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <AuthField
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthField
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {submission.kind === "error" && (
          <p className="text-sm text-red-600 dark:text-red-400">{submission.message}</p>
        )}

        {unverified && (
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
            <p className="font-medium">Email not verified</p>
            <p className="mt-1 text-[var(--muted)]">
              Check your inbox for a verification link, or resend it below.
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendState === "sending" || cooldown > 0}
              className="mt-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs hover:border-[var(--brand)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendState === "sent"
                ? "Sent — check your inbox"
                : cooldown > 0
                ? `Resend in ${formatDuration(cooldown)}`
                : resendState === "sending"
                ? "Sending…"
                : "Resend verification email"}
            </button>
            {resendState === "error" && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                Couldn&apos;t resend. Try again in a moment.
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={submission.kind === "submitting"}
          className="mt-2 inline-flex items-center justify-center rounded-full bg-[var(--brand)] px-6 py-2.5 text-sm font-medium text-[var(--brand-contrast)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submission.kind === "submitting" ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        <Link href="/forgot-password" className="text-[var(--muted)] hover:underline">
          Forgot your password?
        </Link>
      </p>
    </>
  );
}
