"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthField } from "@/components/auth/AuthField";
import { PasswordRules, isPasswordValid } from "@/components/auth/PasswordRules";
import { Button } from "@/components/ui";
import { resetPassword } from "@/lib/auth";
import { ApiError } from "@/lib/types";

type Submission =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string }
  | { kind: "success" };

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [submission, setSubmission] = useState<Submission>({ kind: "idle" });
  const [touched, setTouched] = useState(false);

  const passwordOk = isPasswordValid(password);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!token) {
      setSubmission({
        kind: "error",
        message: "Missing reset token — use the link from your email.",
      });
      return;
    }
    if (!passwordOk) return;
    setSubmission({ kind: "submitting" });
    try {
      await resetPassword({ token, newPassword: password });
      setSubmission({ kind: "success" });
      setTimeout(() => router.replace("/login"), 2000);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setSubmission({ kind: "error", message: "This reset link is invalid or has expired." });
          return;
        }
        if (err.status === 400) {
          setSubmission({
            kind: "error",
            message: err.problem?.detail ?? "Choose a password different from your current one.",
          });
          return;
        }
        setSubmission({ kind: "error", message: err.message });
        return;
      }
      setSubmission({ kind: "error", message: "Something went wrong. Try again." });
    }
  };

  if (submission.kind === "success") {
    return (
      <>
        <h1 className="text-2xl font-semibold tracking-tight">Password updated</h1>
        <p className="mt-3 text-sm text-muted">Redirecting you to sign in…</p>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Choose a new password</h1>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <AuthField
            label="New password"
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

        <Button
          type="submit"
          size="pill"
          disabled={submission.kind === "submitting"}
          className="mt-2"
        >
          {submission.kind === "submitting" ? "Updating…" : "Update password"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm">
        <Link href="/login" className="text-muted hover:underline">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
