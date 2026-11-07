"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Pencil, Plus, X } from "lucide-react";
import { useStudyStore } from "@/hooks/use-study-store";
import { getSubjectColor } from "@/lib/colors";
import { daysUntil, subjectProgress } from "@/lib/study";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/ui/field";
import { LoadingDesk, PageHeader } from "@/components/PageHeader";
import type { Subject } from "@/types/study";
import { SubjectEditor } from "./SubjectEditor";

export function StudyDesk() {
  const { state, dispatch, hydrated } = useStudyStore();
  const [editing, setEditing] = useState<Subject | "new" | null>(null);

  const totals = useMemo(() => {
    const all = state.subjects.flatMap((s) => s.chapters);
    const done = all.filter((c) => c.done).length;
    return { done, total: all.length, pct: all.length ? Math.round((done / all.length) * 100) : 0 };
  }, [state.subjects]);

  const header = (
    <PageHeader
      eyebrow="Table"
      tone="mint"
      title="โต๊ะเรียนของฉัน"
      description="บันทึกว่าแต่ละวิชาอ่านไปถึงบทไหนแล้ว ติ๊กบทที่อ่านจบ ระบบคำนวณความคืบหน้าให้อัตโนมัติ"
      actions={
        hydrated ? (
          <Button onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" /> เพิ่มวิชา
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

  return (
    <>
      {header}

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        {state.subjects.length > 0 && (
          <dl className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat
              label="ความคืบหน้ารวม"
              value={`${totals.pct}%`}
              badge="Progress"
              toneClass="border-terracotta/25 bg-terracotta-tint text-terracotta-deep"
            />
            <Stat
              label="บทที่อ่านจบแล้ว"
              value={`${totals.done}/${totals.total}`}
              badge="Chapters"
              toneClass="border-sage/25 bg-sage-tint text-sage-deep"
            />
            <Stat
              label="วิชาบนโต๊ะเรียน"
              value={String(state.subjects.length)}
              badge="Subjects"
              toneClass="border-mustard/35 bg-mustard-tint text-mustard-deep"
            />
          </dl>
        )}

        {state.subjects.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-line-strong bg-sheet px-6 py-16 text-center">
            <p className="font-display text-xl font-bold text-ink">โต๊ะยังว่างอยู่</p>
            <p className="mt-2 text-ink-soft">เริ่มจากเพิ่มวิชาที่ต้องอ่าน แล้วใส่รายการบทเรียนของแต่ละวิชา</p>
            <Button className="mt-6" onClick={() => setEditing("new")}>
              <Plus className="h-4 w-4" /> เพิ่มวิชาแรก
            </Button>
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-2">
            {state.subjects.map((s) => (
              <SubjectPanel key={s.id} subject={s} onEdit={() => setEditing(s)} />
            ))}
          </div>
        )}
      </div>

      {editing && (
        <SubjectEditor
          subject={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={(name, color) => {
            dispatch({ type: "saveSubject", id: editing === "new" ? undefined : editing.id, name, color });
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
  badge,
  toneClass,
}: {
  label: string;
  value: string;
  badge: string;
  toneClass: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-line-strong bg-sheet px-5 py-4 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.1)]">
      <div>
        <dt className="text-xs font-medium text-ink-muted sm:text-sm">{label}</dt>
        <dd className="mt-1 font-mono text-2xl font-semibold text-ink sm:text-3xl">{value}</dd>
      </div>
      <span className={cn("rounded-full border px-2.5 py-1 font-mono text-[11px] font-semibold", toneClass)}>
        {badge}
      </span>
    </div>
  );
}

function SubjectPanel({ subject, onEdit }: { subject: Subject; onEdit: () => void }) {
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
      className="flex flex-col overflow-hidden rounded-xl border border-line-strong bg-sheet shadow-[0_12px_28px_-22px_rgba(15,23,42,0.12)]"
    >
      <div className={cn("h-1.5", color.solidClass)} style={color.solidStyle} />
      <div className="px-5 pt-4 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={cn("h-2.5 w-2.5 rounded-full", color.solidClass)}
                style={color.solidStyle}
                aria-hidden="true"
              />
              <h2 id={`subject-${subject.id}`} className="font-display text-xl font-bold text-ink">
                {subject.name}
              </h2>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
              <Link
                href="/planner"
                className="rounded-md bg-paper-deep px-2 py-0.5 font-medium text-ink-soft transition-colors hover:text-ink"
              >
                วางแผนไว้ {plannedHours} ชม./สัปดาห์
              </Link>
              {nextExam && (
                <Link
                  href="/exam"
                  className="rounded-md border border-mustard/30 bg-mustard-tint px-2 py-0.5 font-medium text-mustard-deep hover:underline"
                >
                  {nextExam.title} · อีก {daysUntil(nextExam.date)} วัน
                </Link>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-paper-deep hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
            aria-label={`แก้ไขวิชา ${subject.name}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
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

      <ul className="max-h-80 overflow-y-auto border-t border-line">
        {subject.chapters.length === 0 && (
          <li className="px-5 py-4 text-sm text-ink-muted">ยังไม่มีบทเรียน เพิ่มบทแรกด้านล่างได้เลย</li>
        )}
        {subject.chapters.map((c, i) => (
          <li
            key={c.id}
            className="group flex items-center gap-2 border-b border-line/70 px-5 py-2.5 transition-colors last:border-b-0 hover:bg-paper"
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
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingChapterId(c.id);
                    setEditingTitle(c.title);
                  }}
                  className="rounded p-1 text-ink-muted opacity-60 transition-opacity hover:bg-paper-deep hover:text-ink focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label={`เปลี่ยนชื่อบท ${c.title}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "deleteChapter", subjectId: subject.id, chapterId: c.id })}
                  className="rounded p-1 text-ink-muted opacity-60 transition-opacity hover:bg-slate-tint hover:text-slate-deep focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label={`ลบบท ${c.title}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      <form
        className="flex gap-2 border-t border-line bg-paper px-5 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          addChapter();
        }}
      >
        <input
          className={cn(inputClass, "h-9")}
          placeholder="เพิ่มบทเรียน เช่น บทที่ 5 · ปริพันธ์"
          value={newChapter}
          onChange={(e) => setNewChapter(e.target.value)}
          aria-label={`เพิ่มบทเรียนในวิชา ${subject.name}`}
        />
        <Button type="submit" size="sm" variant="outline" disabled={!newChapter.trim()}>
          <Plus className="h-4 w-4" /> เพิ่ม
        </Button>
      </form>
    </section>
  );
}
