"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => (
    <select
      ref={ref}
      aria-invalid={error || undefined}
      className={cn(
        "block w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand disabled:opacity-50",
        error ? "border-red-500 focus:border-red-500" : "border-border",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";
