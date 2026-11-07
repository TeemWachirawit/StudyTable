import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type HeaderTone = "sky" | "mint" | "amber";

const toneStyles: Record<HeaderTone, { badge: string; dot: string }> = {
  sky: {
    badge: "border-terracotta/25 bg-terracotta-tint text-terracotta-deep",
    dot: "bg-terracotta",
  },
  mint: {
    badge: "border-sage/25 bg-sage-tint text-sage-deep",
    dot: "bg-sage",
  },
  amber: {
    badge: "border-mustard/30 bg-mustard-tint text-mustard-deep",
    dot: "bg-mustard",
  },
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  tone = "sky",
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  tone?: HeaderTone;
}) {
  const style = toneStyles[tone];
  return (
    <div className="border-b border-line bg-ruled">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 pt-10 pb-8 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs font-semibold tracking-wider uppercase",
              style.badge
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} aria-hidden="true" />
            {eyebrow}
          </span>
          <h1 className="mt-3 font-display text-3xl leading-snug font-bold text-ink sm:text-4xl">{title}</h1>
          <p className="mt-2 text-ink-soft">{description}</p>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function LoadingDesk() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 text-center text-sm text-ink-muted sm:px-8" aria-live="polite">
      กำลังเปิดโต๊ะเรียนของคุณ…
    </div>
  );
}
