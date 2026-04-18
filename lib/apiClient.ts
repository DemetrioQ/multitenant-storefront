"use client";

import { getAuthToken, setAuthToken } from "./authToken";
import { extractSlugFromHost } from "./config";
import { ApiError, type ApiProblemDetails } from "./types";

const STOREFRONT_PREFIX = "/api/v1/storefront";
const DEFAULT_TIMEOUT_MS = 10000;

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  auth?: boolean;
  timeoutMs?: number;
  signal?: AbortSignal;
};

function buildUrl(path: string, query?: Record<string, string | number | undefined>): string {
  // Always same-origin from the browser. next.config.ts rewrites /api/v1/* to
  // the backend when NEXT_PUBLIC_API_URL is set, so CORS is out of the picture.
  const full = new URL(`${STOREFRONT_PREFIX}${path}`, window.location.origin);

  // Dev fallback: when proxying to a different-origin backend, the rewrite
  // loses the original tenant Host header — pass the slug explicitly.
  const usingProxy = !!process.env.NEXT_PUBLIC_API_URL?.trim();
  if (usingProxy) {
    const slug = extractSlugFromHost(window.location.host);
    if (slug) full.searchParams.set("storeSlug", slug);
  }

  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") full.searchParams.set(k, String(v));
    }
  }
  return full.toString();
}

async function parseError(res: Response): Promise<ApiError> {
  let problem: ApiProblemDetails | undefined;
  try {
    problem = (await res.json()) as ApiProblemDetails;
  } catch {
    // non-JSON response
  }
  return new ApiError(res.status, problem?.title ?? `Request failed: ${res.status}`, problem);
}

async function singleFetch(url: string, init: RequestInit, opts: RequestOptions): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (opts.body !== undefined) headers.set("Content-Type", "application/json");
  if (opts.auth) {
    const token = getAuthToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(url, {
    ...init,
    headers,
    credentials: "include",
    signal: init.signal ?? AbortSignal.timeout(opts.timeoutMs ?? DEFAULT_TIMEOUT_MS),
  });
}

async function tryRefresh(): Promise<string | null> {
  try {
    const res = await fetch(buildUrl("/auth/refresh"), {
      method: "POST",
      credentials: "include",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { jwtToken?: string };
    return data.jwtToken ?? null;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const url = buildUrl(path, opts.query);
  const init: RequestInit = {
    method: opts.method ?? "GET",
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  };

  let res: Response;
  try {
    res = await singleFetch(url, init, opts);
  } catch (err) {
    const cause = err instanceof Error && "cause" in err && err.cause instanceof Error ? ` (${err.cause.message})` : "";
    const message = err instanceof Error ? err.message : "Network error";
    throw new ApiError(0, `${message}${cause}`);
  }

  if (res.status === 401 && opts.auth && getAuthToken()) {
    const newToken = await tryRefresh();
    if (newToken) {
      setAuthToken(newToken);
      res = await singleFetch(url, init, opts);
    } else {
      setAuthToken(null);
    }
  }

  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
