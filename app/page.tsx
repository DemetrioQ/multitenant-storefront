import Link from "next/link";
import { notFound } from "next/navigation";
import { getStore, listProducts } from "@/lib/api";
import { ApiError, type ApiProduct, type ApiStore } from "@/lib/types";
import { formatPrice } from "@/lib/format";

export default async function HomePage() {
  let store: ApiStore;
  try {
    store = await getStore();
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    // Layout handles the store-unavailable screen; skip the products call
    // because it's guaranteed to fail against the same backend.
    return null;
  }

  let items: ApiProduct[] = [];
  try {
    const res = await listProducts({ page: 1, pageSize: 4 });
    items = res.items;
  } catch {
    // Non-fatal — the home page still renders without featured products.
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <section className="mb-16">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Welcome to {store.name}
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--muted)] text-lg">
          Browse our latest products below or explore the full catalog.
        </p>
        <div className="mt-8">
          <Link
            href="/products"
            className="inline-flex items-center rounded-full bg-[var(--brand)] px-4 sm:px-6 py-3 text-sm font-medium text-[var(--brand-contrast)] hover:opacity-90"
          >
            Shop all products
          </Link>
        </div>
      </section>

      {items.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">Featured</h2>
            <Link href="/products" className="text-sm text-[var(--muted)] hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="group block rounded-lg border border-[var(--border)] overflow-hidden hover:border-[var(--brand)] transition-colors"
              >
                <div className="aspect-square bg-[var(--border)] overflow-hidden">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--muted)] text-sm">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-sm">{p.name}</h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {p.stock === 0 ? "Out of stock" : formatPrice(p.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
