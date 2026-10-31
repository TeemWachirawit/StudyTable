"use client";

import React, { useState, useMemo } from "react";
import {
  BookOpenCheck,
  Calendar,
  ClipboardList,
  GraduationCap,
  BarChart3,
  LayoutDashboard,
  RotateCcw,
  Clock,
  AlertCircle,
  CheckCircle2,
  Flame,
  ArrowRight,
} from "lucide-react";
import { useStudyStore } from "@/hooks/use-study-store";
import {
  calculateSubjectAnalytics,
  formatMinutesAsReadable,
  getBlockDurationMinutes,
  getDueUrgency,
  getExamReadiness,
} from "@/lib/planner-engine";
import { WeeklyTimetable } from "@/components/WeeklyTimetable";
import { HomeworkManager } from "@/components/HomeworkManager";
import { ExamCountdownPanel } from "@/components/ExamCountdownPanel";
import { StudyAnalyticsPanel } from "@/components/StudyAnalyticsPanel";

type ActiveTab =
  | "overview"
  | "timetable"
  | "homework"
  | "exams"
  | "analytics";

export default function StudyTablePage() {
  const {
    isLoaded,
    subjects,
    studyBlocks,
    homeworks,
    exams,
    addSubject,
    deleteSubject,
    addStudyBlock,
    toggleStudyBlockCompleted,
    deleteStudyBlock,
    addHomework,
    updateHomeworkStatus,
    toggleHomeworkSubtask,
    addHomeworkSubtask,
    deleteHomework,
    scheduleHomeworkToTimetable,
    addExamGoal,
    toggleExamTopic,
    addExamTopic,
    deleteExamGoal,
    resetToSeedData,
  } = useStudyStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");

  // Top-level Academic Summary Metrics
  const summaryStats = useMemo(() => {
    const plannedMins = studyBlocks.reduce(
      (sum, b) => sum + getBlockDurationMinutes(b),
      0
    );
    const completedMins = studyBlocks
      .filter((b) => b.completed)
      .reduce((sum, b) => sum + getBlockDurationMinutes(b), 0);

    const pendingHomeworks = homeworks.filter((h) => h.status !== "done");
    const urgentHomeworks = pendingHomeworks.filter((h) => {
      const u = getDueUrgency(h.dueDate, false);
      return u.level === "overdue" || u.level === "today" || u.level === "soon";
    });

    const allSubtasks = homeworks.flatMap((h) => h.subtasks);
    const completedSubtasks = allSubtasks.filter((s) => s.completed).length;

    const upcomingExams = [...exams]
      .map((e) => ({ exam: e, readiness: getExamReadiness(e) }))
      .filter((item) => item.readiness.daysRemaining >= 0)
      .sort((a, b) => a.readiness.daysRemaining - b.readiness.daysRemaining);

    const nearestExam = upcomingExams[0] || null;
    const subjectAnalytics = calculateSubjectAnalytics(
      subjects,
      studyBlocks,
      homeworks
    );

    return {
      plannedMins,
      completedMins,
      completionPct:
        plannedMins > 0 ? Math.round((completedMins / plannedMins) * 100) : 0,
      pendingHomeworkCount: pendingHomeworks.length,
      urgentHomeworkCount: urgentHomeworks.length,
      completedSubtasks,
      totalSubtasks: allSubtasks.length,
      nearestExam,
      subjectAnalytics,
    };
  }, [subjects, studyBlocks, homeworks, exams]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2] p-8">
        <div className="text-center">
          <p className="font-serif text-lg font-semibold text-[#1E1B18]">
            กำลังเปิดสมุดวางแผนการเรียน StudyTable...
          </p>
          <p className="mt-1 text-xs text-[#8A8177]">
            Warm Academic Planner & Homework Ledger
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1E1B18]">
      {/* Top Planner Masthead */}
      <header className="border-b border-[#DED6CA] bg-[#F3EFE6]">
        <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#C85A32]/30 bg-[#C85A32] text-white shadow-xs">
                <BookOpenCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="font-serif text-2xl font-bold tracking-tight text-[#1E1B18] sm:text-3xl">
                    StudyTable
                  </h1>
                  <span className="rounded border border-[#D5CCC0] bg-[#FAF7F2] px-2 py-0.5 font-mono text-[11px] font-medium text-[#575049]">
                    ACADEMIC PLANNER & HOMEWORK LEDGER
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[#575049] sm:text-sm">
                  ระบบจัดตารางอ่านหนังสือแบบ Time-Blocking • จัดการการบ้านและงานย่อย • นับถอยหลังวันสอบ
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={resetToSeedData}
                title="คืนค่าข้อมูลตัวอย่างเริ่มต้น"
                className="inline-flex items-center gap-1.5 rounded-md border border-[#D5CCC0] bg-[#FAF7F2] px-3 py-1.5 text-xs font-medium text-[#575049] transition hover:border-[#1E1B18] hover:text-[#1E1B18]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                รีเซ็ตข้อมูลตัวอย่าง
              </button>
            </div>
          </div>

          {/* 4-Column Ledger KPI Strip */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Metric 1: Study Hours */}
            <div className="rounded-lg border border-[#DED6CA] bg-[#FAF7F2] px-4 py-3">
              <div className="flex items-center justify-between text-xs text-[#575049]">
                <span className="font-medium">ชั่วโมงอ่านหนังสือสัปดาห์นี้</span>
                <Clock className="h-4 w-4 text-[#C85A32]" />
              </div>
              <div className="mt-1.5 flex items-baseline justify-between">
                <p className="font-mono text-lg font-bold text-[#1E1B18]">
                  {formatMinutesAsReadable(summaryStats.completedMins)}
                </p>
                <span className="font-mono text-xs text-[#3D6B52]">
                  สำเร็จ {summaryStats.completionPct}%
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#8A8177]">
                จากที่วางแผนในตารางทั้งหมด{" "}
                {formatMinutesAsReadable(summaryStats.plannedMins)}
              </p>
            </div>

            {/* Metric 2: Pending Homework */}
            <div className="rounded-lg border border-[#DED6CA] bg-[#FAF7F2] px-4 py-3">
              <div className="flex items-center justify-between text-xs text-[#575049]">
                <span className="font-medium">การบ้านที่รอส่ง</span>
                <AlertCircle className="h-4 w-4 text-[#C27D1A]" />
              </div>
              <div className="mt-1.5 flex items-baseline justify-between">
                <p className="font-mono text-lg font-bold text-[#1E1B18]">
                  {summaryStats.pendingHomeworkCount} ชิ้นงาน
                </p>
                {summaryStats.urgentHomeworkCount > 0 && (
                  <span className="rounded bg-[#FCF0EE] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[#822215]">
                    เร่งด่วน {summaryStats.urgentHomeworkCount} ชิ้น
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-[#8A8177]">
                สามารถดึงลงตารางเวลาอ่านหนังสือได้โดยตรง
              </p>
            </div>

            {/* Metric 3: Subtasks Progress */}
            <div className="rounded-lg border border-[#DED6CA] bg-[#FAF7F2] px-4 py-3">
              <div className="flex items-center justify-between text-xs text-[#575049]">
                <span className="font-medium">ความคืบหน้างานย่อย (Subtasks)</span>
                <CheckCircle2 className="h-4 w-4 text-[#3D6B52]" />
              </div>
              <div className="mt-1.5 flex items-baseline justify-between">
                <p className="font-mono text-lg font-bold text-[#1E1B18]">
                  {summaryStats.completedSubtasks}/{summaryStats.totalSubtasks}{" "}
                  ขั้นตอน
                </p>
                <span className="font-mono text-xs text-[#3D6B52]">
                  {summaryStats.totalSubtasks > 0
                    ? Math.round(
                      (summaryStats.completedSubtasks /
                        summaryStats.totalSubtasks) *
                      100
                    )
                    : 0}
                  %
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#8A8177]">
                แบ่งงานใหญ่เป็นรายการเช็กลิสต์ย่อย
              </p>
            </div>

            {/* Metric 4: Nearest Exam Countdown */}
            <div className="rounded-lg border border-[#DED6CA] bg-[#FAF7F2] px-4 py-3">
              <div className="flex items-center justify-between text-xs text-[#575049]">
                <span className="font-medium">สนามสอบที่ใกล้ที่สุด</span>
                <Flame className="h-4 w-4 text-[#B83B2A]" />
              </div>
              {summaryStats.nearestExam ? (
                <>
                  <div className="mt-1.5 flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-bold text-[#1E1B18]">
                      {summaryStats.nearestExam.exam.title}
                    </p>
                    <span className="shrink-0 rounded bg-[#FCF0EE] px-1.5 py-0.5 font-mono text-xs font-bold text-[#822215]">
                      อีก {summaryStats.nearestExam.readiness.daysRemaining} วัน
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#8A8177]">
                    อ่านบทเรียนจบแล้ว{" "}
                    <strong className="font-mono text-[#1E1B18]">
                      {summaryStats.nearestExam.readiness.readinessPercent}%
                    </strong>{" "}
                    ({summaryStats.nearestExam.readiness.completedTopics}/
                    {summaryStats.nearestExam.readiness.totalTopics} บท)
                  </p>
                </>
              ) : (
                <p className="mt-2 text-xs text-[#8A8177]">
                  ยังไม่มีรายการสอบที่กำลังจะมาถึง
                </p>
              )}
            </div>
          </div>

          {/* Primary Navigation Bar */}
          <nav
            aria-label="เมนูหลักของ StudyTable"
            className="mt-5 flex flex-wrap gap-1.5 border-t border-[#DED6CA] pt-4"
          >
            {[
              {
                id: "overview" as ActiveTab,
                label: "ภาพรวมสมุดแพลนเนอร์",
                icon: LayoutDashboard,
              },
              {
                id: "timetable" as ActiveTab,
                label: "จัดตารางอ่านหนังสือ",
                icon: Calendar,
                badge: studyBlocks.length,
              },
              {
                id: "homework" as ActiveTab,
                label: "การจัดการการบ้าน",
                icon: ClipboardList,
                badge: summaryStats.pendingHomeworkCount,
              },
              {
                id: "exams" as ActiveTab,
                label: "นับถอยหลังวันสอบ",
                icon: GraduationCap,
                badge: exams.length,
              },
              {
                id: "analytics" as ActiveTab,
                label: "สถิติชั่วโมงเรียน & รายวิชา",
                icon: BarChart3,
              },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`inline-flex items-center gap-2 rounded-md border px-3.5 py-2 text-xs font-semibold transition sm:text-sm ${isActive
                      ? "border-[#1E1B18] bg-[#1E1B18] text-[#FAF7F2] shadow-xs"
                      : "border-[#D5CCC0] bg-[#FAF7F2] text-[#575049] hover:border-[#B8AEA0] hover:bg-white hover:text-[#1E1B18]"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {typeof item.badge === "number" && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 font-mono text-[11px] ${isActive
                          ? "bg-[#C85A32] text-white"
                          : "bg-[#E4DDD3] text-[#575049]"
                        }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Planner Workbench */}
      <main className="mx-auto max-w-[1400px] px-4 py-7 sm:px-6 lg:px-8">
        {activeTab === "overview" && (
          <div className="space-y-10">
            {/* Section 1: Weekly Study Timetable */}
            <section>
              <WeeklyTimetable
                subjects={subjects}
                studyBlocks={studyBlocks}
                homeworks={homeworks}
                onAddBlock={addStudyBlock}
                onToggleBlock={toggleStudyBlockCompleted}
                onDeleteBlock={deleteStudyBlock}
              />
            </section>

            {/* Section 2: Homework Manager */}
            <section className="border-t border-[#DED6CA] pt-8">
              <HomeworkManager
                subjects={subjects}
                homeworks={homeworks}
                studyBlocks={studyBlocks}
                onAddHomework={addHomework}
                onUpdateStatus={updateHomeworkStatus}
                onToggleSubtask={toggleHomeworkSubtask}
                onAddSubtask={addHomeworkSubtask}
                onDeleteHomework={deleteHomework}
                onScheduleToTimetable={scheduleHomeworkToTimetable}
              />
            </section>

            {/* Section 3: Exam Countdown & Syllabus */}
            <section className="border-t border-[#DED6CA] pt-8">
              <ExamCountdownPanel
                subjects={subjects}
                exams={exams}
                onAddExam={addExamGoal}
                onToggleTopic={toggleExamTopic}
                onAddTopic={addExamTopic}
                onDeleteExam={deleteExamGoal}
              />
            </section>

            {/* Section 4: Quick link to full Analytics */}
            <section className="flex flex-col items-start justify-between gap-4 rounded-lg border border-[#DED6CA] bg-[#F3EFE6] p-5 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-serif text-base font-semibold text-[#1E1B18]">
                  ต้องการดูกราฟสรุปชั่วโมงการอ่านหนังสือรายวิชาหรือเพิ่มวิชาเรียนใหม่?
                </h3>
                <p className="mt-0.5 text-xs text-[#575049]">
                  ตรวจสอบสัดส่วนเวลาเรียนจริงเทียบกับเป้าหมายรายสัปดาห์และจัดการรายวิชาทั้งหมดได้ในหน้าสถิติ
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("analytics")}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#1E1B18] px-4 py-2 text-xs font-semibold text-[#FAF7F2] transition hover:bg-[#342F2A]"
              >
                เปิดหน้าสถิติชั่วโมงเรียน & รายวิชา
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </section>
          </div>
        )}

        {activeTab === "timetable" && (
          <WeeklyTimetable
            subjects={subjects}
            studyBlocks={studyBlocks}
            homeworks={homeworks}
            onAddBlock={addStudyBlock}
            onToggleBlock={toggleStudyBlockCompleted}
            onDeleteBlock={deleteStudyBlock}
          />
        )}

        {activeTab === "homework" && (
          <HomeworkManager
            subjects={subjects}
            homeworks={homeworks}
            studyBlocks={studyBlocks}
            onAddHomework={addHomework}
            onUpdateStatus={updateHomeworkStatus}
            onToggleSubtask={toggleHomeworkSubtask}
            onAddSubtask={addHomeworkSubtask}
            onDeleteHomework={deleteHomework}
            onScheduleToTimetable={scheduleHomeworkToTimetable}
          />
        )}

        {activeTab === "exams" && (
          <ExamCountdownPanel
            subjects={subjects}
            exams={exams}
            onAddExam={addExamGoal}
            onToggleTopic={toggleExamTopic}
            onAddTopic={addExamTopic}
            onDeleteExam={deleteExamGoal}
          />
        )}

        {activeTab === "analytics" && (
          <StudyAnalyticsPanel
            subjects={subjects}
            studyBlocks={studyBlocks}
            homeworks={homeworks}
            onAddSubject={addSubject}
            onDeleteSubject={deleteSubject}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-[#DED6CA] bg-[#F3EFE6] py-6">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-2 px-4 text-xs text-[#575049] sm:flex-row sm:px-6 lg:px-8">
          <p className="font-serif font-medium text-[#1E1B18]">
            StudyTable — Warm Academic Study Planner & Homework Ledger
          </p>
          <p className="font-mono text-[11px] text-[#8A8177]">
            บันทึกข้อมูลอัตโนมัติในเบราว์เซอร์ (Local-First) • รองรับโครงสร้างฐานข้อมูล Drizzle ORM
          </p>
        </div>
      </footer>
    </div>
  );
}

