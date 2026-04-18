import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { getStore } from "@/lib/api";
import { extractSlugFromHost, getBareHostUrl, isBareHost } from "@/lib/config";
import { ApiError, type ApiStore } from "@/lib/types";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { StoreProvider } from "@/contexts/StoreContext";
import { Header } from "@/components/Header";
import { LandingHeader } from "@/components/LandingHeader";
import { LandingFooter } from "@/components/LandingFooter";
import { StoreUnavailableScreen } from "@/components/StoreUnavailableScreen";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

type StoreState =
  | { kind: "ok"; store: ApiStore }
  | { kind: "notfound" }
  | { kind: "unavailable"; message: string }
  | { kind: "not-a-store" };

async function loadStoreState(): Promise<StoreState> {
  const h = await headers();
  if (!extractSlugFromHost(h.get("host"))) return { kind: "not-a-store" };
  try {
    const store = await getStore();
    return { kind: "ok", store };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return { kind: "notfound" };
    const message = err instanceof Error ? err.message : "Backend unreachable";
    return { kind: "unavailable", message };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const host = h.get("host");

  if (isBareHost(host)) {
    return {
      title: "SaaS API Portfolio",
      description: "Multi-tenant Shopify-for-X portfolio project by Demetrio Quiñones.",
      robots: { index: true, follow: true },
    };
  }

  const state = await loadStoreState();
  if (state.kind === "ok") {
    return {
      title: { template: `%s · ${state.store.name}`, default: state.store.name },
      description: `${state.store.name} storefront`,
      openGraph: { siteName: state.store.name, type: "website" },
      robots: { index: true, follow: true },
    };
  }
  if (state.kind === "notfound") {
    return { title: "Store not available", robots: { index: false, follow: false } };
  }
  if (state.kind === "unavailable") {
    return { title: "Store temporarily unavailable", robots: { index: false, follow: false } };
  }
  return { title: "Store not found", robots: { index: false, follow: false } };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const host = h.get("host");
  const bare = isBareHost(host);
  const proto = h.get("x-forwarded-proto") ?? (process.env.NODE_ENV === "production" ? "https:" : "http:");
  const bareHostUrl = getBareHostUrl(proto.endsWith(":") ? proto : `${proto}:`);

  const htmlClass = `${geistSans.variable} ${geistMono.variable} h-full antialiased`;

  if (bare) {
    return (
      <html lang="en" className={htmlClass}>
        <body className="min-h-full flex flex-col">
          <LandingHeader />
          <main className="flex-1">{children}</main>
          <LandingFooter />
        </body>
      </html>
    );
  }

  const state = await loadStoreState();

  if (state.kind === "notfound" || state.kind === "unavailable") {
    const mode = state.kind === "notfound" ? "notfound" : "unavailable";
    const message = state.kind === "unavailable" ? state.message : undefined;
    return (
      <html lang="en" className={htmlClass}>
        <body className="min-h-full flex flex-col">
          <header className="border-b border-[var(--border)]">
            <div className="mx-auto max-w-6xl px-6 py-4">
              <a href={bareHostUrl} className="text-lg font-semibold tracking-tight hover:underline">
                SaaS API Portfolio
              </a>
            </div>
          </header>
          <main className="flex-1 flex">
            <StoreUnavailableScreen mode={mode} message={message} bareHostUrl={bareHostUrl} />
          </main>
        </body>
      </html>
    );
  }

  const store = state.kind === "ok" ? state.store : null;
  const storeName = store?.name ?? "Store";

  return (
    <html lang="en" className={htmlClass}>
      <body className="min-h-full flex flex-col">
        <StoreProvider store={store}>
          <AuthProvider>
            <CartProvider>
              <Header storeName={storeName} />
              <main className="flex-1">{children}</main>
              <footer className="border-t border-[var(--border)] mt-16">
                <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-[var(--muted)] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <span>© {new Date().getFullYear()} {storeName}</span>
                  <div className="flex flex-wrap gap-4 items-center">
                    {store?.supportEmail && (
                      <a href={`mailto:${store.supportEmail}`} className="hover:underline">
                        {store.supportEmail}
                      </a>
                    )}
                    {store?.websiteUrl && (
                      <a href={store.websiteUrl} target="_blank" rel="noreferrer" className="hover:underline">
                        Website
                      </a>
                    )}
                    <a
                      href={bareHostUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[var(--muted)]/80 hover:underline"
                    >
                      Powered by SaaS API Portfolio
                    </a>
                  </div>
                </div>
              </footer>
            </CartProvider>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
