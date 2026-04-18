"use client";

import { apiFetch } from "./apiClient";
import type { CartDto } from "./types";

export function getCart(): Promise<CartDto> {
  return apiFetch<CartDto>("/cart", { auth: true });
}

export function addCartItem(productId: string, quantity: number): Promise<CartDto> {
  return apiFetch<CartDto>("/cart/items", {
    method: "POST",
    body: { productId, quantity },
    auth: true,
  });
}

export function updateCartItem(productId: string, quantity: number): Promise<CartDto> {
  return apiFetch<CartDto>(`/cart/items/${encodeURIComponent(productId)}`, {
    method: "PUT",
    body: { quantity },
    auth: true,
  });
}

export function removeCartItem(productId: string): Promise<CartDto> {
  return apiFetch<CartDto>(`/cart/items/${encodeURIComponent(productId)}`, {
    method: "DELETE",
    auth: true,
  });
}

export function clearCart(): Promise<void> {
  return apiFetch<void>("/cart", { method: "DELETE", auth: true });
}
