import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isBareHost, isStoreHost } from "./lib/config";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host");
  const { pathname } = request.nextUrl;

  if (isBareHost(host)) {
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/landing", request.url));
    }
    if (pathname === "/landing" || pathname.startsWith("/landing/")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isStoreHost(host)) {
    if (pathname === "/landing" || pathname.startsWith("/landing/")) {
      return NextResponse.rewrite(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL("/store-not-found", request.url));
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
