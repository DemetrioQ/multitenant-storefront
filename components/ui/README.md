# UI primitives

Light/auto-mode primitives that adapt to the user's OS theme via the storefront's CSS-variable tokens (`--background`, `--foreground`, `--brand`, `--brand-contrast`, `--border`, `--muted`). **Use these instead of copy-pasting Tailwind class strings into pages.**

## Quick rules

- Importing: `import { Button, Card, Input } from "@/components/ui"`.
- Every primitive forwards its ref and accepts `className`. Extra classes win over defaults (thanks to `tailwind-merge`).
- Don't add one-off variants — use `className` on the call-site first. Only promote a variant when you see it in 3+ places.
- Stateful/event-handler primitives are marked `"use client"`. Importing them into a Server Component automatically lands their JS in the client bundle for that subtree.

## Components

### `Button`

```tsx
<Button>Add to cart</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="destructive">Remove</Button>
<Button variant="ghost" size="sm">Close</Button>
<Button variant="outline">View cart</Button>
<Button variant="link">Forgot password?</Button>

// Pill shape — matches the storefront's existing AddToCartButton style
<Button size="pill">Sign in to buy</Button>
<Button size="pill-lg">Place order</Button>

// As a Next.js Link — uses Radix Slot to pass classes to the child
<Button asChild>
  <Link href="/cart">View cart</Link>
</Button>
```

Variants: `primary` (default), `secondary`, `ghost`, `outline`, `destructive`, `link`. Sizes: `sm`, `md` (default), `lg`, `pill`, `pill-lg`.

### `IconButton`

For icon-only buttons. `aria-label` is **required** by the type.

```tsx
<IconButton aria-label="Increase quantity">+</IconButton>
<IconButton aria-label="Close" variant="ghost">✕</IconButton>
```

### `Badge`

Status pill that mirrors the existing `OrderStatusBadge` palette. Variants: `default`, `muted`, `success`, `warning`, `info`, `destructive`, `rose`.

```tsx
<Badge>Default</Badge>
<Badge variant="success">Paid</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="info">Fulfilled</Badge>
<Badge variant="rose">Refunded</Badge>
```

### `Input`, `Textarea`, `Select`, `Checkbox`

```tsx
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" error={!!errors.email} />
<FieldError message={errors.email} />

<Textarea rows={4} error={!!errors.notes} />

<Select>
  <option value="">Choose…</option>
  <option value="us">United States</option>
</Select>

<Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)} />
```

### `Card` + slots

```tsx
<Card>
  <CardHeader>
    <h2 className="text-base font-semibold">Order summary</h2>
  </CardHeader>
  <CardContent>{/* line items */}</CardContent>
  <CardFooter>
    <Button className="w-full">Place order</Button>
  </CardFooter>
</Card>
```

`<Card>` works standalone too when you just need the surface.

### `Label`, `FieldError`

Minimal form helpers. `FieldError` renders nothing when `message` is falsy.

### `Skeleton`

Animated placeholder block.

```tsx
{
  loading ? <Skeleton className="h-8 w-32" /> : <p>{value}</p>;
}
```

### `Modal`

Accessible dialog with focus trap, ESC handling, focus restoration, backdrop click.

```tsx
{
  open && (
    <Modal title="Edit address" onClose={() => setOpen(false)}>
      <form>...</form>
    </Modal>
  );
}
```

### `useConfirm`

Replaces `window.confirm()` with a styled dialog. Render `dialog` once near the root of your component, then `await confirm({ ... })` in event handlers.

```tsx
function CartLine({ item }) {
  const { confirm, dialog } = useConfirm();

  const onRemove = async () => {
    const ok = await confirm({
      title: "Remove item?",
      message: `${item.name} will be removed from your cart.`,
      destructive: true,
      confirmLabel: "Remove",
    });
    if (ok) await removeItem(item.id);
  };

  return (
    <>
      {dialog}
      <Button variant="destructive" onClick={onRemove}>
        Remove
      </Button>
    </>
  );
}
```

### `useToast`

App-level notification. Mount `<ToastProvider>` once near the top of `app/layout.tsx`; then any client descendant can call `toast(message, variant)`. Variants: `success`, `error`, `info`. Auto-dismisses after 4s.

```tsx
const { toast } = useToast();

const onSave = async () => {
  try {
    await save();
    toast("Address saved.", "success");
  } catch (err) {
    toast(getErrorMessage(err), "error");
  }
};
```

## When NOT to use a primitive

- Bespoke widgets with embedded SDKs (Stripe Elements, payment forms with custom focus management) — keep their hand-tuned markup.
- Server Components that only render static markup — primitives that don't need interactivity (`Card`, `Badge`, `Label`, `Skeleton`, `FieldError`) are fine in Server Components; the others (`Button`, `Input`, etc.) carry `"use client"` and pull their subtree into the client bundle.

## Adding a new primitive

1. Put it in `components/ui/YourThing.tsx`.
2. Use `cva` for variant matrices; use `cn()` for simple cases.
3. `forwardRef` + spread `...props` so it composes well.
4. Mark `"use client"` only if it owns state or event handlers.
5. Export from `components/ui/index.ts`.
6. Document it here.
