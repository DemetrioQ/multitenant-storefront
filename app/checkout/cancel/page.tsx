import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Payment canceled",
  robots: { index: false, follow: false },
};

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-16 text-center">
      <p className="text-xs uppercase tracking-widest text-muted">Payment canceled</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">No charge was made</h1>
      <p className="mt-3 text-sm text-muted">
        Your order will be released and any reserved stock returned once the session expires. You
        can try again from your cart.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button asChild size="pill">
          <Link href="/cart">Back to cart</Link>
        </Button>
        <Button asChild variant="outline" size="pill">
          <Link href="/products">Keep shopping</Link>
        </Button>
      </div>
    </div>
  );
}
