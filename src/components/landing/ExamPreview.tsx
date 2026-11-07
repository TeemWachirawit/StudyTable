import { cn } from "@/lib/utils";

const exams = [
  {
    subject: "ฟิสิกส์ · กลางภาค",
    date: "18 พ.ย.",
    daysLeft: 4,
    topics: ["ไฟฟ้าสถิต", "ไฟฟ้ากระแส", "แม่เหล็ก"],
    badgeClass: "border-mustard/35 bg-mustard-tint text-mustard-deep",
    pillClass: "border-mustard/25 bg-mustard-tint/60 text-mustard-deep",
  },
  {
    subject: "คณิตศาสตร์ · กลางภาค",
    date: "25 พ.ย.",
    daysLeft: 11,
    topics: ["อนุพันธ์", "การประยุกต์อนุพันธ์", "ปริพันธ์"],
    badgeClass: "border-terracotta/25 bg-terracotta-tint text-terracotta-deep",
    pillClass: "border-line bg-paper text-ink-soft",
  },
];

export function ExamPreview({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)} role="img" aria-label="ตัวอย่างรายการสอบและเนื้อหาที่ออกสอบ">
      {exams.map((e) => (
        <div
          key={e.subject}
          className="flex gap-4 rounded-xl border border-line-strong bg-sheet p-4 shadow-[0_14px_32px_-24px_rgba(15,23,42,0.1)]"
        >
          <div
            className={cn(
              "flex w-18 shrink-0 flex-col items-center justify-center rounded-lg border py-2",
              e.badgeClass
            )}
          >
            <span className="font-mono text-3xl leading-none font-semibold">{e.daysLeft}</span>
            <span className="mt-1 text-[11px] font-medium opacity-85">วันที่เหลือ</span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-ink">{e.subject}</p>
            <p className="font-mono text-xs text-ink-muted">สอบวันที่ {e.date}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {e.topics.map((t) => (
                <span key={t} className={cn("rounded-md border px-2 py-0.5 text-xs", e.pillClass)}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
