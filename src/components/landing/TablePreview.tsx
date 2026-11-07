import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { subjects } from "./PlannerPreview";

const progress = [
  { key: "math", done: 7, total: 10 },
  { key: "bio", done: 8, total: 8 },
  { key: "english", done: 4, total: 6 },
  { key: "physics", done: 4, total: 9 },
] as const;

const chapters = [
  { title: "บทที่ 1 · ลิมิตและความต่อเนื่อง", done: true },
  { title: "บทที่ 2 · อนุพันธ์", done: true },
  { title: "บทที่ 3 · การประยุกต์อนุพันธ์", done: true },
  { title: "บทที่ 4 · ปริพันธ์", done: false },
];

export function TablePreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-line-strong bg-sheet p-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.1)]",
        className
      )}
      role="img"
      aria-label="ตัวอย่างความคืบหน้าการอ่านแต่ละวิชา"
    >
      <ul className="space-y-3.5">
        {progress.map((p) => {
          const s = subjects[p.key];
          const pct = Math.round((p.done / p.total) * 100);
          return (
            <li key={p.key}>
              <div className="mb-1.5 flex items-baseline justify-between text-sm">
                <span className="font-semibold text-ink">{s.name}</span>
                <span className="font-mono text-xs text-ink-muted">
                  {p.done}/{p.total} บท · {pct}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-paper-deep">
                <div className={cn("h-2 rounded-full", s.bar)} style={{ width: `${pct}%` }} />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 border-t border-dashed border-line-strong pt-4">
        <p className="mb-2.5 text-xs font-semibold tracking-wide text-ink-muted">คณิตศาสตร์ · แคลคูลัส</p>
        <ul className="space-y-2 text-sm">
          {chapters.map((c) => (
            <li key={c.title} className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border",
                  c.done ? "border-sage bg-sage text-sheet" : "border-line-strong bg-sheet"
                )}
              >
                {c.done && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
              <span className={c.done ? "text-ink-muted line-through decoration-line-strong" : "text-ink"}>
                {c.title}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
