"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

function formatRemaining(target: Date): string {
  const ms = target.getTime() - Date.now();
  if (ms <= 0) return "expired";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `<1m`;
}

export function DemoBanner() {
  const { customer } = useAuth();
  const [, force] = useState(0);

  const expiresAtDate = useMemo(() => {
    const v = customer?.demo_expires_at;
    return v ? new Date(v) : null;
  }, [customer?.demo_expires_at]);

  // Re-render once a minute so the countdown drifts forward.
  useEffect(() => {
    if (!customer?.demo) return;
    const id = setInterval(() => force((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, [customer?.demo]);

  if (customer?.demo !== "true") return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-800 dark:text-amber-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-2 text-sm flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-medium">Demo shopper</span>
        <span className="text-amber-700/80 dark:text-amber-200/80">
          You&apos;re browsing as a temporary test customer — orders aren&apos;t real.
        </span>
        {expiresAtDate && (
          <span className="ml-auto text-xs text-amber-700/70 dark:text-amber-200/70">
            Session resets in {formatRemaining(expiresAtDate)}
          </span>
        )}
      </div>
    </div>
  );
}
