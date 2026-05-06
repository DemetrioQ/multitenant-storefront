import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Minimal root layout — applies to ALL routes, including chromeless ones
// like /preview/*. The full storefront chrome (Header/Footer/providers)
// lives in app/(storefront)/layout.tsx, scoped to that route group.

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SaaS API Portfolio",
  description: "Multi-tenant Shopify-for-X portfolio project by Demetrio Quiñones.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
