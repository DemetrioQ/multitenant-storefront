"use client";

import { useEffect, useState } from "react";

function formatRemaining(target: Date): string {
  const ms = target.getTime() - Date.now();
  if (ms <= 0) return "expired";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `<1m`;
}

export function StoreCardCountdown({ expiresAt }: { expiresAt: string }) {
  const target = new Date(expiresAt);
  const [label, setLabel] = useState(() => formatRemaining(target));

  useEffect(() => {
    const id = setInterval(() => setLabel(formatRemaining(target)), 30_000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return <span>{label}</span>;
}
