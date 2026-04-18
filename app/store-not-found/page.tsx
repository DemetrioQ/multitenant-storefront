import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store not found",
  robots: { index: false, follow: false },
};

export default function StoreNotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
        Unknown store
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">
        This storefront isn&apos;t set up yet
      </h1>
      <p className="mt-4 text-[var(--muted)]">
        The subdomain you visited doesn&apos;t match any active store. If you&apos;re
        a merchant looking to configure a storefront, visit your dashboard.
      </p>
    </div>
  );
}
