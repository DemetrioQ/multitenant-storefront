import { headers } from "next/headers";
import { cache } from "react";
import { extractSlugFromHost } from "./config";
import {
  ApiError,
  type ApiProblemDetails,
  type ApiProduct,
  type ApiProductList,
  type ApiStore,
  type StoreSummaryList,
} from "./types";

const STOREFRONT_PREFIX = "/api/v1/storefront";
const PLATFORM_PREFIX = "/api/v1";

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

function buildUrl(
  base: string,
  path: string,
  slug: string | null,
  override: boolean,
  extra?: Record<string, string | number>,
  prefix: string = STOREFRONT_PREFIX,
): string {
  const url = new URL(`${base}${prefix}${path}`);
  if (override && slug && prefix === STOREFRONT_PREFIX) url.searchParams.set("storeSlug", slug);
  if (extra) {
    for (const [k, v] of Object.entries(extra)) url.searchParams.set(k, String(v));
  }
  return url.toString();
}

const DEFAULT_TIMEOUT_MS = 5000;
const IS_DEV = process.env.NODE_ENV !== "production";

async function request<T>(
  path: string,
  opts: {
    revalidate?: number;
    extra?: Record<string, string | number>;
    timeoutMs?: number;
    prefix?: string;
  } = {},
): Promise<T> {
  const { url, slug, override } = await resolveBase();
  const full = buildUrl(url, path, slug, override, opts.extra, opts.prefix);
  let res: Response;
  try {
    res = await fetch(full, {
      headers: { Accept: "application/json" },
      cache: IS_DEV ? "no-store" : undefined,
      next: IS_DEV ? undefined : { revalidate: opts.revalidate ?? 60 },
      signal: AbortSignal.timeout(opts.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    });
  } catch (err) {
    const cause =
      err instanceof Error && "cause" in err && err.cause instanceof Error
        ? ` (${err.cause.message})`
        : "";
    const message = err instanceof Error ? err.message : "Network error";
    throw new ApiError(0, `${message}${cause}`);
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

// Success path: React cache() dedupes within a single render pass
// (generateMetadata + layout + page share one call). No cross-render caching,
// so dashboard edits to store info show up on the very next page load.
const fetchStoreMemoized = cache(async (): Promise<ApiStore> => {
  return request<ApiStore>("/store", { revalidate: 300 });
});

// Error path: a known-bad subdomain would otherwise hit the backend on every
// prefetch + every click. We cache rejected Promises for 30s keyed by tenant
// slug so the backend stops getting pinged once we know the store is missing.
type StoreErrorEntry = { promise: Promise<ApiStore>; expires: number };
const STORE_ERROR_TTL_MS = 30_000;
const storeErrorCache = new Map<string, StoreErrorEntry>();

export async function getStore(): Promise<ApiStore> {
  const h = await headers();
  const slug = extractSlugFromHost(h.get("host")) ?? "__no_slug__";

  const cachedError = storeErrorCache.get(slug);
  if (cachedError && cachedError.expires > Date.now()) return cachedError.promise;

  const promise = fetchStoreMemoized();
  promise.catch(() => {
    const entry: StoreErrorEntry = { promise, expires: Date.now() + STORE_ERROR_TTL_MS };
    storeErrorCache.set(slug, entry);
    setTimeout(() => {
      if (storeErrorCache.get(slug) === entry) storeErrorCache.delete(slug);
    }, STORE_ERROR_TTL_MS + 500).unref?.();
  });
  return promise;
}

export function listProducts(
  params: { page?: number; pageSize?: number } = {},
): Promise<ApiProductList> {
  const extra: Record<string, string | number> = {};
  if (params.page) extra.page = params.page;
  if (params.pageSize) extra.pageSize = params.pageSize;
  return request<ApiProductList>("/products", { revalidate: 60, extra });
}

export function getProduct(slug: string): Promise<ApiProduct> {
  return request<ApiProduct>(`/products/${encodeURIComponent(slug)}`, { revalidate: 60 });
}

export function listStores(
  params: { page?: number; pageSize?: number } = {},
): Promise<StoreSummaryList> {
  const extra: Record<string, string | number> = {};
  if (params.page) extra.page = params.page;
  if (params.pageSize) extra.pageSize = params.pageSize;
  return request<StoreSummaryList>("/stores", { revalidate: 60, extra, prefix: PLATFORM_PREFIX });
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
