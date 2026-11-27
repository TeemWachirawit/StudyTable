import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type HeaderTone = "sky" | "mint" | "amber" | "plum" | "coral" | "indigo";

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
  plum: {
    badge: "border-plum/25 bg-plum-tint text-plum-deep",
    dot: "bg-plum",
  },
  coral: {
    badge: "border-slate/25 bg-slate-tint text-slate-deep",
    dot: "bg-slate",
  },
  indigo: {
    badge: "border-indigo/25 bg-indigo-tint text-indigo-deep",
    dot: "bg-indigo",
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
    <div className="mx-auto max-w-6xl space-y-6 px-5 py-8 sm:px-8" aria-live="polite" aria-busy="true">
      <span className="sr-only">กำลังเปิดโต๊ะเรียนของคุณ…</span>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl border border-line bg-sheet p-5">
            <div className="h-3 w-24 rounded bg-paper-deep" />
            <div className="mt-3 h-7 w-20 rounded bg-paper-deep" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="h-64 animate-pulse rounded-xl border border-line bg-sheet p-5">
            <div className="h-5 w-40 rounded bg-paper-deep" />
            <div className="mt-4 space-y-3">
              <div className="h-3 w-full rounded bg-paper-deep" />
              <div className="h-3 w-5/6 rounded bg-paper-deep" />
              <div className="h-3 w-2/3 rounded bg-paper-deep" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
