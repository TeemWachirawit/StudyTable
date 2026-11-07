"use client";

import { useMemo, useState } from "react";
import { BookOpen, Check, GraduationCap, MapPin, Sparkles, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { DAYS, FIRST_HOUR, LAST_HOUR, findConflict, formatHour, uid } from "@/lib/study";
import { cn } from "@/lib/utils";
import type { StudyBlock, Subject } from "@/types/study";

interface Props {
  draft: StudyBlock;
  isNew: boolean;
  subjects: Subject[];
  blocks: StudyBlock[];
  onClose: () => void;
  onSave: (block: StudyBlock, followUp?: StudyBlock) => void;
  onDelete: (id: string) => void;
}

export function BlockEditor({ draft, isNew, subjects, blocks, onClose, onSave, onDelete }: Props) {
  const [form, setForm] = useState<StudyBlock>({
    ...draft,
    type: draft.type ?? "study",
    location: draft.location ?? "",
  });
  const [autoAddStudy, setAutoAddStudy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const set = <K extends keyof StudyBlock>(key: K, value: StudyBlock[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

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

  // Compute recommended follow-up review slot after class
  const followUpCandidate = useMemo(() => {
    if (form.type !== "class" || !isNew) return null;
    const end = form.startHour + form.duration;
    let targetHour = Math.max(end, 17);
    if (targetHour >= LAST_HOUR) targetHour = end;

    const simulated = [...blocks.filter((b) => b.id !== form.id), form];

    while (targetHour < LAST_HOUR) {
      const candidate: StudyBlock = {
        id: "candidate",
        subjectId: form.subjectId,
        day: form.day,
        startHour: targetHour,
        duration: 1,
        topic: "",
        type: "study",
      };
      if (!findConflict(simulated, candidate)) {
        return {
          id: uid(),
          subjectId: form.subjectId,
          day: form.day,
          startHour: targetHour,
          duration: 1,
          topic: `ทบทวน: ${subject?.name ?? "บทเรียน"}`,
          type: "study" as const,
        };
      }
      targetHour++;
    }
    return null;
  }, [form, isNew, blocks, subject]);

  const handleSave = () => {
    if (error) return;
    const cleanBlock: StudyBlock = {
      ...form,
      topic: form.topic.trim(),
      location: (form.location ?? "").trim(),
    };
    onSave(cleanBlock, autoAddStudy && followUpCandidate ? followUpCandidate : undefined);
  };

  const isClass = form.type === "class";

  return (
    <Modal
      open
      onClose={onClose}
      title={
        isNew
          ? isClass
            ? "เพิ่มตารางเรียน (คาบเรียน)"
            : "เพิ่มตารางอ่านหนังสือ"
          : isClass
            ? "แก้ไขตารางเรียน"
            : "แก้ไขช่วงอ่านหนังสือ"
      }
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
          <Button onClick={handleSave} disabled={!!error}>
            บันทึก
          </Button>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        {/* Type Switcher */}
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-paper p-1 text-xs">
          <button
            type="button"
            onClick={() => set("type", "class")}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg py-2 font-semibold transition-all",
              isClass
                ? "border border-line bg-sheet text-ink shadow-2xs"
                : "text-ink-soft hover:text-ink"
            )}
          >
            <GraduationCap className="h-4 w-4 text-terracotta" />
            ตารางเรียน (Class)
          </button>
          <button
            type="button"
            onClick={() => set("type", "study")}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg py-2 font-semibold transition-all",
              !isClass
                ? "border border-line bg-sheet text-ink shadow-2xs"
                : "text-ink-soft hover:text-ink"
            )}
          >
            <BookOpen className="h-4 w-4 text-sage" />
            ตารางอ่านหนังสือ (Study)
          </button>
        </div>

        {/* Subject */}
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

        {/* If Class: Location field */}
        {isClass && (
          <Field
            label="ห้องเรียน / อาคาร / ลิงก์ออนไลน์"
            htmlFor="block-location"
            hint="เช่น ห้อง SC-302, อาคาร 4 ชั้น 2, หรือ Zoom"
          >
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
              <input
                id="block-location"
                className={cn(inputClass, "pl-9")}
                placeholder="เช่น ห้อง SC-302"
                value={form.location ?? ""}
                onChange={(e) => set("location", e.target.value)}
              />
            </div>
          </Field>
        )}

        {/* Topic field */}
        <Field
          label={isClass ? "หัวข้อบรรยาย / ชื่ออาจารย์ (ถ้ามี)" : "หัวข้อที่จะอ่าน"}
          htmlFor="block-topic"
          hint={
            !isClass && subject && subject.chapters.length > 0
              ? "คลิกเลือกจากบทเรียนด้านล่าง หรือพิมพ์หัวข้อเอง"
              : undefined
          }
        >
          <input
            id="block-topic"
            className={inputClass}
            placeholder={isClass ? "เช่น บรรยาย: บทที่ 1-2, อ.สมชาย" : "เช่น บทที่ 3 · อนุพันธ์"}
            value={form.topic}
            onChange={(e) => set("topic", e.target.value)}
          />

          {!isClass && subject && subject.chapters.length > 0 && (
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

        {/* Time & Day Selectors */}
        <div className="grid grid-cols-3 gap-3">
          <Field label="วัน" htmlFor="block-day">
            <select
              id="block-day"
              className={inputClass}
              value={form.day}
              onChange={(e) => set("day", Number(e.target.value))}
            >
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

        {/* Auto Add Study Review after class */}
        {isNew && isClass && followUpCandidate && (
          <div className="rounded-xl border border-line bg-paper p-3 text-xs transition-colors">
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={autoAddStudy}
                onChange={(e) => setAutoAddStudy(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-line text-terracotta focus:ring-terracotta"
              />
              <div className="space-y-0.5">
                <span className="flex items-center gap-1 font-semibold text-ink">
                  <Sparkles className="h-3.5 w-3.5 text-mustard" />
                  เพิ่มช่วงอ่านหนังสือทบทวนต่อหลังเลิกเรียน
                </span>
                <p className="text-ink-soft leading-normal">
                  จัดสรรเวลาทบทวนวิชานี้อัตโนมัติในวันเดียวกัน ช่วงเวลา{" "}
                  <strong className="text-ink">
                    {formatHour(followUpCandidate.startHour)}–{formatHour(followUpCandidate.startHour + followUpCandidate.duration)}
                  </strong>{" "}
                  (1 ชม.)
                </p>
              </div>
            </label>
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-slate/30 bg-slate-tint px-3 py-2 text-sm text-slate-deep"
          >
            {error}
          </p>
        )}
        {/* lets Enter submit the form */}
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
