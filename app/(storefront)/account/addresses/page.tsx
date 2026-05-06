"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AddressForm, emptyAddress, validateAddress } from "@/components/checkout/AddressForm";
import { Badge, Button, Card, Checkbox, Input } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { createAddress, deleteAddress, listAddresses, updateAddress } from "@/lib/addresses";
import { ApiError, type AddressDto, type CustomerAddressDto } from "@/lib/types";

type ListState =
  | { kind: "loading" }
  | { kind: "ready"; addresses: CustomerAddressDto[] }
  | { kind: "error"; message: string };

type EditorState = { kind: "closed" } | { kind: "create" } | { kind: "edit"; id: string };

type EditorForm = {
  label: string;
  address: AddressDto;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
};

function toForm(a: CustomerAddressDto): EditorForm {
  return {
    label: a.label ?? "",
    address: {
      line1: a.line1,
      line2: a.line2,
      city: a.city,
      region: a.region,
      postalCode: a.postalCode,
      country: a.country,
    },
    isDefaultShipping: a.isDefaultShipping,
    isDefaultBilling: a.isDefaultBilling,
  };
}

function emptyForm(): EditorForm {
  return { label: "", address: emptyAddress(), isDefaultShipping: false, isDefaultBilling: false };
}

export default function AccountAddressesPage() {
  const router = useRouter();
  const { status: authStatus } = useAuth();
  const [list, setList] = useState<ListState>({ kind: "loading" });
  const [editor, setEditor] = useState<EditorState>({ kind: "closed" });
  const [form, setForm] = useState<EditorForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof AddressDto, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "anonymous") router.replace("/login?next=/account/addresses");
  }, [authStatus, router]);

  const reload = async () => {
    setList({ kind: "loading" });
    try {
      const res = await listAddresses();
      setList({ kind: "ready", addresses: res });
    } catch (err) {
      setList({
        kind: "error",
        message: err instanceof ApiError ? err.message : "Couldn't load addresses.",
      });
    }
  };

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [authStatus]);

  const openCreate = () => {
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
    setEditor({ kind: "create" });
  };

  const openEdit = (a: CustomerAddressDto) => {
    setForm(toForm(a));
    setErrors({});
    setSubmitError(null);
    setEditor({ kind: "edit", id: a.id });
  };

  const closeEditor = () => setEditor({ kind: "closed" });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validateAddress(form.address);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      if (editor.kind === "create") {
        await createAddress({
          label: form.label.trim() || null,
          address: form.address,
          isDefaultShipping: form.isDefaultShipping,
          isDefaultBilling: form.isDefaultBilling,
        });
      } else if (editor.kind === "edit") {
        await updateAddress(editor.id, {
          label: form.label.trim() || null,
          address: form.address,
          isDefaultShipping: form.isDefaultShipping,
          isDefaultBilling: form.isDefaultBilling,
        });
      }
      closeEditor();
      await reload();
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? (err.problem?.detail ?? err.message) : "Couldn't save.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    try {
      await deleteAddress(id);
      await reload();
    } catch {
      // keep silent — could add a toast layer later
    } finally {
      setBusyId(null);
    }
  };

  if (authStatus === "loading" || list.kind === "loading") {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 text-center text-muted">
        Loading addresses…
      </div>
    );
  }

  if (list.kind === "error") {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-semibold">Saved addresses</h1>
        <p className="mt-4 text-red-600 dark:text-red-400">{list.message}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/orders" className="text-sm text-muted hover:underline">
            ← Account
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Saved addresses</h1>
        </div>
        {editor.kind === "closed" && (
          <Button type="button" onClick={openCreate} size="pill" className="px-5">
            Add address
          </Button>
        )}
      </div>

      {editor.kind !== "closed" && (
        <Card className="mb-8 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-medium">
              {editor.kind === "create" ? "Add a new address" : "Edit address"}
            </h2>
            <Input
              type="text"
              placeholder="Label (optional, e.g. Home, Office)"
              maxLength={50}
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
            <AddressForm
              value={form.address}
              onChange={(address) => setForm({ ...form, address })}
              prefix="acct"
              errors={errors}
            />
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.isDefaultShipping}
                  onChange={(e) => setForm({ ...form, isDefaultShipping: e.target.checked })}
                />
                Use as default shipping address
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.isDefaultBilling}
                  onChange={(e) => setForm({ ...form, isDefaultBilling: e.target.checked })}
                />
                Use as default billing address
              </label>
            </div>
            {submitError && <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>}
            <div className="flex gap-3 pt-2">
              <Button type="submit" size="pill" className="px-5" disabled={submitting}>
                {submitting ? "Saving…" : "Save"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="pill"
                className="px-5"
                onClick={closeEditor}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {list.addresses.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-muted">You haven&apos;t saved any addresses yet.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.addresses.map((a) => (
            <li key={a.id}>
              <Card className="flex items-start justify-between gap-4 p-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {a.label && <span className="font-medium">{a.label}</span>}
                    {a.isDefaultShipping && <Badge variant="muted">Default shipping</Badge>}
                    {a.isDefaultBilling && <Badge variant="muted">Default billing</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ""} · {a.city}
                    {a.region ? `, ${a.region}` : ""} {a.postalCode} · {a.country}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button type="button" variant="outline" size="sm" onClick={() => openEdit(a)}>
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(a.id)}
                    disabled={busyId === a.id}
                    className="text-red-600 hover:border-red-500"
                  >
                    {busyId === a.id ? "…" : "Delete"}
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
