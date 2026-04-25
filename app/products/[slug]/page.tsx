import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, getStore } from "@/lib/api";
import { ApiError, type ApiProduct, type ApiStore } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { AddToCartButton } from "@/components/AddToCartButton";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  let store: ApiStore;
  try {
    store = await getStore();
  } catch {
    return { title: "Product not found", robots: { index: false, follow: false } };
  }

  let product: ApiProduct;
  try {
    product = await getProduct(slug);
  } catch {
    return { title: "Product not found", robots: { index: false, follow: false } };
  }

  const ogImages = product.imageUrl ? [{ url: product.imageUrl, alt: product.name }] : undefined;
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      siteName: store.name,
      type: "website",
      images: ogImages,
    },
    twitter: {
      card: product.imageUrl ? "summary_large_image" : "summary",
      title: product.name,
      description: product.description,
      images: product.imageUrl ? [product.imageUrl] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  let store: ApiStore;
  try {
    store = await getStore();
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    // Layout will render the store-unavailable screen; no point firing
    // the product call since the backend is clearly unreachable.
    return null;
  }

  let product: ApiProduct;
  try {
    product = await getProduct(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    return (
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold">Can&apos;t load this product right now</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          The backend is temporarily unreachable. Please try again shortly.
        </p>
      </div>
    );
  }

  const outOfStock = product.stock === 0;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="aspect-square rounded-lg overflow-hidden bg-[var(--border)]">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
              No image
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
          {product.sku && (
            <p className="mt-1 text-xs uppercase tracking-wide text-[var(--muted)]">
              SKU · {product.sku}
            </p>
          )}
          <p className="mt-4 text-2xl">
            {outOfStock ? (
              <span className="text-[var(--muted)]">Out of stock</span>
            ) : (
              <span className="font-medium">{formatPrice(product.price)}</span>
            )}
          </p>
          <p className="mt-6 text-[var(--foreground)] whitespace-pre-line leading-relaxed">
            {product.description}
          </p>
          <div className="mt-8">
            <AddToCartButton productId={product.id} maxStock={product.stock} />
          </div>
          {!outOfStock && (
            <p className="mt-2 text-xs text-[var(--muted)]">{product.stock} in stock</p>
          )}
        </div>
      </div>
    </div>
  );
}
