import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { fetchAllProductSlugs, getStore } from "@/lib/api";
import { isBareHost, isStoreHost } from "@/lib/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const host = h.get("host") ?? "localhost";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const origin = `${proto}://${host}`;

  if (isBareHost(host)) {
    return [{ url: origin, changeFrequency: "weekly", priority: 1 }];
  }

  if (!isStoreHost(host)) return [];

  // Bail before the products call if the store isn't reachable —
  // no point enumerating products for a tenant that doesn't exist.
  try {
    await getStore();
  } catch {
    return [];
  }

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
  } catch {
    return base;
  }
}
