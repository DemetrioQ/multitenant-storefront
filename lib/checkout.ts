"use client";

import { apiFetch } from "./apiClient";
import type {
  AddressDto,
  CheckoutSessionResponse,
  OrderDto,
  OrderListDto,
} from "./types";

// Address slot: either an inline address OR a saved-address id, but never
// both and (for shipping) never neither.
type AddressSlot =
  | { inline: AddressDto; id?: undefined }
  | { inline?: undefined; id: string };

type CheckoutInput = {
  shipping: AddressSlot;
  // billing null/undefined = "same as shipping" (backend defaults)
  billing?: AddressSlot | null;
};

function normalize(slot: AddressSlot | null | undefined): {
  address: AddressDto | null;
  addressId: string | null;
} {
  if (!slot) return { address: null, addressId: null };
  if (slot.id) return { address: null, addressId: slot.id };
  return { address: slot.inline ?? null, addressId: null };
}

export function placeOrder(input: CheckoutInput): Promise<OrderDto> {
  const shipping = normalize(input.shipping);
  const billing = normalize(input.billing);
  return apiFetch<OrderDto>("/checkout", {
    method: "POST",
    body: {
      shippingAddress: shipping.address,
      shippingAddressId: shipping.addressId,
      billingAddress: billing.address,
      billingAddressId: billing.addressId,
    },
    auth: true,
  });
}

export function createCheckoutSession(
  input: CheckoutInput & { successUrl: string; cancelUrl: string }
): Promise<CheckoutSessionResponse> {
  const shipping = normalize(input.shipping);
  const billing = normalize(input.billing);
  return apiFetch<CheckoutSessionResponse>("/checkout/session", {
    method: "POST",
    body: {
      shippingAddress: shipping.address,
      shippingAddressId: shipping.addressId,
      billingAddress: billing.address,
      billingAddressId: billing.addressId,
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
