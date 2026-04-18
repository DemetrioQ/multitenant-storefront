// Runs once at server startup (both dev and prod). Perfect spot to flip
// TLS verification off when the dev saas-api is using ASP.NET Core's
// self-signed certificate, because Next's rewrite proxy evaluates TLS
// before .env.local is fully loaded into the Node runtime.
export function register() {
  if (process.env.NODE_ENV === "production") return;

  const backend = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!backend?.startsWith("https://")) return;

  if (process.env.NODE_TLS_REJECT_UNAUTHORIZED !== "0") {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    // eslint-disable-next-line no-console
    console.warn(
      `[saas-storefront] TLS verification disabled for dev HTTPS backend at ${backend}. Trust the cert with \`dotnet dev-certs https --trust\` to re-enable.`,
    );
  }
}
