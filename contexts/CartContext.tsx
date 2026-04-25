"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as cartApi from "@/lib/cart";
import { ApiError, type CartDto } from "@/lib/types";
import { useAuth } from "./AuthContext";

type CartState = {
  status: "idle" | "loading" | "ready" | "error";
  cart: CartDto | null;
  error: string | null;
};

type CartContextValue = CartState & {
  refresh: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<CartDto>;
  updateItem: (productId: string, quantity: number) => Promise<CartDto>;
  removeItem: (productId: string) => Promise<CartDto>;
  clear: () => Promise<void>;
  totalItems: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { status: authStatus } = useAuth();
  const [state, setState] = useState<CartState>({ status: "idle", cart: null, error: null });

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, status: "loading" }));
    try {
      const cart = await cartApi.getCart();
      setState({ status: "ready", cart, error: null });
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setState({ status: "idle", cart: null, error: null });
        return;
      }
      setState({
        status: "error",
        cart: null,
        error: err instanceof Error ? err.message : "Failed to load cart",
      });
    }
  }, []);

  useEffect(() => {
    if (authStatus === "authenticated") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void refresh();
    } else if (authStatus === "anonymous") {
      setState({ status: "idle", cart: null, error: null });
    }
  }, [authStatus, refresh]);

  const mutate = useCallback(
    async <T,>(op: () => Promise<T>, applyCart: (result: T) => void): Promise<T> => {
      const result = await op();
      applyCart(result);
      return result;
    },
    [],
  );

  const addItem = useCallback(
    (productId: string, quantity: number) =>
      mutate(
        () => cartApi.addCartItem(productId, quantity),
        (cart) => setState({ status: "ready", cart, error: null }),
      ),
    [mutate],
  );

  const updateItem = useCallback(
    (productId: string, quantity: number) =>
      mutate(
        () => cartApi.updateCartItem(productId, quantity),
        (cart) => setState({ status: "ready", cart, error: null }),
      ),
    [mutate],
  );

  const removeItem = useCallback(
    (productId: string) =>
      mutate(
        () => cartApi.removeCartItem(productId),
        (cart) => setState({ status: "ready", cart, error: null }),
      ),
    [mutate],
  );

  const clear = useCallback(async () => {
    await cartApi.clearCart();
    await refresh();
  }, [refresh]);

  const totalItems = state.cart?.totalItems ?? 0;

  const value = useMemo<CartContextValue>(
    () => ({ ...state, refresh, addItem, updateItem, removeItem, clear, totalItems }),
    [state, refresh, addItem, updateItem, removeItem, clear, totalItems],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
