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
            <Button
              variant="ghost"
              className="mr-auto text-terracotta hover:text-terracotta-deep"
              onClick={() => {
                if (confirm(`ลบวิชา "${subject?.name}"? ช่วงอ่านในตารางและรายการสอบของวิชานี้จะถูกลบด้วย`)) onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" /> ลบวิชา
            </Button>
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
          <legend className="mb-2 text-sm font-semibold">สีประจำวิชา</legend>
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
                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm",
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
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}

