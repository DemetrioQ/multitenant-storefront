"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AddressPicker, type AddressSelection } from "@/components/checkout/AddressPicker";
import { emptyAddress, validateAddress } from "@/components/checkout/AddressForm";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/StoreContext";
import { createAddress, listAddresses } from "@/lib/addresses";
import { createCheckoutSession, placeOrder } from "@/lib/checkout";
import { formatPrice } from "@/lib/format";
import { ApiError, type AddressDto, type CustomerAddressDto } from "@/lib/types";

type Submission =
  | { kind: "idle" }
  | { kind: "submitting"; mode: "place" | "session" }
  | { kind: "error"; message: string };

type ResolvedSlot = { inline: AddressDto; id?: undefined } | { inline?: undefined; id: string };

function initialShippingSelection(addresses: CustomerAddressDto[]): AddressSelection {
  const def = addresses.find((a) => a.isDefaultShipping) ?? addresses[0];
  if (def) return { kind: "saved", id: def.id };
  return { kind: "inline", address: emptyAddress(), save: false, label: "" };
}

function initialBillingSelection(addresses: CustomerAddressDto[]): AddressSelection {
  const def = addresses.find((a) => a.isDefaultBilling) ?? addresses[0];
  if (def) return { kind: "saved", id: def.id };
  return { kind: "inline", address: emptyAddress(), save: false, label: "" };
}

async function resolveSlot(
  selection: AddressSelection,
  flags: { isDefaultShipping?: boolean; isDefaultBilling?: boolean } = {},
): Promise<ResolvedSlot> {
  if (selection.kind === "saved") return { id: selection.id };
  if (selection.save) {
    const saved = await createAddress({
      label: selection.label.trim() || null,
      address: selection.address,
      ...flags,
    });
    return { id: saved.id };
  }
  return { inline: selection.address };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { status: authStatus } = useAuth();
  const { cart, status: cartStatus, refresh: refreshCart, clear: clearCart } = useCart();
  const currency = useCurrency();

  const [addresses, setAddresses] = useState<CustomerAddressDto[] | null>(null);
  const [shipping, setShipping] = useState<AddressSelection>(() =>
    ({ kind: "inline", address: emptyAddress(), save: false, label: "" })
  );
  const [billing, setBilling] = useState<AddressSelection>(() =>
    ({ kind: "inline", address: emptyAddress(), save: false, label: "" })
  );
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [submission, setSubmission] = useState<Submission>({ kind: "idle" });
  const [shippingErrors, setShippingErrors] = useState<Partial<Record<keyof AddressDto, string>>>({});
  const [billingErrors, setBillingErrors] = useState<Partial<Record<keyof AddressDto, string>>>({});

  useEffect(() => {
    if (authStatus === "anonymous") router.replace("/login?next=/checkout");
  }, [authStatus, router]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    let cancelled = false;
    listAddresses()
      .then((res) => {
        if (cancelled) return;
        setAddresses(res);
        setShipping(initialShippingSelection(res));
        setBilling(initialBillingSelection(res));
      })
      .catch(() => {
        if (cancelled) return;
        setAddresses([]);
      });
    return () => {
      cancelled = true;
    };
  }, [authStatus]);

  const items = cart?.items ?? [];
  const isEmpty = items.length === 0;

  const submit = async (mode: "place" | "session") => {
    const sErrors = shipping.kind === "inline" ? validateAddress(shipping.address) : {};
    const bErrors = !useSameAddress && billing.kind === "inline" ? validateAddress(billing.address) : {};
    setShippingErrors(sErrors);
    setBillingErrors(bErrors);
    if (Object.keys(sErrors).length > 0 || Object.keys(bErrors).length > 0) return;

    setSubmission({ kind: "submitting", mode });
    try {
      const resolvedShipping = await resolveSlot(shipping, { isDefaultShipping: addresses?.length === 0 });
      const resolvedBilling = useSameAddress ? null : await resolveSlot(billing);

      if (mode === "place") {
        const order = await placeOrder({
          shipping: resolvedShipping,
          billing: resolvedBilling,
        });
        await clearCart().catch(() => {
          // backend already emptied the cart; ignore
        });
        router.replace(`/orders/${order.id}`);
      } else {
        const origin = window.location.origin;
        // The backend substitutes {ORDER_ID} / {ORDER_NUMBER} in both URLs
        // before handing them to Stripe (or the simulation provider), so we
        // don't have to know the id upfront.
        const session = await createCheckoutSession({
          shipping: resolvedShipping,
          billing: resolvedBilling,
          successUrl: `${origin}/checkout/success?order={ORDER_ID}`,
          cancelUrl: `${origin}/checkout/cancel?order={ORDER_ID}`,
        });
        window.location.assign(session.paymentUrl);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400) {
          setSubmission({ kind: "error", message: err.problem?.detail ?? err.message });
          return;
        }
        if (err.status === 401 || err.status === 403) {
          router.replace("/login?next=/checkout");
          return;
        }
        if (err.status === 404) {
          setSubmission({ kind: "error", message: "A saved address on file was removed. Pick another or enter a new one." });
          return;
        }
      }
      setSubmission({
        kind: "error",
        message: err instanceof Error ? err.message : "Checkout failed. Please try again.",
      });
    }
  };

  if (authStatus === "loading" || cartStatus === "loading" || cartStatus === "idle" || addresses === null) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16 text-center text-[var(--muted)]">
        Loading checkout…
      </div>
    );
  }

  if (cartStatus === "error") {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className="mt-4 text-red-600 dark:text-red-400">Couldn&apos;t load your cart.</p>
        <button type="button" onClick={refreshCart} className="mt-4 rounded-md border border-[var(--border)] px-4 py-2 text-sm">
          Retry
        </button>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Add something to it before checking out.</p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center rounded-full bg-[var(--brand)] px-6 py-2.5 text-sm font-medium text-[var(--brand-contrast)] hover:opacity-90"
        >
          Browse products
        </Link>
      </div>
    );
  }

  const submitting = submission.kind === "submitting";

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight mb-8">Checkout</h1>
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          submit("session");
        }}
        className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10"
      >
        <div className="space-y-8">
          <AddressPicker
            title="Shipping address"
            addresses={addresses}
            selection={shipping}
            onChange={setShipping}
            inlineErrors={shippingErrors}
            idPrefix="ship"
          />

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Billing address</h2>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={useSameAddress}
                  onChange={(e) => setUseSameAddress(e.target.checked)}
                />
                Same as shipping
              </label>
            </div>
            {!useSameAddress && (
              <AddressPicker
                title=""
                addresses={addresses}
                selection={billing}
                onChange={setBilling}
                inlineErrors={billingErrors}
                idPrefix="bill"
              />
            )}
          </section>

          {submission.kind === "error" && (
            <p className="text-sm text-red-600 dark:text-red-400">{submission.message}</p>
          )}
        </div>

        <aside className="lg:sticky lg:top-8 h-fit rounded-lg border border-[var(--border)] p-6 space-y-4">
          <h2 className="text-lg font-medium">Order summary</h2>
          <ul className="divide-y divide-[var(--border)]">
            {items.map((item) => (
              <li key={item.productId} className="py-3 flex justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium truncate">{item.productName}</p>
                  <p className="text-[var(--muted)]">× {item.quantity}</p>
                </div>
                <p className="tabular-nums whitespace-nowrap">{formatPrice(item.lineTotal, currency)}</p>
              </li>
            ))}
          </ul>
          <div className="border-t border-[var(--border)] pt-4 flex justify-between font-semibold">
            <span>Subtotal</span>
            <span>{formatPrice(cart?.subtotal ?? 0, currency)}</span>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-medium text-[var(--brand-contrast)] hover:opacity-90 disabled:opacity-50"
            >
              {submission.kind === "submitting" && submission.mode === "session" ? "Redirecting…" : "Pay now"}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => submit("place")}
              className="inline-flex items-center justify-center rounded-full border border-[var(--border)] px-6 py-3 text-sm font-medium hover:border-[var(--brand)] disabled:opacity-50"
            >
              {submission.kind === "submitting" && submission.mode === "place" ? "Placing…" : "Place order (pay later)"}
            </button>
          </div>

          <p className="text-xs text-[var(--muted)]">
            Choosing &quot;Pay now&quot; redirects you to the payment provider. &quot;Place order&quot; creates
            the order in pending status without charging you.
          </p>
        </aside>
      </form>
    </div>
  );
}
