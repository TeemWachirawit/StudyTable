"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  AlertTriangle,
  BookOpen,
  Link2,
  Filter,
  LayoutGrid,
  ListFilter,
} from "lucide-react";
import {
  DayOfWeek,
  HomeworkItem,
  StudyBlock,
  StudySessionType,
  Subject,
} from "@/types/study";
import {
  THAI_DAYS,
  findConflictingBlocks,
  formatMinutesAsReadable,
  getBlockDurationMinutes,
  parseTimeToMinutes,
} from "@/lib/planner-engine";
import { SESSION_TYPE_LABELS, SUBJECT_COLORS } from "@/lib/theme";

interface WeeklyTimetableProps {
  subjects: Subject[];
  studyBlocks: StudyBlock[];
  homeworks: HomeworkItem[];
  onAddBlock: (block: Omit<StudyBlock, "id">) => void;
  onToggleBlock: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
}

export function WeeklyTimetable({
  subjects,
  studyBlocks,
  homeworks,
  onAddBlock,
  onToggleBlock,
  onDeleteBlock,
}: WeeklyTimetableProps) {
  const [viewMode, setViewMode] = useState<"weekly" | "daily">("weekly");
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(0);
  const [filterSubjectId, setFilterSubjectId] = useState<string>("all");
  const [filterSessionType, setFilterSessionType] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add Block Form State
  const [formSubjectId, setFormSubjectId] = useState<string>(
    subjects[0]?.id || ""
  );
  const [formTitle, setFormTitle] = useState("");
  const [formDay, setFormDay] = useState<DayOfWeek>(0);
  const [formStartTime, setFormStartTime] = useState("18:00");
  const [formEndTime, setFormEndTime] = useState("20:00");
  const [formSessionType, setFormSessionType] =
    useState<StudySessionType>("review");
  const [formNotes, setFormNotes] = useState("");

  const subjectMap = useMemo(() => {
    const map = new Map<string, Subject>();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  const homeworkMap = useMemo(() => {
    const map = new Map<string, HomeworkItem>();
    homeworks.forEach((h) => map.set(h.id, h));
    return map;
  }, [homeworks]);

  const filteredBlocks = useMemo(() => {
    return studyBlocks
      .filter((b) => {
        if (filterSubjectId !== "all" && b.subjectId !== filterSubjectId)
          return false;
        if (filterSessionType !== "all" && b.sessionType !== filterSessionType)
          return false;
        return true;
      })
      .sort(
        (a, b) =>
          parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
      );
  }, [studyBlocks, filterSubjectId, filterSessionType]);

  // Real-time conflict check inside the Add Modal
  const formConflicts = useMemo(() => {
    return findConflictingBlocks(studyBlocks, {
      dayOfWeek: formDay,
      startTime: formStartTime,
      endTime: formEndTime,
    });
  }, [studyBlocks, formDay, formStartTime, formEndTime]);

  const isTimeRangeValid =
    parseTimeToMinutes(formEndTime) > parseTimeToMinutes(formStartTime);

  const handleOpenAddForDay = (day: DayOfWeek) => {
    setFormDay(day);
    if (!formSubjectId && subjects[0]) {
      setFormSubjectId(subjects[0].id);
    }
    setIsAddModalOpen(true);
  };

  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !isTimeRangeValid) return;
    const targetSubId = formSubjectId || subjects[0]?.id;
    if (!targetSubId) return;

    onAddBlock({
      subjectId: targetSubId,
      title: formTitle.trim(),
      dayOfWeek: formDay,
      startTime: formStartTime,
      endTime: formEndTime,
      sessionType: formSessionType,
      completed: false,
      notes: formNotes.trim() || undefined,
    });

    setFormTitle("");
    setFormNotes("");
    setIsAddModalOpen(false);
  };

  const totalWeeklyPlannedMins = useMemo(
    () =>
      studyBlocks.reduce((acc, b) => acc + getBlockDurationMinutes(b), 0),
    [studyBlocks]
  );

  const totalWeeklyCompletedMins = useMemo(
    () =>
      studyBlocks
        .filter((b) => b.completed)
        .reduce((acc, b) => acc + getBlockDurationMinutes(b), 0),
    [studyBlocks]
  );

  return (
    <div className="space-y-5">
      {/* Planner Control Bar */}
      <div className="flex flex-col gap-4 border-b border-[#E4DDD3] pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#D5CCC0] bg-[#F3EFE6] text-[#C85A32]">
              <Calendar className="h-4 w-4" />
            </span>
            <h2 className="font-serif text-xl font-semibold tracking-tight text-[#1E1B18]">
              ตารางเวลาอ่านหนังสือ (Time-Blocking Schedule)
            </h2>
          </div>
          <p className="mt-1 text-sm text-[#575049]">
            วางแผนแล้วรวม{" "}
            <span className="font-mono font-semibold text-[#1E1B18]">
              {formatMinutesAsReadable(totalWeeklyPlannedMins)}
            </span>{" "}
            • อ่านสำเร็จแล้ว{" "}
            <span className="font-mono font-semibold text-[#3D6B52]">
              {formatMinutesAsReadable(totalWeeklyCompletedMins)}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Toggle: Weekly vs Daily */}
          <div className="inline-flex rounded-md border border-[#D5CCC0] bg-[#F3EFE6] p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewMode("weekly")}
              className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 transition ${
                viewMode === "weekly"
                  ? "bg-white text-[#1E1B18] shadow-xs"
                  : "text-[#575049] hover:text-[#1E1B18]"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              รายสัปดาห์ (7 วัน)
            </button>
            <button
              type="button"
              onClick={() => setViewMode("daily")}
              className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 transition ${
                viewMode === "daily"
                  ? "bg-white text-[#1E1B18] shadow-xs"
                  : "text-[#575049] hover:text-[#1E1B18]"
              }`}
            >
              <ListFilter className="h-3.5 w-3.5" />
              โฟกัสรายวัน
            </button>
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-1.5 rounded-md border border-[#D5CCC0] bg-white px-2.5 py-1.5 text-xs">
            <Filter className="h-3.5 w-3.5 text-[#8A8177]" />
            <select
              aria-label="กรองตามรายวิชา"
              value={filterSubjectId}
              onChange={(e) => setFilterSubjectId(e.target.value)}
              className="bg-transparent text-[#1E1B18] focus:outline-none"
            >
              <option value="all">ทุกวิชา ({subjects.length})</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} — {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Session Type Filter */}
          <select
            aria-label="กรองตามประเภทการอ่าน"
            value={filterSessionType}
            onChange={(e) => setFilterSessionType(e.target.value)}
            className="rounded-md border border-[#D5CCC0] bg-white px-2.5 py-1.5 text-xs text-[#1E1B18] focus:outline-none"
          >
            <option value="all">ทุกประเภทกิจกรรม</option>
            <option value="review">ทบทวนบทเรียน</option>
            <option value="homework">ล็อกเวลาทำการบ้าน</option>
            <option value="exam-prep">ติวเข้มก่อนสอบ</option>
          </select>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#C85A32] px-3.5 py-2 text-xs font-medium text-white transition hover:bg-[#B04B25]"
          >
            <Plus className="h-4 w-4" />
            เพิ่มช่วงเวลาอ่านหนังสือ
          </button>
        </div>
      </div>

      {/* Daily Selector Bar when in Daily Mode */}
      {viewMode === "daily" && (
        <div className="flex flex-wrap gap-2 border-b border-[#E4DDD3] pb-3">
          {THAI_DAYS.map((day) => {
            const count = filteredBlocks.filter(
              (b) => b.dayOfWeek === day.dayOfWeek
            ).length;
            const isSelected = selectedDay === day.dayOfWeek;
            return (
              <button
                key={day.dayOfWeek}
                type="button"
                onClick={() => setSelectedDay(day.dayOfWeek)}
                className={`flex items-center gap-2 rounded-md border px-3.5 py-2 text-xs font-medium transition ${
                  isSelected
                    ? "border-[#1E1B18] bg-[#1E1B18] text-[#FAF7F2]"
                    : "border-[#DED6CA] bg-[#F3EFE6] text-[#575049] hover:border-[#B8AEA0] hover:bg-white"
                }`}
              >
                <span>{day.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 font-mono text-[11px] ${
                    isSelected
                      ? "bg-[#C85A32] text-white"
                      : "bg-[#E5DEC9] text-[#575049]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Weekly 7-Column Ledger OR Focused Single-Day Ledger */}
      <div
        className={
          viewMode === "weekly"
            ? "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-7"
            : "mx-auto max-w-3xl space-y-3"
        }
      >
        {THAI_DAYS.filter((day) =>
          viewMode === "weekly" ? true : day.dayOfWeek === selectedDay
        ).map((day) => {
          const dayBlocks = filteredBlocks.filter(
            (b) => b.dayOfWeek === day.dayOfWeek
          );
          const dayTotalMinutes = dayBlocks.reduce(
            (acc, b) => acc + getBlockDurationMinutes(b),
            0
          );

          return (
            <div
              key={day.dayOfWeek}
              className="flex flex-col rounded-lg border border-[#DED6CA] bg-white"
            >
              {/* Day Column Header */}
              <div className="flex items-center justify-between border-b border-[#E4DDD3] bg-[#F3EFE6] px-3.5 py-2.5">
                <div>
                  <span className="text-xs font-semibold text-[#1E1B18]">
                    {day.label}
                  </span>
                  <span className="ml-2 font-mono text-[11px] text-[#8A8177]">
                    {dayTotalMinutes > 0
                      ? formatMinutesAsReadable(dayTotalMinutes)
                      : "ว่าง"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenAddForDay(day.dayOfWeek)}
                  title={`เพิ่มตารางเรียนใน${day.label}`}
                  className="inline-flex h-6 w-6 items-center justify-center rounded border border-[#D5CCC0] bg-white text-[#575049] transition hover:border-[#C85A32] hover:text-[#C85A32]"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Day Blocks List */}
              <div className="flex flex-1 flex-col divide-y divide-[#EFEAE1] p-2.5">
                {dayBlocks.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
                    <p className="text-xs text-[#8A8177]">
                      ยังไม่มีตารางอ่านหนังสือ
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOpenAddForDay(day.dayOfWeek)}
                      className="mt-2 text-[11px] font-medium text-[#C85A32] underline-offset-2 hover:underline"
                    >
                      + ลงเวลาอ่านหนังสือ
                    </button>
                  </div>
                ) : (
                  dayBlocks.map((block) => {
                    const subject = subjectMap.get(block.subjectId);
                    const colorStyle =
                      SUBJECT_COLORS[subject?.color || "terracotta"];
                    const durationMins = getBlockDurationMinutes(block);
                    const linkedHw = block.linkedHomeworkId
                      ? homeworkMap.get(block.linkedHomeworkId)
                      : undefined;
                    const sessionBadge =
                      SESSION_TYPE_LABELS[block.sessionType];

                    return (
                      <div
                        key={block.id}
                        className={`group relative py-3 first:pt-1 last:pb-1 transition ${
                          block.completed ? "opacity-70" : ""
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {/* Color Accent Strip */}
                          <div
                            className={`mt-1 h-10 w-1 shrink-0 rounded-full ${colorStyle.accentBar}`}
                          />

                          <div className="min-w-0 flex-1">
                            {/* Time & Action Row */}
                            <div className="flex items-center justify-between gap-1">
                              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[#575049]">
                                <Clock className="h-3 w-3 text-[#8A8177]" />
                                {block.startTime}–{block.endTime}
                                <span className="font-normal text-[#8A8177]">
                                  ({formatMinutesAsReadable(durationMins)})
                                </span>
                              </span>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => onToggleBlock(block.id)}
                                  title={
                                    block.completed
                                      ? "ยกเลิกสถานะอ่านเสร็จ"
                                      : "ทำเครื่องหมายว่าอ่านเสร็จแล้ว"
                                  }
                                  className="text-[#575049] transition hover:text-[#3D6B52]"
                                >
                                  {block.completed ? (
                                    <CheckCircle2 className="h-4 w-4 text-[#3D6B52]" />
                                  ) : (
                                    <Circle className="h-4 w-4" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDeleteBlock(block.id)}
                                  title="ลบออกจากตาราง"
                                  className="opacity-0 transition group-hover:opacity-100 text-[#8A8177] hover:text-[#B83B2A]"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Subject Pill */}
                            {subject && (
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                <span
                                  className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${colorStyle.bgBadge} ${colorStyle.text}`}
                                >
                                  {subject.code}
                                </span>
                                <span
                                  className={`inline-flex rounded border px-1.5 py-0.5 text-[10px] ${sessionBadge.badgeClass}`}
                                >
                                  {sessionBadge.label}
                                </span>
                              </div>
                            )}

                            {/* Title */}
                            <p
                              className={`mt-1.5 text-xs font-medium leading-snug text-[#1E1B18] ${
                                block.completed
                                  ? "line-through text-[#8A8177]"
                                  : ""
                              }`}
                            >
                              {block.title}
                            </p>

                            {/* Linked Homework Indicator */}
                            {linkedHw && (
                              <div className="mt-1.5 flex items-center gap-1 rounded bg-[#FDF3EE] px-2 py-1 text-[10px] text-[#8F391A]">
                                <Link2 className="h-3 w-3 shrink-0" />
                                <span className="truncate">
                                  เชื่อมกับการบ้าน: {linkedHw.title}
                                </span>
                              </div>
                            )}

                            {/* Notes */}
                            {block.notes && !linkedHw && (
                              <p className="mt-1 text-[11px] text-[#8A8177] line-clamp-2">
                                {block.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Study Block Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1B18]/40 p-4 backdrop-blur-[1px]">
          <div className="w-full max-w-lg rounded-lg border border-[#D5CCC0] bg-[#FAF7F2] shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E4DDD3] bg-[#F3EFE6] px-5 py-3.5">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#C85A32]" />
                <h3 className="font-serif text-base font-semibold text-[#1E1B18]">
                  เพิ่มช่วงเวลาอ่านหนังสือลงตาราง
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-xs font-medium text-[#575049] hover:text-[#1E1B18]"
              >
                ปิดหน้าต่าง ✕
              </button>
            </div>

            <form onSubmit={handleCreateBlock} className="space-y-4 p-5">
              <div>
                <label className="block text-xs font-semibold text-[#1E1B18]">
                  รายวิชา
                </label>
                <select
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#D5CCC0] bg-white px-3 py-2 text-sm text-[#1E1B18] focus:border-[#C85A32] focus:outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} — {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18]">
                  หัวข้อ / บทเรียนที่ต้องการอ่าน
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น สรุปสูตรแคลคูลัส บทที่ 3 หรือ ตะลุยโจทย์เก่า"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#D5CCC0] bg-white px-3 py-2 text-sm text-[#1E1B18] placeholder:text-[#8A8177] focus:border-[#C85A32] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18]">
                    วันในสัปดาห์
                  </label>
                  <select
                    value={formDay}
                    onChange={(e) =>
                      setFormDay(Number(e.target.value) as DayOfWeek)
                    }
                    className="mt-1 w-full rounded-md border border-[#D5CCC0] bg-white px-3 py-2 text-sm text-[#1E1B18] focus:border-[#C85A32] focus:outline-none"
                  >
                    {THAI_DAYS.map((d) => (
                      <option key={d.dayOfWeek} value={d.dayOfWeek}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18]">
                    เวลาเริ่ม
                  </label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#D5CCC0] bg-white px-3 py-2 font-mono text-sm text-[#1E1B18] focus:border-[#C85A32] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18]">
                    เวลาสิ้นสุด
                  </label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#D5CCC0] bg-white px-3 py-2 font-mono text-sm text-[#1E1B18] focus:border-[#C85A32] focus:outline-none"
                  />
                </div>
              </div>

              {!isTimeRangeValid && (
                <div className="flex items-center gap-2 rounded-md border border-[#E3B4AD] bg-[#FCF0EE] px-3 py-2 text-xs text-[#822215]">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น</span>
                </div>
              )}

              {isTimeRangeValid && formConflicts.length > 0 && (
                <div className="flex items-start gap-2 rounded-md border border-[#E5C99B] bg-[#FDF6EB] px-3 py-2.5 text-xs text-[#855209]">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#C27D1A]" />
                  <div>
                    <p className="font-semibold">
                      พบช่วงเวลาทับซ้อนในวันเดียวกัน ({formConflicts.length} รายการ):
                    </p>
                    <ul className="mt-1 list-inside list-disc space-y-0.5">
                      {formConflicts.map((c) => (
                        <li key={c.id}>
                          {c.startTime}–{c.endTime}: {c.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18]">
                  รูปแบบการอ่าน
                </label>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {(
                    [
                      ["review", "ทบทวนบทเรียน"],
                      ["homework", "ทำการบ้าน"],
                      ["exam-prep", "ติวเข้มก่อนสอบ"],
                    ] as [StudySessionType, string][]
                  ).map(([typeKey, label]) => (
                    <button
                      key={typeKey}
                      type="button"
                      onClick={() => setFormSessionType(typeKey)}
                      className={`rounded-md border px-3 py-2 text-xs font-medium transition ${
                        formSessionType === typeKey
                          ? "border-[#C85A32] bg-[#FDF3EE] text-[#8F391A]"
                          : "border-[#D5CCC0] bg-white text-[#575049] hover:bg-[#F3EFE6]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18]">
                  บันทึกเพิ่มเติม (ถ้ามี)
                </label>
                <input
                  type="text"
                  placeholder="เช่น เน้นทำโจทย์ท้ายบทข้อคู่ หรือ อ่านสรุปชีทอาจารย์"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#D5CCC0] bg-white px-3 py-2 text-sm text-[#1E1B18] placeholder:text-[#8A8177] focus:border-[#C85A32] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#E4DDD3] pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-md border border-[#D5CCC0] bg-white px-4 py-2 text-xs font-medium text-[#575049] hover:bg-[#F3EFE6]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={!isTimeRangeValid || !formTitle.trim()}
                  className="rounded-md bg-[#C85A32] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#B04B25] disabled:opacity-50"
                >
                  บันทึกลงตารางอ่านหนังสือ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

