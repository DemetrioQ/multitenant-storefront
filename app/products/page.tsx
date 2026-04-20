import Link from "next/link";
import { notFound } from "next/navigation";
import { getStore, listProducts } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { ApiError, type ApiProductList, type ApiStore } from "@/lib/types";

type Props = {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
};

function clampInt(value: string | undefined, min: number, max: number, fallback: number): number {
  if (!value) return fallback;
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

function ProductsUnavailable() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
      </header>
      <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center">
        <p className="text-[var(--muted)]">
          We couldn&apos;t load products right now. Please refresh in a moment.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center rounded-full border border-[var(--border)] px-4 py-2 text-sm hover:border-[var(--brand)]"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = clampInt(sp.page, 1, 1000, 1);
  const pageSize = clampInt(sp.pageSize, 1, 100, 20);

  let store: ApiStore;
  try {
    store = await getStore();
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    // Layout already renders the store-unavailable screen; bail before
    // firing a products call that's guaranteed to fail too.
    return null;
  }

  let data: ApiProductList;
  try {
    data = await listProducts({ page, pageSize });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    return <ProductsUnavailable />;
  }

  const totalPages = Math.max(1, Math.ceil(data.totalCount / pageSize));

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
        <p className="mt-2 text-[var(--muted)]">
          {data.totalCount === 0
            ? "No products available yet."
            : `${data.totalCount} product${data.totalCount === 1 ? "" : "s"}`}
        </p>
      </header>

      {data.items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center text-[var(--muted)]">
          Check back soon.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.items.map((p) => (
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
                  <h3 className="font-medium">{p.name}</h3>
                  <p className="mt-1 text-sm text-[var(--muted)] line-clamp-2">{p.description}</p>
                  <p className="mt-3 text-sm">
                    {p.stock === 0 ? (
                      <span className="text-[var(--muted)]">Out of stock</span>
                    ) : (
                      <span className="font-medium">{formatPrice(p.price)}</span>
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="mt-10 flex items-center justify-between text-sm">
              <span className="text-[var(--muted)]">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/products?page=${page - 1}&pageSize=${pageSize}`}
                    className="rounded border border-[var(--border)] px-4 py-2 hover:border-[var(--brand)]"
                  >
                    ← Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/products?page=${page + 1}&pageSize=${pageSize}`}
                    className="rounded border border-[var(--border)] px-4 py-2 hover:border-[var(--brand)]"
                  >
                    Next →
                  </Link>
                )}
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
