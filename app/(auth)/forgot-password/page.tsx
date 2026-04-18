"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthField } from "@/components/auth/AuthField";
import { forgotPassword } from "@/lib/auth";

type State = "idle" | "sending" | "sent" | "error";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setState("sending");
    try {
      await forgotPassword(email);
      setState("sent");
    } catch {
      setState("error");
    }
  };

  if (state === "sent") {
    return (
      <>
        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          If an account exists for <strong className="text-[var(--foreground)]">{email}</strong>, we sent a
          password reset link. Check your inbox.
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
      <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        We&apos;ll email you a link to reset it.
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
        {state === "error" && (
          <p className="text-sm text-red-600 dark:text-red-400">Something went wrong. Try again.</p>
        )}
        <button
          type="submit"
          disabled={state === "sending"}
          className="mt-2 inline-flex items-center justify-center rounded-full bg-[var(--brand)] px-6 py-2.5 text-sm font-medium text-[var(--brand-contrast)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state === "sending" ? "Sending…" : "Send reset link"}
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
