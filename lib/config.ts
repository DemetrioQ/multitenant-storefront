export const HOST_SUFFIXES = [".shop.demetrioq.com", ".shop.lvh.me"] as const;

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,62}[a-z0-9]$|^[a-z0-9]$/;

export function extractSlugFromHost(host: string | null | undefined): string | null {
  if (!host) return null;
  const hostname = host.split(":")[0].toLowerCase();
  for (const suffix of HOST_SUFFIXES) {
    if (hostname.endsWith(suffix)) {
      const slug = hostname.slice(0, -suffix.length);
      if (SLUG_PATTERN.test(slug)) return slug;
      return null;
    }
  }
  return null;
}

export function isKnownSuffix(host: string | null | undefined): boolean {
  if (!host) return false;
  const hostname = host.split(":")[0].toLowerCase();
  return HOST_SUFFIXES.some((s) => hostname.endsWith(s));
}
