import type { CustomerClaims } from "./types";

function base64UrlDecode(segment: string): string {
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/").padEnd(segment.length + ((4 - (segment.length % 4)) % 4), "=");
  if (typeof atob === "function") return atob(padded);
  return Buffer.from(padded, "base64").toString("binary");
}

export function decodeJwt(token: string): CustomerClaims | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = base64UrlDecode(parts[1]);
    const decoded = decodeURIComponent(
      Array.from(payload)
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(decoded) as CustomerClaims;
  } catch {
    return null;
  }
}

export function jwtExpiresInMs(token: string): number | null {
  const claims = decodeJwt(token);
  if (!claims?.exp) return null;
  return claims.exp * 1000 - Date.now();
}
