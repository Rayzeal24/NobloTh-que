import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full rounded-xl border bg-surface px-4 text-sm outline-none transition placeholder:text-muted focus:border-primary focus:ring-3 focus:ring-primary/10",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
