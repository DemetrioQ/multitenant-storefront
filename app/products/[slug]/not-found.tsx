import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <p className="text-xs uppercase tracking-widest text-[var(--muted)]">404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">Product not found</h1>
      <p className="mt-4 text-[var(--muted)]">
        This product is unavailable or has been removed.
      </p>
      <Link
        href="/products"
        className="mt-8 inline-flex items-center rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-medium text-[var(--brand-contrast)] hover:opacity-90"
      >
        Browse all products
      </Link>
    </div>
  );
}
