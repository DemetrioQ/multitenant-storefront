"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-40 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default:
          "border border-border text-foreground hover:bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)]",
        ghost: "text-foreground hover:bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)]",
        destructive: "text-foreground hover:text-red-600 hover:bg-red-500/10",
      },
      size: {
        sm: "p-1.5",
        md: "p-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof iconButtonVariants> {
  /** Required for accessibility — icon-only buttons need a text label for screen readers. */
  "aria-label": string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(iconButtonVariants({ variant, size }), className)} {...props} />
  ),
);
IconButton.displayName = "IconButton";
