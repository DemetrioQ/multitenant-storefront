import { headers } from "next/headers";
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

async function request<T>(path: string, opts: { revalidate?: number; extra?: Record<string, string | number>; timeoutMs?: number; prefix?: string } = {}): Promise<T> {
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
    const cause = err instanceof Error && "cause" in err && err.cause instanceof Error ? ` (${err.cause.message})` : "";
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

// Process-wide TTL cache for /store. Next's Link prefetch + real navigation
// each do a separate SSR render, and Next's data cache doesn't hold error
// responses — so an invalid tenant would hit /store twice every click.
// Asymmetric TTL: successes stay cached just long enough to absorb
// prefetch→click (2s, below human reaction time for dashboard edit → F5, so
// edits still feel instant); failures stay cached longer (30s) so a
// known-bad subdomain doesn't keep hitting the backend.
type StoreCacheEntry = { promise: Promise<ApiStore>; expires: number };
const STORE_SUCCESS_TTL_MS = 2_000;
const STORE_ERROR_TTL_MS = 30_000;
const storeCache = new Map<string, StoreCacheEntry>();

export async function getStore(): Promise<ApiStore> {
  const h = await headers();
  const slug = extractSlugFromHost(h.get("host")) ?? "__no_slug__";
  const now = Date.now();
  const existing = storeCache.get(slug);
  if (existing && existing.expires > now) return existing.promise;

  const promise = request<ApiStore>("/store", { revalidate: 300 });
  const entry: StoreCacheEntry = { promise, expires: now + STORE_SUCCESS_TTL_MS };
  storeCache.set(slug, entry);
  promise.catch(() => {
    // A rejected Promise is still cached; extend its lifetime so we don't
    // hammer the backend for a known-bad store while the user clicks around.
    entry.expires = Date.now() + STORE_ERROR_TTL_MS;
    setTimeout(() => {
      if (storeCache.get(slug) === entry && entry.expires <= Date.now()) {
        storeCache.delete(slug);
      }
    }, STORE_ERROR_TTL_MS + 500).unref?.();
  });
  setTimeout(() => {
    if (storeCache.get(slug) === entry && entry.expires <= Date.now()) {
      storeCache.delete(slug);
    }
  }, STORE_SUCCESS_TTL_MS + 500).unref?.();
  return promise;
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

export function listStores(params: { page?: number; pageSize?: number } = {}): Promise<StoreSummaryList> {
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
