import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, getStore } from "@/lib/api";
import { ApiError, type ApiProduct, type ApiStore } from "@/lib/types";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductDetailView } from "@/components/product/ProductDetailView";

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

  // Verify the store exists before firing the product call that's guaranteed
  // to fail if the backend is unreachable. The result isn't used here — the
  // layout renders the store header/footer.
  try {
    await getStore();
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
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

  return (
    <ProductDetailView
      product={product}
      actionSlot={<AddToCartButton productId={product.id} maxStock={product.stock} />}
    />
  );
}
