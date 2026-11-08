"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  BookPlus,
  Check,
  GraduationCap,
  MapPin,
  Plus,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useStudyStore } from "@/hooks/use-study-store";
import { getSubjectColor } from "@/lib/colors";
import {
  DAYS,
  DAYS_SHORT,
  FIRST_HOUR,
  LAST_HOUR,
  blockDurationMinutes,
  blockEndMinutes,
  blockStartMinutes,
  formatBlockTime,
  formatHour,
  formatTime,
  isClassBlock,
  isStudyBlock,
  uid,
  weekdayIndex,
} from "@/lib/study";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { LoadingDesk, PageHeader } from "@/components/PageHeader";
import type { StudyBlock } from "@/types/study";
import { BlockEditor } from "./BlockEditor";
import { SubjectEditor } from "@/components/table/SubjectEditor";
import { SmartStudyModal } from "./SmartStudyModal";

const ROW_REM = 3;
const HOURS = Array.from({ length: LAST_HOUR - FIRST_HOUR }, (_, i) => FIRST_HOUR + i);

export function PlannerBoard() {
  const { state, dispatch, hydrated } = useStudyStore();
  const [draft, setDraft] = useState<StudyBlock | null>(null);
  const [addingSubject, setAddingSubject] = useState(false);
  const [smartModalOpen, setSmartModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "class" | "study">("all");
  const [confirmingReset, setConfirmingReset] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = useMemo(() => weekdayIndex(new Date()), []);
  const [mobileDay, setMobileDay] = useState<number | "all">(today);

  const subjectById = useMemo(
    () => new Map(state.subjects.map((s) => [s.id, s])),
    [state.subjects]
  );

  const classBlocks = useMemo(() => state.blocks.filter(isClassBlock), [state.blocks]);
  const studyBlocksList = useMemo(() => state.blocks.filter(isStudyBlock), [state.blocks]);

  const classHours = useMemo(
    () => Math.round(classBlocks.reduce((sum, b) => sum + blockDurationMinutes(b) / 60, 0) * 10) / 10,
    [classBlocks]
  );
  const studyHours = useMemo(
    () => Math.round(studyBlocksList.reduce((sum, b) => sum + blockDurationMinutes(b) / 60, 0) * 10) / 10,
    [studyBlocksList]
  );
  const totalHours = Math.round(state.blocks.reduce((sum, b) => sum + blockDurationMinutes(b) / 60, 0) * 10) / 10;

  const displayedBlocks = useMemo(() => {
    if (filterType === "class") return classBlocks;
    if (filterType === "study") return studyBlocksList;
    return state.blocks;
  }, [filterType, classBlocks, studyBlocksList, state.blocks]);

  const hoursBySubject = useMemo(() => {
    const totals = new Map<string, number>();
    for (const b of displayedBlocks) {
      const added = blockDurationMinutes(b) / 60;
      totals.set(b.subjectId, Math.round(((totals.get(b.subjectId) ?? 0) + added) * 10) / 10);
    }
    return totals;
  }, [displayedBlocks]);

  // Scroll the grid to the earliest planned session on first load.
  useEffect(() => {
    if (!hydrated || !scrollRef.current) return;
    const earliest = state.blocks.length
      ? Math.min(...state.blocks.map((b) => b.startHour))
      : 8;
    const rootFont = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    scrollRef.current.scrollTop = Math.max(0, earliest - FIRST_HOUR - 0.5) * ROW_REM * rootFont;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const openNew = (
    day: number,
    startHour: number,
    defaultType: "class" | "study" = "study"
  ) => {
    if (state.subjects.length === 0) {
      setAddingSubject(true);
      return;
    }
    setDraft({
      id: uid(),
      subjectId: state.subjects[0].id,
      day,
      startHour,
      duration: defaultType === "class" ? 2 : 1,
      topic: "",
      type: defaultType,
      location: "",
    });
  };

  const header = (
    <PageHeader
      eyebrow="Planner"
      tone="sky"
      title="ตารางเรียนและตารางอ่านหนังสือ"
      description="ลงตารางเรียนเพื่อกำหนดเวลาเรียน แล้วจัดสรรเวลาอ่านหนังสือลงในช่วงว่างเพื่อบริหารเวลาให้มีประสิทธิภาพ"
      actions={
        hydrated ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setAddingSubject(true)}>
              <BookPlus className="h-4 w-4" /> เพิ่มวิชา
            </Button>
            {state.subjects.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    openNew(typeof mobileDay === "number" ? mobileDay : today, 9, "class")
                  }
                >
                  <GraduationCap className="h-4 w-4 text-terracotta" />
                  + ตารางเรียน
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    openNew(typeof mobileDay === "number" ? mobileDay : today, 18, "study")
                  }
                >
                  <BookOpen className="h-4 w-4" />
                  + ตารางอ่าน
                </Button>
              </>
            )}
          </div>
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
            <p className="mt-2 text-ink-soft">
              เพิ่มวิชาแรกของคุณที่นี่เพื่อเริ่มลงตารางเรียนและจัดตารางอ่านหนังสือ
            </p>
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
            onSave={(name, color, emoji) => {
              dispatch({ type: "saveSubject", name, color, emoji });
              setAddingSubject(false);
            }}
          />
        )}
      </>
    );
  }

  const visibleDays =
    mobileDay === "all"
      ? DAYS.map((d, i) => ({ name: d, index: i }))
      : [{ name: DAYS[mobileDay], index: mobileDay }];

  return (
    <>
      {header}

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        {/* summary statistics */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-sheet px-4 py-3 shadow-2xs">
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-ink-soft">
            <p>
              รวม <span className="font-mono text-base font-semibold text-ink">{totalHours}</span>{" "}
              ชม./สัปดาห์
            </p>
            <span className="hidden h-3.5 w-px bg-line sm:inline-block" />
            <p className="flex items-center gap-1.5 text-xs">
              <GraduationCap className="h-3.5 w-3.5 text-terracotta" />
              เรียน: <span className="font-mono font-semibold text-ink">{classHours}</span> ชม.
            </p>
            <span className="hidden h-3.5 w-px bg-line sm:inline-block" />
            <p className="flex items-center gap-1.5 text-xs">
              <BookOpen className="h-3.5 w-3.5 text-sage" />
              อ่านหนังสือ: <span className="font-mono font-semibold text-ink">{studyHours}</span> ชม.
            </p>
          </div>
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
                  {s.emoji ? (
                    <span className="text-xs leading-none select-none">{s.emoji}</span>
                  ) : (
                    <span
                      className={cn("h-2 w-2 rounded-full", sc.solidClass)}
                      style={sc.solidStyle}
                    />
                  )}
                  {s.name}
                  <span className="font-mono font-semibold">{hoursBySubject.get(s.id) ?? 0} ชม.</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* View Filter & Smart Allocator Trigger */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-line bg-paper p-1 text-xs">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={cn(
                "rounded-lg px-3 py-1.5 font-medium transition-colors",
                filterType === "all"
                  ? "border border-line bg-sheet font-semibold text-ink shadow-2xs"
                  : "text-ink-soft hover:text-ink"
              )}
            >
              ทั้งหมด ({state.blocks.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("class")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors",
                filterType === "class"
                  ? "border border-line bg-sheet font-semibold text-terracotta-deep shadow-2xs"
                  : "text-ink-soft hover:text-ink"
              )}
            >
              <GraduationCap className="h-3.5 w-3.5 text-terracotta" />
              ตารางเรียน ({classBlocks.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("study")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors",
                filterType === "study"
                  ? "border border-line bg-sheet font-semibold text-sage-deep shadow-2xs"
                  : "text-ink-soft hover:text-ink"
              )}
            >
              <BookOpen className="h-3.5 w-3.5 text-sage" />
              ตารางอ่านหนังสือ ({studyBlocksList.length})
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSmartModalOpen(true)}
            className="h-8 gap-1.5 border-mustard/40 bg-mustard-tint/40 text-xs font-semibold text-mustard-deep hover:bg-mustard-tint"
          >
            <Sparkles className="h-3.5 w-3.5 text-mustard" />
            จัดสรรเวลาอ่านอัตโนมัติ
          </Button>
        </div>

        {/* Mobile Day Switcher */}
        <div className="mb-4 flex items-center gap-1 overflow-x-auto rounded-xl border border-line bg-sheet p-1.5 md:hidden">
          {DAYS_SHORT.map((short, i) => {
            const active = mobileDay === i;
            const hasBlocks = displayedBlocks.some((b) => b.day === i);
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
              "shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors",
              mobileDay === "all" ? "bg-ink text-sheet" : "text-ink-soft hover:bg-paper-deep"
            )}
          >
            7 วัน
          </button>
        </div>

        {/* Mobile Single-Day View */}
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
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openNew(visibleDays[0].index, 9, "class")}
                >
                  <GraduationCap className="h-3.5 w-3.5 text-terracotta" /> +คาบเรียน
                </Button>
                <Button
                  size="sm"
                  onClick={() => openNew(visibleDays[0].index, 18, "study")}
                >
                  <BookOpen className="h-3.5 w-3.5" /> +อ่าน
                </Button>
              </div>
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
                    onClick={() =>
                      openNew(
                        visibleDays[0].index,
                        h,
                        filterType === "class" ? "class" : h < 17 ? "class" : "study"
                      )
                    }
                    aria-label={`เพิ่มช่วงเวลา วัน${visibleDays[0].name} ${formatHour(h)}`}
                    className="group border-b border-line/70 hover:bg-terracotta-tint/40 focus-visible:bg-terracotta-tint/40 focus-visible:outline-none"
                    style={{ gridColumn: 2, gridRow: r + 1 }}
                  >
                    <Plus className="mx-auto h-4 w-4 text-terracotta opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" />
                  </button>
                </div>
              ))}
              <div
                className="pointer-events-none relative"
                style={{
                  gridColumn: 2,
                  gridRow: `1 / span ${HOURS.length}`,
                }}
              >
                {displayedBlocks
                  .filter((b) => b.day === visibleDays[0].index)
                  .map((b) => {
                    const subject = subjectById.get(b.subjectId);
                    if (!subject) return null;
                    const sc = getSubjectColor(subject.color);
                    const startM = blockStartMinutes(b);
                    const endM = blockEndMinutes(b);
                    const topRem = ((startM - FIRST_HOUR * 60) / 60) * ROW_REM;
                    const heightRem = ((endM - startM) / 60) * ROW_REM;
                    const chapterDone = subject.chapters.some((c) => c.title === b.topic && c.done);
                    const isClass = isClassBlock(b);

                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setDraft(b)}
                        className={cn(
                          "pointer-events-auto absolute inset-x-[3px] z-[5] flex flex-col overflow-hidden rounded-lg border px-3 py-1.5 text-left text-xs leading-snug transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:outline-none",
                          isClass && "ring-1 ring-terracotta/25 shadow-2xs",
                          sc.blockClass
                        )}
                        style={{
                          ...sc.blockStyle,
                          top: `${topRem}rem`,
                          height: `calc(${heightRem}rem - 6px)`,
                        }}
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="truncate font-semibold">
                            {subject.emoji && <span className="mr-1 select-none">{subject.emoji}</span>}
                            {subject.name}
                          </span>
                          <span
                            className={cn(
                              "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase shrink-0",
                              isClass
                                ? "bg-terracotta/25 text-terracotta-deep"
                                : "bg-sage/25 text-sage-deep"
                            )}
                          >
                            {isClass ? "เรียน" : "อ่าน"}
                          </span>
                        </div>
                        {isClass && b.location && (
                          <span className="mt-0.5 inline-flex items-center gap-1 truncate font-mono text-[10px] opacity-90">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{b.location}</span>
                          </span>
                        )}
                        {b.topic && (
                          <span className="mt-0.5 inline-flex items-center gap-1 truncate opacity-90 text-[11px]">
                            {!isClass && chapterDone && (
                              <Check className="h-3 w-3 shrink-0 text-sage" strokeWidth={3} />
                            )}
                            <span className="truncate">{b.topic}</span>
                          </span>
                        )}
                        {heightRem >= 2.5 && (
                          <span className="mt-auto font-mono text-[10px] opacity-75">
                            {formatBlockTime(b)}
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Full 7-day grid */}
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
                    onClick={() =>
                      openNew(
                        c,
                        h,
                        filterType === "class"
                          ? "class"
                          : filterType === "study"
                            ? "study"
                            : c < 5 && h < 17
                              ? "class"
                              : "study"
                      )
                    }
                    aria-label={`เพิ่มช่วงเวลา วัน${d} ${formatHour(h)}`}
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

            {/* Timetable blocks */}
            {DAYS.map((_, i) => (
              <div
                key={`day-overlay-${i}`}
                className="pointer-events-none relative"
                style={{
                  gridColumn: i + 2,
                  gridRow: `2 / span ${HOURS.length}`,
                }}
              >
                {displayedBlocks
                  .filter((b) => b.day === i)
                  .map((b) => {
                    const subject = subjectById.get(b.subjectId);
                    if (!subject) return null;
                    const sc = getSubjectColor(subject.color);
                    const startM = blockStartMinutes(b);
                    const endM = blockEndMinutes(b);
                    const topRem = ((startM - FIRST_HOUR * 60) / 60) * ROW_REM;
                    const heightRem = ((endM - startM) / 60) * ROW_REM;
                    const chapterDone = subject.chapters.some((c) => c.title === b.topic && c.done);
                    const isClass = isClassBlock(b);

                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setDraft(b)}
                        className={cn(
                          "pointer-events-auto absolute inset-x-[3px] z-[5] flex flex-col overflow-hidden rounded-lg border px-2.5 py-1.5 text-left text-xs leading-snug transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:outline-none",
                          isClass && "ring-1 ring-terracotta/30 shadow-2xs",
                          sc.blockClass
                        )}
                        style={{
                          ...sc.blockStyle,
                          top: `${topRem}rem`,
                          height: `calc(${heightRem}rem - 6px)`,
                        }}
                        aria-label={`${isClass ? "คาบเรียน" : "ช่วงอ่าน"} ${subject.name} ${b.topic} วัน${DAYS[b.day]} ${formatBlockTime(b)}`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate font-semibold">
                            {subject.emoji && <span className="mr-1 select-none">{subject.emoji}</span>}
                            {subject.name}
                          </span>
                          <span
                            className={cn(
                              "rounded px-1 py-0.2 text-[9px] font-bold uppercase shrink-0",
                              isClass
                                ? "bg-terracotta/25 text-terracotta-deep"
                                : "bg-sage/25 text-sage-deep"
                            )}
                          >
                            {isClass ? "เรียน" : "อ่าน"}
                          </span>
                        </div>

                        {isClass && b.location && (
                          <span className="mt-0.5 inline-flex items-center gap-1 truncate font-mono text-[10px] opacity-90">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{b.location}</span>
                          </span>
                        )}

                        {b.topic && (
                          <span className="inline-flex items-center gap-1 truncate opacity-90 text-[11px]">
                            {!isClass && chapterDone && (
                              <Check className="h-3 w-3 shrink-0 text-sage" strokeWidth={3} />
                            )}
                            <span className="truncate">{b.topic}</span>
                          </span>
                        )}

                        {heightRem >= 2.5 && (
                          <span className="mt-auto font-mono text-[10px] opacity-75">
                            {formatBlockTime(b)}
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
            ))}
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
          onSave={(block, followUp) => {
            if (followUp) {
              dispatch({ type: "saveBlocks", blocks: [block, followUp] });
            } else {
              dispatch({ type: "saveBlock", block });
            }
            setDraft(null);
          }}
          onDelete={(id) => {
            dispatch({ type: "deleteBlock", id });
            setDraft(null);
          }}
        />
      )}

      {smartModalOpen && (
        <SmartStudyModal
          state={state}
          onClose={() => setSmartModalOpen(false)}
          onApply={(blocks) => {
            dispatch({ type: "saveBlocks", blocks });
          }}
        />
      )}

      {addingSubject && (
        <SubjectEditor
          subject={null}
          onClose={() => setAddingSubject(false)}
          onSave={(name, color, emoji) => {
            dispatch({ type: "saveSubject", name, color, emoji });
            setAddingSubject(false);
          }}
        />
      )}
    </>
  );
}
