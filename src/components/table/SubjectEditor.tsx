"use client";

import { useState } from "react";
import { Check, Palette, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import {
  COLOR_KEYS,
  EXTRA_PRESET_HEX,
  SUBJECT_COLORS,
  getSubjectColor,
  isPresetColor,
  type SubjectColor,
} from "@/lib/colors";
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

  const resolved = getSubjectColor(color);
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

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-ink">สีประจำวิชา</legend>

          {/* Preset colors */}
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
                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                    c.block,
                    selected && "ring-2 ring-ink ring-offset-2 ring-offset-sheet"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full text-sheet",
                      c.solid
                    )}
                  >
                    {selected && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  {c.label}
                </button>
              );
            })}

            {EXTRA_PRESET_HEX.map((item) => {
              const selected =
                !isPresetColor(color) && color.toLowerCase() === item.hex.toLowerCase();
              const itemResolved = getSubjectColor(item.hex);
              return (
                <button
                  key={item.hex}
                  type="button"
                  onClick={() => setColor(item.hex)}
                  aria-pressed={selected}
                  style={itemResolved.blockStyle}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                    selected && "ring-2 ring-ink ring-offset-2 ring-offset-sheet"
                  )}
                >
                  <span
                    style={itemResolved.solidStyle}
                    className="flex h-4 w-4 items-center justify-center rounded-full text-sheet"
                  >
                    {selected && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Custom Color Picker */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-paper p-3">
            <div className="flex items-center gap-2.5">
              <label
                htmlFor="custom-subject-color"
                className="relative flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-line-strong shadow-2xs"
                style={{ backgroundColor: resolved.hex }}
                title="คลิกเพื่อเลือกสีตามต้องการ"
              >
                <input
                  id="custom-subject-color"
                  type="color"
                  value={resolved.hex}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <Palette className="h-4 w-4 text-white drop-shadow-xs" />
              </label>
              <div>
                <p className="text-xs font-semibold text-ink">เลือกสีตามต้องการ (Custom Color)</p>
                <p className="font-mono text-[11px] text-ink-muted">
                  รหัสสีปัจจุบัน: {resolved.hex.toUpperCase()}
                </p>
              </div>
            </div>

            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold",
                resolved.blockClass
              )}
              style={resolved.blockStyle}
            >
              <span
                className={cn("h-2.5 w-2.5 rounded-full", resolved.solidClass)}
                style={resolved.solidStyle}
              />
              <span>{name.trim() || "ตัวอย่างสีวิชา"}</span>
            </div>
          </div>
        </fieldset>

        {confirmingDelete && (
          <p
            role="alert"
            className="rounded-lg border border-slate/30 bg-slate-tint px-3 py-2 text-xs text-slate-deep"
          >
            การลบวิชา &ldquo;{subject?.name}&rdquo; จะลบตารางอ่านและรายการสอบของวิชานี้ทั้งหมดด้วย
          </p>
        )}
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
