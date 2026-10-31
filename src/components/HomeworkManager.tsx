"use client";

import React, { useState, useMemo } from "react";
import {
  ClipboardList,
  Plus,
  CalendarPlus,
  CheckSquare,
  Square,
  Clock,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  CalendarClock,
} from "lucide-react";
import {
  DayOfWeek,
  HomeworkItem,
  HomeworkPriority,
  HomeworkStatus,
  StudyBlock,
  Subject,
} from "@/types/study";
import {
  THAI_DAYS,
  calculateHomeworkProgress,
  findConflictingBlocks,
  formatMinutesAsReadable,
  getDueUrgency,
  getTodayIsoString,
  minutesToTimeString,
  parseTimeToMinutes,
} from "@/lib/planner-engine";
import {
  PRIORITY_STYLES,
  STATUS_STYLES,
  SUBJECT_COLORS,
} from "@/lib/theme";

interface HomeworkManagerProps {
  subjects: Subject[];
  homeworks: HomeworkItem[];
  studyBlocks: StudyBlock[];
  onAddHomework: (
    hw: Omit<HomeworkItem, "id" | "scheduledBlockIds" | "subtasks"> & {
      subtaskTitles?: string[];
    }
  ) => void;
  onUpdateStatus: (homeworkId: string, status: HomeworkStatus) => void;
  onToggleSubtask: (homeworkId: string, subtaskId: string) => void;
  onAddSubtask: (homeworkId: string, title: string) => void;
  onDeleteHomework: (homeworkId: string) => void;
  onScheduleToTimetable: (
    homeworkId: string,
    slot: {
      dayOfWeek: DayOfWeek;
      startTime: string;
      durationMinutes: number;
      notes?: string;
    }
  ) => void;
}

export function HomeworkManager({
  subjects,
  homeworks,
  studyBlocks,
  onAddHomework,
  onUpdateStatus,
  onToggleSubtask,
  onAddSubtask,
  onDeleteHomework,
  onScheduleToTimetable,
}: HomeworkManagerProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // New Subtask Inline Inputs keyed by homework.id
  const [subtaskDrafts, setSubtaskDrafts] = useState<Record<string, string>>(
    {}
  );

  // Add Homework Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newSubjectId, setNewSubjectId] = useState(subjects[0]?.id || "");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDueDate, setNewDueDate] = useState(getTodayIsoString());
  const [newPriority, setNewPriority] = useState<HomeworkPriority>("high");
  const [newEstimatedMins, setNewEstimatedMins] = useState(90);
  const [newSubtasksRaw, setNewSubtasksRaw] = useState("");

  // Schedule-to-Timetable Modal State
  const [schedulingHw, setSchedulingHw] = useState<HomeworkItem | null>(null);
  const [schedDay, setSchedDay] = useState<DayOfWeek>(0);
  const [schedStartTime, setSchedStartTime] = useState("18:00");
  const [schedDuration, setSchedDuration] = useState(90);
  const [schedNotes, setSchedNotes] = useState("");
  const [scheduleSuccessBanner, setScheduleSuccessBanner] = useState<
    string | null
  >(null);

  const subjectMap = useMemo(() => {
    const map = new Map<string, Subject>();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  const filteredHomeworks = useMemo(() => {
    const priorityRank: Record<HomeworkPriority, number> = {
      high: 0,
      medium: 1,
      low: 2,
    };

    return homeworks
      .filter((hw) => {
        if (statusFilter !== "all" && hw.status !== statusFilter) return false;
        if (subjectFilter !== "all" && hw.subjectId !== subjectFilter)
          return false;
        if (priorityFilter !== "all" && hw.priority !== priorityFilter)
          return false;
        return true;
      })
      .sort((a, b) => {
        if (a.status === "done" && b.status !== "done") return 1;
        if (a.status !== "done" && b.status === "done") return -1;
        if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        return priorityRank[a.priority] - priorityRank[b.priority];
      });
  }, [homeworks, statusFilter, subjectFilter, priorityFilter]);

  const schedEndTime = useMemo(() => {
    return minutesToTimeString(
      parseTimeToMinutes(schedStartTime) + schedDuration
    );
  }, [schedStartTime, schedDuration]);

  const schedConflicts = useMemo(() => {
    if (!schedulingHw) return [];
    return findConflictingBlocks(studyBlocks, {
      dayOfWeek: schedDay,
      startTime: schedStartTime,
      endTime: schedEndTime,
    });
  }, [schedulingHw, studyBlocks, schedDay, schedStartTime, schedEndTime]);

  const handleOpenScheduleModal = (hw: HomeworkItem) => {
    setSchedulingHw(hw);
    setSchedDuration(hw.estimatedMinutes || 90);
    setSchedNotes("");
  };

  const handleConfirmSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingHw) return;

    onScheduleToTimetable(schedulingHw.id, {
      dayOfWeek: schedDay,
      startTime: schedStartTime,
      durationMinutes: schedDuration,
      notes: schedNotes.trim() || undefined,
    });

    const dayLabel =
      THAI_DAYS.find((d) => d.dayOfWeek === schedDay)?.label || "";
    setScheduleSuccessBanner(
      `ดึง "${schedulingHw.title}" ลงตาราง${dayLabel} เวลา ${schedStartTime}–${schedEndTime} เรียบร้อยแล้ว`
    );
    setSchedulingHw(null);
    setTimeout(() => setScheduleSuccessBanner(null), 5000);
  };

  const handleCreateHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const subId = newSubjectId || subjects[0]?.id;
    if (!subId) return;

    const subtaskTitles = newSubtasksRaw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    onAddHomework({
      subjectId: subId,
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      dueDate: newDueDate,
      priority: newPriority,
      status: "todo",
      estimatedMinutes: Number(newEstimatedMins) || 60,
      subtaskTitles,
    });

    setNewTitle("");
    setNewDescription("");
    setNewSubtasksRaw("");
    setIsAddOpen(false);
  };

  const handleInlineSubtaskAdd = (homeworkId: string) => {
    const text = subtaskDrafts[homeworkId];
    if (!text || !text.trim()) return;
    onAddSubtask(homeworkId, text);
    setSubtaskDrafts((prev) => ({ ...prev, [homeworkId]: "" }));
  };

  return (
    <div className="space-y-5">
      {/* Header & Filter Bar */}
      <div className="flex flex-col gap-4 border-b border-[#E4DDD3] pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#D5CCC0] bg-[#F3EFE6] text-[#C85A32]">
              <ClipboardList className="h-4 w-4" />
            </span>
            <h2 className="font-serif text-xl font-semibold tracking-tight text-[#1E1B18]">
              สมุดจัดการการบ้านและงานย่อย (Homework & Subtask Ledger)
            </h2>
          </div>
          <p className="mt-1 text-sm text-[#575049]">
            จัดลำดับความสำคัญ แตกงานย่อย (Checklist) และดึงการบ้านลงตารางเวลาอ่านหนังสือได้ในคลิกเดียว
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Tabs */}
          <div className="inline-flex rounded-md border border-[#D5CCC0] bg-[#F3EFE6] p-0.5 text-xs font-medium">
            {[
              { key: "all", label: "ทั้งหมด" },
              { key: "todo", label: "ยังไม่เริ่ม" },
              { key: "in_progress", label: "กำลังทำ" },
              { key: "done", label: "เสร็จสิ้น" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`rounded px-2.5 py-1.5 transition ${
                  statusFilter === tab.key
                    ? "bg-white text-[#1E1B18] shadow-xs"
                    : "text-[#575049] hover:text-[#1E1B18]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Subject Filter */}
          <select
            aria-label="กรองการบ้านตามรายวิชา"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="rounded-md border border-[#D5CCC0] bg-white px-2.5 py-1.5 text-xs text-[#1E1B18] focus:outline-none"
          >
            <option value="all">ทุกวิชา</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            aria-label="กรองตามระดับความสำคัญ"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-md border border-[#D5CCC0] bg-white px-2.5 py-1.5 text-xs text-[#1E1B18] focus:outline-none"
          >
            <option value="all">ทุกระดับความสำคัญ</option>
            <option value="high">สำคัญมาก (High)</option>
            <option value="medium">ปานกลาง (Medium)</option>
            <option value="low">ทั่วไป (Low)</option>
          </select>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#C85A32] px-3.5 py-2 text-xs font-medium text-white transition hover:bg-[#B04B25]"
          >
            <Plus className="h-4 w-4" />
            เพิ่มการบ้านใหม่
          </button>
        </div>
      </div>

      {/* Confirmation Banner when Homework is scheduled to Timetable */}
      {scheduleSuccessBanner && (
        <div className="flex items-center justify-between rounded-md border border-[#B8D4C3] bg-[#EFF6F2] px-4 py-2.5 text-xs font-medium text-[#264A36]">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#3D6B52]" />
            <span>{scheduleSuccessBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setScheduleSuccessBanner(null)}
            className="text-[#264A36] hover:underline"
          >
            รับทราบ
          </button>
        </div>
      )}

      {/* Homework Ledger Cards */}
      {filteredHomeworks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#D5CCC0] bg-white p-10 text-center">
          <p className="font-serif text-base font-medium text-[#1E1B18]">
            ไม่พบรายการการบ้านตามเงื่อนไขที่เลือก
          </p>
          <p className="mt-1 text-xs text-[#8A8177]">
            กดปุ่ม &ldquo;เพิ่มการบ้านใหม่&rdquo; เพื่อเริ่มจดบันทึกกำหนดส่งและแตกงานย่อย
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredHomeworks.map((hw) => {
            const subject = subjectMap.get(hw.subjectId);
            const colorStyle = SUBJECT_COLORS[subject?.color || "terracotta"];
            const priorityStyle = PRIORITY_STYLES[hw.priority];
            const statusStyle = STATUS_STYLES[hw.status];
            const progress = calculateHomeworkProgress(hw);
            const urgency = getDueUrgency(hw.dueDate, hw.status === "done");

            const linkedBlocks = studyBlocks.filter(
              (b) =>
                b.linkedHomeworkId === hw.id ||
                hw.scheduledBlockIds.includes(b.id)
            );

            return (
              <div
                key={hw.id}
                className={`flex flex-col justify-between rounded-lg border border-[#DED6CA] bg-white transition ${
                  hw.status === "done" ? "opacity-80" : ""
                }`}
              >
                {/* Top Strip & Metadata */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EFEAE1] bg-[#FAF7F2] px-4 py-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {subject && (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-semibold ${colorStyle.bgBadge} ${colorStyle.text}`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${colorStyle.dot}`}
                          />
                          {subject.code} • {subject.name}
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-medium ${priorityStyle.className}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${priorityStyle.dotColor}`}
                        />
                        ความสำคัญ: {priorityStyle.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Status Select */}
                      <select
                        aria-label={`เปลี่ยนสถานะของ ${hw.title}`}
                        value={hw.status}
                        onChange={(e) =>
                          onUpdateStatus(
                            hw.id,
                            e.target.value as HomeworkStatus
                          )
                        }
                        className={`rounded border px-2 py-0.5 text-[11px] font-semibold focus:outline-none ${statusStyle.className}`}
                      >
                        <option value="todo">ยังไม่เริ่ม</option>
                        <option value="in_progress">กำลังทำ</option>
                        <option value="done">เสร็จสิ้น</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => onDeleteHomework(hw.id)}
                        title="ลบการบ้านนี้"
                        className="text-[#8A8177] transition hover:text-[#B83B2A]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3
                        className={`font-serif text-base font-semibold leading-snug text-[#1E1B18] ${
                          hw.status === "done"
                            ? "line-through text-[#8A8177]"
                            : ""
                        }`}
                      >
                        {hw.title}
                      </h3>
                    </div>

                    {hw.description && (
                      <p className="mt-1 text-xs leading-relaxed text-[#575049]">
                        {hw.description}
                      </p>
                    )}

                    {/* Due Date & Estimated Time Row */}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-medium ${
                          urgency.level === "overdue"
                            ? "border-[#E3B4AD] bg-[#FCF0EE] text-[#822215]"
                            : urgency.level === "today" ||
                              urgency.level === "soon"
                            ? "border-[#E5C99B] bg-[#FDF6EB] text-[#855209]"
                            : urgency.level === "completed"
                            ? "border-[#B8D4C3] bg-[#EFF6F2] text-[#264A36]"
                            : "border-[#E4DDD3] bg-[#F3EFE6] text-[#575049]"
                        }`}
                      >
                        {urgency.level === "overdue" ? (
                          <AlertCircle className="h-3.5 w-3.5" />
                        ) : urgency.level === "completed" ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <CalendarClock className="h-3.5 w-3.5" />
                        )}
                        กำหนดส่ง: <span className="font-mono">{hw.dueDate}</span>{" "}
                        ({urgency.label})
                      </span>

                      <span className="inline-flex items-center gap-1 text-[#575049]">
                        <Clock className="h-3.5 w-3.5 text-[#8A8177]" />
                        เวลาที่คาดการณ์:{" "}
                        <strong className="font-mono text-[#1E1B18]">
                          {formatMinutesAsReadable(hw.estimatedMinutes)}
                        </strong>
                      </span>
                    </div>

                    {/* Subtasks Progress Bar & Checklist */}
                    <div className="mt-4 rounded-md border border-[#E4DDD3] bg-[#FAF7F2] p-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#1E1B18]">
                          ขั้นตอนงานย่อย (Subtasks Checklist)
                        </span>
                        <span className="font-mono text-[11px] font-semibold text-[#575049]">
                          {progress.completedCount}/{progress.totalCount} ขั้นตอน (
                          {progress.percentage}%)
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#E4DDD3]">
                        <div
                          className="h-full rounded-full bg-[#3D6B52] transition-all duration-300"
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>

                      {/* Subtask Items */}
                      <ul className="mt-2.5 space-y-1.5">
                        {hw.subtasks.map((st) => (
                          <li key={st.id}>
                            <button
                              type="button"
                              onClick={() => onToggleSubtask(hw.id, st.id)}
                              className="flex w-full items-start gap-2 rounded px-1.5 py-1 text-left text-xs transition hover:bg-[#F3EFE6]"
                            >
                              {st.completed ? (
                                <CheckSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#3D6B52]" />
                              ) : (
                                <Square className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8A8177]" />
                              )}
                              <span
                                className={
                                  st.completed
                                    ? "line-through text-[#8A8177]"
                                    : "text-[#1E1B18]"
                                }
                              >
                                {st.title}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>

                      {/* Inline Add Subtask */}
                      <div className="mt-2.5 flex items-center gap-1.5 pt-1">
                        <input
                          type="text"
                          placeholder="+ เพิ่มขั้นตอนย่อย..."
                          value={subtaskDrafts[hw.id] || ""}
                          onChange={(e) =>
                            setSubtaskDrafts((prev) => ({
                              ...prev,
                              [hw.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleInlineSubtaskAdd(hw.id);
                            }
                          }}
                          className="flex-1 rounded border border-[#D5CCC0] bg-white px-2.5 py-1 text-xs text-[#1E1B18] placeholder:text-[#8A8177] focus:border-[#C85A32] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleInlineSubtaskAdd(hw.id)}
                          className="rounded border border-[#D5CCC0] bg-white px-2.5 py-1 text-xs font-medium text-[#575049] hover:border-[#C85A32] hover:text-[#C85A32]"
                        >
                          เพิ่ม
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer: Linked Schedule Slots + "Schedule to Timetable" Button */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#EFEAE1] bg-[#FAF7F2] px-4 py-2.5">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#575049]">
                    {linkedBlocks.length > 0 ? (
                      linkedBlocks.map((b) => {
                        const dayObj = THAI_DAYS.find(
                          (d) => d.dayOfWeek === b.dayOfWeek
                        );
                        return (
                          <span
                            key={b.id}
                            className="inline-flex items-center gap-1 rounded border border-[#B8D4C3] bg-[#EFF6F2] px-2 py-0.5 font-mono text-[10px] font-medium text-[#264A36]"
                          >
                            ลงตารางแล้ว: {dayObj?.shortLabel} {b.startTime}–
                            {b.endTime}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-[#8A8177]">
                        ยังไม่ได้ล็อกเวลาทำในตารางอ่านหนังสือ
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenScheduleModal(hw)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#C85A32] bg-[#FDF3EE] px-3 py-1.5 text-xs font-semibold text-[#8F391A] transition hover:bg-[#C85A32] hover:text-white"
                  >
                    <CalendarPlus className="h-3.5 w-3.5" />
                    ดึงลงตารางอ่านหนังสือ
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal 1: Add New Homework */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1B18]/40 p-4 backdrop-blur-[1px]">
          <div className="w-full max-w-lg rounded-lg border border-[#D5CCC0] bg-[#FAF7F2] shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E4DDD3] bg-[#F3EFE6] px-5 py-3.5">
              <h3 className="font-serif text-base font-semibold text-[#1E1B18]">
                จดการบ้าน / โปรเจกต์ใหม่
              </h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-xs font-medium text-[#575049] hover:text-[#1E1B18]"
              >
                ปิดหน้าต่าง ✕
              </button>
            </div>

            <form onSubmit={handleCreateHomework} className="space-y-4 p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18]">
                    รายวิชา
                  </label>
                  <select
                    value={newSubjectId}
                    onChange={(e) => setNewSubjectId(e.target.value)}
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
                    วันกำหนดส่ง (Due Date)
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#D5CCC0] bg-white px-3 py-2 font-mono text-sm text-[#1E1B18] focus:border-[#C85A32] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18]">
                  หัวข้อการบ้าน / ชิ้นงาน
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น แบบฝึกหัดท้ายบทที่ 5 หรือ รายงานวิเคราะห์กรณีศึกษา"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#D5CCC0] bg-white px-3 py-2 text-sm text-[#1E1B18] placeholder:text-[#8A8177] focus:border-[#C85A32] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18]">
                  รายละเอียดเพิ่มเติม
                </label>
                <input
                  type="text"
                  placeholder="เช่น ส่งไฟล์ PDF ในระบบก่อนเที่ยงคืน"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#D5CCC0] bg-white px-3 py-2 text-sm text-[#1E1B18] placeholder:text-[#8A8177] focus:border-[#C85A32] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18]">
                    ระดับความสำคัญ
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) =>
                      setNewPriority(e.target.value as HomeworkPriority)
                    }
                    className="mt-1 w-full rounded-md border border-[#D5CCC0] bg-white px-3 py-2 text-sm text-[#1E1B18] focus:border-[#C85A32] focus:outline-none"
                  >
                    <option value="high">สำคัญมาก (High Priority)</option>
                    <option value="medium">ปานกลาง (Medium Priority)</option>
                    <option value="low">ทั่วไป (Low Priority)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18]">
                    เวลาที่คาดว่าจะใช้ (นาที)
                  </label>
                  <input
                    type="number"
                    min={15}
                    step={15}
                    value={newEstimatedMins}
                    onChange={(e) =>
                      setNewEstimatedMins(Number(e.target.value))
                    }
                    className="mt-1 w-full rounded-md border border-[#D5CCC0] bg-white px-3 py-2 font-mono text-sm text-[#1E1B18] focus:border-[#C85A32] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18]">
                  แตกขั้นตอนงานย่อย (Subtasks — พิมพ์บรรทัดละ 1 ขั้นตอน)
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    "ค้นคว้าข้อมูลอ้างอิง\nเขียนโครงร่างสรุป\nตรวจทานคำผิดก่อนส่ง"
                  }
                  value={newSubtasksRaw}
                  onChange={(e) => setNewSubtasksRaw(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#D5CCC0] bg-white px-3 py-2 text-xs text-[#1E1B18] placeholder:text-[#8A8177] focus:border-[#C85A32] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#E4DDD3] pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-md border border-[#D5CCC0] bg-white px-4 py-2 text-xs font-medium text-[#575049] hover:bg-[#F3EFE6]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-[#C85A32] px-4 py-2 text-xs font-medium text-white hover:bg-[#B04B25]"
                >
                  บันทึกรายการการบ้าน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Schedule Homework directly into Timetable */}
      {schedulingHw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1B18]/40 p-4 backdrop-blur-[1px]">
          <div className="w-full max-w-md rounded-lg border border-[#D5CCC0] bg-[#FAF7F2] shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E4DDD3] bg-[#F3EFE6] px-5 py-3.5">
              <div className="flex items-center gap-2">
                <CalendarPlus className="h-4 w-4 text-[#C85A32]" />
                <h3 className="font-serif text-base font-semibold text-[#1E1B18]">
                  ดึงการบ้านลงตารางเวลาอ่านหนังสือ
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSchedulingHw(null)}
                className="text-xs font-medium text-[#575049] hover:text-[#1E1B18]"
              >
                ปิด ✕
              </button>
            </div>

            <form onSubmit={handleConfirmSchedule} className="space-y-4 p-5">
              <div className="rounded-md border border-[#E4DDD3] bg-white p-3">
                <p className="text-[11px] font-semibold text-[#8A8177]">
                  การบ้านที่เลือก:
                </p>
                <p className="mt-0.5 text-sm font-semibold text-[#1E1B18]">
                  {schedulingHw.title}
                </p>
                <p className="mt-1 text-xs text-[#575049]">
                  กำหนดส่ง: <span className="font-mono">{schedulingHw.dueDate}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18]">
                  เลือกวันที่ต้องการล็อกเวลาทำการบ้าน
                </label>
                <select
                  value={schedDay}
                  onChange={(e) =>
                    setSchedDay(Number(e.target.value) as DayOfWeek)
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18]">
                    เวลาเริ่ม
                  </label>
                  <input
                    type="time"
                    value={schedStartTime}
                    onChange={(e) => setSchedStartTime(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#D5CCC0] bg-white px-3 py-2 font-mono text-sm text-[#1E1B18] focus:border-[#C85A32] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18]">
                    ระยะเวลา (นาที)
                  </label>
                  <select
                    value={schedDuration}
                    onChange={(e) => setSchedDuration(Number(e.target.value))}
                    className="mt-1 w-full rounded-md border border-[#D5CCC0] bg-white px-3 py-2 font-mono text-sm text-[#1E1B18] focus:border-[#C85A32] focus:outline-none"
                  >
                    <option value={30}>30 นาที</option>
                    <option value={60}>60 นาที (1 ชม.)</option>
                    <option value={90}>90 นาที (1.5 ชม.)</option>
                    <option value={120}>120 นาที (2 ชม.)</option>
                    <option value={150}>150 นาที (2.5 ชม.)</option>
                    <option value={180}>180 นาที (3 ชม.)</option>
                  </select>
                </div>
              </div>

              <div className="rounded border border-[#E4DDD3] bg-[#F3EFE6] px-3 py-2 text-xs text-[#575049]">
                ช่วงเวลาที่จะบันทึกลงตาราง:{" "}
                <strong className="font-mono text-[#1E1B18]">
                  {schedStartTime} – {schedEndTime}
                </strong>
              </div>

              {schedConflicts.length > 0 && (
                <div className="rounded-md border border-[#E5C99B] bg-[#FDF6EB] px-3 py-2 text-xs text-[#855209]">
                  <p className="font-semibold">
                    หมายเหตุ: ช่วงเวลานี้ชนกับตารางที่มีอยู่ ({schedConflicts.length}{" "}
                    รายการ)
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18]">
                  เป้าหมายของรอบนี้ (ไม่บังคับ)
                </label>
                <input
                  type="text"
                  placeholder="เช่น ทำข้อ 1–6 ให้เสร็จในรอบนี้"
                  value={schedNotes}
                  onChange={(e) => setSchedNotes(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#D5CCC0] bg-white px-3 py-2 text-xs text-[#1E1B18] placeholder:text-[#8A8177] focus:border-[#C85A32] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#E4DDD3] pt-3">
                <button
                  type="button"
                  onClick={() => setSchedulingHw(null)}
                  className="rounded-md border border-[#D5CCC0] bg-white px-4 py-2 text-xs font-medium text-[#575049] hover:bg-[#F3EFE6]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-[#C85A32] px-4 py-2 text-xs font-medium text-white hover:bg-[#B04B25]"
                >
                  ล็อกเวลาลงตารางอ่านหนังสือ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

