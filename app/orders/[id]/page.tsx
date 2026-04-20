"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/StoreContext";
import { getOrder } from "@/lib/checkout";
import { parseUtcDate } from "@/lib/dates";
import { formatPrice } from "@/lib/format";
import { ApiError, type AddressDto, type OrderDto } from "@/lib/types";

type State =
  | { kind: "loading" }
  | { kind: "ready"; order: OrderDto }
  | { kind: "missing" }
  | { kind: "error"; message: string };

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { status: authStatus } = useAuth();
  const currency = useCurrency();
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (authStatus === "anonymous") {
      router.replace(`/login?next=${encodeURIComponent(`/orders/${id}`)}`);
    }
  }, [authStatus, router, id]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !id) return;
    let cancelled = false;
    getOrder(id)
      .then((order) => {
        if (!cancelled) setState({ kind: "ready", order });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setState({ kind: "missing" });
          return;
        }
        setState({
          kind: "error",
          message: err instanceof Error ? err.message : "Couldn't load order.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [authStatus, id]);

  if (authStatus === "loading" || state.kind === "loading") {
    return <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 text-center text-[var(--muted)]">Loading order…</div>;
  }

  if (state.kind === "missing") {
    return (
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold">Order not found</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          We couldn&apos;t find that order on your account.
        </p>
        <Link href="/orders" className="mt-6 inline-flex items-center rounded-full bg-[var(--brand)] px-4 sm:px-6 py-2.5 text-sm font-medium text-[var(--brand-contrast)] hover:opacity-90">
          Back to orders
        </Link>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-semibold">Order</h1>
        <p className="mt-4 text-red-600 dark:text-red-400">{state.message}</p>
      </div>
    );
  }

  const order = state.order;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      <div className="mb-6">
        <Link href="/orders" className="text-sm text-[var(--muted)] hover:underline">
          ← All orders
        </Link>
      </div>
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight font-mono">{order.number}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Placed {parseUtcDate(order.createdAt).toLocaleString()}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
        <section>
          <h2 className="text-lg font-medium mb-3">Items</h2>
          <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]">
            {order.items.map((item) => (
              <li key={item.productId} className="p-4 flex justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/products/${item.productSlug}`} className="font-medium hover:underline">
                    {item.productName}
                  </Link>
                  {item.productSku && (
                    <p className="text-xs text-[var(--muted)]">SKU · {item.productSku}</p>
                  )}
                  <p className="mt-0.5 text-sm text-[var(--muted)]">
                    {formatPrice(item.unitPrice, currency)} × {item.quantity}
                  </p>
                </div>
                <p className="font-medium tabular-nums whitespace-nowrap">
                  {formatPrice(item.lineTotal, currency)}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-lg border border-[var(--border)] p-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Subtotal</span>
              <span className="tabular-nums">{formatPrice(order.subtotal, currency)}</span>
            </div>
            <div className="flex justify-between font-semibold border-t border-[var(--border)] pt-2">
              <span>Total</span>
              <span className="tabular-nums">{formatPrice(order.total, currency)}</span>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <AddressBlock title="Shipping" address={order.shippingAddress} />
          <AddressBlock title="Billing" address={order.billingAddress} />
          <div className="rounded-lg border border-[var(--border)] p-4 text-xs text-[var(--muted)] space-y-1">
            <Timestamp label="Created" value={order.createdAt} />
            <Timestamp label="Paid" value={order.paidAt} />
            <Timestamp label="Fulfilled" value={order.fulfilledAt} />
            <Timestamp label="Canceled" value={order.canceledAt} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function AddressBlock({ title, address }: { title: string; address: AddressDto }) {
  return (
    <div className="rounded-lg border border-[var(--border)] p-4 text-sm">
      <p className="text-xs uppercase tracking-wide text-[var(--muted)] mb-2">{title}</p>
      <p>{address.line1}</p>
      {address.line2 && <p>{address.line2}</p>}
      <p>
        {address.city}
        {address.region ? `, ${address.region}` : ""} {address.postalCode}
      </p>
      <p>{address.country}</p>
    </div>
  );
}

function Timestamp({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="tabular-nums">{value ? parseUtcDate(value).toLocaleString() : "—"}</span>
    </div>
  );
}
