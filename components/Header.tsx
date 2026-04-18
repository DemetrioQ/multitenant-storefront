"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

type Props = {
  storeName: string;
};

export function Header({ storeName }: Props) {
  const { status, customer, logout } = useAuth();
  const { totalItems } = useCart();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="border-b border-[var(--border)]">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4 gap-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {storeName}
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/products" className="hover:underline">Products</Link>
          {status === "authenticated" && (
            <Link href="/cart" className="relative hover:underline" aria-label={`Cart, ${totalItems} items`}>
              Cart
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-4 inline-flex items-center justify-center rounded-full bg-[var(--brand)] text-[var(--brand-contrast)] text-[10px] font-medium min-w-[18px] h-[18px] px-1">
                  {totalItems}
                </span>
              )}
            </Link>
          )}
          {status === "loading" && (
            <span className="text-[var(--muted)] text-xs">…</span>
          )}
          {status === "anonymous" && (
            <>
              <Link href="/login" className="hover:underline">Sign in</Link>
              <Link
                href="/register"
                className="inline-flex items-center rounded-full bg-[var(--brand)] px-4 py-1.5 text-xs font-medium text-[var(--brand-contrast)] hover:opacity-90"
              >
                Create account
              </Link>
            </>
          )}
          {status === "authenticated" && customer && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs hover:border-[var(--brand)]"
              >
                <span className="truncate max-w-[140px]">{customer.email}</span>
                <span aria-hidden className="text-[var(--muted)]">▾</span>
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-md border border-[var(--border)] bg-[var(--background)] shadow-lg text-sm overflow-hidden"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <Link
                    href="/orders"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 hover:bg-[var(--border)]"
                  >
                    My orders
                  </Link>
                  <Link
                    href="/cart"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 hover:bg-[var(--border)]"
                  >
                    Cart
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-[var(--border)] border-t border-[var(--border)]"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
