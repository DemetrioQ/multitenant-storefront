import Link from "next/link";
import type { Metadata } from "next";
import { listStores } from "@/lib/api";
import { ApiError, type StoreSummary } from "@/lib/types";

export const metadata: Metadata = {
  title: "SaaS API Portfolio · Multi-tenant Shopify-for-X",
  description:
    "A multi-tenant storefront platform portfolio project by Demetrio Quiñones. Each merchant gets their own store at a custom subdomain.",
  robots: { index: true, follow: true },
};

async function loadStores(): Promise<{ stores: StoreSummary[]; error: string | null }> {
  try {
    const res = await listStores({ page: 1, pageSize: 50 });
    return { stores: res.items, error: null };
  } catch (err) {
    if (err instanceof ApiError) return { stores: [], error: err.message };
    return { stores: [], error: "Couldn't load live stores." };
  }
}

export default async function LandingPage() {
  const { stores, error } = await loadStores();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <section className="mb-16">
        <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Portfolio project</p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight max-w-3xl">
          A multi-tenant storefront platform
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-[var(--muted)] leading-relaxed">
          This is a Shopify-for-X demo: one backend serves many independent stores,
          each at their own subdomain. Merchants manage products, orders, and
          customers from a shared dashboard; shoppers browse and check out on the
          per-store frontend you&apos;re visiting below.
        </p>
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Live stores</h2>
          {stores.length > 0 && (
            <span className="text-sm text-[var(--muted)]">
              {stores.length} store{stores.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {error ? (
          <div className="rounded-lg border border-dashed border-[var(--border)] p-8 text-sm text-[var(--muted)]">
            Couldn&apos;t load the store directory right now. The backend may be warming up — try again in a moment.
          </div>
        ) : stores.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--border)] p-8 text-sm text-[var(--muted)]">
            No live stores yet. Create one from the merchant dashboard to see it listed here.
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map((store) => (
              <li key={store.slug}>
                <a
                  href={store.storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-[var(--border)] p-5 hover:border-[var(--brand)] transition-colors h-full"
                >
                  <p className="text-xs uppercase tracking-wide text-[var(--muted)] font-mono">
                    {store.slug}
                  </p>
                  <p className="mt-2 text-lg font-medium group-hover:underline">
                    {store.name}
                  </p>
                  <p className="mt-3 text-xs text-[var(--muted)] truncate">
                    Visit {store.storeUrl.replace(/^https?:\/\//, "")} →
                  </p>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-20 rounded-lg border border-[var(--border)] p-6 sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight">Tech stack</h2>
        <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-3 text-sm">
          <dt className="text-[var(--muted)]">Backend</dt>
          <dd>.NET 9, ASP.NET Core, Clean Architecture, MediatR, EF Core + Postgres</dd>
          <dt className="text-[var(--muted)]">Storefront</dt>
          <dd>Next.js 16 App Router, TypeScript, Tailwind v4, SSR</dd>
          <dt className="text-[var(--muted)]">Auth</dt>
          <dd>JWT (merchant + customer) with refresh-cookie rotation</dd>
          <dt className="text-[var(--muted)]">Payments</dt>
          <dd>Stripe hosted checkout + simulation provider</dd>
          <dt className="text-[var(--muted)]">Routing</dt>
          <dd>Subdomain-based tenant resolution via Next.js proxy middleware</dd>
          <dt className="text-[var(--muted)]">Hosting</dt>
          <dd>Oracle Cloud ARM VM · Caddy · Docker</dd>
        </dl>
        <p className="mt-6 text-xs text-[var(--muted)]">
          <Link href="https://github.com/demetrioq" target="_blank" rel="noopener noreferrer" className="underline">
            Source on GitHub
          </Link>
        </p>
      </section>
    </div>
  );
}
