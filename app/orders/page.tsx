"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Button } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { listOrders } from "@/lib/checkout";
import { parseUtcDate } from "@/lib/dates";
import { formatPrice } from "@/lib/format";
import { ApiError, type OrderListDto } from "@/lib/types";

type State =
  | { kind: "loading" }
  | { kind: "ready"; data: OrderListDto }
  | { kind: "error"; message: string };

function parsePage(value: string | null): number {
  const n = value ? parseInt(value, 10) : 1;
  return Number.isNaN(n) || n < 1 ? 1 : n;
}

export default function OrdersPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { status: authStatus } = useAuth();
  const page = parsePage(params.get("page"));
  const pageSize = 20;

  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (authStatus === "anonymous") {
      router.replace(`/login?next=${encodeURIComponent(`/orders?page=${page}`)}`);
    }
  }, [authStatus, router, page]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    let cancelled = false;
    listOrders({ page, pageSize })
      .then((data) => {
        if (!cancelled) setState({ kind: "ready", data });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          kind: "error",
          message: err instanceof ApiError ? err.message : "Couldn't load orders.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [authStatus, page]);

  if (authStatus === "loading" || state.kind === "loading") {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 text-center text-muted">
        Loading orders…
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-semibold">Your orders</h1>
        <p className="mt-4 text-red-600 dark:text-red-400">{state.message}</p>
      </div>
    );
  }

  const { items, totalCount } = state.data;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Your orders</h1>
      <p className="mt-2 text-sm text-muted">
        {totalCount === 0
          ? "You haven't placed any orders yet."
          : `${totalCount} order${totalCount === 1 ? "" : "s"}`}
      </p>

      {items.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-muted">Nothing here yet.</p>
          <Button asChild size="pill" className="mt-6">
            <Link href="/products">Browse products</Link>
          </Button>
        </div>
      ) : (
        <>
          <ul className="mt-8 divide-y divide-[var(--border)] rounded-lg border border-border">
            {items.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/orders/${o.id}`}
                  className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto_auto] gap-3 px-5 py-4 hover:bg-[var(--border)]/30 items-center"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm">{o.number}</p>
                    <p className="text-xs text-muted">
                      {parseUtcDate(o.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="hidden sm:block text-sm text-muted">
                    {o.itemCount} item{o.itemCount === 1 ? "" : "s"}
                  </p>
                  <p className="hidden sm:block text-sm font-medium tabular-nums">
                    {formatPrice(o.total)}
                  </p>
                  <OrderStatusBadge status={o.status} />
                </Link>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <nav className="mt-6 flex items-center justify-between text-sm">
              <span className="text-muted">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/orders?page=${page - 1}`}>← Previous</Link>
                  </Button>
                )}
                {page < totalPages && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/orders?page=${page + 1}`}>Next →</Link>
                  </Button>
                )}
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
