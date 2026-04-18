"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { ApiError } from "@/lib/types";

type Props = {
  productId: string;
  maxStock: number;
  disabled?: boolean;
};

type State =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "added" }
  | { kind: "error"; message: string };

export function AddToCartButton({ productId, maxStock, disabled }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { status: authStatus } = useAuth();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [state, setState] = useState<State>({ kind: "idle" });

  if (disabled || maxStock === 0) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-medium text-[var(--brand-contrast)] opacity-40 cursor-not-allowed"
      >
        Unavailable
      </button>
    );
  }

  if (authStatus === "anonymous") {
    return (
      <button
        type="button"
        onClick={() => router.push(`/login?next=${encodeURIComponent(pathname)}`)}
        className="inline-flex items-center rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-medium text-[var(--brand-contrast)] hover:opacity-90"
      >
        Sign in to buy
      </button>
    );
  }

  if (authStatus === "loading") {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-medium text-[var(--brand-contrast)] opacity-50"
      >
        …
      </button>
    );
  }

  const handleAdd = async () => {
    setState({ kind: "submitting" });
    try {
      await addItem(productId, quantity);
      setState({ kind: "added" });
      setTimeout(() => setState({ kind: "idle" }), 2000);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setState({ kind: "error", message: err.problem?.detail ?? "Not enough stock available." });
        return;
      }
      setState({ kind: "error", message: err instanceof Error ? err.message : "Failed to add to cart." });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-md border border-[var(--border)]">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="h-10 w-10 text-lg hover:bg-[var(--border)] disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-10 text-center text-sm tabular-nums">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
            disabled={quantity >= maxStock}
            className="h-10 w-10 text-lg hover:bg-[var(--border)] disabled:opacity-40"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={state.kind === "submitting"}
          className="inline-flex items-center rounded-full bg-[var(--brand)] px-6 py-2.5 text-sm font-medium text-[var(--brand-contrast)] hover:opacity-90 disabled:opacity-50"
        >
          {state.kind === "submitting"
            ? "Adding…"
            : state.kind === "added"
            ? "Added to cart ✓"
            : "Add to cart"}
        </button>
      </div>
      {state.kind === "error" && (
        <p className="text-xs text-red-600 dark:text-red-400">{state.message}</p>
      )}
    </div>
  );
}
