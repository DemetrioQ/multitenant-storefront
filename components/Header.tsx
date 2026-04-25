"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui";

type Props = {
  storeName: string;
};

function CartBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1.5 -right-2 inline-flex items-center justify-center rounded-full bg-brand text-brand-contrast text-[10px] font-medium min-w-[18px] h-[18px] px-1">
      {count}
    </span>
  );
}

export function Header({ storeName }: Props) {
  const { status, customer, logout } = useAuth();
  const { totalItems } = useCart();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [mobileOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    setMobileOpen(false);
    await logout();
    router.push("/");
    router.refresh();
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-30 bg-background border-b border-border">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 gap-3">
        <Link href="/" className="text-base sm:text-lg font-semibold tracking-tight truncate">
          {storeName}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/products" className="hover:underline">
            Products
          </Link>
          {status === "authenticated" && (
            <Link
              href="/cart"
              className="relative hover:underline"
              aria-label={`Cart, ${totalItems} items`}
            >
              Cart
              <CartBadge count={totalItems} />
            </Link>
          )}
          {status === "loading" && <span className="text-muted text-xs">…</span>}
          {status === "anonymous" && (
            <>
              <Link href="/login" className="hover:underline">
                Sign in
              </Link>
              <Button asChild size="pill" className="text-xs px-4 py-1.5">
                <Link href="/register">Create account</Link>
              </Button>
            </>
          )}
          {status === "authenticated" && customer && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs hover:border-brand"
              >
                <span className="truncate max-w-[140px]">{customer.email}</span>
                <span aria-hidden className="text-muted">
                  ▾
                </span>
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-background shadow-lg text-sm overflow-hidden z-50"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <Link
                    href="/orders"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 hover:bg-border"
                  >
                    My orders
                  </Link>
                  <Link
                    href="/account/addresses"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 hover:bg-border"
                  >
                    Saved addresses
                  </Link>
                  <Link
                    href="/cart"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 hover:bg-border"
                  >
                    Cart
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-border border-t border-border"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Mobile right side: cart icon + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          {status === "authenticated" && (
            <Link href="/cart" className="relative p-2" aria-label={`Cart, ${totalItems} items`}>
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <CartBadge count={totalItems} />
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="p-2"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 top-14 bg-black/30 md:hidden z-30"
            onClick={closeMobile}
            aria-hidden="true"
          />
          <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg z-40">
            <nav className="flex flex-col text-sm">
              <Link href="/" onClick={closeMobile} className="px-5 py-3 border-b border-border">
                Home
              </Link>
              <Link
                href="/products"
                onClick={closeMobile}
                className="px-5 py-3 border-b border-border"
              >
                Products
              </Link>
              {status === "authenticated" && (
                <>
                  <Link
                    href="/cart"
                    onClick={closeMobile}
                    className="px-5 py-3 border-b border-border flex items-center justify-between"
                  >
                    <span>Cart</span>
                    {totalItems > 0 && (
                      <span className="rounded-full bg-brand text-brand-contrast text-[10px] font-medium min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/orders"
                    onClick={closeMobile}
                    className="px-5 py-3 border-b border-border"
                  >
                    My orders
                  </Link>
                  <Link
                    href="/account/addresses"
                    onClick={closeMobile}
                    className="px-5 py-3 border-b border-border"
                  >
                    Saved addresses
                  </Link>
                  {customer && (
                    <div className="px-5 py-2 text-xs text-muted truncate">{customer.email}</div>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-left px-5 py-3 border-t border-border"
                  >
                    Sign out
                  </button>
                </>
              )}
              {status === "anonymous" && (
                <>
                  <Link
                    href="/login"
                    onClick={closeMobile}
                    className="px-5 py-3 border-b border-border"
                  >
                    Sign in
                  </Link>
                  <Link href="/register" onClick={closeMobile} className="px-5 py-3">
                    Create account
                  </Link>
                </>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
