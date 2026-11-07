"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Pencil, Plus, X } from "lucide-react";
import { useStudyStore } from "@/hooks/use-study-store";
import { SUBJECT_COLORS } from "@/lib/colors";
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
          <dl className="mb-8 grid grid-cols-3 divide-x divide-line rounded-xl border border-line-strong bg-sheet">
            <Stat label="ความคืบหน้ารวม" value={`${totals.pct}%`} />
            <Stat label="บทที่อ่านจบ" value={`${totals.done}/${totals.total}`} />
            <Stat label="วิชาบนโต๊ะ" value={String(state.subjects.length)} />
          </dl>
        )}

        {state.subjects.length === 0 ? (
          <div className="mx-auto max-w-md py-16 text-center">
            <p className="font-display text-xl font-bold">โต๊ะยังว่างอยู่</p>
            <p className="mt-2 text-ink-soft">เริ่มจากเพิ่มวิชาที่ต้องอ่าน แล้วใส่รายการบทเรียนของแต่ละวิชา</p>
            <Button className="mt-6" onClick={() => setEditing("new")}>
              <Plus className="h-4 w-4" /> เพิ่มวิชาแรก
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-4 sm:px-6">
      <dt className="text-xs text-ink-muted sm:text-sm">{label}</dt>
      <dd className="mt-1 font-mono text-2xl font-semibold sm:text-3xl">{value}</dd>
    </div>
  );
}

function SubjectPanel({ subject, onEdit }: { subject: Subject; onEdit: () => void }) {
  const { state, dispatch } = useStudyStore();
  const [newChapter, setNewChapter] = useState("");
  const color = SUBJECT_COLORS[subject.color];
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

  return (
    <section
      aria-labelledby={`subject-${subject.id}`}
      className="flex flex-col overflow-hidden rounded-xl border border-line-strong bg-sheet"
    >
      <div className={cn("h-1.5", color.solid)} />
      <div className="px-5 pt-4 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={`subject-${subject.id}`} className="font-display text-xl font-bold">
              {subject.name}
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              วางแผนไว้ {plannedHours} ชม./สัปดาห์
              {nextExam && (
                <>
                  {" · "}
                  <Link href="/exam" className="text-terracotta hover:underline">
                    {nextExam.title}อีก {daysUntil(nextExam.date)} วัน
                  </Link>
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-md p-1.5 text-ink-muted hover:bg-paper-deep hover:text-ink"
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
            <span className={cn("font-mono font-semibold", color.text)}>{pct}%</span>
          </div>
          <div
            className="h-2.5 rounded-full bg-paper-deep"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`ความคืบหน้า ${subject.name}`}
          >
            <div className={cn("h-2.5 rounded-full transition-[width]", color.solid)} style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <ul className="flex-1 border-t border-line">
        {subject.chapters.length === 0 && (
          <li className="px-5 py-4 text-sm text-ink-muted">ยังไม่มีบทเรียน เพิ่มบทแรกด้านล่างได้เลย</li>
        )}
        {subject.chapters.map((c, i) => (
          <li key={c.id} className="group flex items-center gap-3 border-b border-line/70 px-5 py-2.5 last:border-b-0">
            <button
              type="button"
              role="checkbox"
              aria-checked={c.done}
              onClick={() => dispatch({ type: "toggleChapter", subjectId: subject.id, chapterId: c.id })}
              className="flex flex-1 items-center gap-3 text-left text-sm"
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
              <span className={c.done ? "text-ink-muted line-through decoration-line-strong" : "text-ink"}>{c.title}</span>
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "deleteChapter", subjectId: subject.id, chapterId: c.id })}
              className="rounded p-1 text-ink-muted opacity-0 group-hover:opacity-100 hover:text-terracotta focus-visible:opacity-100"
              aria-label={`ลบบท ${c.title}`}
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      <form
        className="flex gap-2 border-t border-line bg-paper/60 px-5 py-3"
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

