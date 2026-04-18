import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { HOST_SUFFIXES, extractSlugFromHost } from "./lib/config";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host");
  if (!host) return NextResponse.next();

  const hostname = host.split(":")[0].toLowerCase();
  const matchedSuffix = HOST_SUFFIXES.find((s) => hostname.endsWith(s));

  if (!matchedSuffix) {
    return NextResponse.rewrite(new URL("/store-not-found", request.url));
  }

  const slug = extractSlugFromHost(host);
  if (!slug) {
    return NextResponse.rewrite(new URL("/store-not-found", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
