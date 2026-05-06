"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button, Card } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
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
  const { refresh: refreshCart } = useCart();
  const [state, setState] = useState<State>(() =>
    orderId ? { kind: "loading" } : { kind: "error", message: "Missing order reference." },
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
  }, [orderId, authStatus, refreshCart]);

  if (state.kind === "loading" || authStatus === "loading") {
    return (
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-16 text-center text-muted">
        Confirming your order…
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold">Something&apos;s off</h1>
        <p className="mt-3 text-sm text-muted">{state.message}</p>
        <Button asChild size="pill" className="mt-6">
          <Link href="/orders">View your orders</Link>
        </Button>
      </div>
    );
  }

  const order = state.order;
  const isPending = state.kind === "pending";

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
      <Card className="p-8">
        <p className="text-xs uppercase tracking-widest text-muted">
          {isPending ? "Awaiting payment confirmation" : "Order confirmed"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {isPending ? "Hold tight…" : "Thanks for your order"}
        </h1>
        <p className="mt-2 text-muted">
          Order <span className="font-mono">{order.number}</span>
        </p>

        {isPending && (
          <p className="mt-4 text-sm text-muted">
            Your payment is finalizing. This page will update automatically. (Attempt{" "}
            {state.attempts}/{MAX_ATTEMPTS})
          </p>
        )}

        <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <dt className="text-muted">Status</dt>
          <dd className="font-medium capitalize">{order.status}</dd>
          <dt className="text-muted">Total</dt>
          <dd className="font-medium">{formatPrice(order.total)}</dd>
          <dt className="text-muted">Items</dt>
          <dd>{order.items.reduce((s, i) => s + i.quantity, 0)}</dd>
        </dl>

        <div className="mt-8 flex gap-3">
          <Button asChild size="pill" className="px-5">
            <Link href={`/orders/${order.id}`}>View order details</Link>
          </Button>
          <Button asChild variant="outline" size="pill" className="px-5">
            <Link href="/products">Keep shopping</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
