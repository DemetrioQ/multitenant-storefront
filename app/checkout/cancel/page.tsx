import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment canceled",
  robots: { index: false, follow: false },
};

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-16 text-center">
      <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Payment canceled</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">No charge was made</h1>
      <p className="mt-3 text-sm text-[var(--muted)]">
        Your order will be released and any reserved stock returned once the session expires.
        You can try again from your cart.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/cart"
          className="inline-flex items-center rounded-full bg-[var(--brand)] px-6 py-2.5 text-sm font-medium text-[var(--brand-contrast)] hover:opacity-90"
        >
          Back to cart
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center rounded-full border border-[var(--border)] px-6 py-2.5 text-sm hover:border-[var(--brand)]"
        >
          Keep shopping
        </Link>
      </div>
    </div>
  );
}
