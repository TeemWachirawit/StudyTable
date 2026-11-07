"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { BookPlus, Check, Plus, RotateCcw } from "lucide-react";
import { useStudyStore } from "@/hooks/use-study-store";
import { getSubjectColor } from "@/lib/colors";
import { DAYS, DAYS_SHORT, FIRST_HOUR, LAST_HOUR, formatHour, uid, weekdayIndex } from "@/lib/study";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { LoadingDesk, PageHeader } from "@/components/PageHeader";
import type { StudyBlock } from "@/types/study";
import { BlockEditor } from "./BlockEditor";
import { SubjectEditor } from "@/components/table/SubjectEditor";

const ROW_REM = 3;
const HOURS = Array.from({ length: LAST_HOUR - FIRST_HOUR }, (_, i) => FIRST_HOUR + i);

export function PlannerBoard() {
  const { state, dispatch, hydrated } = useStudyStore();
  const [draft, setDraft] = useState<StudyBlock | null>(null);
  const [addingSubject, setAddingSubject] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = useMemo(() => weekdayIndex(new Date()), []);
  const [mobileDay, setMobileDay] = useState<number | "all">(today);

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
    if (state.subjects.length === 0) {
      setAddingSubject(true);
      return;
    }
    setDraft({ id: uid(), subjectId: state.subjects[0].id, day, startHour, duration: 1, topic: "" });
  };

  const header = (
    <PageHeader
      eyebrow="Planner"
      tone="sky"
      title="ตารางอ่านหนังสือรายสัปดาห์"
      description="คลิกช่องว่างในตารางเพื่อเพิ่มช่วงอ่าน คลิกช่วงที่มีอยู่เพื่อแก้ไขหรือลบ"
      actions={
        hydrated ? (
          <>
            <Button variant="outline" size="sm" onClick={() => setAddingSubject(true)}>
              <BookPlus className="h-4 w-4" /> เพิ่มวิชา
            </Button>
            {state.subjects.length > 0 && (
              <Button size="sm" onClick={() => openNew(typeof mobileDay === "number" ? mobileDay : today, 18)}>
                <Plus className="h-4 w-4" /> เพิ่มช่วงอ่าน
              </Button>
            )}
          </>
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
        <div className="mx-auto max-w-xl px-5 py-16 text-center sm:px-8">
          <div className="rounded-2xl border border-dashed border-line-strong bg-sheet px-6 py-14">
            <p className="font-display text-xl font-bold text-ink">ยังไม่มีวิชาบนโต๊ะเรียน</p>
            <p className="mt-2 text-ink-soft">เพิ่มวิชาแรกของคุณที่นี่เพื่อเริ่มจัดตาราง หรือไปจัดการบทเรียนทั้งหมดในหน้า Table</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button onClick={() => setAddingSubject(true)}>
                <Plus className="h-4 w-4" /> เพิ่มวิชาแรก
              </Button>
              <Link href="/table" className={buttonVariants({ variant: "outline" })}>
                ไปที่หน้า Table
              </Link>
            </div>
          </div>
        </div>
        {addingSubject && (
          <SubjectEditor
            subject={null}
            onClose={() => setAddingSubject(false)}
            onSave={(name, color) => {
              dispatch({ type: "saveSubject", name, color });
              setAddingSubject(false);
            }}
          />
        )}
      </>
    );
  }

  const visibleDays = mobileDay === "all" ? DAYS.map((d, i) => ({ name: d, index: i })) : [{ name: DAYS[mobileDay], index: mobileDay }];

  return (
    <>
      {header}

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        {/* summary */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-sheet px-4 py-3 shadow-2xs">
          <p className="text-sm text-ink-soft">
            รวม <span className="font-mono text-base font-semibold text-ink">{totalHours}</span> ชั่วโมง / สัปดาห์
          </p>
          <ul className="flex flex-wrap gap-2">
            {state.subjects.map((s) => {
              const sc = getSubjectColor(s.color);
              return (
                <li
                  key={s.id}
                  style={sc.blockStyle}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                    sc.blockClass
                  )}
                >
                  <span
                    className={cn("h-2 w-2 rounded-full", sc.solidClass)}
                    style={sc.solidStyle}
                  />
                  {s.name}
                  <span className="font-mono font-semibold">{hoursBySubject.get(s.id) ?? 0} ชม.</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Mobile Day Switcher (solves horizontal scroll trap on small screens) */}
        <div className="mb-4 flex items-center gap-1 overflow-x-auto rounded-xl border border-line bg-sheet p-1.5 md:hidden">
          {DAYS_SHORT.map((short, i) => {
            const active = mobileDay === i;
            const hasBlocks = state.blocks.some((b) => b.day === i);
            return (
              <button
                key={short}
                type="button"
                onClick={() => setMobileDay(i)}
                className={cn(
                  "relative flex flex-1 flex-col items-center rounded-lg py-1.5 text-xs font-semibold transition-colors",
                  active ? "bg-terracotta text-sheet" : "text-ink-soft hover:bg-paper-deep"
                )}
              >
                <span>{short}</span>
                {hasBlocks && (
                  <span
                    className={cn(
                      "mt-0.5 h-1 w-1 rounded-full",
                      active ? "bg-sheet" : "bg-terracotta"
                    )}
                  />
                )}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setMobileDay("all")}
            className={cn(
              " shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors",
              mobileDay === "all" ? "bg-ink text-sheet" : "text-ink-soft hover:bg-paper-deep"
            )}
          >
            7 วัน
          </button>
        </div>

        {/* Mobile Single-Day View (when a specific day is selected on < md) */}
        {mobileDay !== "all" && (
          <div className="mb-4 overflow-hidden rounded-xl border border-line-strong bg-sheet shadow-xs md:hidden">
            <div className="flex items-center justify-between border-b border-line bg-paper px-4 py-2.5">
              <span className="text-sm font-bold text-ink">
                วัน{visibleDays[0].name}
                {visibleDays[0].index === today && (
                  <span className="ml-2 rounded-full bg-terracotta-tint px-2 py-0.5 text-[11px] font-semibold text-terracotta-deep">
                    วันนี้
                  </span>
                )}
              </span>
              <Button size="sm" variant="outline" onClick={() => openNew(visibleDays[0].index, 17)}>
                <Plus className="h-3.5 w-3.5" /> เพิ่มช่วงเวลา
              </Button>
            </div>
            <div
              className="grid max-h-[62vh] overflow-y-auto"
              style={{
                gridTemplateColumns: "3.75rem minmax(0, 1fr)",
                gridTemplateRows: `repeat(${HOURS.length}, ${ROW_REM}rem)`,
              }}
            >
              {HOURS.map((h, r) => (
                <div key={h} className="contents">
                  <div
                    className="border-r border-b border-line bg-sheet pt-1 pr-2 text-right font-mono text-[11px] text-ink-muted"
                    style={{ gridColumn: 1, gridRow: r + 1 }}
                  >
                    {formatHour(h)}
                  </div>
                  <button
                    type="button"
                    onClick={() => openNew(visibleDays[0].index, h)}
                    aria-label={`เพิ่มช่วงอ่าน วัน${visibleDays[0].name} ${formatHour(h)}`}
                    className="group border-b border-line/70 hover:bg-terracotta-tint/40 focus-visible:bg-terracotta-tint/40 focus-visible:outline-none"
                    style={{ gridColumn: 2, gridRow: r + 1 }}
                  >
                    <Plus className="mx-auto h-4 w-4 text-terracotta opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" />
                  </button>
                </div>
              ))}
              {state.blocks
                .filter((b) => b.day === visibleDays[0].index)
                .map((b) => {
                  const subject = subjectById.get(b.subjectId);
                  if (!subject) return null;
                  const sc = getSubjectColor(subject.color);
                  const startRow = b.startHour - FIRST_HOUR + 1;
                  const chapterDone = subject.chapters.some((c) => c.title === b.topic && c.done);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setDraft(b)}
                      className={cn(
                        "z-[5] m-[3px] flex flex-col overflow-hidden rounded-lg border px-3 py-1.5 text-left text-xs leading-snug transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:outline-none",
                        sc.blockClass
                      )}
                      style={{
                        ...sc.blockStyle,
                        gridColumn: 2,
                        gridRow: `${startRow} / span ${b.duration}`,
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-semibold">{subject.name}</span>
                        <span className="font-mono text-[10px] opacity-75">
                          {formatHour(b.startHour)}–{formatHour(b.startHour + b.duration)}
                        </span>
                      </div>
                      {b.topic && (
                        <span className="mt-0.5 inline-flex items-center gap-1 truncate opacity-90">
                          {chapterDone && <Check className="h-3 w-3 shrink-0 text-sage" strokeWidth={3} />}
                          {b.topic}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {/* Full 7-day grid (Always visible on md+, or when "7 วัน" is chosen on mobile) */}
        <div
          ref={scrollRef}
          className={cn(
            "max-h-[70vh] overflow-auto rounded-xl border border-line-strong bg-sheet shadow-[0_18px_40px_-28px_rgba(15,23,42,0.14)]",
            mobileDay !== "all" && "hidden md:block"
          )}
        >
          <div
            className="grid min-w-[760px]"
            style={{
              gridTemplateColumns: "3.75rem repeat(7, minmax(0, 1fr))",
              gridTemplateRows: `2.75rem repeat(${HOURS.length}, ${ROW_REM}rem)`,
            }}
          >
            {/* corner + day headers (sticky) */}
            <div className="sticky top-0 left-0 z-30 border-r border-b border-line bg-paper" />
            {DAYS.map((d, i) => (
              <div
                key={d}
                className={cn(
                  "sticky top-0 z-20 flex items-center justify-center gap-1.5 border-b border-r border-line text-sm font-semibold last:border-r-0",
                  i === today
                    ? "bg-terracotta-tint text-terracotta-deep"
                    : "bg-paper text-ink-soft"
                )}
                style={{ gridColumn: i + 2, gridRow: 1 }}
              >
                <span className="lg:hidden">{DAYS_SHORT[i]}</span>
                <span className="hidden lg:inline">{d}</span>
                {i === today && (
                  <span className="rounded-full bg-terracotta px-1.5 py-0.5 text-[10px] font-semibold text-sheet">
                    วันนี้
                  </span>
                )}
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
                      "group border-r border-b border-line/70 last:border-r-0 hover:bg-terracotta-tint/50 focus-visible:bg-terracotta-tint/50 focus-visible:outline-none",
                      c === today ? "bg-terracotta-tint/20" : "bg-sheet"
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
              const sc = getSubjectColor(subject.color);
              const startRow = b.startHour - FIRST_HOUR + 2;
              const chapterDone = subject.chapters.some((c) => c.title === b.topic && c.done);
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setDraft(b)}
                  className={cn(
                    "z-[5] m-[3px] flex flex-col overflow-hidden rounded-lg border px-2.5 py-1.5 text-left text-xs leading-snug transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:outline-none",
                    sc.blockClass
                  )}
                  style={{
                    ...sc.blockStyle,
                    gridColumn: b.day + 2,
                    gridRow: `${startRow} / span ${b.duration}`,
                  }}
                  aria-label={`${subject.name} ${b.topic} วัน${DAYS[b.day]} ${formatHour(b.startHour)}–${formatHour(b.startHour + b.duration)}`}
                >
                  <span className="truncate font-semibold">{subject.name}</span>
                  {b.topic && (
                    <span className="inline-flex items-center gap-1 truncate opacity-90">
                      {chapterDone && <Check className="h-3 w-3 shrink-0 text-sage" strokeWidth={3} />}
                      <span className="truncate">{b.topic}</span>
                    </span>
                  )}
                  {b.duration > 1 && (
                    <span className="mt-auto font-mono text-[10px] opacity-75">
                      {formatHour(b.startHour)}–{formatHour(b.startHour + b.duration)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          {confirmingReset ? (
            <div className="flex items-center gap-2 rounded-lg border border-slate/30 bg-slate-tint px-3 py-1.5 text-xs text-slate-deep">
              <span>รีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้น?</span>
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: "reset" });
                  setConfirmingReset(false);
                }}
                className="rounded bg-slate px-2 py-0.5 font-semibold text-sheet hover:bg-slate-deep"
              >
                ยืนยัน
              </button>
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="font-medium text-ink-soft hover:text-ink"
              >
                ยกเลิก
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingReset(true)}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-ink-muted transition-colors hover:bg-paper-deep hover:text-ink"
            >
              <RotateCcw className="h-3.5 w-3.5" /> รีเซ็ตเป็นข้อมูลตัวอย่าง
            </button>
          )}
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

      {addingSubject && (
        <SubjectEditor
          subject={null}
          onClose={() => setAddingSubject(false)}
          onSave={(name, color) => {
            dispatch({ type: "saveSubject", name, color });
            setAddingSubject(false);
          }}
        />
      )}
    </>
  );
}
