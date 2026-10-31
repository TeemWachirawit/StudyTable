"use client";

import React, { useState, useMemo } from "react";
import {
  GraduationCap,
  Plus,
  CheckSquare,
  Square,
  Trash2,
  MapPin,
  Target,
  Flame,
  Calendar,
} from "lucide-react";
import { ExamGoal, Subject } from "@/types/study";
import { getExamReadiness, getTodayIsoString } from "@/lib/planner-engine";
import { SUBJECT_COLORS } from "@/lib/theme";

interface ExamCountdownPanelProps {
  subjects: Subject[];
  exams: ExamGoal[];
  onAddExam: (
    exam: Omit<ExamGoal, "id" | "topics"> & { topicTitles?: string[] }
  ) => void;
  onToggleTopic: (examId: string, topicId: string) => void;
  onAddTopic: (examId: string, title: string, chapterCode?: string) => void;
  onDeleteExam: (examId: string) => void;
}

export function ExamCountdownPanel({
  subjects,
  exams,
  onAddExam,
  onToggleTopic,
  onAddTopic,
  onDeleteExam,
}: ExamCountdownPanelProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id || "");
  const [formTitle, setFormTitle] = useState("");
  const [formExamDate, setFormExamDate] = useState(getTodayIsoString());
  const [formRoom, setFormRoom] = useState("");
  const [formTargetScore, setFormTargetScore] = useState("");
  const [formTopicsRaw, setFormTopicsRaw] = useState("");

  const [topicDrafts, setTopicDrafts] = useState<Record<string, string>>({});

  const subjectMap = useMemo(() => {
    const map = new Map<string, Subject>();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  const sortedExams = useMemo(() => {
    return [...exams].sort((a, b) => a.examDate.localeCompare(b.examDate));
  }, [exams]);

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    const subId = formSubjectId || subjects[0]?.id;
    if (!subId) return;

    const topicTitles = formTopicsRaw
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);

    onAddExam({
      subjectId: subId,
      title: formTitle.trim(),
      examDate: formExamDate,
      roomOrFormat: formRoom.trim() || undefined,
      targetScore: formTargetScore.trim() || undefined,
      topicTitles,
    });

    setFormTitle("");
    setFormRoom("");
    setFormTargetScore("");
    setFormTopicsRaw("");
    setIsAddOpen(false);
  };

  const handleInlineTopicAdd = (examId: string) => {
    const draft = topicDrafts[examId];
    if (!draft || !draft.trim()) return;
    onAddTopic(examId, draft);
    setTopicDrafts((prev) => ({ ...prev, [examId]: "" }));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-[#E4DDD3] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#D5CCC0] bg-[#F3EFE6] text-[#C85A32]">
              <GraduationCap className="h-4 w-4" />
            </span>
            <h2 className="font-serif text-xl font-semibold tracking-tight text-[#1E1B18]">
              นับถอยหลังวันสอบ & เช็กลิสต์บทเรียน (Exam Countdown & Syllabus)
            </h2>
          </div>
          <p className="mt-1 text-sm text-[#575049]">
            ติดตามจำนวนวันที่เหลือก่อนสอบและเช็กความพร้อมของแต่ละบทเรียนที่ต้องอ่านให้ครบ
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-1.5 self-start rounded-md bg-[#C85A32] px-3.5 py-2 text-xs font-medium text-white transition hover:bg-[#B04B25] sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          เพิ่มเป้าหมายการสอบ
        </button>
      </div>

      {/* Exam Cards Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {sortedExams.map((exam) => {
          const subject = subjectMap.get(exam.subjectId);
          const colorStyle = SUBJECT_COLORS[subject?.color || "terracotta"];
          const readiness = getExamReadiness(exam);

          return (
            <div
              key={exam.id}
              className="flex flex-col justify-between rounded-lg border border-[#DED6CA] bg-white"
            >
              <div>
                {/* Top Countdown Banner */}
                <div className="flex items-center justify-between border-b border-[#EFEAE1] bg-[#FAF7F2] px-4 py-3">
                  {subject ? (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-semibold ${colorStyle.bgBadge} ${colorStyle.text}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${colorStyle.dot}`}
                      />
                      {subject.code}
                    </span>
                  ) : (
                    <span />
                  )}

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 font-mono text-xs font-bold ${
                        readiness.urgencyLevel === "critical"
                          ? "border-[#E3B4AD] bg-[#FCF0EE] text-[#822215]"
                          : readiness.urgencyLevel === "approaching"
                          ? "border-[#E5C99B] bg-[#FDF6EB] text-[#855209]"
                          : "border-[#B8D4C3] bg-[#EFF6F2] text-[#264A36]"
                      }`}
                    >
                      <Flame className="h-3.5 w-3.5" />
                      {readiness.daysRemaining < 0
                        ? `ผ่านไปแล้ว ${Math.abs(readiness.daysRemaining)} วัน`
                        : readiness.daysRemaining === 0
                        ? "สอบวันนี้!"
                        : `อีก ${readiness.daysRemaining} วัน`}
                    </span>

                    <button
                      type="button"
                      onClick={() => onDeleteExam(exam.id)}
                      title="ลบตารางสอบนี้"
                      className="text-[#8A8177] hover:text-[#B83B2A]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Exam Info */}
                <div className="p-4">
                  <h3 className="font-serif text-base font-semibold text-[#1E1B18]">
                    {exam.title}
                  </h3>

                  <div className="mt-2 space-y-1 text-xs text-[#575049]">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[#8A8177]" />
                      วันสอบ:{" "}
                      <span className="font-mono font-semibold text-[#1E1B18]">
                        {exam.examDate}
                      </span>
                    </p>
                    {exam.roomOrFormat && (
                      <p className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-[#8A8177]" />
                        <span>{exam.roomOrFormat}</span>
                      </p>
                    )}
                    {exam.targetScore && (
                      <p className="flex items-center gap-1.5">
                        <Target className="h-3.5 w-3.5 text-[#C85A32]" />
                        เป้าหมาย:{" "}
                        <strong className="text-[#1E1B18]">
                          {exam.targetScore}
                        </strong>
                      </p>
                    )}
                  </div>

                  {/* Syllabus Readiness Bar */}
                  <div className="mt-4 rounded-md border border-[#E4DDD3] bg-[#FAF7F2] p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#1E1B18]">
                        ความพร้อมเนื้อหาที่อ่านแล้ว
                      </span>
                      <span className="font-mono font-bold text-[#3D6B52]">
                        {readiness.completedTopics}/{readiness.totalTopics} บท (
                        {readiness.readinessPercent}%)
                      </span>
                    </div>

                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#E4DDD3]">
                      <div
                        className="h-full rounded-full bg-[#C85A32] transition-all duration-300"
                        style={{ width: `${readiness.readinessPercent}%` }}
                      />
                    </div>

                    {/* Topic Checklist */}
                    <ul className="mt-3 space-y-1.5">
                      {exam.topics.map((topic) => (
                        <li key={topic.id}>
                          <button
                            type="button"
                            onClick={() => onToggleTopic(exam.id, topic.id)}
                            className="flex w-full items-start gap-2 rounded px-1.5 py-1 text-left text-xs transition hover:bg-[#F3EFE6]"
                          >
                            {topic.completed ? (
                              <CheckSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#3D6B52]" />
                            ) : (
                              <Square className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8A8177]" />
                            )}
                            <span
                              className={
                                topic.completed
                                  ? "line-through text-[#8A8177]"
                                  : "text-[#1E1B18]"
                              }
                            >
                              {topic.chapterCode && (
                                <strong className="mr-1 font-mono text-[11px] text-[#575049]">
                                  [{topic.chapterCode}]
                                </strong>
                              )}
                              {topic.title}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>

                    {/* Inline Add Syllabus Topic */}
                    <div className="mt-2.5 flex items-center gap-1.5 pt-1">
                      <input
                        type="text"
                        placeholder="+ เพิ่มบทเรียนที่ต้องอ่าน..."
                        value={topicDrafts[exam.id] || ""}
                        onChange={(e) =>
                          setTopicDrafts((prev) => ({
                            ...prev,
                            [exam.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleInlineTopicAdd(exam.id);
                          }
                        }}
                        className="flex-1 rounded border border-[#D5CCC0] bg-white px-2.5 py-1 text-xs text-[#1E1B18] placeholder:text-[#8A8177] focus:border-[#C85A32] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleInlineTopicAdd(exam.id)}
                        className="rounded border border-[#D5CCC0] bg-white px-2.5 py-1 text-xs font-medium text-[#575049] hover:border-[#C85A32] hover:text-[#C85A32]"
                      >
                        เพิ่ม
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Exam Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1B18]/40 p-4 backdrop-blur-[1px]">
          <div className="w-full max-w-lg rounded-lg border border-[#D5CCC0] bg-[#FAF7F2] shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E4DDD3] bg-[#F3EFE6] px-5 py-3.5">
              <h3 className="font-serif text-base font-semibold text-[#1E1B18]">
                เพิ่มเป้าหมายการสอบ & บทเรียนที่ต้องอ่าน
              </h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-xs font-medium text-[#575049] hover:text-[#1E1B18]"
              >
                ปิด ✕
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-4 p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                    วันที่สอบ (Exam Date)
                  </label>
                  <input
                    type="date"
                    required
                    value={formExamDate}
                    onChange={(e) => setFormExamDate(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#D5CCC0] bg-white px-3 py-2 font-mono text-sm text-[#1E1B18] focus:border-[#C85A32] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18]">
                  ชื่อการสอบ
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น สอบปลายภาค แคลคูลัส 2"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#D5CCC0] bg-white px-3 py-2 text-sm text-[#1E1B18] placeholder:text-[#8A8177] focus:border-[#C85A32] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18]">
                    ห้องสอบ / รูปแบบข้อสอบ
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น ห้อง SC-301 • อัตนัย 5 ข้อ"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#D5CCC0] bg-white px-3 py-2 text-xs text-[#1E1B18] placeholder:text-[#8A8177] focus:border-[#C85A32] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18]">
                    คะแนนหรือเกรดเป้าหมาย
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น 85% หรือ เกรด A"
                    value={formTargetScore}
                    onChange={(e) => setFormTargetScore(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#D5CCC0] bg-white px-3 py-2 text-xs text-[#1E1B18] placeholder:text-[#8A8177] focus:border-[#C85A32] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18]">
                  รายการบทเรียนที่ต้องอ่านให้จบ (พิมพ์บรรทัดละ 1 บท)
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    "บทที่ 1: สมการเชิงอนุพันธ์อันดับหนึ่ง\nบทที่ 2: การแปลงลาปลาซ\nบทที่ 3: อนุกรมฟูเรียร์"
                  }
                  value={formTopicsRaw}
                  onChange={(e) => setFormTopicsRaw(e.target.value)}
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
                  บันทึกตารางสอบ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

