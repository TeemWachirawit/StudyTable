"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  BookPlus,
  Check,
  Download,
  GraduationCap,
  Loader2,
  MapPin,
  Plus,
} from "lucide-react";
import { useStudyStore } from "@/hooks/use-study-store";
import { getSubjectColor } from "@/lib/colors";
import { exportPlannerToPng } from "@/lib/export-planner-png";
import {
  DAYS,
  DAYS_SHORT,
  FIRST_HOUR,
  LAST_HOUR,
  blockDurationMinutes,
  blockEndMinutes,
  blockStartMinutes,
  findConflict,
  formatBlockTime,
  formatHour,
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

const ROW_REM = 4.5;
const HOURS = Array.from({ length: LAST_HOUR - FIRST_HOUR }, (_, i) => FIRST_HOUR + i);
const SNAP_MINUTES = 30;

interface DragSession {
  block: StudyBlock;
  mode: "move" | "resize";
  startX: number;
  startY: number;
  grabOffsetMins: number;
  active: boolean;
  candidate: StudyBlock;
  hasConflict: boolean;
}

function buildTimedBlock(base: StudyBlock, day: number, startMins: number, endMins: number): StudyBlock {
  const sH = Math.floor(startMins / 60);
  const sM = startMins % 60;
  const eH = Math.floor(endMins / 60);
  const eM = endMins % 60;
  const duration = Math.round((endMins - startMins) / 6) / 10;
  return {
    ...base,
    day,
    startHour: sH,
    startMinute: sM,
    endHour: eH,
    endMinute: eM,
    duration: Math.max(0.5, duration),
  };
}

export function PlannerBoard() {
  const { state, dispatch, hydrated } = useStudyStore();
  const [draft, setDraft] = useState<StudyBlock | null>(null);
  const [addingSubject, setAddingSubject] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "class" | "study">("all");
  const [exporting, setExporting] = useState(false);
  const [drag, setDrag] = useState<DragSession | null>(null);
  const [dragNotice, setDragNotice] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const firstDayColRef = useRef<HTMLDivElement>(null);
  const suppressClickRef = useRef(false);
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

  // Scroll the grid (desktop & mobile) to the earliest planned session on first load.
  useEffect(() => {
    if (!hydrated) return;
    const earliest = state.blocks.length
      ? Math.min(...state.blocks.map((b) => b.startHour))
      : 8;
    const rootFont = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const targetTop = Math.max(0, earliest - FIRST_HOUR - 0.5) * ROW_REM * rootFont;
    if (scrollRef.current) scrollRef.current.scrollTop = targetTop;
    if (mobileScrollRef.current) mobileScrollRef.current.scrollTop = targetTop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // Auto-clear conflict notice
  useEffect(() => {
    if (!dragNotice) return;
    const t = setTimeout(() => setDragNotice(null), 2600);
    return () => clearTimeout(t);
  }, [dragNotice]);

  // Global pointer listeners while dragging or resizing a block
  const isDragging = drag !== null;
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      const colEl = firstDayColRef.current;
      if (!colEl) return;
      const rect = colEl.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const pxPerMin = rect.height / (HOURS.length * 60);

      setDrag((prev) => {
        if (!prev) return null;
        const dist = Math.hypot(e.clientX - prev.startX, e.clientY - prev.startY);
        const active = prev.active || prev.mode === "resize" || dist > 6;
        if (!active) return prev;

        const origStart = blockStartMinutes(prev.block);
        const origEnd = blockEndMinutes(prev.block);
        const origDur = Math.max(SNAP_MINUTES, origEnd - origStart);

        let nextCandidate: StudyBlock;
        if (prev.mode === "move") {
          const rawDay = Math.floor((e.clientX - rect.left) / rect.width);
          const day = Math.max(0, Math.min(6, rawDay));
          const pointerMins = FIRST_HOUR * 60 + (e.clientY - rect.top) / pxPerMin;
          const snappedStart = Math.round((pointerMins - prev.grabOffsetMins) / SNAP_MINUTES) * SNAP_MINUTES;
          const clampedStart = Math.max(
            FIRST_HOUR * 60,
            Math.min(LAST_HOUR * 60 - origDur, snappedStart)
          );
          nextCandidate = buildTimedBlock(prev.block, day, clampedStart, clampedStart + origDur);
        } else {
          const pointerMins = FIRST_HOUR * 60 + (e.clientY - rect.top) / pxPerMin;
          const snappedEnd = Math.round(pointerMins / SNAP_MINUTES) * SNAP_MINUTES;
          const clampedEnd = Math.max(
            origStart + SNAP_MINUTES,
            Math.min(LAST_HOUR * 60, snappedEnd)
          );
          nextCandidate = buildTimedBlock(prev.block, prev.block.day, origStart, clampedEnd);
        }

        const hasConflict = Boolean(findConflict(state.blocks, nextCandidate));
        return {
          ...prev,
          active: true,
          candidate: nextCandidate,
          hasConflict,
        };
      });
    };

    const handlePointerUp = () => {
      setDrag((prev) => {
        if (!prev) return null;
        if (prev.active) {
          suppressClickRef.current = true;
          setTimeout(() => {
            suppressClickRef.current = false;
          }, 0);

          const changed =
            prev.candidate.day !== prev.block.day ||
            blockStartMinutes(prev.candidate) !== blockStartMinutes(prev.block) ||
            blockEndMinutes(prev.candidate) !== blockEndMinutes(prev.block);

          if (changed) {
            if (prev.hasConflict) {
              setDragNotice("ไม่สามารถวางได้ เนื่องจากเวลาชนกับช่วงอื่นในวันเดียวกัน");
            } else {
              dispatch({ type: "saveBlock", block: prev.candidate });
            }
          }
        }
        return null;
      });
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [isDragging, state.blocks, dispatch]);

  const startBlockDrag = (
    e: React.PointerEvent,
    block: StudyBlock,
    mode: "move" | "resize"
  ) => {
    if (e.button !== 0) return;
    const colEl = firstDayColRef.current;
    if (!colEl) return;
    const rect = colEl.getBoundingClientRect();
    const pxPerMin = rect.height / (HOURS.length * 60);
    const pointerMins = FIRST_HOUR * 60 + (e.clientY - rect.top) / pxPerMin;
    const grabOffsetMins = pointerMins - blockStartMinutes(block);

    if (mode === "resize") {
      e.stopPropagation();
      e.preventDefault();
    }

    setDrag({
      block,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      grabOffsetMins,
      active: mode === "resize",
      candidate: block,
      hasConflict: false,
    });
  };

  const handleExportPng = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const filterLabel =
        filterType === "class"
          ? "เฉพาะตารางเรียน"
          : filterType === "study"
            ? "เฉพาะตารางอ่านหนังสือ"
            : "ตารางเรียนและตารางอ่านหนังสือทั้งหมด";
      await exportPlannerToPng({
        blocks: displayedBlocks,
        subjects: state.subjects,
        filterLabel,
      });
    } finally {
      setExporting(false);
    }
  };

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
        </div>

        {/* View Filter & Export PNG */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div
            role="group"
            aria-label="กรองประเภทตาราง"
            className="flex items-center gap-1 rounded-xl border border-line bg-paper p-1 text-xs"
          >
            <button
              type="button"
              aria-pressed={filterType === "all"}
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
              aria-pressed={filterType === "class"}
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
              aria-pressed={filterType === "study"}
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

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-ink-muted md:inline">
              ลากบล็อกเพื่อย้ายเวลา · ดึงขอบล่างเพื่อปรับความยาว
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPng}
              disabled={exporting}
              className="h-8 gap-1.5 text-xs"
            >
              {exporting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5 text-terracotta" />
              )}
              {exporting ? "กำลังสร้างรูป..." : "Export PNG"}
            </Button>
          </div>
        </div>

        {dragNotice && (
          <div
            role="alert"
            className="mb-3 rounded-lg border border-danger/35 bg-danger-tint px-3.5 py-2 text-xs font-medium text-danger-deep"
          >
            {dragNotice}
          </div>
        )}

        {/* Mobile Day Switcher */}
        <div
          role="group"
          aria-label="เลือกวัน"
          className="mb-4 flex items-center gap-1 overflow-x-auto rounded-xl border border-line bg-sheet p-1.5 md:hidden"
        >
          {DAYS_SHORT.map((short, i) => {
            const active = mobileDay === i;
            const hasBlocks = displayedBlocks.some((b) => b.day === i);
            return (
              <button
                key={short}
                type="button"
                aria-pressed={active}
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
            aria-pressed={mobileDay === "all"}
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
              ref={mobileScrollRef}
              className="grid max-h-[68vh] overflow-y-auto"
              style={{
                gridTemplateColumns: "4.25rem minmax(0, 1fr)",
                gridTemplateRows: `repeat(${HOURS.length}, ${ROW_REM}rem)`,
              }}
            >
              {HOURS.map((h, r) => (
                <div key={h} className="contents">
                  <div
                    className="border-r border-b border-line bg-sheet pt-1.5 pr-2.5 text-right font-mono text-xs text-ink-muted"
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
                    <Plus className="mx-auto h-5 w-5 text-terracotta opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" />
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
                              "rounded px-1.5 py-0.5 text-[11px] leading-none font-bold shrink-0",
                              isClass
                                ? "bg-terracotta/25 text-terracotta-deep"
                                : "bg-sage/25 text-sage-deep"
                            )}
                          >
                            {isClass ? "เรียน" : "อ่าน"}
                          </span>
                        </div>
                        {isClass && b.location && heightRem >= 4.2 && (
                          <span className="mt-0.5 inline-flex items-center gap-1 truncate font-mono text-[11px] opacity-90">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{b.location}</span>
                          </span>
                        )}
                        {b.topic && heightRem >= 3.5 && (
                          <span className="mt-0.5 inline-flex items-center gap-1 truncate opacity-90 text-[11px]">
                            {!isClass && chapterDone && (
                              <Check className="h-3 w-3 shrink-0 text-sage" strokeWidth={3} />
                            )}
                            <span className="truncate">{b.topic}</span>
                          </span>
                        )}
                        {heightRem >= 3 && (
                          <span className="mt-auto font-mono text-[11px] opacity-75">
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
            "max-h-[76vh] overflow-auto rounded-xl border border-line-strong bg-sheet shadow-[0_18px_40px_-28px_rgba(15,23,42,0.14)]",
            mobileDay !== "all" && "hidden md:block"
          )}
        >
          <div
            className="grid min-w-[860px]"
            style={{
              gridTemplateColumns: "4.25rem repeat(7, minmax(0, 1fr))",
              gridTemplateRows: `3.25rem repeat(${HOURS.length}, ${ROW_REM}rem)`,
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
                  <span className="rounded-full bg-terracotta px-1.5 py-0.5 text-[11px] leading-none font-semibold text-sheet">
                    วันนี้
                  </span>
                )}
              </div>
            ))}

            {/* time labels + clickable empty cells */}
            {HOURS.map((h, r) => (
              <div key={h} className="contents">
                <div
                  className="sticky left-0 z-10 border-r border-b border-line bg-sheet pt-1.5 pr-2.5 text-right font-mono text-xs text-ink-muted"
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
                    <Plus className="mx-auto h-5 w-5 text-terracotta opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" />
                  </button>
                ))}
              </div>
            ))}

            {/* Timetable blocks */}
            {DAYS.map((_, i) => {
              const showGhostHere = drag?.active && drag.candidate.day === i;
              const ghostSubject = showGhostHere ? subjectById.get(drag.candidate.subjectId) : undefined;
              const ghostColor = ghostSubject ? getSubjectColor(ghostSubject.color) : null;
              const ghostStartM = showGhostHere ? blockStartMinutes(drag.candidate) : 0;
              const ghostEndM = showGhostHere ? blockEndMinutes(drag.candidate) : 0;
              const ghostTopRem = ((ghostStartM - FIRST_HOUR * 60) / 60) * ROW_REM;
              const ghostHeightRem = ((ghostEndM - ghostStartM) / 60) * ROW_REM;

              return (
                <div
                  key={`day-overlay-${i}`}
                  ref={i === 0 ? firstDayColRef : undefined}
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
                      const isBeingDragged = drag?.active && drag.block.id === b.id;

                      return (
                        <div
                          key={b.id}
                          role="button"
                          tabIndex={0}
                          onPointerDown={(e) => startBlockDrag(e, b, "move")}
                          onClick={() => {
                            if (suppressClickRef.current) return;
                            setDraft(b);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setDraft(b);
                            }
                          }}
                          className={cn(
                            "group/block pointer-events-auto absolute inset-x-1 z-[5] flex select-none flex-col overflow-hidden rounded-lg border px-3 py-2 text-left text-xs leading-snug transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:outline-none sm:text-[13px]",
                            drag?.active ? "cursor-grabbing" : "cursor-grab",
                            isBeingDragged && "opacity-30",
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
                                "rounded px-1.5 py-0.5 text-[11px] leading-none font-bold shrink-0",
                                isClass
                                  ? "bg-terracotta/25 text-terracotta-deep"
                                  : "bg-sage/25 text-sage-deep"
                              )}
                            >
                              {isClass ? "เรียน" : "อ่าน"}
                            </span>
                          </div>

                          {isClass && b.location && heightRem >= 4.2 && (
                            <span className="mt-0.5 inline-flex items-center gap-1 truncate font-mono text-[11px] opacity-90">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">{b.location}</span>
                            </span>
                          )}

                          {b.topic && heightRem >= 3.5 && (
                            <span className="inline-flex items-center gap-1 truncate opacity-90 text-[11px]">
                              {!isClass && chapterDone && (
                                <Check className="h-3 w-3 shrink-0 text-sage" strokeWidth={3} />
                              )}
                              <span className="truncate">{b.topic}</span>
                            </span>
                          )}

                          {heightRem >= 3 && (
                            <span className="mt-auto font-mono text-[11px] opacity-75">
                              {formatBlockTime(b)}
                            </span>
                          )}

                          {/* Bottom resize handle */}
                          <div
                            onPointerDown={(e) => startBlockDrag(e, b, "resize")}
                            onClick={(e) => e.stopPropagation()}
                            title="ดึงเพื่อปรับระยะเวลา"
                            className="absolute inset-x-0 bottom-0 flex h-2.5 cursor-ns-resize items-center justify-center opacity-0 transition-opacity group-hover/block:opacity-100"
                          >
                            <span className="h-1 w-8 rounded-full bg-current opacity-40" />
                          </div>
                        </div>
                      );
                    })}

                  {/* Live Drag / Resize Ghost Preview */}
                  {showGhostHere && ghostSubject && ghostColor && (
                    <div
                      className={cn(
                        "pointer-events-none absolute inset-x-1 z-20 flex flex-col overflow-hidden rounded-lg border-2 px-3 py-2 text-left text-xs leading-snug shadow-lg",
                        drag.hasConflict
                          ? "border-danger bg-danger-tint text-danger-deep"
                          : cn("ring-2 ring-terracotta/40", ghostColor.blockClass)
                      )}
                      style={{
                        ...(!drag.hasConflict ? ghostColor.blockStyle : undefined),
                        top: `${ghostTopRem}rem`,
                        height: `calc(${ghostHeightRem}rem - 6px)`,
                      }}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate font-semibold">
                          {ghostSubject.emoji && <span className="mr-1">{ghostSubject.emoji}</span>}
                          {ghostSubject.name}
                        </span>
                        {drag.hasConflict && (
                          <span className="shrink-0 rounded bg-danger px-1.5 py-0.5 text-[11px] leading-none font-bold text-white">
                            ชนเวลา
                          </span>
                        )}
                      </div>
                      <span className="mt-auto font-mono text-[11px] font-semibold">
                        {formatBlockTime(drag.candidate)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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
          onSave={(name, color, emoji) => {
            dispatch({ type: "saveSubject", name, color, emoji });
            setAddingSubject(false);
          }}
        />
      )}
    </>
  );
}
