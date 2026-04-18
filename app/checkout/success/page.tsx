"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/StoreContext";
import { getOrder } from "@/lib/checkout";
import { formatPrice } from "@/lib/format";
import { ApiError, type OrderDto } from "@/lib/types";

type State =
  | { kind: "loading" }
  | { kind: "pending"; order: OrderDto; attempts: number }
  | { kind: "ready"; order: OrderDto }
  | { kind: "error"; message: string };

const POLL_INTERVAL_MS = 1500;
const MAX_ATTEMPTS = 40;

export default function CheckoutSuccessPage() {
  const params = useSearchParams();
  // Backend substitutes {ORDER_ID} in successUrl before redirecting the user
  // back from the payment provider, so `?order=<guid>` is always populated.
  const orderId = params.get("order");
  const { refresh: refreshCart } = useCart();
  const currency = useCurrency();
  const [state, setState] = useState<State>(() =>
    orderId ? { kind: "loading" } : { kind: "error", message: "Missing order reference." }
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      try {
        const order = await getOrder(orderId);
        if (cancelled) return;
        if (order.status === "pending" && attempts < MAX_ATTEMPTS) {
          attempts += 1;
          setState({ kind: "pending", order, attempts });
          timeoutRef.current = setTimeout(poll, POLL_INTERVAL_MS);
          return;
        }
        setState({ kind: "ready", order });
        refreshCart();
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setState({ kind: "error", message: "We couldn't find that order." });
          return;
        }
        setState({
          kind: "error",
          message: err instanceof Error ? err.message : "Couldn't load order.",
        });
      }
    };

    poll();

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [orderId, refreshCart]);

  if (state.kind === "loading") {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center text-[var(--muted)]">
        Confirming your order…
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold">Something&apos;s off</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">{state.message}</p>
        <Link
          href="/orders"
          className="mt-6 inline-flex items-center rounded-full bg-[var(--brand)] px-6 py-2.5 text-sm font-medium text-[var(--brand-contrast)] hover:opacity-90"
        >
          View your orders
        </Link>
      </div>
    );
  }

  const order = state.order;
  const isPending = state.kind === "pending";

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="rounded-lg border border-[var(--border)] p-8">
        <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
          {isPending ? "Awaiting payment confirmation" : "Order confirmed"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {isPending ? "Hold tight…" : "Thanks for your order"}
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Order <span className="font-mono">{order.number}</span>
        </p>

        {isPending && (
          <p className="mt-4 text-sm text-[var(--muted)]">
            Your payment is finalizing. This page will update automatically. (Attempt {state.attempts}/{MAX_ATTEMPTS})
          </p>
        )}

        <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <dt className="text-[var(--muted)]">Status</dt>
          <dd className="font-medium capitalize">{order.status}</dd>
          <dt className="text-[var(--muted)]">Total</dt>
          <dd className="font-medium">{formatPrice(order.total, currency)}</dd>
          <dt className="text-[var(--muted)]">Items</dt>
          <dd>{order.items.reduce((s, i) => s + i.quantity, 0)}</dd>
        </dl>

        <div className="mt-8 flex gap-3">
          <Link
            href={`/orders/${order.id}`}
            className="inline-flex items-center rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-medium text-[var(--brand-contrast)] hover:opacity-90"
          >
            View order details
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center rounded-full border border-[var(--border)] px-5 py-2.5 text-sm hover:border-[var(--brand)]"
          >
            Keep shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
