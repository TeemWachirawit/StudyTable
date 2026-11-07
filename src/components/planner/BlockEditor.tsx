"use client";

import { useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { DAYS, FIRST_HOUR, LAST_HOUR, findConflict, formatHour } from "@/lib/study";
import { cn } from "@/lib/utils";
import type { StudyBlock, Subject } from "@/types/study";

interface Props {
  draft: StudyBlock;
  isNew: boolean;
  subjects: Subject[];
  blocks: StudyBlock[];
  onClose: () => void;
  onSave: (block: StudyBlock) => void;
  onDelete: (id: string) => void;
}

export function BlockEditor({ draft, isNew, subjects, blocks, onClose, onSave, onDelete }: Props) {
  const [form, setForm] = useState<StudyBlock>(draft);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const set = <K extends keyof StudyBlock>(key: K, value: StudyBlock[K]) => setForm((f) => ({ ...f, [key]: value }));

  const subject = subjects.find((s) => s.id === form.subjectId);
  const overflow = form.startHour + form.duration > LAST_HOUR;
  const conflict = findConflict(blocks, form);
  const conflictSubject = conflict && subjects.find((s) => s.id === conflict.subjectId);
  const error = overflow
    ? `ช่วงเวลาเกิน ${formatHour(LAST_HOUR)} กรุณาลดระยะเวลาหรือเลือกเวลาเริ่มให้เร็วขึ้น`
    : conflict
      ? `ชนกับ ${conflictSubject?.name ?? "ช่วงอื่น"} (${formatHour(conflict.startHour)}–${formatHour(conflict.startHour + conflict.duration)}) ในวันเดียวกัน`
      : null;

  const startOptions = Array.from({ length: LAST_HOUR - FIRST_HOUR }, (_, i) => FIRST_HOUR + i);

  return (
    <Modal
      open
      onClose={onClose}
      title={isNew ? "เพิ่มช่วงอ่านหนังสือ" : "แก้ไขช่วงอ่านหนังสือ"}
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
                  onClick={() => setConfirmingDelete(true)}
                  className="text-slate-deep hover:bg-slate-tint hover:text-slate-deep"
                >
                  <Trash2 className="h-4 w-4" /> ลบ
                </Button>
              )}
            </div>
          )}
          <Button variant="outline" onClick={onClose} className={isNew ? "ml-auto" : undefined}>
            ยกเลิก
          </Button>
          <Button onClick={() => onSave({ ...form, topic: form.topic.trim() })} disabled={!!error}>
            บันทึก
          </Button>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!error) onSave({ ...form, topic: form.topic.trim() });
        }}
      >
        <Field label="วิชา" htmlFor="block-subject">
          <select
            id="block-subject"
            className={inputClass}
            value={form.subjectId}
            onChange={(e) => set("subjectId", e.target.value)}
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="หัวข้อที่จะอ่าน"
          htmlFor="block-topic"
          hint={subject && subject.chapters.length > 0 ? "คลิกเลือกจากบทเรียนด้านล่าง หรือพิมพ์หัวข้อเอง" : undefined}
        >
          <input
            id="block-topic"
            className={inputClass}
            placeholder="เช่น บทที่ 3 · อนุพันธ์"
            value={form.topic}
            onChange={(e) => set("topic", e.target.value)}
          />
          {subject && subject.chapters.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {subject.chapters.map((c) => {
                const active = form.topic === c.title;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => set("topic", c.title)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                      active
                        ? "border-terracotta bg-terracotta-tint text-terracotta-deep"
                        : c.done
                          ? "border-line bg-paper text-ink-muted hover:border-line-strong"
                          : "border-line-strong bg-sheet text-ink-soft hover:bg-paper-deep hover:text-ink"
                    )}
                  >
                    {c.done && <Check className="h-3 w-3 text-sage" strokeWidth={3} />}
                    {c.title}
                  </button>
                );
              })}
            </div>
          )}
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="วัน" htmlFor="block-day">
            <select id="block-day" className={inputClass} value={form.day} onChange={(e) => set("day", Number(e.target.value))}>
              {DAYS.map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
          <Field label="เริ่ม" htmlFor="block-start">
            <select
              id="block-start"
              className={inputClass}
              value={form.startHour}
              onChange={(e) => set("startHour", Number(e.target.value))}
            >
              {startOptions.map((h) => (
                <option key={h} value={h}>
                  {formatHour(h)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="ระยะเวลา" htmlFor="block-duration">
            <select
              id="block-duration"
              className={inputClass}
              value={form.duration}
              onChange={(e) => set("duration", Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} ชม.
                </option>
              ))}
            </select>
          </Field>
        </div>

        {error && (
          <p role="alert" className="rounded-lg border border-slate/30 bg-slate-tint px-3 py-2 text-sm text-slate-deep">
            {error}
          </p>
        )}
        {/* lets Enter submit the form */}
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
