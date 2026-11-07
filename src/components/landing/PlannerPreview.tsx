import { cn } from "@/lib/utils";

/** Shared subject palette used across landing previews — 3 primary soft productivity colors + coral. */
export const subjects = {
  math: {
    name: "คณิตศาสตร์",
    block: "bg-terracotta-tint text-terracotta-deep border-terracotta/30",
    bar: "bg-terracotta",
  },
  bio: {
    name: "ชีววิทยา",
    block: "bg-sage-tint text-sage-deep border-sage/30",
    bar: "bg-sage",
  },
  english: {
    name: "ภาษาอังกฤษ",
    block: "bg-mustard-tint text-mustard-deep border-mustard/35",
    bar: "bg-mustard",
  },
  physics: {
    name: "ฟิสิกส์",
    block: "bg-slate-tint text-slate-deep border-slate/30",
    bar: "bg-slate",
  },
} as const;

type SubjectKey = keyof typeof subjects;

const days = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."];
const hours = ["16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];

/** day: 1–7, start: 0-based hour index, span: hours */
const blocks: { day: number; start: number; span: number; subject: SubjectKey; label: string }[] = [
  { day: 1, start: 0, span: 2, subject: "math", label: "แคลคูลัส" },
  { day: 1, start: 3, span: 1, subject: "english", label: "Reading" },
  { day: 2, start: 1, span: 2, subject: "physics", label: "ไฟฟ้า" },
  { day: 3, start: 0, span: 1, subject: "bio", label: "เซลล์" },
  { day: 3, start: 2, span: 2, subject: "math", label: "เวกเตอร์" },
  { day: 4, start: 1, span: 1, subject: "english", label: "Grammar" },
  { day: 4, start: 3, span: 2, subject: "bio", label: "พันธุศาสตร์" },
  { day: 5, start: 0, span: 2, subject: "physics", label: "แม่เหล็ก" },
  { day: 6, start: 1, span: 3, subject: "math", label: "ติวข้อสอบเก่า" },
  { day: 7, start: 2, span: 1, subject: "bio", label: "ทบทวน" },
];

export function PlannerPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-line-strong bg-sheet shadow-[0_1px_0_var(--color-line),0_20px_45px_-24px_rgba(15,23,42,0.12)]",
        className
      )}
      aria-label="ตัวอย่างตารางอ่านหนังสือรายสัปดาห์"
      role="img"
    >
      <div className="flex items-center justify-between border-b border-line bg-sheet px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-terracotta" />
          <span className="text-sm font-semibold text-ink">สัปดาห์ที่ 3 · พ.ย.</span>
        </div>
        <span className="rounded-full bg-terracotta-tint px-2.5 py-0.5 font-mono text-xs font-medium text-terracotta-deep">
          17 ชม. วางแผนไว้
        </span>
      </div>

      <div
        className="grid text-[11px]"
        style={{
          gridTemplateColumns: "3rem repeat(7, minmax(0, 1fr))",
          gridTemplateRows: `2rem repeat(${hours.length}, 2.65rem)`,
        }}
      >
        {/* header row */}
        <div
          className="border-b border-r border-line bg-paper"
          style={{ gridColumn: 1, gridRow: 1 }}
        />
        {days.map((d, i) => (
          <div
            key={d}
            className={cn(
              "flex items-center justify-center border-b border-r border-line bg-paper font-semibold text-ink-soft",
              i === days.length - 1 && "border-r-0"
            )}
            style={{ gridColumn: i + 2, gridRow: 1 }}
          >
            {d}
          </div>
        ))}

        {/* time labels + empty cells */}
        {hours.map((h, r) => (
          <div key={h} className="contents">
            <div
              className={cn(
                "border-r border-b border-line bg-sheet pr-1.5 pt-1 text-right font-mono text-[10px] text-ink-muted",
                r === hours.length - 1 && "border-b-0"
              )}
              style={{ gridColumn: 1, gridRow: r + 2 }}
            >
              {h}
            </div>
            {days.map((_, c) => (
              <div
                key={c}
                className={cn(
                  "border-r border-b border-line/70 bg-sheet",
                  c === days.length - 1 && "border-r-0",
                  r === hours.length - 1 && "border-b-0"
                )}
                style={{ gridColumn: c + 2, gridRow: r + 2 }}
              />
            ))}
          </div>
        ))}

        {/* study blocks */}
        {blocks.map((b, i) => (
          <div
            key={i}
            className={cn(
              "z-10 m-[3px] flex flex-col justify-center overflow-hidden rounded-md border px-1.5 py-1 leading-tight",
              subjects[b.subject].block
            )}
            style={{ gridColumn: b.day + 1, gridRow: `${b.start + 2} / span ${b.span}` }}
          >
            <span className="block truncate font-semibold">{b.label}</span>
            {b.span > 1 && (
              <span className="mt-0.5 hidden truncate text-[10px] opacity-80 sm:block">
                {subjects[b.subject].name}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
