import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.shop.lvh.me",
    "*.shop.demetrioq.com",
  ],
  // Browser → backend proxy is handled by app/api/v1/[...path]/route.ts,
  // not here, so we get full control over TLS, Host header stripping,
  // and Set-Cookie splitting. Rewrites() removed for that reason.
};

export default nextConfig;
