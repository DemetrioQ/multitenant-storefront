"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

type ToastVariant = "success" | "error" | "info";

interface ToastItem {
  id: number;
  variant: ToastVariant;
  message: string;
}

interface ToastContextType {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  error: "border-red-500/30 bg-red-500/15 text-red-700 dark:text-red-300",
  info: "border-border bg-background text-foreground",
};

const ICON: Record<ToastVariant, string> = {
  success: "✓",
  error: "!",
  info: "ⓘ",
};

const TOAST_DURATION = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const toast = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = ++idRef.current;
    setItems((prev) => [...prev, { id, variant, message }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role={t.variant === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-md text-sm backdrop-blur-sm",
              VARIANT_STYLES[t.variant],
            )}
          >
            <span aria-hidden="true" className="font-mono">
              {ICON[t.variant]}
            </span>
            <p className="flex-1 min-w-0 break-words">{t.message}</p>
            <button
              type="button"
              onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
              aria-label="Dismiss"
              className="flex-shrink-0 opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

/** Fire a toast once when `message` becomes truthy. */
export function useToastOnce(message: string | null, variant: ToastVariant = "info") {
  const { toast } = useToast();
  useEffect(() => {
    if (message) toast(message, variant);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);
}
