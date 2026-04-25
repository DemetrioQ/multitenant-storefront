import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

// Status colour palette mirrors OrderStatusBadge (light + dark text variants).
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        default:
          "border-border bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)] text-foreground",
        muted: "border-zinc-500/30 bg-zinc-500/15 text-zinc-600 dark:text-zinc-300",
        success: "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
        warning: "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300",
        info: "border-sky-500/30 bg-sky-500/15 text-sky-700 dark:text-sky-300",
        destructive: "border-red-500/30 bg-red-500/15 text-red-700 dark:text-red-300",
        rose: "border-rose-500/30 bg-rose-500/15 text-rose-700 dark:text-rose-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
