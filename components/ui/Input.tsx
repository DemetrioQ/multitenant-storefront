"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Red border + ring when truthy. */
  error?: boolean;
}

const inputBase =
  "block w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-brand disabled:opacity-50";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={error || undefined}
      className={cn(
        inputBase,
        error ? "border-red-500 focus:border-red-500" : "border-border",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
