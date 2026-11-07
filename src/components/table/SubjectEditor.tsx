"use client";

import { useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { COLOR_KEYS, SUBJECT_COLORS, type SubjectColor } from "@/lib/colors";
import { cn } from "@/lib/utils";
import type { Subject } from "@/types/study";

interface Props {
  subject: Subject | null;
  onClose: () => void;
  onSave: (name: string, color: SubjectColor) => void;
  onDelete?: () => void;
}

export function SubjectEditor({ subject, onClose, onSave, onDelete }: Props) {
  const [name, setName] = useState(subject?.name ?? "");
  const [color, setColor] = useState<SubjectColor>(subject?.color ?? "terracotta");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const valid = name.trim().length > 0;

  const submit = () => valid && onSave(name.trim(), color);

  return (
    <Modal
      open
      onClose={onClose}
      title={subject ? "แก้ไขวิชา" : "เพิ่มวิชาใหม่"}
      footer={
        <>
          {onDelete && (
            <div className="mr-auto flex items-center gap-2">
              {confirmingDelete ? (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-slate hover:bg-slate-deep"
                    onClick={onDelete}
                  >
                    ยืนยันลบวิชา
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
                  <Trash2 className="h-4 w-4" /> ลบวิชา
                </Button>
              )}
            </div>
          )}
          <Button variant="outline" onClick={onClose} className={onDelete ? undefined : "ml-auto"}>
            ยกเลิก
          </Button>
          <Button onClick={submit} disabled={!valid}>
            บันทึก
          </Button>
        </>
      }
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Field label="ชื่อวิชา" htmlFor="subject-name">
          <input
            id="subject-name"
            className={inputClass}
            placeholder="เช่น เคมี"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-ink">สีประจำวิชา</legend>
          <div className="flex flex-wrap gap-2">
            {COLOR_KEYS.map((key) => {
              const c = SUBJECT_COLORS[key];
              const selected = key === color;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setColor(key)}
                  aria-pressed={selected}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                    c.block,
                    selected && "ring-2 ring-ink ring-offset-2 ring-offset-sheet"
                  )}
                >
                  <span className={cn("flex h-4 w-4 items-center justify-center rounded-full text-sheet", c.solid)}>
                    {selected && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  {c.label}
                </button>
              );
            })}
          </div>
        </fieldset>
        {confirmingDelete && (
          <p role="alert" className="rounded-lg border border-slate/30 bg-slate-tint px-3 py-2 text-xs text-slate-deep">
            การลบวิชา &ldquo;{subject?.name}&rdquo; จะลบตารางอ่านและรายการสอบของวิชานี้ทั้งหมดด้วย
          </p>
        )}
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
