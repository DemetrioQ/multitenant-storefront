import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md px-6 py-16">
      <div className="mb-8">
        <Link href="/" className="text-sm text-[var(--muted)] hover:underline">
          ← Back to store
        </Link>
      </div>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-6 sm:p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
