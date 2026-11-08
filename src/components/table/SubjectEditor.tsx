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

const PRESET_EMOJIS = [
  "📐", "🔬", "🧪", "⚡", "💻", "📚", "🇬🇧", "🌏", "⚖️", "📊",
  "🎨", "🎵", "🧠", "💊", "💡", "📝", "🚀", "📖", "✏️", "🩺"
];

interface Props {
  subject: Subject | null;
  onClose: () => void;
  onSave: (name: string, color: SubjectColor, emoji?: string) => void;
  onDelete?: () => void;
}

export function SubjectEditor({ subject, onClose, onSave, onDelete }: Props) {
  const [name, setName] = useState(subject?.name ?? "");
  const [color, setColor] = useState<SubjectColor>(subject?.color ?? "terracotta");
  const [emoji, setEmoji] = useState(subject?.emoji ?? "📚");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const valid = name.trim().length > 0;

  const resolved = getSubjectColor(color);
  const submit = () => valid && onSave(name.trim(), color, emoji.trim() || undefined);

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
        <div className="space-y-3">
          <Field label="ชื่อวิชาและไอคอน Emoji" htmlFor="subject-name">
            <div className="flex items-center gap-2">
              {/* Emoji Display / Custom input */}
              <div className="relative shrink-0">
                <input
                  type="text"
                  maxLength={4}
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  className="flex h-11 w-14 items-center justify-center rounded-lg border border-line-strong bg-paper text-center text-xl shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                  title="พิมพ์หรือวาง Emoji"
                  placeholder="📚"
                />
              </div>

              {/* Name Input */}
              <input
                id="subject-name"
                className={cn(inputClass, "flex-1")}
                placeholder="เช่น แคลคูลัส, เคมีอินทรีย์"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </Field>

          {/* Preset Emojis */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-ink-muted">เลือก Emoji ที่สื่อถึงวิชานี้:</p>
            <div className="flex flex-wrap gap-1.5 rounded-xl border border-line bg-paper/60 p-2">
              {PRESET_EMOJIS.map((e) => {
                const isSelected = emoji === e;
                return (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-transform hover:scale-110 active:scale-95",
                      isSelected
                        ? "border border-terracotta/40 bg-sheet shadow-xs ring-2 ring-terracotta/30"
                        : "hover:bg-sheet/80"
                    )}
                  >
                    {e}
                  </button>
                );
              })}
              {emoji && (
                <button
                  type="button"
                  onClick={() => setEmoji("")}
                  className="rounded-lg px-2 text-xs text-ink-muted transition-colors hover:bg-sheet hover:text-ink"
                  title="ไม่ใช้ Emoji"
                >
                  ลบออก
                </button>
              )}
            </div>
          </div>
        </div>

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
