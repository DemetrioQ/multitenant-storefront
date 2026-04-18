import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { getStore } from "@/lib/api";
import { extractSlugFromHost } from "@/lib/config";
import { ApiError } from "@/lib/types";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { StoreProvider } from "@/contexts/StoreContext";
import { Header } from "@/components/Header";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

async function loadStore() {
  const h = await headers();
  if (!extractSlugFromHost(h.get("host"))) return null;
  try {
    return await getStore();
  } catch (err) {
    if (err instanceof ApiError) return null;
    throw err;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const store = await loadStore();
  if (!store) {
    return {
      title: "Store not found",
      robots: { index: false, follow: false },
    };
  }
  return {
    title: { template: `%s · ${store.name}`, default: store.name },
    description: `${store.name} storefront`,
    openGraph: {
      siteName: store.name,
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const store = await loadStore();
  const storeName = store?.name ?? "Store";

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <StoreProvider store={store}>
          <AuthProvider>
            <CartProvider>
              <Header storeName={storeName} />
              <main className="flex-1">{children}</main>
              <footer className="border-t border-[var(--border)] mt-16">
                <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-[var(--muted)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span>© {new Date().getFullYear()} {storeName}</span>
                  {store && (
                    <div className="flex gap-4">
                      {store.supportEmail && (
                        <a href={`mailto:${store.supportEmail}`} className="hover:underline">
                          {store.supportEmail}
                        </a>
                      )}
                      {store.websiteUrl && (
                        <a href={store.websiteUrl} target="_blank" rel="noreferrer" className="hover:underline">
                          Website
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </footer>
            </CartProvider>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
