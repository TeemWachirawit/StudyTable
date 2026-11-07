"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Clock, Pencil, Plus } from "lucide-react";
import { useStudyStore } from "@/hooks/use-study-store";
import { SUBJECT_COLORS } from "@/lib/colors";
import { daysUntil, examReadiness, formatThaiDate, toISODate, uid } from "@/lib/study";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { LoadingDesk, PageHeader } from "@/components/PageHeader";
import type { Exam, Subject } from "@/types/study";
import { ExamEditor } from "./ExamEditor";

function urgencyStyle(days: number) {
  if (days < 0) return "bg-paper-deep text-ink-muted";
  if (days <= 3) return "bg-terracotta text-sheet";
  if (days <= 7) return "bg-mustard-tint text-[#7a5a17]";
  return "bg-paper-deep text-ink";
}

export function ExamBoard() {
  const { state, dispatch, hydrated } = useStudyStore();
  const [draft, setDraft] = useState<Exam | null>(null);

  const subjectById = useMemo(() => new Map(state.subjects.map((s) => [s.id, s])), [state.subjects]);
  const sorted = useMemo(() => [...state.exams].sort((a, b) => a.date.localeCompare(b.date)), [state.exams]);
  const upcoming = sorted.filter((e) => daysUntil(e.date) >= 0);
  const past = sorted.filter((e) => daysUntil(e.date) < 0).reverse();

  const openNew = () => {
    if (state.subjects.length === 0) return;
    const inAWeek = new Date();
    inAWeek.setDate(inAWeek.getDate() + 7);
    setDraft({
      id: uid(),
      subjectId: state.subjects[0].id,
      title: "",
      date: toISODate(inAWeek),
      time: "",
      chapterIds: [],
      extraTopics: [],
      notes: "",
    });
  };

  const header = (
    <PageHeader
      eyebrow="Exam"
      title="ตารางสอบและขอบเขตเนื้อหา"
      description="นับถอยหลังวันสอบแต่ละวิชา พร้อมรายการบทที่ออกสอบ และดูว่าอ่านครบแล้วกี่เปอร์เซ็นต์"
      actions={
        hydrated && state.subjects.length > 0 ? (
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" /> เพิ่มการสอบ
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

      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        {state.subjects.length === 0 ? (
          <EmptyState
            title="ยังไม่มีวิชา"
            body="เพิ่มวิชาและบทเรียนในหน้า Table ก่อน แล้วค่อยกลับมาลงวันสอบ"
            action={
              <Link href="/table" className={buttonVariants()}>
                ไปเพิ่มวิชาที่หน้า Table
              </Link>
            }
          />
        ) : upcoming.length === 0 && past.length === 0 ? (
          <EmptyState
            title="ยังไม่มีการสอบที่บันทึกไว้"
            body="เพิ่มวันสอบและหัวข้อที่ออกสอบ แล้วระบบจะนับถอยหลังให้"
            action={
              <Button onClick={openNew}>
                <Plus className="h-4 w-4" /> เพิ่มการสอบ
              </Button>
            }
          />
        ) : (
          <>
            <h2 className="mb-4 text-sm font-semibold text-ink-muted">กำลังจะมาถึง · {upcoming.length} รายการ</h2>
            {upcoming.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line-strong px-5 py-8 text-center text-ink-soft">
                ไม่มีการสอบที่กำลังจะมาถึง 🎉
              </p>
            ) : (
              <ol className="space-y-4">
                {upcoming.map((e) => (
                  <ExamRow key={e.id} exam={e} subject={subjectById.get(e.subjectId)} onEdit={() => setDraft(e)} />
                ))}
              </ol>
            )}

            {past.length > 0 && (
              <details className="mt-12 group">
                <summary className="cursor-pointer text-sm font-semibold text-ink-muted hover:text-ink">
                  สอบไปแล้ว · {past.length} รายการ
                </summary>
                <ol className="mt-4 space-y-4 opacity-75">
                  {past.map((e) => (
                    <ExamRow key={e.id} exam={e} subject={subjectById.get(e.subjectId)} onEdit={() => setDraft(e)} />
                  ))}
                </ol>
              </details>
            )}
          </>
        )}
      </div>

      {draft && (
        <ExamEditor
          draft={draft}
          isNew={!state.exams.some((e) => e.id === draft.id)}
          subjects={state.subjects}
          onClose={() => setDraft(null)}
          onSave={(exam) => {
            dispatch({ type: "saveExam", exam });
            setDraft(null);
          }}
          onDelete={(id) => {
            dispatch({ type: "deleteExam", id });
            setDraft(null);
          }}
        />
      )}
    </>
  );
}

function ExamRow({ exam, subject, onEdit }: { exam: Exam; subject: Subject | undefined; onEdit: () => void }) {
  const days = daysUntil(exam.date);
  const readiness = examReadiness(exam, subject);
  const chapters = subject?.chapters.filter((c) => exam.chapterIds.includes(c.id)) ?? [];
  const color = subject ? SUBJECT_COLORS[subject.color] : null;

  return (
    <li className="flex flex-col gap-4 rounded-xl border border-line-strong bg-sheet p-4 sm:flex-row sm:gap-5 sm:p-5">
      {/* countdown */}
      <div
        className={cn(
          "flex shrink-0 items-center justify-center gap-3 rounded-lg px-4 py-3 sm:w-24 sm:flex-col sm:gap-0 sm:py-4",
          urgencyStyle(days)
        )}
      >
        {days === 0 ? (
          <span className="text-xl font-bold">วันนี้</span>
        ) : (
          <>
            <span className="font-mono text-4xl leading-none font-semibold">{Math.abs(days)}</span>
            <span className="text-xs font-medium opacity-85 sm:mt-1.5">{days > 0 ? "วันที่เหลือ" : "วันที่แล้ว"}</span>
          </>
        )}
      </div>

      {/* details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-sm">
              {color && <span className={cn("h-2.5 w-2.5 rounded-full", color.solid)} />}
              <span className="font-semibold text-ink-soft">{subject?.name ?? "ไม่พบวิชา"}</span>
            </p>
            <h3 className="mt-0.5 font-display text-xl font-bold">{exam.title || "การสอบ"}</h3>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
              <span>{formatThaiDate(exam.date)}</span>
              {exam.time && (
                <span className="inline-flex items-center gap-1 font-mono">
                  <Clock className="h-3.5 w-3.5" /> {exam.time} น.
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-md p-1.5 text-ink-muted hover:bg-paper-deep hover:text-ink"
            aria-label={`แก้ไข ${subject?.name ?? ""} ${exam.title}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>

        {/* topics */}
        {(chapters.length > 0 || exam.extraTopics.length > 0) && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold tracking-wide text-ink-muted">เนื้อหาที่ออกสอบ</p>
            <ul className="flex flex-wrap gap-1.5">
              {chapters.map((c) => (
                <li
                  key={c.id}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs",
                    c.done ? "border-sage/40 bg-sage-tint text-sage" : "border-line bg-paper text-ink-soft"
                  )}
                >
                  {c.done && <Check className="h-3 w-3" strokeWidth={3} />}
                  {c.title}
                </li>
              ))}
              {exam.extraTopics.map((t) => (
                <li key={t} className="rounded-md border border-dashed border-line-strong px-2 py-1 text-xs text-ink-soft">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* readiness */}
        {readiness.total > 0 && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-ink-muted">
                ความพร้อม · อ่านแล้ว {readiness.done}/{readiness.total} บท
              </span>
              <span className="font-mono font-semibold">{readiness.pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-paper-deep">
              <div
                className={cn("h-1.5 rounded-full", readiness.pct === 100 ? "bg-sage" : (color?.solid ?? "bg-ink"))}
                style={{ width: `${readiness.pct}%` }}
              />
            </div>
          </div>
        )}

        {exam.notes && <p className="mt-3 text-sm text-ink-soft">📝 {exam.notes}</p>}
      </div>
    </li>
  );
}

function EmptyState({ title, body, action }: { title: string; body: string; action: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="font-display text-xl font-bold">{title}</p>
      <p className="mt-2 text-ink-soft">{body}</p>
      <div className="mt-6">{action}</div>
    </div>
  );
}

