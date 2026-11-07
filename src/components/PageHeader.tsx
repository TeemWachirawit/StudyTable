import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="border-b border-line bg-ruled">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 pt-10 pb-8 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="font-mono text-xs font-medium tracking-widest text-terracotta uppercase">{eyebrow}</p>
          <h1 className="mt-2 font-display text-3xl leading-snug font-bold sm:text-4xl">{title}</h1>
          <p className="mt-2 text-ink-soft">{description}</p>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
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

