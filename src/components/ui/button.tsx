import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variants = {
      default:
        "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus-visible:ring-blue-500",
      secondary:
        "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700",
      outline:
        "border border-zinc-300 bg-transparent hover:bg-zinc-100 text-zinc-900 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800",
      ghost:
        "bg-transparent hover:bg-zinc-100 text-zinc-800 dark:hover:bg-zinc-800 dark:text-zinc-200",
      danger:
        "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

