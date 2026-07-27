import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[.98] disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-primary text-white hover:brightness-110": variant === "primary",
          "border bg-surface text-foreground hover:bg-surface-2": variant === "secondary",
          "text-muted hover:bg-surface-2 hover:text-foreground": variant === "ghost",
          "bg-red-500/10 text-red-500 hover:bg-red-500/20": variant === "danger",
          "h-9 px-3 text-sm": size === "sm",
          "h-11 px-4 text-sm": size === "md",
          "h-13 px-6": size === "lg",
          "size-11 p-0": size === "icon",
        },
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
