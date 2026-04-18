"use client";

import { apiFetch } from "./apiClient";
import type {
  AddressDto,
  CheckoutSessionResponse,
  OrderDto,
  OrderListDto,
} from "./types";

type CheckoutInput = {
  shippingAddress: AddressDto;
  billingAddress?: AddressDto | null;
};

export function placeOrder(input: CheckoutInput): Promise<OrderDto> {
  return apiFetch<OrderDto>("/checkout", {
    method: "POST",
    body: { shippingAddress: input.shippingAddress, billingAddress: input.billingAddress ?? null },
    auth: true,
  });
}

export function createCheckoutSession(
  input: CheckoutInput & { successUrl: string; cancelUrl: string }
): Promise<CheckoutSessionResponse> {
  return apiFetch<CheckoutSessionResponse>("/checkout/session", {
    method: "POST",
    body: {
      shippingAddress: input.shippingAddress,
      billingAddress: input.billingAddress ?? null,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
    },
    auth: true,
  });
}

export function listOrders(params: { page?: number; pageSize?: number } = {}): Promise<OrderListDto> {
  return apiFetch<OrderListDto>("/orders", {
    auth: true,
    query: { page: params.page, pageSize: params.pageSize },
  });
}

export function getOrder(id: string): Promise<OrderDto> {
  return apiFetch<OrderDto>(`/orders/${encodeURIComponent(id)}`, { auth: true });
}
