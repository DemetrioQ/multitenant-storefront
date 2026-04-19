"use client";

import { AddressForm } from "./AddressForm";
import type { AddressDto, CustomerAddressDto } from "@/lib/types";

export type AddressSelection =
  | { kind: "saved"; id: string }
  | { kind: "inline"; address: AddressDto; save: boolean; label: string };

type Props = {
  title: string;
  addresses: CustomerAddressDto[];
  selection: AddressSelection;
  onChange: (next: AddressSelection) => void;
  inlineErrors?: Partial<Record<keyof AddressDto, string>>;
  idPrefix: string;
};

function formatAddress(a: CustomerAddressDto): string {
  const parts = [a.line1];
  if (a.line2) parts.push(a.line2);
  const cityLine = [a.city, a.region, a.postalCode].filter(Boolean).join(", ");
  parts.push(cityLine);
  parts.push(a.country);
  return parts.join(" · ");
}

export function AddressPicker({ title, addresses, selection, onChange, inlineErrors, idPrefix }: Props) {
  const pickSaved = (id: string) => onChange({ kind: "saved", id });
  const useNew = () =>
    onChange({
      kind: "inline",
      address: { line1: "", line2: null, city: "", region: null, postalCode: "", country: "" },
      save: false,
      label: "",
    });

  return (
    <section>
      <h2 className="text-lg font-medium mb-4">{title}</h2>
      {addresses.length > 0 && (
        <ul className="space-y-2 mb-4">
          {addresses.map((a) => {
            const checked = selection.kind === "saved" && selection.id === a.id;
            return (
              <li key={a.id}>
                <label
                  className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                    checked ? "border-[var(--brand)] bg-[var(--brand)]/5" : "border-[var(--border)] hover:border-[var(--brand)]/60"
                  }`}
                >
                  <input
                    type="radio"
                    name={`${idPrefix}-picker`}
                    className="mt-1"
                    checked={checked}
                    onChange={() => pickSaved(a.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {a.label && <span className="font-medium">{a.label}</span>}
                      {a.isDefaultShipping && <Badge>Default shipping</Badge>}
                      {a.isDefaultBilling && <Badge>Default billing</Badge>}
                    </div>
                    <p className="text-sm text-[var(--muted)]">{formatAddress(a)}</p>
                  </div>
                </label>
              </li>
            );
          })}
        </ul>
      )}

      <label
        className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
          selection.kind === "inline"
            ? "border-[var(--brand)] bg-[var(--brand)]/5"
            : "border-[var(--border)] hover:border-[var(--brand)]/60"
        }`}
      >
        <input
          type="radio"
          name={`${idPrefix}-picker`}
          className="mt-1"
          checked={selection.kind === "inline"}
          onChange={useNew}
        />
        <div className="flex-1">
          <span className="font-medium">
            {addresses.length > 0 ? "Use a new address" : "Enter address"}
          </span>
        </div>
      </label>

      {selection.kind === "inline" && (
        <div className="mt-4 space-y-4 rounded-lg border border-[var(--border)] p-4">
          <AddressForm
            value={selection.address}
            onChange={(address) => onChange({ ...selection, address })}
            prefix={idPrefix}
            errors={inlineErrors}
          />
          <div className="pt-2 border-t border-[var(--border)] flex flex-col gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selection.save}
                onChange={(e) => onChange({ ...selection, save: e.target.checked })}
              />
              Save this address for next time
            </label>
            {selection.save && (
              <input
                type="text"
                placeholder="Label (optional, e.g. Home, Office)"
                maxLength={50}
                value={selection.label}
                onChange={(e) => onChange({ ...selection, label: e.target.value })}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--muted)]">
      {children}
    </span>
  );
}
