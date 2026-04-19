"use client";

import { apiFetch } from "./apiClient";
import type { CustomerAddressDto, SaveAddressInput } from "./types";

export function listAddresses(): Promise<CustomerAddressDto[]> {
  return apiFetch<CustomerAddressDto[]>("/addresses", { auth: true });
}

export function createAddress(input: SaveAddressInput): Promise<CustomerAddressDto> {
  return apiFetch<CustomerAddressDto>("/addresses", {
    method: "POST",
    body: {
      label: input.label ?? null,
      address: input.address,
      isDefaultShipping: input.isDefaultShipping ?? false,
      isDefaultBilling: input.isDefaultBilling ?? false,
    },
    auth: true,
  });
}

export function updateAddress(id: string, input: SaveAddressInput): Promise<CustomerAddressDto> {
  return apiFetch<CustomerAddressDto>(`/addresses/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: {
      label: input.label ?? null,
      address: input.address,
      isDefaultShipping: input.isDefaultShipping ?? false,
      isDefaultBilling: input.isDefaultBilling ?? false,
    },
    auth: true,
  });
}

export function deleteAddress(id: string): Promise<void> {
  return apiFetch<void>(`/addresses/${encodeURIComponent(id)}`, {
    method: "DELETE",
    auth: true,
  });
}
