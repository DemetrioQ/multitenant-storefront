import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "") ?? "";

// Node doesn't read the Windows cert store by default, so even after
// `dotnet dev-certs https --trust` it'll reject self-signed certs from fetch.
// Opt out of verification in dev when pointing at an https backend.
if (
  process.env.NODE_ENV !== "production" &&
  BACKEND_URL.startsWith("https://") &&
  process.env.NODE_TLS_REJECT_UNAUTHORIZED !== "0"
) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

// Strip these from incoming request headers — Host is derived from the target
// URL, content-length is recomputed by fetch, and Next-* are internal.
const FORWARD_SKIP = new Set([
  "host",
  "content-length",
  "connection",
  "keep-alive",
  "transfer-encoding",
  "upgrade",
]);

// Strip these from outgoing response headers — would otherwise confuse the
// browser or the edge.
const RESPONSE_SKIP = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
  "keep-alive",
]);

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { title: "Backend not configured", detail: "NEXT_PUBLIC_API_URL is empty" },
      { status: 500 },
    );
  }

  const { path } = await params;
  const target = new URL(`${BACKEND_URL}/api/v1/${path.join("/")}`);
  req.nextUrl.searchParams.forEach((v, k) => target.searchParams.set(k, v));

  const forwardHeaders = new Headers();
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (FORWARD_SKIP.has(lower)) return;
    if (lower.startsWith("next-")) return;
    forwardHeaders.set(key, value);
  });

  const method = req.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";
  const body = hasBody ? await req.arrayBuffer() : undefined;

  let upstream: Response;
  try {
    upstream = await fetch(target.toString(), {
      method,
      headers: forwardHeaders,
      body: body && body.byteLength > 0 ? body : undefined,
      redirect: "manual",
    });
  } catch (err) {
    const cause =
      err instanceof Error && "cause" in err && err.cause instanceof Error
        ? err.cause.message
        : undefined;
    return NextResponse.json(
      {
        title: "Backend unreachable",
        detail: err instanceof Error ? err.message : "network error",
        ...(cause ? { cause } : {}),
      },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (RESPONSE_SKIP.has(lower)) return;
    if (lower === "set-cookie") return;
    responseHeaders.set(key, value);
  });

  // Preserve multiple Set-Cookie headers individually — some runtimes
  // merge them when iterated, which breaks browser cookie jars.
  const setCookies = upstream.headers.getSetCookie?.() ?? [];
  for (const cookie of setCookies) responseHeaders.append("set-cookie", cookie);

  const status = upstream.status;
  const noBody = status === 204 || status === 304 || method === "HEAD";
  const responseBody = noBody ? null : await upstream.arrayBuffer();

  return new NextResponse(responseBody, {
    status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
export const OPTIONS = handler;
export const HEAD = handler;

export const dynamic = "force-dynamic";
