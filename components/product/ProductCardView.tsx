import { formatPrice } from "@/lib/format";

// Single source of truth for the storefront product card. Used by:
//   - app/products/page.tsx (the real listing, wraps each card in <Link>)
//   - app/preview/product/page.tsx (the dashboard preview iframe)
// Keep all visual styling here so the preview never drifts from prod.

export type ProductCardData = {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
};

export function ProductCardView({ product }: { product: ProductCardData }) {
  return (
    <div className="group block rounded-lg border border-[var(--border)] overflow-hidden hover:border-[var(--brand)] transition-colors">
      <div className="aspect-square bg-[var(--border)] overflow-hidden">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--muted)] text-sm">
            No image
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium">{product.name || "Untitled product"}</h3>
        <p className="mt-1 text-sm text-[var(--muted)] line-clamp-2">{product.description}</p>
        <p className="mt-3 text-sm">
          {product.stock === 0 ? (
            <span className="text-[var(--muted)]">Out of stock</span>
          ) : (
            <span className="font-medium">{formatPrice(product.price)}</span>
          )}
        </p>
      </div>
    </div>
  );
}
