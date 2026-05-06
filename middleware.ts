import { NextResponse, type NextRequest } from "next/server";

// Exposes the request pathname to server components via an `x-pathname`
// request header. The root layout reads this to skip the storefront chrome
// (Header/Footer/CartProvider/etc.) on /preview routes.
export function middleware(req: NextRequest) {
  const headers = new Headers(req.headers);
  headers.set("x-pathname", req.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/|favicon\\.ico).*)"],
};
