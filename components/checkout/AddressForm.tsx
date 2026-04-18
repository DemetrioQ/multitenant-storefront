"use client";

import { AuthField } from "@/components/auth/AuthField";
import type { AddressDto } from "@/lib/types";

type Props = {
  value: AddressDto;
  onChange: (next: AddressDto) => void;
  prefix?: string;
  errors?: Partial<Record<keyof AddressDto, string>>;
};

export function AddressForm({ value, onChange, prefix = "addr", errors }: Props) {
  const set = <K extends keyof AddressDto>(key: K, v: AddressDto[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="sm:col-span-2">
        <AuthField
          id={`${prefix}-line1`}
          label="Address line 1"
          autoComplete="address-line1"
          required
          value={value.line1}
          onChange={(e) => set("line1", e.target.value)}
          error={errors?.line1}
        />
      </div>
      <div className="sm:col-span-2">
        <AuthField
          id={`${prefix}-line2`}
          label="Address line 2 (optional)"
          autoComplete="address-line2"
          value={value.line2 ?? ""}
          onChange={(e) => set("line2", e.target.value || null)}
        />
      </div>
      <AuthField
        id={`${prefix}-city`}
        label="City"
        autoComplete="address-level2"
        required
        value={value.city}
        onChange={(e) => set("city", e.target.value)}
        error={errors?.city}
      />
      <AuthField
        id={`${prefix}-region`}
        label="State / region (optional)"
        autoComplete="address-level1"
        value={value.region ?? ""}
        onChange={(e) => set("region", e.target.value || null)}
      />
      <AuthField
        id={`${prefix}-postal`}
        label="Postal code"
        autoComplete="postal-code"
        required
        value={value.postalCode}
        onChange={(e) => set("postalCode", e.target.value)}
        error={errors?.postalCode}
      />
      <AuthField
        id={`${prefix}-country`}
        label="Country (2-letter ISO)"
        autoComplete="country"
        required
        maxLength={2}
        value={value.country}
        onChange={(e) => set("country", e.target.value.toUpperCase())}
        error={errors?.country}
        hint="e.g. US, GB, DE"
      />
    </div>
  );
}

export function emptyAddress(): AddressDto {
  return { line1: "", line2: null, city: "", region: null, postalCode: "", country: "" };
}

export function validateAddress(a: AddressDto): Partial<Record<keyof AddressDto, string>> {
  const errors: Partial<Record<keyof AddressDto, string>> = {};
  if (!a.line1.trim()) errors.line1 = "Required";
  if (!a.city.trim()) errors.city = "Required";
  if (!a.postalCode.trim()) errors.postalCode = "Required";
  if (!/^[A-Z]{2}$/.test(a.country)) errors.country = "Must be a 2-letter country code (e.g. US)";
  return errors;
}
