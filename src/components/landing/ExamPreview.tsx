import { cn } from "@/lib/utils";

const exams = [
  {
    subject: "ฟิสิกส์ · กลางภาค",
    date: "18 พ.ย.",
    daysLeft: 4,
    topics: ["ไฟฟ้าสถิต", "ไฟฟ้ากระแส", "แม่เหล็ก"],
    urgent: true,
  },
  {
    subject: "คณิตศาสตร์ · กลางภาค",
    date: "25 พ.ย.",
    daysLeft: 11,
    topics: ["อนุพันธ์", "การประยุกต์อนุพันธ์", "ปริพันธ์"],
    urgent: false,
  },
];

export function ExamPreview({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)} role="img" aria-label="ตัวอย่างรายการสอบและเนื้อหาที่ออกสอบ">
      {exams.map((e) => (
        <div key={e.subject} className="flex gap-4 rounded-xl border border-line-strong bg-sheet p-4">
          <div
            className={cn(
              "flex w-18 shrink-0 flex-col items-center justify-center rounded-lg py-2",
              e.urgent ? "bg-terracotta text-sheet" : "bg-paper-deep text-ink"
            )}
          >
            <span className="font-mono text-3xl font-semibold leading-none">{e.daysLeft}</span>
            <span className="mt-1 text-[11px] font-medium opacity-85">วันที่เหลือ</span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold">{e.subject}</p>
            <p className="font-mono text-xs text-ink-muted">สอบวันที่ {e.date}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {e.topics.map((t) => (
                <span key={t} className="rounded border border-line bg-paper px-2 py-0.5 text-xs text-ink-soft">
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

