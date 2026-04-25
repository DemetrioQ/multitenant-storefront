"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Button, IconButton } from "@/components/ui";
import { ApiError, getErrorMessage } from "@/lib/types";

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
      <Button disabled size="pill-lg" className="opacity-40 cursor-not-allowed">
        Unavailable
      </Button>
    );
  }

  if (authStatus === "anonymous") {
    return (
      <Button
        size="pill-lg"
        onClick={() => router.push(`/login?next=${encodeURIComponent(pathname)}`)}
      >
        Sign in to buy
      </Button>
    );
  }

  if (authStatus === "loading") {
    return (
      <Button disabled size="pill-lg" className="opacity-50">
        …
      </Button>
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
        setState({
          kind: "error",
          message: err.problem?.detail ?? "Not enough stock available.",
        });
        return;
      }
      setState({ kind: "error", message: getErrorMessage(err, "Failed to add to cart.") });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-md border border-border">
          <IconButton
            type="button"
            variant="ghost"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="h-10 w-10 rounded-none"
          >
            −
          </IconButton>
          <span className="w-10 text-center text-sm tabular-nums">{quantity}</span>
          <IconButton
            type="button"
            variant="ghost"
            onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
            disabled={quantity >= maxStock}
            aria-label="Increase quantity"
            className="h-10 w-10 rounded-none"
          >
            +
          </IconButton>
        </div>
        <Button
          type="button"
          size="pill"
          onClick={handleAdd}
          disabled={state.kind === "submitting"}
        >
          {state.kind === "submitting"
            ? "Adding…"
            : state.kind === "added"
              ? "Added to cart ✓"
              : "Add to cart"}
        </Button>
      </div>
      {state.kind === "error" && (
        <p className="text-xs text-red-600 dark:text-red-400">{state.message}</p>
      )}
    </div>
  );
}
