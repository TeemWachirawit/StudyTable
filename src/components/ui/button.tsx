import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  default: "bg-terracotta text-sheet hover:bg-terracotta-deep",
  outline: "border border-line-strong bg-sheet text-ink hover:bg-paper-deep",
  ghost: "text-ink-soft hover:bg-paper-deep hover:text-ink",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

/** Shared class builder so links can look like buttons too. */
export function buttonVariants({
  variant = "default",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(baseStyles, variants[variant], sizes[size], className);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={buttonVariants({ variant, size, className })} {...props} />
  )
);

Button.displayName = "Button";
