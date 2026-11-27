"use client";

import { useMemo, useState } from "react";
import { CalendarCheck2, Check, Clock, Info, Link2, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/ui/field";
import { formatThaiDate } from "@/lib/study";
import {
  buildExamFromTcas,
  findMatchingSubjectForTcas,
  getTcasExamsForCohort,
  isTcasExamAlreadyAdded,
  MAX_DEK_YEAR,
  MIN_DEK_YEAR,
  POPULAR_DEK_YEARS,
  TCAS_EXAM_GROUPS,
  TCAS_PRESET_BUNDLES,
  type TcasExamGroup,
} from "@/lib/tcas-exams";
import { cn } from "@/lib/utils";
import type { Exam, Subject } from "@/types/study";

interface Props {
  initialDekYear: number;
  subjects: Subject[];
  existingExams: Exam[];
  onClose: () => void;
  onAddExams: (exams: Exam[], dekYear: number) => void;
}

const GROUP_BADGE: Record<TcasExamGroup, string> = {
  tgat: "border-terracotta/30 bg-terracotta-tint text-terracotta-deep",
  tpat: "border-plum/30 bg-plum-tint text-plum-deep",
  alevel: "border-slate/30 bg-slate-tint text-slate-deep",
};

export function TcasExamModal({
  initialDekYear,
  subjects,
  existingExams,
  onClose,
  onAddExams,
}: Props) {
  const isInitialPopular = POPULAR_DEK_YEARS.includes(
    initialDekYear as (typeof POPULAR_DEK_YEARS)[number]
  );

  const [dekYear, setDekYear] = useState<number>(initialDekYear);
  const [customMode, setCustomMode] = useState<boolean>(!isInitialPopular);
  const [customInput, setCustomInput] = useState<string>(String(initialDekYear));
  const [activeGroup, setActiveGroup] = useState<TcasExamGroup | "all">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const resolvedExams = useMemo(() => getTcasExamsForCohort(dekYear), [dekYear]);

  const alreadyAddedSet = useMemo(() => {
    const set = new Set<string>();
    for (const item of resolvedExams) {
      if (isTcasExamAlreadyAdded(item, existingExams)) {
        set.add(item.id);
      }
    }
    return set;
  }, [resolvedExams, existingExams]);

  const matchedSubjectByExamId = useMemo(() => {
    const map = new Map<string, Subject>();
    for (const item of resolvedExams) {
      const match = findMatchingSubjectForTcas(item, subjects);
      if (match) map.set(item.id, match);
    }
    return map;
  }, [resolvedExams, subjects]);

  const visibleExams = useMemo(() => {
    if (activeGroup === "all") return resolvedExams;
    return resolvedExams.filter((e) => e.group === activeGroup);
  }, [resolvedExams, activeGroup]);

  // Filter out any selected IDs that are already added in the currently selected cohort
  const effectiveSelectedIds = useMemo(
    () => selectedIds.filter((id) => !alreadyAddedSet.has(id)),
    [selectedIds, alreadyAddedSet]
  );

  const handleSelectPopularDek = (year: number) => {
    setDekYear(year);
    setCustomMode(false);
    setCustomInput(String(year));
  };

  const handleCustomInputChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, "").slice(0, 2);
    setCustomInput(digitsOnly);
    const parsed = Number.parseInt(digitsOnly, 10);
    if (!Number.isNaN(parsed) && parsed >= MIN_DEK_YEAR && parsed <= MAX_DEK_YEAR) {
      setDekYear(parsed);
    }
  };

  const toggleExam = (id: string) => {
    if (alreadyAddedSet.has(id)) return;
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const applyBundle = (examIds: string[]) => {
    setSelectedIds(examIds.filter((id) => !alreadyAddedSet.has(id)));
  };

  const handleSubmit = () => {
    if (effectiveSelectedIds.length === 0) return;
    const chosen = resolvedExams.filter((item) => effectiveSelectedIds.includes(item.id));
    const newExams = chosen.map((item) => buildExamFromTcas(item, subjects));
    onAddExams(newExams, dekYear);
  };

  const customValid =
    !customMode ||
    (customInput.length === 2 &&
      Number.parseInt(customInput, 10) >= MIN_DEK_YEAR &&
      Number.parseInt(customInput, 10) <= MAX_DEK_YEAR);

  return (
    <Modal
      open
      onClose={onClose}
      title="เพิ่มการสอบ TCAS (TGAT / TPAT / A-Level)"
      footer={
        <>
          <span className="mr-auto text-xs font-medium text-ink-muted">
            เลือกแล้ว <span className="font-mono font-semibold text-ink">{effectiveSelectedIds.length}</span> วิชา
            (Dek{dekYear})
          </span>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit} disabled={effectiveSelectedIds.length === 0 || !customValid}>
            เพิ่ม {effectiveSelectedIds.length > 0 ? `${effectiveSelectedIds.length} วิชา` : "การสอบ"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* 1. Cohort Selector */}
        <div>
          <p className="mb-2 text-sm font-semibold text-ink">1. เลือกรุ่นของคุณ</p>
          <div className="flex flex-wrap items-center gap-2">
            {POPULAR_DEK_YEARS.map((y) => {
              const active = !customMode && dekYear === y;
              return (
                <button
                  key={y}
                  type="button"
                  aria-pressed={active}
                  onClick={() => handleSelectPopularDek(y)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta",
                    active
                      ? "border-terracotta bg-terracotta text-sheet"
                      : "border-line-strong bg-paper text-ink-soft hover:border-ink-muted hover:text-ink"
                  )}
                >
                  Dek{y}
                  {y === 70 && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[11px] leading-none font-medium",
                        active ? "bg-sheet/20 text-sheet" : "bg-sage-tint text-sage-deep"
                      )}
                    >
                      จริง
                    </span>
                  )}
                </button>
              );
            })}

            <button
              type="button"
              aria-pressed={customMode}
              onClick={() => setCustomMode(true)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta",
                customMode
                  ? "border-terracotta bg-terracotta-tint text-terracotta-deep"
                  : "border-dashed border-line-strong bg-paper text-ink-muted hover:border-ink-muted hover:text-ink"
              )}
            >
              รุ่นอื่น...
            </button>
          </div>

          {customMode && (
            <div className="mt-2.5 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-paper px-3 py-2">
              <label htmlFor="custom-dek-year" className="text-xs font-medium text-ink-soft">
                ระบุเลขรุ่น:
              </label>
              <div className="inline-flex items-center gap-1.5">
                <span className="font-mono text-sm font-semibold text-ink">Dek</span>
                <input
                  id="custom-dek-year"
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  value={customInput}
                  onChange={(e) => handleCustomInputChange(e.target.value)}
                  placeholder="74"
                  className={cn(inputClass, "w-16 py-1 text-center font-mono text-sm")}
                />
              </div>
              <span className="text-xs text-ink-muted">
                (รองรับ Dek{MIN_DEK_YEAR}–Dek{MAX_DEK_YEAR})
              </span>
              {!customValid && (
                <span className="text-xs font-medium text-danger-deep">
                  กรุณากรอกเลขรุ่น {MIN_DEK_YEAR}–{MAX_DEK_YEAR}
                </span>
              )}
            </div>
          )}

          {/* Cohort schedule info banner */}
          <div
            className={cn(
              "mt-3 flex items-start gap-2 rounded-lg border px-3 py-2 text-xs",
              dekYear === 70
                ? "border-sage/35 bg-sage-tint text-sage-deep"
                : "border-mustard/40 bg-mustard-tint text-mustard-deep"
            )}
          >
            {dekYear === 70 ? (
              <>
                <CalendarCheck2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  ใช้กำหนดการสอบจริง <strong>TCAS70 จาก ทปอ.</strong> (TGAT/TPAT ม.ค.–ก.พ. 2570 · A-Level มี.ค. 2570)
                </span>
              </>
            ) : (
              <>
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  วันสอบของ <strong>Dek{dekYear}</strong> (ปีการศึกษา 25{dekYear}) เป็นการคาดการณ์เบื้องต้นจากปฏิทิน
                  TCAS — สามารถกดแก้ไขวันและเวลาเองได้ภายหลัง
                </span>
              </>
            )}
          </div>
        </div>

        {/* 2. Quick Bundles */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
              <Sparkles className="h-3.5 w-3.5 text-terracotta" />
              เลือกชุดวิชาด่วน
            </p>
            {effectiveSelectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-xs font-medium text-ink-muted hover:text-ink hover:underline"
              >
                ล้างที่เลือก
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TCAS_PRESET_BUNDLES.map((bundle) => (
              <button
                key={bundle.id}
                type="button"
                onClick={() => applyBundle(bundle.examIds)}
                title={bundle.description}
                className="rounded-lg border border-line-strong bg-paper px-2.5 py-1 text-xs font-medium text-ink-soft transition-colors hover:border-terracotta/50 hover:bg-terracotta-tint/50 hover:text-ink"
              >
                + {bundle.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Category Tabs + Exam List */}
        <div>
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink">2. เลือกวิชาที่ต้องการสอบ</p>
            <div role="tablist" aria-label="หมวดวิชาสอบ TCAS" className="flex items-center gap-1 rounded-lg bg-paper-deep p-0.5">
              <button
                type="button"
                role="tab"
                aria-selected={activeGroup === "all"}
                onClick={() => setActiveGroup("all")}
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                  activeGroup === "all" ? "bg-sheet text-ink shadow-xs" : "text-ink-muted hover:text-ink"
                )}
              >
                ทั้งหมด
              </button>
              {TCAS_EXAM_GROUPS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  role="tab"
                  aria-selected={activeGroup === g.id}
                  onClick={() => setActiveGroup(g.id)}
                  className={cn(
                    "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                    activeGroup === g.id ? "bg-sheet text-ink shadow-xs" : "text-ink-muted hover:text-ink"
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <ul className="max-h-64 divide-y divide-line/70 overflow-y-auto rounded-xl border border-line">
            {visibleExams.map((item) => {
              const alreadyAdded = alreadyAddedSet.has(item.id);
              const checked = alreadyAdded || effectiveSelectedIds.includes(item.id);
              const matchedSubject = matchedSubjectByExamId.get(item.id);

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    disabled={alreadyAdded}
                    onClick={() => toggleExam(item.id)}
                    className={cn(
                      "flex w-full items-start gap-3 px-3.5 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-terracotta",
                      alreadyAdded
                        ? "cursor-default bg-paper/60 opacity-65"
                        : checked
                          ? "bg-terracotta-tint/35 hover:bg-terracotta-tint/50"
                          : "hover:bg-paper"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border",
                        alreadyAdded
                          ? "border-sage bg-sage text-sheet"
                          : checked
                            ? "border-terracotta bg-terracotta text-sheet"
                            : "border-line-strong bg-sheet"
                      )}
                    >
                      {checked && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={cn(
                            "rounded-md border px-1.5 py-0.5 text-[11px] leading-none font-semibold",
                            GROUP_BADGE[item.group]
                          )}
                        >
                          {item.code}
                        </span>
                        <span className="text-sm font-semibold text-ink">{item.name}</span>
                        {alreadyAdded && (
                          <span className="ml-auto rounded-full bg-sage-tint px-2 py-0.5 text-[11px] font-medium text-sage-deep">
                            เพิ่มแล้ว
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-muted">
                        <span>{formatThaiDate(item.date)}</span>
                        <span className="inline-flex items-center gap-1 font-mono">
                          <Clock className="h-3 w-3" /> {item.timeRange}
                        </span>
                      </div>

                      {matchedSubject && !alreadyAdded && (
                        <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-sage-deep">
                          <Link2 className="h-3 w-3" />
                          เชื่อมกับวิชา {matchedSubject.emoji ? `${matchedSubject.emoji} ` : ""}
                          {matchedSubject.name} อัตโนมัติ
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Modal>
  );
}
