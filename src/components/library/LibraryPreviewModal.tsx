"use client";

import { useMemo, useState } from "react";
import { BookPlus, Check, Layers, Plus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";
import { getSubjectColor } from "@/lib/colors";
import {
  LIBRARY_CATEGORIES,
  normalizeTitle,
  type LibraryItem,
  type LibraryMatchStatus,
} from "@/lib/library-catalog";
import { cn } from "@/lib/utils";

interface Props {
  item: LibraryItem;
  match: LibraryMatchStatus;
  onClose: () => void;
  onConfirm: (payload: {
    name: string;
    chapters: string[];
    mergeIntoSubjectId?: string;
  }) => void;
}

export function LibraryPreviewModal({ item, match, onClose, onConfirm }: Props) {
  const hasMatch = Boolean(match.matchedSubject);
  const [mode, setMode] = useState<"merge" | "new">(
    hasMatch && !match.isFullyImported ? "merge" : hasMatch ? "new" : "new"
  );
  const [customName, setCustomName] = useState(
    hasMatch && match.isFullyImported ? `${item.name} (ใหม่)` : item.name
  );

  const existingChapterKeys = useMemo(() => {
    if (!match.matchedSubject) return new Set<string>();
    return new Set(match.matchedSubject.chapters.map((c) => normalizeTitle(c.title)));
  }, [match.matchedSubject]);

  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(() => {
    if (hasMatch && !match.isFullyImported) {
      // Pre-select only missing chapters when merging
      const missingSet = new Set<number>();
      item.chapters.forEach((ch, idx) => {
        if (!existingChapterKeys.has(normalizeTitle(ch))) {
          missingSet.add(idx);
        }
      });
      return missingSet;
    }
    return new Set(item.chapters.map((_, idx) => idx));
  });

  const color = getSubjectColor(item.color);
  const categoryMeta = LIBRARY_CATEGORIES.find((c) => c.id === item.category);

  const toggleIndex = (idx: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const selectAll = () => {
    if (mode === "merge" && hasMatch) {
      const missing = new Set<number>();
      item.chapters.forEach((ch, idx) => {
        if (!existingChapterKeys.has(normalizeTitle(ch))) missing.add(idx);
      });
      setSelectedIndices(missing);
    } else {
      setSelectedIndices(new Set(item.chapters.map((_, idx) => idx)));
    }
  };

  const clearAll = () => setSelectedIndices(new Set());

  const handleModeChange = (nextMode: "merge" | "new") => {
    setMode(nextMode);
    if (nextMode === "merge" && hasMatch) {
      const missing = new Set<number>();
      item.chapters.forEach((ch, idx) => {
        if (!existingChapterKeys.has(normalizeTitle(ch))) missing.add(idx);
      });
      setSelectedIndices(missing);
    } else {
      setSelectedIndices(new Set(item.chapters.map((_, idx) => idx)));
    }
  };

  const selectedChapters = item.chapters.filter((ch, idx) => {
    if (!selectedIndices.has(idx)) return false;
    if (mode === "merge" && hasMatch && existingChapterKeys.has(normalizeTitle(ch))) {
      return false;
    }
    return true;
  });

  const canSubmit =
    selectedChapters.length > 0 &&
    (mode === "merge" ? Boolean(match.matchedSubject) : customName.trim().length > 0);

  const handleConfirm = () => {
    if (!canSubmit) return;
    onConfirm({
      name: mode === "merge" && match.matchedSubject ? match.matchedSubject.name : customName.trim(),
      chapters: selectedChapters,
      mergeIntoSubjectId: mode === "merge" && match.matchedSubject ? match.matchedSubject.id : undefined,
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`${item.emoji} ${item.name}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button onClick={handleConfirm} disabled={!canSubmit} className="gap-1.5">
            {mode === "merge" && hasMatch ? (
              <>
                <Plus className="h-4 w-4" />
                เพิ่ม {selectedChapters.length} บทเข้าวิชาเดิม
              </>
            ) : (
              <>
                <BookPlus className="h-4 w-4" />
                หยิบเข้า Table ({selectedChapters.length} บท)
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Header summary */}
        <div className="rounded-xl border border-line bg-paper p-3.5 text-xs text-ink-soft">
          <div className="flex flex-wrap items-center gap-2">
            {categoryMeta && (
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                  categoryMeta.badgeClass
                )}
              >
                {categoryMeta.label}
              </span>
            )}
            {item.code && (
              <span className="rounded-md bg-paper-deep px-2 py-0.5 font-mono text-[11px] font-semibold text-ink">
                {item.code}
              </span>
            )}
            <span className="font-mono text-[11px] text-ink-muted">
              ทั้งหมด {item.chapters.length} บทเรียน
            </span>
          </div>
          <p className="mt-2 leading-relaxed">{item.description}</p>
        </div>

        {/* Mode toggle when subject already exists on Table */}
        {hasMatch && match.matchedSubject && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-paper p-1 text-xs">
              <button
                type="button"
                aria-pressed={mode === "merge"}
                disabled={match.isFullyImported}
                onClick={() => handleModeChange("merge")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg py-2 font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-45",
                  mode === "merge"
                    ? "border border-line bg-sheet text-ink shadow-2xs"
                    : "text-ink-soft hover:text-ink"
                )}
              >
                <Layers className="h-3.5 w-3.5 text-sage" />
                รวมเข้าวิชาเดิม ({match.missingChapters.length} บทที่ขาด)
              </button>
              <button
                type="button"
                aria-pressed={mode === "new"}
                onClick={() => handleModeChange("new")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg py-2 font-semibold transition-all",
                  mode === "new"
                    ? "border border-line bg-sheet text-ink shadow-2xs"
                    : "text-ink-soft hover:text-ink"
                )}
              >
                <BookPlus className="h-3.5 w-3.5 text-terracotta" />
                สร้างเป็นวิชาใหม่
              </button>
            </div>
            {match.isFullyImported && (
              <p className="text-xs text-sage-deep">
                วิชา &ldquo;{match.matchedSubject.name}&rdquo; มีครบทั้ง {match.totalChapters} บทบนหน้า Table แล้ว หากต้องการชุดใหม่สามารถเปลี่ยนชื่อด้านล่างเพื่อสร้างแยกได้
              </p>
            )}
          </div>
        )}

        {/* Subject name input when creating a new subject */}
        {mode === "new" && (
          <Field label="ชื่อวิชาที่จะแสดงบนหน้า Table" htmlFor="library-subject-name">
            <input
              id="library-subject-name"
              className={inputClass}
              value={customName}
              maxLength={120}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="ระบุชื่อวิชา"
            />
          </Field>
        )}

        {/* Chapters checklist */}
        <div>
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-semibold text-ink">
              เลือกบทเรียนที่จะหยิบ ({selectedChapters.length}/{item.chapters.length} บท)
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={selectAll}
                className="font-medium text-terracotta-deep hover:underline"
              >
                เลือกทั้งหมด
              </button>
              <span className="text-line-strong">|</span>
              <button
                type="button"
                onClick={clearAll}
                className="font-medium text-ink-muted hover:text-ink hover:underline"
              >
                ล้างการเลือก
              </button>
            </div>
          </div>

          <div className="max-h-64 space-y-1.5 overflow-y-auto rounded-xl border border-line bg-paper/50 p-2">
            {item.chapters.map((chapter, idx) => {
              const alreadyOnTable =
                mode === "merge" && hasMatch && existingChapterKeys.has(normalizeTitle(chapter));
              const checked = !alreadyOnTable && selectedIndices.has(idx);

              return (
                <label
                  key={`${item.id}-ch-${idx}`}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg border px-3 py-2 text-xs transition-colors",
                    alreadyOnTable
                      ? "cursor-default border-transparent bg-paper text-ink-muted opacity-70"
                      : checked
                        ? "cursor-pointer border-line-strong bg-sheet text-ink shadow-2xs"
                        : "cursor-pointer border-transparent bg-transparent text-ink-soft hover:bg-sheet/70"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={alreadyOnTable || checked}
                    disabled={alreadyOnTable}
                    onChange={() => toggleIndex(idx)}
                    className="h-4 w-4 shrink-0 rounded border-line text-terracotta focus:ring-terracotta disabled:opacity-50"
                  />
                  <span className="font-mono text-[11px] text-ink-muted">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 leading-snug">{chapter}</span>
                  {alreadyOnTable && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sage-tint px-2 py-0.5 text-[10px] font-semibold text-sage-deep">
                      <Check className="h-3 w-3" strokeWidth={3} />
                      มีแล้ว
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* Color preview strip */}
        <div className="flex items-center gap-2 text-[11px] text-ink-muted">
          <span
            className={cn("h-2.5 w-2.5 rounded-full", color.solidClass)}
            style={color.solidStyle}
            aria-hidden="true"
          />
          <span>
            เมื่อกดยืนยัน ข้อมูลจะถูกเพิ่มเข้าหน้า Table และบันทึกอัตโนมัติทันที (แก้ไขหรือติ๊กอ่านจบได้ตามปกติ)
          </span>
        </div>
      </div>
    </Modal>
  );
}
