"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/format";
import { ApiError, type CartLineItem } from "@/lib/types";

export default function CartPage() {
  const router = useRouter();
  const { status: authStatus } = useAuth();
  const { cart, status, error, refresh, updateItem, removeItem, clear } = useCart();

  useEffect(() => {
    if (authStatus === "anonymous") {
      router.replace("/login?next=/cart");
    }
  }, [authStatus, router]);

  if (authStatus === "loading" || status === "loading" || status === "idle") {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 text-center text-[var(--muted)]">
        Loading your cart…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Your cart</h1>
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error ?? "Couldn't load cart."}</p>
        <button
          type="button"
          onClick={refresh}
          className="mt-4 rounded-md border border-[var(--border)] px-4 py-2 text-sm hover:border-[var(--brand)]"
        >
          Retry
        </button>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const isEmpty = items.length === 0;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Your cart</h1>
        {!isEmpty && (
          <button
            type="button"
            onClick={() => clear()}
            className="text-xs text-[var(--muted)] hover:underline"
          >
            Clear cart
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center">
          <p className="text-[var(--muted)]">Your cart is empty.</p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center rounded-full bg-[var(--brand)] px-4 sm:px-6 py-2.5 text-sm font-medium text-[var(--brand-contrast)] hover:opacity-90"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]">
            {items.map((item) => (
              <CartLine
                key={item.productId}
                item={item}
                onUpdate={(qty) => updateItem(item.productId, qty)}
                onRemove={() => removeItem(item.productId)}
              />
            ))}
          </ul>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border border-[var(--border)] p-6">
            <div>
              <p className="text-sm text-[var(--muted)]">Subtotal ({cart?.totalItems ?? 0} items)</p>
              <p className="text-2xl font-semibold">{formatPrice(cart?.subtotal ?? 0)}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Taxes and shipping calculated at checkout.
              </p>
            </div>
            <Link
              href="/checkout"
              className="inline-flex items-center justify-center rounded-full bg-[var(--brand)] px-8 py-3 text-sm font-medium text-[var(--brand-contrast)] hover:opacity-90"
            >
              Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function CartLine({
  item,
  onUpdate,
  onRemove,
}: {
  item: CartLineItem;
  onUpdate: (quantity: number) => Promise<unknown>;
  onRemove: () => Promise<unknown>;
}) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [lastSynced, setLastSynced] = useState(item.quantity);
  if (lastSynced !== item.quantity) {
    setLastSynced(item.quantity);
    setQuantity(item.quantity);
  }

  const commit = async (next: number) => {
    if (next === item.quantity) return;
    setPending(true);
    setError(null);
    try {
      await onUpdate(next);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setError(err.problem?.detail ?? "Not enough stock available.");
      } else {
        setError(err instanceof Error ? err.message : "Update failed.");
      }
      setQuantity(item.quantity);
    } finally {
      setPending(false);
    }
  };

  const handleRemove = async () => {
    setPending(true);
    try {
      await onRemove();
    } finally {
      setPending(false);
    }
  };

  return (
    <li className="flex gap-4 p-4">
      <div className="w-20 h-20 shrink-0 rounded-md bg-[var(--border)] overflow-hidden">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
        ) : null}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link href={`/products/${item.productSlug}`} className="font-medium hover:underline">
              {item.productName}
            </Link>
            <p className="mt-0.5 text-sm text-[var(--muted)]">
              {formatPrice(item.unitPrice)} each
            </p>
          </div>
          <p className="font-medium tabular-nums">{formatPrice(item.lineTotal)}</p>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center rounded-md border border-[var(--border)]">
            <button
              type="button"
              disabled={pending || quantity <= 1}
              onClick={() => {
                const next = quantity - 1;
                setQuantity(next);
                commit(next);
              }}
              className="h-8 w-8 text-sm hover:bg-[var(--border)] disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-8 text-center text-sm tabular-nums">{quantity}</span>
            <button
              type="button"
              disabled={pending || quantity >= item.availableStock}
              onClick={() => {
                const next = quantity + 1;
                setQuantity(next);
                commit(next);
              }}
              className="h-8 w-8 text-sm hover:bg-[var(--border)] disabled:opacity-40"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={pending}
            className="text-xs text-[var(--muted)] hover:underline disabled:opacity-50"
          >
            Remove
          </button>
          {item.availableStock < quantity && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              Only {item.availableStock} in stock
            </span>
          )}
        </div>
        {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    </li>
  );
}
