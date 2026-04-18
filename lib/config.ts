const DEFAULT_SUFFIX_PROD = ".shop.demetrioq.com";
const DEFAULT_SUFFIX_DEV = ".shop.lvh.me";

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,62}[a-z0-9]$|^[a-z0-9]$/;

export function getHostSuffix(): string {
  const raw = process.env.NEXT_PUBLIC_STOREFRONT_HOST_SUFFIX?.trim();
  if (raw) return raw.startsWith(".") ? raw : `.${raw}`;
  return process.env.NODE_ENV === "production" ? DEFAULT_SUFFIX_PROD : DEFAULT_SUFFIX_DEV;
}

export function getDashboardUrl(): string {
  const raw = process.env.NEXT_PUBLIC_DASHBOARD_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return process.env.NODE_ENV === "production"
    ? "https://saas.demetrioq.com"
    : "http://localhost:5173";
}

function normalizeHost(host: string | null | undefined): string | null {
  if (!host) return null;
  return host.split(":")[0].toLowerCase();
}

export function isBareHost(host: string | null | undefined): boolean {
  const hostname = normalizeHost(host);
  if (!hostname) return false;
  const suffix = getHostSuffix();
  const bare = suffix.replace(/^\./, "");
  return hostname === bare;
}

export function isStoreHost(host: string | null | undefined): boolean {
  const hostname = normalizeHost(host);
  if (!hostname) return false;
  const suffix = getHostSuffix();
  if (!hostname.endsWith(suffix)) return false;
  const slug = hostname.slice(0, -suffix.length);
  return SLUG_PATTERN.test(slug);
}

export function isKnownSuffix(host: string | null | undefined): boolean {
  return isBareHost(host) || isStoreHost(host);
}

export function extractSlugFromHost(host: string | null | undefined): string | null {
  const hostname = normalizeHost(host);
  if (!hostname) return null;
  const suffix = getHostSuffix();
  if (!hostname.endsWith(suffix)) return null;
  const slug = hostname.slice(0, -suffix.length);
  if (SLUG_PATTERN.test(slug)) return slug;
  return null;
}

export function getBareHostUrl(protocol: string): string {
  const suffix = getHostSuffix();
  const bare = suffix.replace(/^\./, "");
  return `${protocol}//${bare}`;
}
