import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.shop.lvh.me",
    "*.shop.demetrioq.com",
  ],
  // Proxy /api/v1/* to the backend when NEXT_PUBLIC_API_URL is set so the
  // browser always talks to same-origin (avoids CORS on POST register/login
  // etc). In prod with same-origin backend this var is empty and the edge
  // router (Caddy / ingress) handles /api routing.
  async rewrites() {
    const backend = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "");
    if (!backend) return [];
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backend}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
