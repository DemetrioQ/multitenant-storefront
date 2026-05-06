import type { ReactNode } from "react";
import { formatPrice } from "@/lib/format";

// Single source of truth for the storefront product detail page. Used by:
//   - app/products/[slug]/page.tsx (passes a real <AddToCartButton/> as actionSlot)
//   - app/preview/product/page.tsx (passes a static stub button)
// Keep all visual styling here so the preview never drifts from prod.

export type ProductDetailData = {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  sku?: string | null;
};

export function ProductDetailView({
  product,
  actionSlot,
}: {
  product: ProductDetailData;
  actionSlot: ReactNode;
}) {
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
          <h1 className="text-3xl font-semibold tracking-tight">
            {product.name || "Untitled product"}
          </h1>
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
          <div className="mt-8">{actionSlot}</div>
          {!outOfStock && (
            <p className="mt-2 text-xs text-[var(--muted)]">{product.stock} in stock</p>
          )}
        </div>
      </div>
    </div>
  );
}
