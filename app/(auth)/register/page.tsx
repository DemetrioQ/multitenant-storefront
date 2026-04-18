"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthField } from "@/components/auth/AuthField";
import { PasswordRules, isPasswordValid } from "@/components/auth/PasswordRules";
import { register, resendVerification } from "@/lib/auth";
import { ApiError } from "@/lib/types";

type Submission =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string }
  | { kind: "success"; email: string };

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [submission, setSubmission] = useState<Submission>({ kind: "idle" });
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [touched, setTouched] = useState(false);

  const passwordOk = isPasswordValid(password);
  const canSubmit = email.length > 0 && firstName.length > 0 && lastName.length > 0 && passwordOk;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    setSubmission({ kind: "submitting" });
    try {
      await register({ email, password, firstName, lastName });
      setSubmission({ kind: "success", email });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setSubmission({ kind: "error", message: "An account with this email already exists for this store." });
          return;
        }
        if (err.status === 400) {
          setSubmission({ kind: "error", message: err.problem?.detail ?? err.message });
          return;
        }
        setSubmission({ kind: "error", message: err.message });
        return;
      }
      setSubmission({ kind: "error", message: "Something went wrong. Try again." });
    }
  };

  const handleResend = async () => {
    if (submission.kind !== "success") return;
    setResendState("sending");
    try {
      await resendVerification(submission.email);
      setResendState("sent");
    } catch {
      setResendState("error");
    }
  };

  if (submission.kind === "success") {
    return (
      <>
        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          We sent a verification link to <strong className="text-[var(--foreground)]">{submission.email}</strong>.
          Click it to activate your account, then sign in.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full bg-[var(--brand)] px-6 py-2.5 text-sm font-medium text-[var(--brand-contrast)] hover:opacity-90"
          >
            Go to sign in
          </Link>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendState === "sending"}
            className="text-xs text-[var(--muted)] hover:underline disabled:opacity-50"
          >
            {resendState === "sent"
              ? "Sent — check your inbox"
              : resendState === "sending"
              ? "Sending…"
              : "Didn't get the email? Resend"}
          </button>
          {resendState === "error" && (
            <p className="text-xs text-red-600 dark:text-red-400">
              Couldn&apos;t resend. Please wait a moment and try again.
            </p>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Already have one? <Link href="/login" className="underline">Sign in</Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <AuthField
            label="First name"
            autoComplete="given-name"
            required
            maxLength={100}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <AuthField
            label="Last name"
            autoComplete="family-name"
            required
            maxLength={100}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <AuthField
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div>
          <AuthField
            label="Password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={touched && !passwordOk ? "Password doesn't meet the requirements below" : null}
          />
          <PasswordRules value={password} />
        </div>

        {submission.kind === "error" && (
          <p className="text-sm text-red-600 dark:text-red-400">{submission.message}</p>
        )}

        <button
          type="submit"
          disabled={submission.kind === "submitting"}
          className="mt-2 inline-flex items-center justify-center rounded-full bg-[var(--brand)] px-6 py-2.5 text-sm font-medium text-[var(--brand-contrast)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submission.kind === "submitting" ? "Creating account…" : "Create account"}
        </button>
      </form>
    </>
  );
}
