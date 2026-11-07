"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Field, inputClass, textareaClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Exam, Subject } from "@/types/study";

interface Props {
  draft: Exam;
  isNew: boolean;
  subjects: Subject[];
  onClose: () => void;
  onSave: (exam: Exam) => void;
  onDelete: (id: string) => void;
}

export function ExamEditor({ draft, isNew, subjects, onClose, onSave, onDelete }: Props) {
  const [form, setForm] = useState<Exam>(draft);
  const [extraText, setExtraText] = useState(draft.extraTopics.join("\n"));
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const subject = subjects.find((s) => s.id === form.subjectId);
  const valid = form.title.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(form.date);

  const toggleChapter = (id: string) =>
    setForm((f) => ({
      ...f,
      chapterIds: f.chapterIds.includes(id) ? f.chapterIds.filter((c) => c !== id) : [...f.chapterIds, id],
    }));

  const submit = () => {
    if (!valid) return;
    onSave({
      ...form,
      title: form.title.trim(),
      notes: form.notes.trim(),
      extraTopics: extraText
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean),
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isNew ? "เพิ่มการสอบ" : "แก้ไขการสอบ"}
      footer={
        <>
          {!isNew && (
            <div className="mr-auto flex items-center gap-2">
              {confirmingDelete ? (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-slate hover:bg-slate-deep"
                    onClick={() => onDelete(form.id)}
                  >
                    ยืนยันลบ
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(false)}>
                    ยกเลิก
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-deep hover:bg-slate-tint hover:text-slate-deep"
                  onClick={() => setConfirmingDelete(true)}
                >
                  <Trash2 className="h-4 w-4" /> ลบ
                </Button>
              )}
            </div>
          )}
          <Button variant="outline" onClick={onClose} className={isNew ? "ml-auto" : undefined}>
            ยกเลิก
          </Button>
          <Button onClick={submit} disabled={!valid}>
            บันทึก
          </Button>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="วิชา" htmlFor="exam-subject">
            <select
              id="exam-subject"
              className={inputClass}
              value={form.subjectId}
              // chapters belong to a subject, so reset the selection when it changes
              onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value, chapterIds: [] }))}
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="ชื่อการสอบ" htmlFor="exam-title">
            <input
              id="exam-title"
              className={inputClass}
              placeholder="เช่น สอบกลางภาค"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </Field>
          <Field label="วันสอบ" htmlFor="exam-date">
            <input
              id="exam-date"
              type="date"
              className={inputClass}
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </Field>
          <Field label="เวลา (ไม่บังคับ)" htmlFor="exam-time">
            <input
              id="exam-time"
              type="time"
              className={inputClass}
              value={form.time}
              onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
            />
          </Field>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-ink">บทที่ออกสอบ</legend>
          {subject && subject.chapters.length > 0 ? (
            <ul className="max-h-52 overflow-y-auto rounded-lg border border-line">
              {subject.chapters.map((c) => {
                const checked = form.chapterIds.includes(c.id);
                return (
                  <li key={c.id} className="border-b border-line/70 last:border-b-0">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={checked}
                      onClick={() => toggleChapter(c.id)}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-terracotta"
                    >
                      <span
                        className={cn(
                          "flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border",
                          checked ? "border-terracotta bg-terracotta text-sheet" : "border-line-strong"
                        )}
                      >
                        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
                      </span>
                      <span className="flex-1 text-ink">{c.title}</span>
                      {c.done && (
                        <span className="rounded-full bg-sage-tint px-2 py-0.5 text-xs font-medium text-sage-deep">
                          อ่านแล้ว
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="rounded-lg border border-dashed border-line-strong px-3 py-3 text-sm text-ink-muted">
              วิชานี้ยังไม่มีบทเรียน{" "}
              <Link href="/table" className="font-medium text-terracotta hover:underline">
                เพิ่มบทในหน้า Table
              </Link>{" "}
              หรือพิมพ์หัวข้อเองด้านล่าง
            </p>
          )}
        </fieldset>

        <Field label="หัวข้ออื่นๆ ที่ออกสอบ" htmlFor="exam-extra" hint="พิมพ์หัวข้อละหนึ่งบรรทัด">
          <textarea
            id="exam-extra"
            className={textareaClass}
            rows={2}
            placeholder="เช่น Writing: Opinion paragraph"
            value={extraText}
            onChange={(e) => setExtraText(e.target.value)}
          />
        </Field>

        <Field label="บันทึกเพิ่มเติม" htmlFor="exam-notes">
          <textarea
            id="exam-notes"
            className={textareaClass}
            rows={2}
            placeholder="เช่น ห้องสอบ อุปกรณ์ที่ต้องเตรียม"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </Field>
      </form>
    </Modal>
  );
}
