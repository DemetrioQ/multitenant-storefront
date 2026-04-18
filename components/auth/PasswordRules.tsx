"use client";

export type PasswordRule = {
  label: string;
  test: (value: string) => boolean;
};

export const PASSWORD_RULES: PasswordRule[] = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "One digit", test: (v) => /\d/.test(v) },
  { label: "One special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export function isPasswordValid(value: string): boolean {
  return PASSWORD_RULES.every((r) => r.test(value));
}

export function PasswordRules({ value }: { value: string }) {
  return (
    <ul className="mt-2 space-y-1 text-xs">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(value);
        return (
          <li
            key={rule.label}
            className={ok ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--muted)]"}
          >
            <span aria-hidden className="mr-1.5">{ok ? "✓" : "•"}</span>
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
