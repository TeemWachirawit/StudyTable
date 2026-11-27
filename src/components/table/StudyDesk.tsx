"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Library, Pencil, Pin, Plus, Timer, X } from "lucide-react";
import { useStudyStore } from "@/hooks/use-study-store";
import { getSubjectColor } from "@/lib/colors";
import { daysUntil, formatStudySeconds, orderSubjectsWithPinned, subjectProgress } from "@/lib/study";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { inputClass } from "@/components/ui/field";
import { LoadingDesk, PageHeader } from "@/components/PageHeader";
import type { Subject } from "@/types/study";
import { FocusTimer } from "./FocusTimer";
import { SubjectEditor } from "./SubjectEditor";

export function StudyDesk() {
  const { state, dispatch, hydrated } = useStudyStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editing, setEditing] = useState<Subject | "new" | null>(null);
  const [focusSubjectId, setFocusSubjectId] = useState<string>("");
  const [timerExpandSignal, setTimerExpandSignal] = useState(0);
  const timerSectionRef = useRef<HTMLDivElement>(null);

  const paramSubjectId = searchParams.get("subject");
  const paramChapters = searchParams.get("chapters");
  const pinnedSubjectId = useMemo(() => {
    if (paramSubjectId && state.subjects.some((s) => s.id === paramSubjectId)) {
      return paramSubjectId;
    }
    return null;
  }, [paramSubjectId, state.subjects]);

  const targetChapterIds = useMemo(() => {
    if (!pinnedSubjectId || !paramChapters) return new Set<string>();
    return new Set(
      paramChapters
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
    );
  }, [pinnedSubjectId, paramChapters]);

  const orderedSubjects = useMemo(
    () => orderSubjectsWithPinned(state.subjects, pinnedSubjectId),
    [state.subjects, pinnedSubjectId]
  );

  // When arriving from Today's To-Do (?subject=...), automatically target it in FocusTimer
  useEffect(() => {
    if (pinnedSubjectId) {
      setFocusSubjectId(pinnedSubjectId);
    }
  }, [pinnedSubjectId]);

  const effectiveFocusSubjectId = useMemo(() => {
    if (focusSubjectId && state.subjects.some((s) => s.id === focusSubjectId)) {
      return focusSubjectId;
    }
    return orderedSubjects[0]?.id ?? "";
  }, [focusSubjectId, state.subjects, orderedSubjects]);

  const clearPinnedSubject = () => {
    router.replace("/table", { scroll: false });
  };

  const totals = useMemo(() => {
    const all = state.subjects.flatMap((s) => s.chapters);
    const done = all.filter((c) => c.done).length;
    const totalStudySeconds = state.subjects.reduce((sum, s) => sum + (s.studySeconds ?? 0), 0);
    return {
      done,
      total: all.length,
      pct: all.length ? Math.round((done / all.length) * 100) : 0,
      totalStudySeconds,
    };
  }, [state.subjects]);

  const handleFocusSubject = (subjectId: string) => {
    setFocusSubjectId(subjectId);
    setTimerExpandSignal((n) => n + 1);
    timerSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const header = (
    <PageHeader
      eyebrow="Table"
      tone="mint"
      title="โต๊ะเรียนของฉัน"
      description="บันทึกว่าแต่ละวิชาอ่านไปถึงบทไหนแล้ว ติ๊กบทที่อ่านจบ ระบบคำนวณความคืบหน้าให้อัตโนมัติ"
      actions={
        hydrated ? (
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/library" className={buttonVariants({ variant: "outline" })}>
              <Library className="h-4 w-4 text-indigo" /> หยิบจาก Library
            </Link>
            <Button onClick={() => setEditing("new")}>
              <Plus className="h-4 w-4" /> เพิ่มวิชา
            </Button>
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

  return (
    <>
      {header}

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        {state.subjects.length > 0 && (
          <dl className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="ความคืบหน้ารวม" value={`${totals.pct}%`} dotClass="bg-terracotta" />
            <Stat label="บทที่อ่านจบแล้ว" value={`${totals.done}/${totals.total}`} dotClass="bg-sage" />
            <Stat
              label="เวลาอ่านสะสมรวม"
              value={formatStudySeconds(totals.totalStudySeconds)}
              dotClass="bg-plum"
            />
            <Stat label="วิชาบนโต๊ะเรียน" value={String(state.subjects.length)} dotClass="bg-mustard" />
          </dl>
        )}

        {state.subjects.length > 0 && (
          <div ref={timerSectionRef} className="scroll-mt-20">
            <FocusTimer
              subjects={state.subjects}
              selectedSubjectId={effectiveFocusSubjectId}
              onSelectSubject={setFocusSubjectId}
              expandSignal={timerExpandSignal}
              onLogStudyTime={(subjectId, seconds) =>
                dispatch({ type: "addStudyTime", subjectId, seconds })
              }
            />
          </div>
        )}

        {state.subjects.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-line-strong bg-sheet px-6 py-16 text-center">
            <p className="font-display text-xl font-bold text-ink">โต๊ะยังว่างอยู่</p>
            <p className="mt-2 text-ink-soft">เริ่มจากเพิ่มวิชาที่ต้องอ่าน แล้วใส่รายการบทเรียนของแต่ละวิชา</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/library" className={buttonVariants({ variant: "outline" })}>
                <Library className="h-4 w-4 text-indigo" /> หยิบจาก Library
              </Link>
              <Button onClick={() => setEditing("new")}>
                <Plus className="h-4 w-4" /> เพิ่มวิชาแรก
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-2">
            {orderedSubjects.map((s) => (
              <SubjectPanel
                key={s.id}
                subject={s}
                isPinned={s.id === pinnedSubjectId}
                targetChapterIds={s.id === pinnedSubjectId ? targetChapterIds : undefined}
                onUnpin={clearPinnedSubject}
                isFocused={s.id === effectiveFocusSubjectId}
                onFocus={() => handleFocusSubject(s.id)}
                onEdit={() => setEditing(s)}
              />
            ))}
          </div>
        )}
      </div>

      {editing && (
        <SubjectEditor
          subject={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={(name, color, emoji) => {
            dispatch({ type: "saveSubject", id: editing === "new" ? undefined : editing.id, name, color, emoji });
            setEditing(null);
          }}
          onDelete={
            editing === "new"
              ? undefined
              : () => {
                dispatch({ type: "deleteSubject", id: editing.id });
                setEditing(null);
              }
          }
        />
      )}
    </>
  );
}

function Stat({
  label,
  value,
  dotClass,
}: {
  label: string;
  value: string;
  dotClass: string;
}) {
  return (
    <div className="rounded-xl border border-line-strong bg-sheet px-5 py-4 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.1)]">
      <dt className="flex items-center gap-2 text-xs font-medium text-ink-muted sm:text-sm">
        <span className={cn("h-2 w-2 rounded-full", dotClass)} aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-1.5 font-mono text-2xl font-semibold text-ink sm:text-3xl">{value}</dd>
    </div>
  );
}

function SubjectPanel({
  subject,
  isPinned,
  targetChapterIds,
  onUnpin,
  isFocused,
  onFocus,
  onEdit,
}: {
  subject: Subject;
  isPinned: boolean;
  targetChapterIds?: Set<string>;
  onUnpin: () => void;
  isFocused: boolean;
  onFocus: () => void;
  onEdit: () => void;
}) {
  const { state, dispatch } = useStudyStore();
  const [newChapter, setNewChapter] = useState("");
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const color = getSubjectColor(subject.color);
  const { done, total, pct } = subjectProgress(subject);

  const plannedHours = state.blocks.filter((b) => b.subjectId === subject.id).reduce((n, b) => n + b.duration, 0);
  const nextExam = state.exams
    .filter((e) => e.subjectId === subject.id && daysUntil(e.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const addChapter = () => {
    const title = newChapter.trim();
    if (!title) return;
    dispatch({ type: "addChapter", subjectId: subject.id, title });
    setNewChapter("");
  };

  const commitChapterEdit = (chapterId: string) => {
    const trimmed = editingTitle.trim();
    if (trimmed) {
      dispatch({ type: "updateChapter", subjectId: subject.id, chapterId, title: trimmed });
    }
    setEditingChapterId(null);
  };

  return (
    <section
      aria-labelledby={`subject-${subject.id}`}
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border bg-sheet shadow-[0_12px_28px_-22px_rgba(15,23,42,0.12)]",
        isPinned
          ? "border-terracotta/60 ring-2 ring-terracotta/30"
          : "border-line-strong"
      )}
    >
      <div className={cn("h-1.5", color.solidClass)} style={color.solidStyle} />
      {isPinned && (
        <div className="flex items-center justify-between gap-2 border-b border-terracotta/20 bg-terracotta-tint/60 px-5 py-2 text-xs font-semibold text-terracotta-deep">
          <span className="inline-flex items-center gap-1.5">
            <Pin className="h-3.5 w-3.5" />
            กำลังอ่านจาก To-Do วันนี้
          </span>
          <button
            type="button"
            onClick={onUnpin}
            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium text-terracotta-deep/80 transition-colors hover:bg-terracotta/15 hover:text-terracotta-deep"
          >
            <X className="h-3 w-3" /> คืนลำดับปกติ
          </button>
        </div>
      )}
      <div className="px-5 pt-4 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              {subject.emoji ? (
                <span className="text-xl leading-none select-none" role="img" aria-label={subject.name}>
                  {subject.emoji}
                </span>
              ) : (
                <span
                  className={cn("h-2.5 w-2.5 rounded-full", color.solidClass)}
                  style={color.solidStyle}
                  aria-hidden="true"
                />
              )}
              <h2 id={`subject-${subject.id}`} className="font-display text-xl font-bold text-ink">
                {subject.name}
              </h2>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-ink-muted">
              <span className="inline-flex items-center gap-1 font-medium text-plum-deep">
                <Timer className="h-3 w-3" />
                อ่านแล้ว {formatStudySeconds(subject.studySeconds ?? 0)}
              </span>
              <span aria-hidden="true" className="text-line-strong">·</span>
              <Link
                href="/planner"
                className="font-medium text-ink-soft transition-colors hover:text-ink hover:underline"
              >
                วางแผน {plannedHours} ชม./สัปดาห์
              </Link>
              {nextExam && (
                <>
                  <span aria-hidden="true" className="text-line-strong">·</span>
                  <Link
                    href="/exam"
                    className="font-semibold text-mustard-deep hover:underline"
                  >
                    {nextExam.title} อีก {daysUntil(nextExam.date)} วัน
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={onFocus}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta",
                isFocused
                  ? "border-terracotta/40 bg-terracotta-tint text-terracotta-deep"
                  : "border-line bg-paper text-ink-soft hover:bg-paper-deep hover:text-ink"
              )}
              aria-label={`จับเวลาโฟกัสวิชา ${subject.name}`}
            >
              <Timer className="h-3.5 w-3.5" />
              โฟกัส
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-paper-deep hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
              aria-label={`แก้ไขวิชา ${subject.name}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="text-ink-soft">
              อ่านแล้ว {done} จาก {total} บท
            </span>
            <span className={cn("font-mono font-semibold", color.textClass)} style={color.textStyle}>
              {pct}%
            </span>
          </div>
          <div
            className="h-2.5 rounded-full bg-paper-deep"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`ความคืบหน้า ${subject.name}`}
          >
            <div
              className={cn("h-2.5 rounded-full transition-[width]", color.solidClass)}
              style={{ ...color.solidStyle, width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Add Chapter moved to top for instant access */}
      <form
        className="flex gap-2 border-t border-line bg-paper/60 px-5 py-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          addChapter();
        }}
      >
        <input
          className={cn(inputClass, "h-9 bg-sheet text-sm placeholder:text-ink-muted/70")}
          placeholder="+ เพิ่มบทเรียนใหม่ในวิชานี้..."
          value={newChapter}
          onChange={(e) => setNewChapter(e.target.value)}
          aria-label={`เพิ่มบทเรียนในวิชา ${subject.name}`}
        />
        <Button type="submit" size="sm" variant="outline" disabled={!newChapter.trim()}>
          <Plus className="h-4 w-4" /> เพิ่ม
        </Button>
      </form>

      <ul className="border-t border-line">
        {subject.chapters.length === 0 && (
          <li className="px-5 py-6 text-center text-sm text-ink-muted">
            ยังไม่มีบทเรียน พิมพ์ชื่อบทเรียนด้านบนเพื่อเริ่มบันทึก
          </li>
        )}
        {subject.chapters.map((c, i) => {
          const isTargetToday = targetChapterIds?.has(c.id) ?? false;
          return (
            <li
              key={c.id}
              className={cn(
                "group flex items-center gap-2 border-b border-line/70 px-5 py-2.5 transition-colors last:border-b-0 hover:bg-paper",
                isTargetToday && "bg-terracotta-tint/35 hover:bg-terracotta-tint/45"
              )}
            >
              {editingChapterId === c.id ? (
                <form
                  className="flex flex-1 items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    commitChapterEdit(c.id);
                  }}
                >
                  <input
                    className={cn(inputClass, "h-8 text-sm")}
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => commitChapterEdit(c.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setEditingChapterId(null);
                    }}
                    autoFocus
                    aria-label="แก้ไขชื่อบทเรียน"
                  />
                </form>
              ) : (
                <>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={c.done}
                    onClick={() => dispatch({ type: "toggleChapter", subjectId: subject.id, chapterId: c.id })}
                    className="flex flex-1 items-center gap-3 rounded-md py-0.5 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                        c.done ? "border-sage bg-sage text-sheet" : "border-line-strong bg-sheet group-hover:border-ink-muted"
                      )}
                    >
                      {c.done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    </span>
                    <span className="font-mono text-xs text-ink-muted">{String(i + 1).padStart(2, "0")}</span>
                    <span className={c.done ? "text-ink-muted line-through decoration-line-strong" : "text-ink"}>
                      {c.title}
                    </span>
                    {isTargetToday && (
                      <span className="ml-auto rounded-full bg-terracotta-tint px-2 py-0.5 text-[11px] font-semibold text-terracotta-deep">
                        เป้าหมายวันนี้
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingChapterId(c.id);
                      setEditingTitle(c.title);
                    }}
                    className="rounded p-1.5 text-ink-muted opacity-70 transition-opacity hover:bg-paper-deep hover:text-ink hover:opacity-100 focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
                    aria-label={`เปลี่ยนชื่อบท ${c.title}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "deleteChapter", subjectId: subject.id, chapterId: c.id })}
                    className="rounded p-1.5 text-ink-muted opacity-70 transition-opacity hover:bg-danger-tint hover:text-danger-deep hover:opacity-100 focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
                    aria-label={`ลบบท ${c.title}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
