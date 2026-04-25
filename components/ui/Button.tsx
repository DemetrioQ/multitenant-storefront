"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap",
  {
    variants: {
      variant: {
        primary: "bg-brand text-brand-contrast hover:opacity-90",
        secondary:
          "border border-border bg-background text-foreground hover:bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)]",
        ghost: "text-foreground hover:bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)]",
        outline:
          "border border-border text-foreground hover:bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)]",
        destructive: "bg-red-600 text-white hover:bg-red-500",
        link: "text-brand underline-offset-4 hover:underline px-0 py-0 h-auto",
      },
      size: {
        sm: "text-xs px-3 py-1.5 rounded-md",
        md: "text-sm px-4 py-2 rounded-md",
        lg: "text-sm px-6 py-2.5 rounded-md",
        // Pill is used heavily in the storefront (AddToCartButton style).
        pill: "text-sm px-6 py-2.5 rounded-full",
        "pill-lg": "text-sm px-6 py-3 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
