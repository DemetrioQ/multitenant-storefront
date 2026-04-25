"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded border-border bg-background text-brand focus:ring-brand focus:ring-offset-background",
        className,
      )}
      {...props}
    />
  ),
);
Checkbox.displayName = "Checkbox";
