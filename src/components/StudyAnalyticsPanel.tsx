"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart3,
  BookMarked,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  HomeworkItem,
  StudyBlock,
  Subject,
  SubjectColorKey,
} from "@/types/study";
import {
  calculateDailyStudyLoad,
  calculateSubjectAnalytics,
} from "@/lib/planner-engine";
import { SUBJECT_COLORS } from "@/lib/theme";

interface StudyAnalyticsPanelProps {
  subjects: Subject[];
  studyBlocks: StudyBlock[];
  homeworks: HomeworkItem[];
  onAddSubject: (subject: Omit<Subject, "id">) => void;
  onDeleteSubject: (subjectId: string) => void;
}

export function StudyAnalyticsPanel({
  subjects,
  studyBlocks,
  homeworks,
  onAddSubject,
  onDeleteSubject,
}: StudyAnalyticsPanelProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [teacher, setTeacher] = useState("");
  const [color, setColor] = useState<SubjectColorKey>("terracotta");
  const [weeklyTargetHours, setWeeklyTargetHours] = useState(4);

  const subjectStats = useMemo(
    () => calculateSubjectAnalytics(subjects, studyBlocks, homeworks),
    [subjects, studyBlocks, homeworks]
  );

  const dailyLoad = useMemo(
    () => calculateDailyStudyLoad(studyBlocks),
    [studyBlocks]
  );

  const maxDailyHours = useMemo(() => {
    const highest = Math.max(...dailyLoad.map((d) => d.plannedHours), 4);
    return highest;
  }, [dailyLoad]);

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;
    onAddSubject({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      teacherOrNote: teacher.trim() || undefined,
      color,
      weeklyTargetHours: Number(weeklyTargetHours) || 4,
    });
    setCode("");
    setName("");
    setTeacher("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#E4DDD3] pb-4">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#D5CCC0] bg-[#F3EFE6] text-[#C85A32]">
            <BarChart3 className="h-4 w-4" />
          </span>
          <h2 className="font-serif text-xl font-semibold tracking-tight text-[#1E1B18]">
            สถิติชั่วโมงการอ่านหนังสือ & จัดการรายวิชา (Study Analytics & Subjects)
          </h2>
        </div>
        <p className="mt-1 text-sm text-[#575049]">
          วิเคราะห์ชั่วโมงที่วางแผนไว้เทียบกับชั่วโมงที่อ่านจริงในแต่ละวิชา และการกระจายภาระการเรียนรายวัน
        </p>
      </div>

      {/* Top Grid: Subject Breakdown + Daily Load Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 7 cols: Subject Hours Breakdown */}
        <div className="rounded-lg border border-[#DED6CA] bg-white p-5 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-[#EFEAE1] pb-3">
            <div>
              <h3 className="font-serif text-base font-semibold text-[#1E1B18]">
                ความคืบหน้าชั่วโมงเรียนแยกตามรายวิชา
              </h3>
              <p className="text-xs text-[#8A8177]">
                เปรียบเทียบชั่วโมงอ่านสำเร็จจริง vs แผนในตาราง vs เป้าหมายต่อสัปดาห์
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {subjectStats.map((stat) => {
              const colorStyle = SUBJECT_COLORS[stat.color];
              const plannedPctOfTarget =
                stat.weeklyTargetHours > 0
                  ? Math.min(
                      100,
                      Math.round(
                        (stat.plannedHours / stat.weeklyTargetHours) * 100
                      )
                    )
                  : 0;

              return (
                <div
                  key={stat.subjectId}
                  className="rounded-md border border-[#EFEAE1] bg-[#FAF7F2] p-3.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-semibold ${colorStyle.bgBadge} ${colorStyle.text}`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${colorStyle.dot}`}
                        />
                        {stat.subjectCode}
                      </span>
                      <span className="text-sm font-semibold text-[#1E1B18]">
                        {stat.subjectName}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="text-[#3D6B52]">
                        อ่านจริง: <strong>{stat.completedHours} ชม.</strong>
                      </span>
                      <span className="text-[#575049]">
                        ในตาราง: <strong>{stat.plannedHours} ชม.</strong>
                      </span>
                      <span className="text-[#8A8177]">
                        เป้าหมาย: {stat.weeklyTargetHours} ชม./สัปดาห์
                      </span>
                    </div>
                  </div>

                  {/* Dual Layer Bar: Planned vs Completed */}
                  <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-[#E4DDD3]">
                    <div className="relative h-full w-full">
                      {/* Planned bar (soft) */}
                      <div
                        className="absolute top-0 left-0 h-full bg-[#CBC2B5] transition-all"
                        style={{ width: `${plannedPctOfTarget}%` }}
                      />
                      {/* Completed bar (solid subject accent) */}
                      <div
                        className={`absolute top-0 left-0 h-full ${colorStyle.accentBar} transition-all`}
                        style={{ width: `${stat.targetProgressRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#575049]">
                    <span>
                      บรรลุเป้าหมายรายสัปดาห์:{" "}
                      <strong className="font-mono text-[#1E1B18]">
                        {stat.targetProgressRate}%
                      </strong>
                    </span>
                    <span>
                      การบ้านที่ค้างอยู่:{" "}
                      <strong
                        className={`font-mono ${
                          stat.pendingHomeworkCount > 0
                            ? "text-[#C85A32]"
                            : "text-[#3D6B52]"
                        }`}
                      >
                        {stat.pendingHomeworkCount} ชิ้น
                      </strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 cols: 7-Day Workload Distribution Chart */}
        <div className="flex flex-col justify-between rounded-lg border border-[#DED6CA] bg-white p-5 lg:col-span-5">
          <div>
            <div className="border-b border-[#EFEAE1] pb-3">
              <h3 className="font-serif text-base font-semibold text-[#1E1B18]">
                กราฟกระจายชั่วโมงอ่านหนังสือรายวัน (จันทร์–อาทิตย์)
              </h3>
              <p className="text-xs text-[#8A8177]">
                ตรวจสอบความสมดุลของตารางเรียนในแต่ละวันไม่ให้หนักเกินไป
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {dailyLoad.map((day) => {
                const plannedWidthPct = Math.round(
                  (day.plannedHours / maxDailyHours) * 100
                );
                const completedWidthPct = Math.round(
                  (day.completedHours / maxDailyHours) * 100
                );

                return (
                  <div key={day.dayOfWeek} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#1E1B18]">
                        {day.dayLabel}
                      </span>
                      <span className="font-mono text-[11px] text-[#575049]">
                        อ่านเสร็จ{" "}
                        <strong className="text-[#3D6B52]">
                          {day.completedHours}
                        </strong>{" "}
                        / {day.plannedHours} ชม. ({day.sessionCount} คาบ)
                      </span>
                    </div>

                    <div className="h-3 w-full overflow-hidden rounded bg-[#F3EFE6]">
                      <div className="relative h-full w-full">
                        <div
                          className="absolute top-0 left-0 h-full rounded bg-[#DED6CA]"
                          style={{ width: `${plannedWidthPct}%` }}
                        />
                        <div
                          className="absolute top-0 left-0 h-full rounded bg-[#3D6B52]"
                          style={{ width: `${completedWidthPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-md border border-[#E4DDD3] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#575049]">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#3D6B52]" />
              สีเขียวเข้ม = อ่านเสร็จแล้ว
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#8A8177]" />
              สีเทาทราย = เวลาที่วางแผนไว้
            </span>
          </div>
        </div>
      </div>

      {/* Subject Directory & Add New Subject Form */}
      <div className="rounded-lg border border-[#DED6CA] bg-white p-5">
        <div className="flex items-center gap-2 border-b border-[#EFEAE1] pb-3">
          <BookMarked className="h-4 w-4 text-[#C85A32]" />
          <h3 className="font-serif text-base font-semibold text-[#1E1B18]">
            จัดการรายวิชาที่เรียนในเทอมนี้ (Subject Registry)
          </h3>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Subject List */}
          <div className="space-y-2 lg:col-span-7">
            {subjects.map((sub) => {
              const colorStyle = SUBJECT_COLORS[sub.color];
              return (
                <div
                  key={sub.id}
                  className="flex items-center justify-between rounded-md border border-[#EFEAE1] bg-[#FAF7F2] px-3.5 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex rounded px-2 py-0.5 font-mono text-xs font-semibold ${colorStyle.bgBadge} ${colorStyle.text}`}
                    >
                      {sub.code}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#1E1B18]">
                        {sub.name}
                      </p>
                      {sub.teacherOrNote && (
                        <p className="text-xs text-[#8A8177]">
                          {sub.teacherOrNote}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[#575049]">
                      เป้า {sub.weeklyTargetHours} ชม./สัปดาห์
                    </span>
                    {subjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onDeleteSubject(sub.id)}
                        title="ลบรายวิชานี้"
                        className="text-[#8A8177] hover:text-[#B83B2A]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Subject Form */}
          <form
            onSubmit={handleAddSubject}
            className="space-y-3 rounded-md border border-[#E4DDD3] bg-[#FAF7F2] p-4 lg:col-span-5"
          >
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#575049]">
              + เพิ่มรายวิชาใหม่
            </h4>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-[#1E1B18]">
                  รหัสวิชา
                </label>
                <input
                  type="text"
                  required
                  placeholder="PHYS 101"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="mt-1 w-full rounded border border-[#D5CCC0] bg-white px-2.5 py-1.5 font-mono text-xs text-[#1E1B18]"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-[#1E1B18]">
                  ชื่อวิชา
                </label>
                <input
                  type="text"
                  required
                  placeholder="ฟิสิกส์ทั่วไป 1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded border border-[#D5CCC0] bg-white px-2.5 py-1.5 text-xs text-[#1E1B18]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-[#1E1B18]">
                  โทนสีประจำวิชา
                </label>
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value as SubjectColorKey)}
                  className="mt-1 w-full rounded border border-[#D5CCC0] bg-white px-2.5 py-1.5 text-xs text-[#1E1B18]"
                >
                  {Object.values(SUBJECT_COLORS).map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1E1B18]">
                  เป้าหมาย (ชม./สัปดาห์)
                </label>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={weeklyTargetHours}
                  onChange={(e) =>
                    setWeeklyTargetHours(Number(e.target.value))
                  }
                  className="mt-1 w-full rounded border border-[#D5CCC0] bg-white px-2.5 py-1.5 font-mono text-xs text-[#1E1B18]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#1E1B18]">
                อาจารย์ผู้สอน / ห้องเรียน (ไม่บังคับ)
              </label>
              <input
                type="text"
                placeholder="เช่น อ.สมชาย • ห้อง SC-204"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                className="mt-1 w-full rounded border border-[#D5CCC0] bg-white px-2.5 py-1.5 text-xs text-[#1E1B18]"
              />
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded bg-[#1E1B18] px-3 py-2 text-xs font-medium text-[#FAF7F2] transition hover:bg-[#342F2A]"
            >
              <Plus className="h-3.5 w-3.5" />
              บันทึกรายวิชาเพิ่ม
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

