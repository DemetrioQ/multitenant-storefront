# saas-storefront

Customer-facing storefront for the Shopify-esque SaaS platform. Sibling to
[`saas-dashboard`](https://github.com/DemetrioQ/multitenant-dashboard/tree/main) (merchant admin) and [`saas-api`](https://github.com/DemetrioQ/dotnet-multitenant-api) (backend).

Next.js 16 App Router · React 19 · TypeScript · Tailwind v4 · Turbopack.

## How it works

One deployment serves every tenant. The proxy (`proxy.ts`) inspects the `Host`
header on each request:

- `acme.shop.lvh.me` (dev) / `acme.shop.demetrioq.com` (prod) → per-store pages
- the bare suffix (`shop.lvh.me`, `shop.demetrioq.com`) → marketing landing
- anything else → `/store-not-found`

The backend also reads `Host` to resolve the tenant, so the storefront never
sends `X-Tenant-Id` or a JWT. When `NEXT_PUBLIC_API_URL` points at a different
host during local dev, the API client appends `?storeSlug=<slug>` so the
backend can still resolve the tenant.

## Getting started

```bash
cp .env.example .env.local
npm install
npm run dev
```

Then visit a tenant subdomain — e.g. `http://demo.shop.lvh.me:3000`.
`lvh.me` resolves to `127.0.0.1`, so no hosts-file editing is needed.

If `saas-api` is running with the ASP.NET dev certificate, uncomment
`NODE_TLS_REJECT_UNAUTHORIZED=0` in `.env.local` so Node's fetch accepts it.

## Environment

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Absolute URL of `saas-api`. Leave empty in prod to use same-origin. |
| `NEXT_PUBLIC_STOREFRONT_HOST_SUFFIX` | Host suffix that separates landing from tenant stores. Must start with `.`. |
| `NEXT_PUBLIC_DASHBOARD_URL` | Merchant dashboard URL used by the landing navbar. |

Defaults live in `lib/config.ts` and differ between `NODE_ENV=production` and dev.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Next.js dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Layout

```
app/
  (auth)/            login, register, password reset, email verification
  account/addresses/ saved-address management
  cart/              cart view
  checkout/          checkout flow + success/cancel
  landing/           bare-host marketing pages
  orders/            order history and detail
  products/[slug]/   product detail
  store-not-found/   rewritten target for unknown hosts
components/          Header, AddToCartButton, checkout + auth pieces
contexts/            AuthContext, CartContext, StoreContext
lib/                 api client, auth/cart/checkout helpers, config, types
proxy.ts             host-based routing at the edge
```

## Conventions

- Treat `ApiError.status === 404` specially when catching API errors; let
  anything else bubble up to the global error boundary.
- For expected not-found cases in pages, call `notFound()` from
  `next/navigation` rather than throwing — it renders the right `not-found.tsx`.
- `headers()`, `params`, and `searchParams` are async in Next.js 16 — always
  await them. Layouts cannot read `searchParams`; lift that into a client
  component.
- No client-side data store. Pages are SSR against the backend; contexts hold
  only browser-only state (cart cookie, auth token).

## Deployment

`Dockerfile` builds a standalone Next.js image. The deploy workflow lives at
`.github/workflows/` and ships to the VM that fronts every tenant subdomain.
