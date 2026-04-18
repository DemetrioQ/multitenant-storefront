"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
  const router = useRouter();
  const params = useSearchParams();
  // Backend substitutes {ORDER_ID} in successUrl before redirecting the user
  // back from the payment provider, so `?order=<guid>` is always populated.
  const orderId = params.get("order");
  const { status: authStatus } = useAuth();
  const { clear: clearCart } = useCart();
  const currency = useCurrency();
  const [state, setState] = useState<State>(() =>
    orderId ? { kind: "loading" } : { kind: "error", message: "Missing order reference." }
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Coming back from the payment provider is a full page load, so the
  // AuthContext is mid-refresh when this page first mounts. If that refresh
  // fails (customerRefreshToken expired) we send the user through login with
  // the order URL as the return target.
  useEffect(() => {
    if (authStatus === "anonymous" && orderId) {
      router.replace(`/login?next=${encodeURIComponent(`/checkout/success?order=${orderId}`)}`);
    }
  }, [authStatus, orderId, router]);

  useEffect(() => {
    if (!orderId) return;
    // Wait for the silent refresh to finish hydrating the JWT — otherwise the
    // first getOrder call goes out without an Authorization header and 401s.
    if (authStatus !== "authenticated") return;
    let cancelled = false;
    let attempts = 0;

    let cartCleared = false;
    const poll = async () => {
      try {
        const order = await getOrder(orderId);
        if (cancelled) return;

        // Landing on /checkout/success means the customer went through the
        // payment step (cancel_url would have pointed them at /cancel). Clear
        // the cart once on the first successful order fetch — unless the
        // order is already canceled, in which case keep the cart so the
        // customer can retry without rebuilding it.
        if (!cartCleared && order.status !== "canceled") {
          cartCleared = true;
          clearCart().catch(() => {
            // best-effort — webhook will eventually clear server-side anyway
          });
        }

        if (order.status === "pending" && attempts < MAX_ATTEMPTS) {
          attempts += 1;
          setState({ kind: "pending", order, attempts });
          timeoutRef.current = setTimeout(poll, POLL_INTERVAL_MS);
          return;
        }
        setState({ kind: "ready", order });
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
  }, [orderId, authStatus, clearCart]);

  if (state.kind === "loading" || authStatus === "loading") {
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
