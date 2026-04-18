import { headers } from "next/headers";
import { extractSlugFromHost } from "./config";
import {
  ApiError,
  type ApiProblemDetails,
  type ApiProduct,
  type ApiProductList,
  type ApiStore,
} from "./types";

const STOREFRONT_PREFIX = "/api/v1/storefront";

async function resolveBase(): Promise<{ url: string; slug: string | null; override: boolean }> {
  const h = await headers();
  const host = h.get("host");
  const slug = extractSlugFromHost(host);
  const override = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (override) {
    return { url: override.replace(/\/$/, ""), slug, override: true };
  }
  const proto = h.get("x-forwarded-proto") ?? "http";
  return { url: `${proto}://${host}`, slug, override: false };
}

function buildUrl(base: string, path: string, slug: string | null, override: boolean, extra?: Record<string, string | number>): string {
  const url = new URL(`${base}${STOREFRONT_PREFIX}${path}`);
  if (override && slug) url.searchParams.set("storeSlug", slug);
  if (extra) {
    for (const [k, v] of Object.entries(extra)) url.searchParams.set(k, String(v));
  }
  return url.toString();
}

const DEFAULT_TIMEOUT_MS = 5000;

async function request<T>(path: string, opts: { revalidate?: number; extra?: Record<string, string | number>; timeoutMs?: number } = {}): Promise<T> {
  const { url, slug, override } = await resolveBase();
  const full = buildUrl(url, path, slug, override, opts.extra);
  let res: Response;
  try {
    res = await fetch(full, {
      headers: { Accept: "application/json" },
      next: { revalidate: opts.revalidate ?? 60 },
      signal: AbortSignal.timeout(opts.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    });
  } catch (err) {
    throw new ApiError(0, err instanceof Error ? err.message : "Network error");
  }
  if (!res.ok) {
    let problem: ApiProblemDetails | undefined;
    try {
      problem = (await res.json()) as ApiProblemDetails;
    } catch {
      // non-JSON error
    }
    throw new ApiError(res.status, problem?.title ?? `Request failed: ${res.status}`, problem);
  }
  return (await res.json()) as T;
}

export function getStore(): Promise<ApiStore> {
  return request<ApiStore>("/store", { revalidate: 300 });
}

export function listProducts(params: { page?: number; pageSize?: number } = {}): Promise<ApiProductList> {
  const extra: Record<string, string | number> = {};
  if (params.page) extra.page = params.page;
  if (params.pageSize) extra.pageSize = params.pageSize;
  return request<ApiProductList>("/products", { revalidate: 60, extra });
}

export function getProduct(slug: string): Promise<ApiProduct> {
  return request<ApiProduct>(`/products/${encodeURIComponent(slug)}`, { revalidate: 60 });
}

export async function fetchAllProductSlugs(pageSize = 100): Promise<ApiProduct[]> {
  const all: ApiProduct[] = [];
  let page = 1;
  while (true) {
    const res = await listProducts({ page, pageSize });
    all.push(...res.items);
    if (all.length >= res.totalCount || res.items.length === 0) break;
    page += 1;
    if (page > 50) break;
  }
  return all;
}
