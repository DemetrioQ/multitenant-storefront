"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={error || undefined}
      className={cn(
        "block w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-brand disabled:opacity-50 resize-y",
        error ? "border-red-500 focus:border-red-500" : "border-border",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
