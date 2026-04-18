import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { isKnownSuffix } from "@/lib/config";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const origin = host ? `${proto}://${host}` : undefined;

  if (!isKnownSuffix(host)) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: origin ? `${origin}/sitemap.xml` : undefined,
  };
}
