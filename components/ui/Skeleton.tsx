import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Animated placeholder block. Use to reserve space during loading. */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-md bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)]",
        className,
      )}
      {...props}
    />
  );
}
