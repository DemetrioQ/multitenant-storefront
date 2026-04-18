import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { fetchAllProductSlugs } from "@/lib/api";
import { ApiError } from "@/lib/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const host = h.get("host") ?? "localhost";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const origin = `${proto}://${host}`;

  const base: MetadataRoute.Sitemap = [
    { url: origin, changeFrequency: "weekly", priority: 1 },
    { url: `${origin}/products`, changeFrequency: "daily", priority: 0.9 },
  ];

  try {
    const products = await fetchAllProductSlugs();
    return [
      ...base,
      ...products.map((p) => ({
        url: `${origin}/products/${p.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return [];
    return base;
  }
}
