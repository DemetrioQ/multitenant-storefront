"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCardView, type ProductCardData } from "@/components/product/ProductCardView";
import { ProductDetailView } from "@/components/product/ProductDetailView";
import { Button } from "@/components/ui";

// Embedded by the dashboard's <StorefrontPreview> iframe to render a live
// preview of a product as it would appear on the storefront — without
// touching the backend or requiring the product to exist yet.
//
// Initial state comes from URL search params; subsequent updates arrive via
// postMessage from the parent window so the iframe never needs to reload.
//
// Message contract (parent -> iframe):
//   { type: "preview-update", product: PreviewProduct, view?: "card" | "detail" }
// Message contract (iframe -> parent):
//   { type: "preview-ready" }  // sent once, after mount

type View = "card" | "detail";
type PreviewProduct = ProductCardData & { sku?: string | null };

function readFromSearchParams(sp: URLSearchParams): {
  product: PreviewProduct;
  view: View;
} {
  const view = sp.get("view") === "detail" ? "detail" : "card";
  return {
    view,
    product: {
      name: sp.get("name") ?? "",
      description: sp.get("description") ?? "",
      price: parseFloat(sp.get("price") ?? "0") || 0,
      stock: parseInt(sp.get("stock") ?? "0", 10) || 0,
      imageUrl: sp.get("imageUrl") || null,
      sku: sp.get("sku") || null,
    },
  };
}

function StubAddToCart({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <Button disabled size="pill-lg" className="opacity-40 cursor-not-allowed">
        Unavailable
      </Button>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-md border border-border">
        <span className="h-10 w-10 grid place-items-center text-muted">−</span>
        <span className="w-10 text-center text-sm tabular-nums">1</span>
        <span className="h-10 w-10 grid place-items-center text-muted">+</span>
      </div>
      <Button type="button" size="pill">
        Add to cart
      </Button>
    </div>
  );
}

export default function PreviewProductPage() {
  const sp = useSearchParams();
  const initial = useMemo(() => readFromSearchParams(sp), [sp]);
  const [product, setProduct] = useState<PreviewProduct>(initial.product);
  const [view, setView] = useState<View>(initial.view);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const data = e.data;
      if (!data || typeof data !== "object" || data.type !== "preview-update") return;
      if (data.product && typeof data.product === "object") {
        setProduct({
          name: String(data.product.name ?? ""),
          description: String(data.product.description ?? ""),
          price: Number(data.product.price) || 0,
          stock: Number(data.product.stock) || 0,
          imageUrl: data.product.imageUrl || null,
          sku: data.product.sku || null,
        });
      }
      if (data.view === "card" || data.view === "detail") {
        setView(data.view);
      }
    }
    window.addEventListener("message", onMessage);
    // Tell the parent we're listening so it can flush its current state.
    if (window.parent !== window) {
      window.parent.postMessage({ type: "preview-ready" }, "*");
    }
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (view === "detail") {
    return (
      <ProductDetailView product={product} actionSlot={<StubAddToCart stock={product.stock} />} />
    );
  }

  return (
    <div className="mx-auto max-w-sm p-6">
      <ProductCardView product={product} />
    </div>
  );
}
