"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AuthField } from "@/components/auth/AuthField";
import { Button } from "@/components/ui";
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

/**
 * Whitelist `?next=` to same-origin paths only. Prevents open-redirect / phishing
 * where a malicious link `?next=https://evil.example.com` lands a victim on the real
 * login page then bounces them off-site after a successful auth.
 *
 * Accept only paths starting with a single `/` (rejects schemes, protocol-relative
 * `//evil.com`, and absolute URLs).
 */
function safeNext(raw: string | null): string {
  if (!raw) return "/";
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return "/";
  return raw;
}

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = safeNext(params.get("next"));
  const { login, status, signInAsDemo } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submission, setSubmission] = useState<Submission>({ kind: "idle" });
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);

  const handleDemoSignIn = async () => {
    setDemoLoading(true);
    setDemoError(null);
    try {
      await signInAsDemo();
      router.replace(redirectTo);
      router.refresh();
    } catch {
      setDemoError("Could not start a demo session. Try again in a moment.");
      setDemoLoading(false);
    }
  };

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
      <p className="mt-1 text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="underline">
          Create one
        </Link>
      </p>

      <div className="mt-6 rounded-md border border-amber-500/40 bg-amber-500/10 p-4">
        <p className="text-sm font-medium">Just browsing?</p>
        <p className="mt-1 text-xs text-muted">
          Skip the form — get a temporary demo shopper account so you can add to cart and check out.
          Nothing is real.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDemoSignIn}
          disabled={demoLoading}
          className="mt-3"
        >
          {demoLoading ? "Setting up demo…" : "Try the demo"}
        </Button>
        {demoError && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{demoError}</p>}
      </div>

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
            <p className="mt-1 text-muted">
              Check your inbox for a verification link, or resend it below.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResend}
              disabled={resendState === "sending" || cooldown > 0}
              className="mt-3"
            >
              {resendState === "sent"
                ? "Sent — check your inbox"
                : cooldown > 0
                  ? `Resend in ${formatDuration(cooldown)}`
                  : resendState === "sending"
                    ? "Sending…"
                    : "Resend verification email"}
            </Button>
            {resendState === "error" && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                Couldn&apos;t resend. Try again in a moment.
              </p>
            )}
          </div>
        )}

        <Button
          type="submit"
          size="pill"
          disabled={submission.kind === "submitting"}
          className="mt-2"
        >
          {submission.kind === "submitting" ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm">
        <Link href="/forgot-password" className="text-muted hover:underline">
          Forgot your password?
        </Link>
      </p>
    </>
  );
}
