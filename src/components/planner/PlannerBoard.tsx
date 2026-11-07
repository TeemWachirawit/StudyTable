"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Plus, RotateCcw } from "lucide-react";
import { useStudyStore } from "@/hooks/use-study-store";
import { SUBJECT_COLORS } from "@/lib/colors";
import { DAYS, DAYS_SHORT, FIRST_HOUR, LAST_HOUR, formatHour, uid, weekdayIndex } from "@/lib/study";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { LoadingDesk, PageHeader } from "@/components/PageHeader";
import type { StudyBlock } from "@/types/study";
import { BlockEditor } from "./BlockEditor";

const ROW_REM = 3;
const HOURS = Array.from({ length: LAST_HOUR - FIRST_HOUR }, (_, i) => FIRST_HOUR + i);

export function PlannerBoard() {
  const { state, dispatch, hydrated } = useStudyStore();
  const [draft, setDraft] = useState<StudyBlock | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = useMemo(() => weekdayIndex(new Date()), []);

  const subjectById = useMemo(() => new Map(state.subjects.map((s) => [s.id, s])), [state.subjects]);

  const hoursBySubject = useMemo(() => {
    const totals = new Map<string, number>();
    for (const b of state.blocks) totals.set(b.subjectId, (totals.get(b.subjectId) ?? 0) + b.duration);
    return totals;
  }, [state.blocks]);
  const totalHours = state.blocks.reduce((sum, b) => sum + b.duration, 0);

  // Scroll the grid to the earliest planned session on first load.
  useEffect(() => {
    if (!hydrated || !scrollRef.current) return;
    const earliest = state.blocks.length ? Math.min(...state.blocks.map((b) => b.startHour)) : 16;
    const rootFont = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    scrollRef.current.scrollTop = Math.max(0, earliest - FIRST_HOUR - 0.5) * ROW_REM * rootFont;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const openNew = (day: number, startHour: number) => {
    if (state.subjects.length === 0) return;
    setDraft({ id: uid(), subjectId: state.subjects[0].id, day, startHour, duration: 1, topic: "" });
  };

  const header = (
    <PageHeader
      eyebrow="Planner"
      title="ตารางอ่านหนังสือรายสัปดาห์"
      description="คลิกช่องว่างในตารางเพื่อเพิ่มช่วงอ่าน คลิกช่วงที่มีอยู่เพื่อแก้ไขหรือลบ"
      actions={
        hydrated && state.subjects.length > 0 ? (
          <Button onClick={() => openNew(today, 18)}>
            <Plus className="h-4 w-4" /> เพิ่มช่วงอ่าน
          </Button>
        ) : undefined
      }
    />
  );

  if (!hydrated) {
    return (
      <>
        {header}
        <LoadingDesk />
      </>
    );
  }

  if (state.subjects.length === 0) {
    return (
      <>
        {header}
        <div className="mx-auto max-w-xl px-5 py-20 text-center sm:px-8">
          <p className="font-display text-xl font-bold">ยังไม่มีวิชาบนโต๊ะเรียน</p>
          <p className="mt-2 text-ink-soft">เพิ่มวิชาที่จะอ่านในหน้า Table ก่อน แล้วกลับมาลงตารางได้เลย</p>
          <Link href="/table" className={buttonVariants({ className: "mt-6" })}>
            ไปเพิ่มวิชาที่หน้า Table
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      {header}

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        {/* summary */}
        <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-3">
          <p className="text-sm text-ink-soft">
            รวม <span className="font-mono text-base font-semibold text-ink">{totalHours}</span> ชั่วโมง / สัปดาห์
          </p>
          <ul className="flex flex-wrap gap-2">
            {state.subjects.map((s) => (
              <li
                key={s.id}
                className={cn("flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium", SUBJECT_COLORS[s.color].block)}
              >
                {s.name}
                <span className="font-mono">{hoursBySubject.get(s.id) ?? 0} ชม.</span>
              </li>
            ))}
          </ul>
        </div>

        {/* grid */}
        <div
          ref={scrollRef}
          className="max-h-[70vh] overflow-auto rounded-xl border border-line-strong bg-sheet shadow-[0_18px_40px_-28px_rgba(31,27,22,0.4)]"
        >
          <div
            className="grid min-w-[760px]"
            style={{
              gridTemplateColumns: "3.75rem repeat(7, minmax(0, 1fr))",
              gridTemplateRows: `2.75rem repeat(${HOURS.length}, ${ROW_REM}rem)`,
            }}
          >
            {/* corner + day headers (sticky) */}
            <div className="sticky top-0 left-0 z-30 border-r border-b border-line bg-paper-deep" />
            {DAYS.map((d, i) => (
              <div
                key={d}
                className={cn(
                  "sticky top-0 z-20 flex items-center justify-center gap-1.5 border-b border-r border-line text-sm font-semibold last:border-r-0",
                  i === today ? "bg-ink text-paper" : "bg-paper-deep text-ink-soft"
                )}
                style={{ gridColumn: i + 2, gridRow: 1 }}
              >
                <span className="lg:hidden">{DAYS_SHORT[i]}</span>
                <span className="hidden lg:inline">{d}</span>
                {i === today && <span className="text-[10px] font-normal opacity-75">วันนี้</span>}
              </div>
            ))}

            {/* time labels + clickable empty cells */}
            {HOURS.map((h, r) => (
              <div key={h} className="contents">
                <div
                  className="sticky left-0 z-10 border-r border-b border-line bg-sheet pt-1 pr-2 text-right font-mono text-[11px] text-ink-muted"
                  style={{ gridColumn: 1, gridRow: r + 2 }}
                >
                  {formatHour(h)}
                </div>
                {DAYS.map((d, c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => openNew(c, h)}
                    aria-label={`เพิ่มช่วงอ่าน วัน${d} ${formatHour(h)}`}
                    className={cn(
                      "group border-r border-b border-line/70 last:border-r-0 hover:bg-terracotta-tint/40 focus-visible:bg-terracotta-tint/40 focus-visible:outline-none",
                      c === today && "bg-paper/60"
                    )}
                    style={{ gridColumn: c + 2, gridRow: r + 2 }}
                  >
                    <Plus className="mx-auto h-4 w-4 text-terracotta opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" />
                  </button>
                ))}
              </div>
            ))}

            {/* study blocks */}
            {state.blocks.map((b) => {
              const subject = subjectById.get(b.subjectId);
              if (!subject) return null;
              const startRow = b.startHour - FIRST_HOUR + 2;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setDraft(b)}
                  className={cn(
                    "z-[5] m-[3px] flex flex-col overflow-hidden rounded-md border px-2 py-1.5 text-left text-xs leading-snug transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none",
                    SUBJECT_COLORS[subject.color].block
                  )}
                  style={{ gridColumn: b.day + 2, gridRow: `${startRow} / span ${b.duration}` }}
                  aria-label={`${subject.name} ${b.topic} วัน${DAYS[b.day]} ${formatHour(b.startHour)}–${formatHour(b.startHour + b.duration)}`}
                >
                  <span className="truncate font-semibold">{subject.name}</span>
                  {b.topic && <span className="truncate opacity-85">{b.topic}</span>}
                  {b.duration > 1 && (
                    <span className="mt-auto font-mono text-[10px] opacity-70">
                      {formatHour(b.startHour)}–{formatHour(b.startHour + b.duration)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (confirm("ล้างข้อมูลทั้งหมดและกลับไปใช้ข้อมูลตัวอย่าง?")) dispatch({ type: "reset" });
            }}
            className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-terracotta"
          >
            <RotateCcw className="h-3.5 w-3.5" /> รีเซ็ตเป็นข้อมูลตัวอย่าง
          </button>
        </div>
      </div>

      {draft && (
        <BlockEditor
          draft={draft}
          isNew={!state.blocks.some((b) => b.id === draft.id)}
          subjects={state.subjects}
          blocks={state.blocks}
          onClose={() => setDraft(null)}
          onSave={(block) => {
            dispatch({ type: "saveBlock", block });
            setDraft(null);
          }}
          onDelete={(id) => {
            dispatch({ type: "deleteBlock", id });
            setDraft(null);
          }}
        />
      )}
    </>
  );
}

