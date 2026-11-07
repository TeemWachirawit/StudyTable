"use client";

import { useMemo, useState } from "react";
import { BookOpen, CalendarCheck, Check, Clock, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { getSubjectColor } from "@/lib/colors";
import { DAYS, formatHour, isClassBlock, isStudyBlock, suggestStudyBlocks, type StudySlotSuggestion } from "@/lib/study";
import { cn } from "@/lib/utils";
import type { StudyBlock, StudyState } from "@/types/study";

interface Props {
  state: StudyState;
  onClose: () => void;
  onApply: (blocks: StudyBlock[]) => void;
}

export function SmartStudyModal({ state, onClose, onApply }: Props) {
  const [preferredWindow, setPreferredWindow] = useState<"evening" | "weekend" | "all">("all");
  const [hoursPerSubject, setHoursPerSubject] = useState<number>(2);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(
    () => state.subjects.map((s) => s.id)
  );

  const subjectById = useMemo(
    () => new Map(state.subjects.map((s) => [s.id, s])),
    [state.subjects]
  );

  const suggestions = useMemo(() => {
    return suggestStudyBlocks(state, {
      preferredWindow,
      hoursPerSubject,
      subjectIds: selectedSubjectIds,
    });
  }, [state, preferredWindow, hoursPerSubject, selectedSubjectIds]);

  const [selectedSuggestionIds, setSelectedSuggestionIds] = useState<Set<string>>(() => new Set());

  // Synchronize selected suggestions whenever suggestions change
  const currentSuggestionsKey = suggestions.map((s) => s.id).join(",");
  const [lastKey, setLastKey] = useState("");
  if (currentSuggestionsKey !== lastKey) {
    setLastKey(currentSuggestionsKey);
    setSelectedSuggestionIds(new Set(suggestions.map((s) => s.id)));
  }

  const toggleSuggestion = (id: string) => {
    setSelectedSuggestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSubject = (id: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectedList = suggestions.filter((s) => selectedSuggestionIds.has(s.id));

  const handleApply = () => {
    const blocksToAdd: StudyBlock[] = selectedList.map((s) => ({
      id: s.id,
      subjectId: s.subjectId,
      day: s.day,
      startHour: s.startHour,
      duration: s.duration,
      topic: s.topic,
      type: "study",
    }));
    onApply(blocksToAdd);
    onClose();
  };

  const classCount = state.blocks.filter(isClassBlock).length;
  const currentStudyHours = state.blocks.filter(isStudyBlock).reduce((sum, b) => sum + b.duration, 0);

  return (
    <Modal
      open
      onClose={onClose}
      title="จัดสรรเวลาอ่านหนังสืออัตโนมัติ"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleApply}
            disabled={selectedList.length === 0}
            className="gap-2"
          >
            <CalendarCheck className="h-4 w-4" />
            เพิ่มลงตาราง ({selectedList.length} ช่วงอ่านหนังสือ)
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-line-strong bg-paper p-3.5 text-xs text-ink-soft">
          <p className="font-semibold text-ink flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-mustard" />
            ผู้ช่วยคำนวณช่วงเวลาอ่านหนังสือจากตารางเรียนของคุณ
          </p>
          <p className="mt-1 leading-relaxed">
            ระบบจะตรวจสอบคาบเรียนทั้งหมด ({classCount} คาบ) และหาช่วงเวลาว่างที่เหมาะสมที่สุด
            โดยจัดเวลาทบทวนบทเรียนหลังเลิกเรียน หรือเตรียมพร้อมก่อนสอบให้อัตโนมัติ ไม่ชนกับตารางเรียนใดๆ
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink">
              ช่วงเวลาที่สะดวกอ่าน
            </label>
            <div className="grid grid-cols-3 gap-1 rounded-lg border border-line bg-paper p-1 text-xs">
              <button
                type="button"
                onClick={() => setPreferredWindow("all")}
                className={cn(
                  "rounded-md py-1.5 font-medium transition-colors",
                  preferredWindow === "all"
                    ? "bg-sheet font-semibold text-ink shadow-2xs"
                    : "text-ink-soft hover:text-ink"
                )}
              >
                ทุกช่วงว่าง
              </button>
              <button
                type="button"
                onClick={() => setPreferredWindow("evening")}
                className={cn(
                  "rounded-md py-1.5 font-medium transition-colors",
                  preferredWindow === "evening"
                    ? "bg-sheet font-semibold text-ink shadow-2xs"
                    : "text-ink-soft hover:text-ink"
                )}
              >
                ช่วงเย็น (จ–ศ)
              </button>
              <button
                type="button"
                onClick={() => setPreferredWindow("weekend")}
                className={cn(
                  "rounded-md py-1.5 font-medium transition-colors",
                  preferredWindow === "weekend"
                    ? "bg-sheet font-semibold text-ink shadow-2xs"
                    : "text-ink-soft hover:text-ink"
                )}
              >
                เสาร์–อาทิตย์
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink">
              เป้าหมายเวลาอ่านต่อวิชา
            </label>
            <div className="grid grid-cols-3 gap-1 rounded-lg border border-line bg-paper p-1 text-xs">
              {[1, 2, 3].map((hrs) => (
                <button
                  key={hrs}
                  type="button"
                  onClick={() => setHoursPerSubject(hrs)}
                  className={cn(
                    "rounded-md py-1.5 font-medium transition-colors",
                    hoursPerSubject === hrs
                      ? "bg-sheet font-semibold text-ink shadow-2xs"
                      : "text-ink-soft hover:text-ink"
                  )}
                >
                  {hrs} ชม./สัปดาห์
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Subjects Filter */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink">
            เลือกวิชาที่ต้องการจัดตารางอ่าน
          </label>
          <div className="flex flex-wrap gap-1.5">
            {state.subjects.map((s) => {
              const active = selectedSubjectIds.includes(s.id);
              const color = getSubjectColor(s.color);
              const hasClass = state.blocks.some((b) => b.subjectId === s.id && isClassBlock(b));
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSubject(s.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                    active
                      ? "border-line-strong bg-sheet text-ink shadow-2xs"
                      : "border-line bg-paper text-ink-muted hover:border-line-strong"
                  )}
                >
                  <span
                    className={cn("h-2 w-2 rounded-full", active ? color.solidClass : "bg-ink-muted/50")}
                    style={active ? color.solidStyle : undefined}
                  />
                  <span>{s.name}</span>
                  {hasClass && (
                    <span className="text-[10px] text-terracotta font-normal">
                      (มีตารางเรียน)
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Suggestions List */}
        <div>
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-semibold text-ink">
              แผนตารางอ่านหนังสือที่แนะนำ ({suggestions.length} ช่วง)
            </span>
            {suggestions.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (selectedSuggestionIds.size === suggestions.length) {
                    setSelectedSuggestionIds(new Set());
                  } else {
                    setSelectedSuggestionIds(new Set(suggestions.map((s) => s.id)));
                  }
                }}
                className="text-terracotta hover:underline"
              >
                {selectedSuggestionIds.size === suggestions.length ? "ยกเลิกเลือกทั้งหมด" : "เลือกทั้งหมด"}
              </button>
            )}
          </div>

          {suggestions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line-strong py-8 text-center text-xs text-ink-muted">
              ไม่พบช่วงเวลาว่างที่ตรงกับเงื่อนไข หรือคุณมีตารางอ่านครอบคลุมแล้ว ลองเลือก &quot;ทุกช่วงว่าง&quot; หรือเพิ่มเป้าหมายเวลา
            </div>
          ) : (
            <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
              {suggestions.map((s) => {
                const subject = subjectById.get(s.subjectId);
                const color = subject ? getSubjectColor(subject.color) : getSubjectColor("terracotta");
                const isChecked = selectedSuggestionIds.has(s.id);

                return (
                  <div
                    key={s.id}
                    onClick={() => toggleSuggestion(s.id)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-2.5 transition-all text-xs",
                      isChecked
                        ? "border-line-strong bg-sheet shadow-2xs"
                        : "border-line bg-paper opacity-60 hover:opacity-100"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSuggestion(s.id)}
                        className="h-4 w-4 rounded border-line text-terracotta focus:ring-terracotta shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                              color.blockClass
                            )}
                            style={color.blockStyle}
                          >
                            <span
                              className={cn("h-1.5 w-1.5 rounded-full", color.solidClass)}
                              style={color.solidStyle}
                            />
                            {subject?.name ?? "วิชา"}
                          </span>
                          <span className="font-semibold text-ink">
                            วัน{DAYS[s.day]} {formatHour(s.startHour)}–{formatHour(s.startHour + s.duration)}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-ink-soft">
                          <span className="text-ink font-medium">{s.topic}</span> · {s.reason}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 rounded bg-paper-deep px-1.5 py-0.5 font-mono text-[11px] font-semibold text-ink-soft">
                      {s.duration} ชม.
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
