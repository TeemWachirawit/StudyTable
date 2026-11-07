"use client";

import { useMemo, useState } from "react";
import {
  BookOpenCheck,
  BookPlus,
  CalendarDays,
  Check,
  Clock,
  Hourglass,
  Palette,
  Pencil,
  PieChart,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useStudyStore } from "@/hooks/use-study-store";
import { getSubjectColor } from "@/lib/colors";
import {
  DAYS,
  DAYS_SHORT,
  daysUntil,
  examReadiness,
  formatHour,
  formatThaiDate,
  subjectProgress,
  toISODate,
  uid,
  weekdayIndex,
} from "@/lib/study";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/ui/field";
import { LoadingDesk, PageHeader } from "@/components/PageHeader";
import { SubjectEditor } from "@/components/table/SubjectEditor";
import { BlockEditor } from "@/components/planner/BlockEditor";
import { ExamEditor } from "@/components/exam/ExamEditor";
import type { Exam, StudyBlock, Subject } from "@/types/study";

type ManagerTab = "subjects" | "schedule" | "exams";

export function DashboardBoard() {
  const { state, dispatch, hydrated } = useStudyStore();
  const [activeTab, setActiveTab] = useState<ManagerTab>("subjects");
  const [editingSubject, setEditingSubject] = useState<Subject | "new" | null>(null);
  const [editingBlock, setEditingBlock] = useState<StudyBlock | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [dayFilter, setDayFilter] = useState<number | "all">("all");

  const subjectById = useMemo(
    () => new Map(state.subjects.map((s) => [s.id, s])),
    [state.subjects]
  );

  // Analytics calculations
  const analytics = useMemo(() => {
    const totalHours = state.blocks.reduce((sum, b) => sum + b.duration, 0);
    const allChapters = state.subjects.flatMap((s) => s.chapters);
    const doneChapters = allChapters.filter((c) => c.done).length;
    const overallPct = allChapters.length
      ? Math.round((doneChapters / allChapters.length) * 100)
      : 0;

    const hoursBySubject = new Map<string, number>();
    for (const b of state.blocks) {
      hoursBySubject.set(b.subjectId, (hoursBySubject.get(b.subjectId) ?? 0) + b.duration);
    }

    const subjectStats = state.subjects.map((s) => {
      const hours = hoursBySubject.get(s.id) ?? 0;
      const hourSharePct = totalHours > 0 ? Math.round((hours / totalHours) * 100) : 0;
      const progress = subjectProgress(s);
      const color = getSubjectColor(s.color);
      return {
        subject: s,
        hours,
        hourSharePct,
        progress,
        color,
      };
    });

    const upcomingExams = [...state.exams]
      .filter((e) => daysUntil(e.date) >= 0)
      .sort((a, b) => a.date.localeCompare(b.date));

    const hoursByDay = DAYS.map((dayName, dayIdx) => {
      const hours = state.blocks
        .filter((b) => b.day === dayIdx)
        .reduce((sum, b) => sum + b.duration, 0);
      return { dayName, dayIdx, hours };
    });
    const maxDayHours = Math.max(1, ...hoursByDay.map((d) => d.hours));

    return {
      totalHours,
      totalChapters: allChapters.length,
      doneChapters,
      overallPct,
      subjectStats,
      upcomingExams,
      hoursByDay,
      maxDayHours,
    };
  }, [state]);

  const openNewBlock = () => {
    if (state.subjects.length === 0) {
      setEditingSubject("new");
      return;
    }
    setEditingBlock({
      id: uid(),
      subjectId: state.subjects[0].id,
      day: weekdayIndex(new Date()),
      startHour: 18,
      duration: 1,
      topic: "",
    });
  };

  const openNewExam = () => {
    if (state.subjects.length === 0) {
      setEditingSubject("new");
      return;
    }
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setEditingExam({
      id: uid(),
      subjectId: state.subjects[0].id,
      title: "",
      date: toISODate(nextWeek),
      time: "",
      chapterIds: [],
      extraTopics: [],
      notes: "",
    });
  };

  const header = (
    <PageHeader
      eyebrow="Dashboard"
      tone="sky"
      title="แดชบอร์ดภาพรวมและจัดการข้อมูล"
      description="ดูแผนภูมิสัดส่วนชั่วโมงเรียน ความคืบหน้าแต่ละรายวิชา และแก้ไขวิชา สี บทเรียน ตารางเวลา หรือวันสอบได้ในหน้าเดียว"
      actions={
        hydrated ? (
          <>
            <Button variant="outline" size="sm" onClick={() => setEditingSubject("new")}>
              <BookPlus className="h-4 w-4" /> เพิ่มวิชา
            </Button>
            <Button variant="outline" size="sm" onClick={openNewBlock}>
              <CalendarDays className="h-4 w-4" /> เพิ่มเวลาเรียน
            </Button>
            <Button size="sm" onClick={openNewExam}>
              <Plus className="h-4 w-4" /> เพิ่มการสอบ
            </Button>
          </>
        ) : undefined
      }
    />
  );

  if (!hydrated) {
    return (
      <>
        {header}
        <LoadingDesk />
      </>
    );
  }

  const sortedBlocks = [...state.blocks]
    .filter((b) => dayFilter === "all" || b.day === dayFilter)
    .sort((a, b) => (a.day !== b.day ? a.day - b.day : a.startHour - b.startHour));

  const sortedExams = [...state.exams].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <>
      {header}

      <div className="mx-auto max-w-6xl space-y-8 px-5 py-8 sm:px-8">
        {/* ───────── 1. KPI Summary Strip ───────── */}
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="ชั่วโมงอ่านต่อสัปดาห์"
            value={`${analytics.totalHours} ชม.`}
            sub={`${state.blocks.length} ช่วงเวลาที่วางแผนไว้`}
            badge="Planner"
            toneClass="border-terracotta/25 bg-terracotta-tint text-terracotta-deep"
          />
          <KpiCard
            label="ความคืบหน้าบทเรียนรวม"
            value={`${analytics.overallPct}%`}
            sub={`อ่านจบแล้ว ${analytics.doneChapters} จาก ${analytics.totalChapters} บท`}
            badge="Chapters"
            toneClass="border-sage/25 bg-sage-tint text-sage-deep"
          />
          <KpiCard
            label="รายวิชาทั้งหมด"
            value={`${state.subjects.length} วิชา`}
            sub="คลิกที่สีวิชาเพื่อเปลี่ยนสีได้ทันที"
            badge="Subjects"
            toneClass="border-plum/25 bg-plum-tint text-plum-deep"
          />
          <KpiCard
            label="การสอบที่กำลังจะมาถึง"
            value={`${analytics.upcomingExams.length} รายการ`}
            sub={
              analytics.upcomingExams[0]
                ? `สอบถัดไปในอีก ${daysUntil(analytics.upcomingExams[0].date)} วัน`
                : "ยังไม่มีกำหนดสอบใหม่"
            }
            badge="Exams"
            toneClass="border-mustard/35 bg-mustard-tint text-mustard-deep"
          />
        </dl>

        {/* ───────── 2. Visual Analytics Charts ───────── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Chart A: Donut Chart — Study Hours Share by Subject */}
          <section className="flex flex-col rounded-2xl border border-line-strong bg-sheet p-6 shadow-[0_12px_28px_-22px_rgba(15,23,42,0.12)]">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-terracotta uppercase">
                  <PieChart className="h-3.5 w-3.5" />
                  Study Time Distribution
                </span>
                <span className="font-mono text-xs text-ink-muted">
                  รวม {analytics.totalHours} ชม./สัปดาห์
                </span>
              </div>
              <h2 className="mt-1.5 font-display text-xl font-bold text-ink">
                สัดส่วนชั่วโมงอ่านหนังสือแยกตามรายวิชา
              </h2>
              <p className="mt-1 text-xs text-ink-soft">
                แสดงสัดส่วนเวลาที่จัดไว้ในตารางรายสัปดาห์ของแต่ละวิชาตามสีที่คุณเลือก
              </p>
            </div>

            {state.subjects.length === 0 ? (
              <div className="my-8 rounded-xl border border-dashed border-line px-4 py-10 text-center text-sm text-ink-muted">
                ยังไม่มีรายวิชา เพิ่มวิชาเพื่อดูแผนภูมิสัดส่วนเวลาเรียน
              </div>
            ) : (
              <>
                <div className="mt-5 grid items-center gap-6 sm:grid-cols-[11.5rem_1fr]">
                  <DonutChart
                    segments={analytics.subjectStats.map((item) => ({
                      id: item.subject.id,
                      label: item.subject.name,
                      value: item.hours,
                      hex: item.color.hex,
                    }))}
                    totalHours={analytics.totalHours}
                  />

                  <ul className="space-y-2.5">
                    {analytics.subjectStats.map(({ subject, hours, hourSharePct, color }) => (
                      <li
                        key={subject.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper px-3.5 py-2 text-sm"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span
                            className="h-3 w-3 shrink-0 rounded-full shadow-2xs"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="truncate font-semibold text-ink">{subject.name}</span>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 font-mono text-xs">
                          <span className="font-semibold text-ink">{hours} ชม.</span>
                          <span className="w-10 text-right text-ink-muted">({hourSharePct}%)</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Daily study hours breakdown (Mon-Sun) */}
                <div className="mt-6 border-t border-line pt-4">
                  <p className="mb-3 font-mono text-xs font-semibold tracking-wide text-ink-muted uppercase">
                    ชั่วโมงอ่านหนังสือรายวัน (จันทร์–อาทิตย์)
                  </p>
                  <div className="grid grid-cols-7 gap-2">
                    {analytics.hoursByDay.map(({ dayName, dayIdx, hours }) => {
                      const heightPct =
                        hours > 0 ? Math.max(18, Math.round((hours / analytics.maxDayHours) * 100)) : 0;
                      const isToday = dayIdx === weekdayIndex(new Date());
                      return (
                        <div
                          key={dayName}
                          className="flex flex-col items-center rounded-xl border border-line bg-paper px-1.5 py-2.5"
                        >
                          <span className="font-mono text-[11px] font-semibold text-ink">
                            {hours > 0 ? `${hours}ชม.` : "–"}
                          </span>
                          <div className="my-2 flex h-14 w-3 items-end overflow-hidden rounded-full bg-paper-deep">
                            <div
                              className={cn(
                                "w-full rounded-full transition-all duration-300",
                                isToday ? "bg-terracotta" : "bg-terracotta/65"
                              )}
                              style={{ height: `${heightPct}%` }}
                            />
                          </div>
                          <span
                            className={cn(
                              "text-[11px] font-medium",
                              isToday ? "font-bold text-terracotta-deep" : "text-ink-soft"
                            )}
                          >
                            {DAYS_SHORT[dayIdx]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </section>

          {/* Chart B: Subject Progress Comparison & Exam Readiness */}
          <section className="flex flex-col rounded-2xl border border-line-strong bg-sheet p-6 shadow-[0_12px_28px_-22px_rgba(15,23,42,0.12)]">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-sage uppercase">
                  <BookOpenCheck className="h-3.5 w-3.5" />
                  Progress & Exam Readiness
                </span>
                <span className="font-mono text-xs text-ink-muted">
                  ภาพรวม {analytics.overallPct}%
                </span>
              </div>
              <h2 className="mt-1.5 font-display text-xl font-bold text-ink">
                ความคืบหน้าบทเรียนรายวิชา และความพร้อมสอบ
              </h2>
              <p className="mt-1 text-xs text-ink-soft">
                เปรียบเทียบเปอร์เซ็นต์บทเรียนที่อ่านจบแล้วและระดับความพร้อมก่อนถึงวันสอบ
              </p>

              {/* Subject Progress Bars */}
              <div className="mt-5 space-y-3.5">
                {analytics.subjectStats.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-ink-muted">
                    ยังไม่มีข้อมูลบทเรียน
                  </p>
                ) : (
                  analytics.subjectStats.map(({ subject, progress, color }) => (
                    <div key={subject.id}>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 font-semibold text-ink">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: color.hex }}
                          />
                          {subject.name}
                        </span>
                        <span className="font-mono text-ink-muted">
                          {progress.done}/{progress.total} บท ·{" "}
                          <strong className="text-ink">{progress.pct}%</strong>
                        </span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-paper-deep">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${progress.pct}%`,
                            backgroundColor: color.hex,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Upcoming Exam Readiness Sub-chart */}
            <div className="mt-6 border-t border-line pt-4">
              <p className="mb-2.5 font-mono text-xs font-semibold tracking-wide text-ink-muted uppercase">
                ความพร้อมการสอบที่กำลังจะมาถึง
              </p>
              {analytics.upcomingExams.length === 0 ? (
                <p className="text-xs text-ink-muted">ไม่มีการสอบที่กำลังจะมาถึง</p>
              ) : (
                <ul className="space-y-2.5">
                  {analytics.upcomingExams.slice(0, 3).map((exam) => {
                    const subj = subjectById.get(exam.subjectId);
                    const color = subj ? getSubjectColor(subj.color) : getSubjectColor("terracotta");
                    const readiness = examReadiness(exam, subj);
                    const days = daysUntil(exam.date);
                    return (
                      <li
                        key={exam.id}
                        className="rounded-xl border border-line bg-paper px-3.5 py-2.5 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="truncate font-semibold text-ink">
                              {subj?.name ?? "ไม่ระบุวิชา"} · {exam.title}
                            </span>
                          </div>
                          <span className="shrink-0 rounded-full border border-mustard/30 bg-mustard-tint px-2 py-0.5 font-mono text-[11px] font-semibold text-mustard-deep">
                            {days === 0 ? "สอบวันนี้" : `อีก ${days} วัน`}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2.5">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-deep">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${readiness.pct}%`,
                                backgroundColor: readiness.pct === 100 ? "#0d9488" : color.hex,
                              }}
                            />
                          </div>
                          <span className="w-20 text-right font-mono text-[11px] text-ink-soft">
                            พร้อม {readiness.pct}%
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        </div>

        {/* ───────── 3. Interactive Data Manager ───────── */}
        <section className="rounded-2xl border border-line-strong bg-sheet shadow-[0_12px_28px_-22px_rgba(15,23,42,0.12)]">
          <div className="flex flex-col justify-between gap-4 border-b border-line px-6 py-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-xl font-bold text-ink">
                จัดการและแก้ไขข้อมูลทั้งหมด
              </h2>
              <p className="text-xs text-ink-soft">
                แก้ไขรายวิชา เปลี่ยนสีวิชา จัดการบทเรียน ตารางอ่านหนังสือ และวันสอบได้ทันทีจากตรงนี้
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 rounded-xl border border-line bg-paper p-1">
              <button
                type="button"
                onClick={() => setActiveTab("subjects")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  activeTab === "subjects"
                    ? "bg-sheet text-ink shadow-2xs"
                    : "text-ink-soft hover:text-ink"
                )}
              >
                <BookOpenCheck className="h-3.5 w-3.5 text-sage" />
                วิชาและบทเรียน ({state.subjects.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("schedule")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  activeTab === "schedule"
                    ? "bg-sheet text-ink shadow-2xs"
                    : "text-ink-soft hover:text-ink"
                )}
              >
                <CalendarDays className="h-3.5 w-3.5 text-terracotta" />
                ตารางอ่านหนังสือ ({state.blocks.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("exams")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  activeTab === "exams"
                    ? "bg-sheet text-ink shadow-2xs"
                    : "text-ink-soft hover:text-ink"
                )}
              >
                <Hourglass className="h-3.5 w-3.5 text-mustard" />
                รายการสอบ ({state.exams.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* TAB 1: Subjects & Chapters Manager */}
            {activeTab === "subjects" && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-ink-soft">
                    คลิกที่ปุ่มวงกลมสีของแต่ละวิชาเพื่อเปลี่ยนสีเป็นเฉดที่ต้องการ หรือเพิ่ม/แก้ไขบทเรียนได้โดยตรง
                  </p>
                  <Button size="sm" onClick={() => setEditingSubject("new")}>
                    <Plus className="h-4 w-4" /> เพิ่มวิชาใหม่
                  </Button>
                </div>

                {state.subjects.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-line-strong py-12 text-center">
                    <p className="font-semibold text-ink">ยังไม่มีรายวิชา</p>
                    <p className="mt-1 text-sm text-ink-soft">
                      เริ่มเพิ่มวิชาแรกเพื่อจัดการบทเรียนและตารางเวลา
                    </p>
                    <Button className="mt-4" size="sm" onClick={() => setEditingSubject("new")}>
                      <Plus className="h-4 w-4" /> เพิ่มวิชาแรก
                    </Button>
                  </div>
                ) : (
                  <div className="grid items-start gap-5 lg:grid-cols-2">
                    {state.subjects.map((subject) => (
                      <DashboardSubjectCard
                        key={subject.id}
                        subject={subject}
                        onEditSubject={() => setEditingSubject(subject)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Study Schedule Manager */}
            {activeTab === "schedule" && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDayFilter("all")}
                      className={cn(
                        "rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors",
                        dayFilter === "all"
                          ? "border-terracotta bg-terracotta text-sheet"
                          : "border-line bg-paper text-ink-soft hover:text-ink"
                      )}
                    >
                      ทุกวัน ({state.blocks.length})
                    </button>
                    {DAYS.map((dayName, idx) => (
                      <button
                        key={dayName}
                        type="button"
                        onClick={() => setDayFilter(idx)}
                        className={cn(
                          "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                          dayFilter === idx
                            ? "border-terracotta bg-terracotta-tint font-semibold text-terracotta-deep"
                            : "border-line bg-paper text-ink-soft hover:text-ink"
                        )}
                      >
                        {dayName}
                      </button>
                    ))}
                  </div>

                  <Button size="sm" onClick={openNewBlock}>
                    <Plus className="h-4 w-4" /> เพิ่มช่วงอ่านหนังสือ
                  </Button>
                </div>

                {sortedBlocks.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-line-strong py-12 text-center text-sm text-ink-muted">
                    ไม่มีรายการตารางเวลาในวันที่เลือก
                  </div>
                ) : (
                  <div className="divide-y divide-line overflow-hidden rounded-xl border border-line">
                    {sortedBlocks.map((block) => {
                      const subj = subjectById.get(block.subjectId);
                      const color = subj
                        ? getSubjectColor(subj.color)
                        : getSubjectColor("terracotta");
                      return (
                        <div
                          key={block.id}
                          className="flex flex-wrap items-center justify-between gap-3 bg-sheet px-4 py-3 transition-colors hover:bg-paper"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              className="inline-flex w-20 shrink-0 justify-center rounded-md border border-line bg-paper px-2 py-1 text-xs font-semibold text-ink"
                            >
                              วัน{DAYS[block.day]}
                            </span>
                            <span className="font-mono text-xs font-semibold text-ink-soft">
                              {formatHour(block.startHour)}–
                              {formatHour(block.startHour + block.duration)} ({block.duration} ชม.)
                            </span>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                                color.blockClass
                              )}
                              style={color.blockStyle}
                            >
                              <span
                                className={cn("h-2 w-2 rounded-full", color.solidClass)}
                                style={color.solidStyle}
                              />
                              {subj?.name ?? "ไม่พบวิชา"}
                            </span>
                            {block.topic && (
                              <span className="truncate text-sm text-ink">{block.topic}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2.5 text-xs"
                              onClick={() => setEditingBlock(block)}
                            >
                              <Pencil className="h-3.5 w-3.5" /> แก้ไข
                            </Button>
                            <button
                              type="button"
                              onClick={() => dispatch({ type: "deleteBlock", id: block.id })}
                              className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-slate-tint hover:text-slate-deep"
                              aria-label="ลบช่วงเวลา"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Exams Manager */}
            {activeTab === "exams" && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-ink-soft">
                    จัดการวันสอบและหัวข้อที่ออกสอบทั้งหมด
                  </p>
                  <Button size="sm" onClick={openNewExam}>
                    <Plus className="h-4 w-4" /> เพิ่มการสอบ
                  </Button>
                </div>

                {sortedExams.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-line-strong py-12 text-center text-sm text-ink-muted">
                    ยังไม่มีรายการสอบที่บันทึกไว้
                  </div>
                ) : (
                  <div className="divide-y divide-line overflow-hidden rounded-xl border border-line">
                    {sortedExams.map((exam) => {
                      const subj = subjectById.get(exam.subjectId);
                      const color = subj
                        ? getSubjectColor(subj.color)
                        : getSubjectColor("terracotta");
                      const days = daysUntil(exam.date);
                      const readiness = examReadiness(exam, subj);
                      return (
                        <div
                          key={exam.id}
                          className="flex flex-wrap items-center justify-between gap-4 bg-sheet px-4 py-3.5 transition-colors hover:bg-paper"
                        >
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                                  color.blockClass
                                )}
                                style={color.blockStyle}
                              >
                                <span
                                  className={cn("h-2 w-2 rounded-full", color.solidClass)}
                                  style={color.solidStyle}
                                />
                                {subj?.name ?? "ไม่พบวิชา"}
                              </span>
                              <span className="font-semibold text-ink">{exam.title}</span>
                              <span className="rounded-full border border-line bg-paper px-2 py-0.5 font-mono text-xs text-ink-soft">
                                {days < 0
                                  ? `ผ่านไปแล้ว ${Math.abs(days)} วัน`
                                  : days === 0
                                    ? "สอบวันนี้"
                                    : `อีก ${days} วัน`}
                              </span>
                            </div>
                            <p className="flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                              <span>{formatThaiDate(exam.date)}</span>
                              {exam.time && (
                                <span className="inline-flex items-center gap-1 font-mono">
                                  <Clock className="h-3 w-3" /> {exam.time} น.
                                </span>
                              )}
                              <span>
                                ความพร้อมบทที่ออกสอบ: {readiness.done}/{readiness.total} บท (
                                {readiness.pct}%)
                              </span>
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2.5 text-xs"
                              onClick={() => setEditingExam(exam)}
                            >
                              <Pencil className="h-3.5 w-3.5" /> แก้ไข
                            </Button>
                            <button
                              type="button"
                              onClick={() => dispatch({ type: "deleteExam", id: exam.id })}
                              className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-slate-tint hover:text-slate-deep"
                              aria-label="ลบการสอบ"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modals */}
      {editingSubject && (
        <SubjectEditor
          subject={editingSubject === "new" ? null : editingSubject}
          onClose={() => setEditingSubject(null)}
          onSave={(name, color) => {
            dispatch({
              type: "saveSubject",
              id: editingSubject === "new" ? undefined : editingSubject.id,
              name,
              color,
            });
            setEditingSubject(null);
          }}
          onDelete={
            editingSubject === "new"
              ? undefined
              : () => {
                  dispatch({ type: "deleteSubject", id: editingSubject.id });
                  setEditingSubject(null);
                }
          }
        />
      )}

      {editingBlock && (
        <BlockEditor
          draft={editingBlock}
          isNew={!state.blocks.some((b) => b.id === editingBlock.id)}
          subjects={state.subjects}
          blocks={state.blocks}
          onClose={() => setEditingBlock(null)}
          onSave={(block) => {
            dispatch({ type: "saveBlock", block });
            setEditingBlock(null);
          }}
          onDelete={(id) => {
            dispatch({ type: "deleteBlock", id });
            setEditingBlock(null);
          }}
        />
      )}

      {editingExam && (
        <ExamEditor
          draft={editingExam}
          isNew={!state.exams.some((e) => e.id === editingExam.id)}
          subjects={state.subjects}
          onClose={() => setEditingExam(null)}
          onSave={(exam) => {
            dispatch({ type: "saveExam", exam });
            setEditingExam(null);
          }}
          onDelete={(id) => {
            dispatch({ type: "deleteExam", id });
            setEditingExam(null);
          }}
        />
      )}
    </>
  );
}

function KpiCard({
  label,
  value,
  sub,
  badge,
  toneClass,
}: {
  label: string;
  value: string;
  sub: string;
  badge: string;
  toneClass: string;
}) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-line-strong bg-sheet p-5 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.1)]">
      <div className="flex items-start justify-between gap-2">
        <dt className="text-xs font-medium text-ink-muted">{label}</dt>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold",
            toneClass
          )}
        >
          {badge}
        </span>
      </div>
      <dd className="mt-2 font-mono text-2xl font-bold text-ink sm:text-3xl">{value}</dd>
      <p className="mt-1.5 text-xs text-ink-soft">{sub}</p>
    </div>
  );
}

function DonutChart({
  segments,
  totalHours,
}: {
  segments: { id: string; label: string; value: number; hex: string }[];
  totalHours: number;
}) {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;

  return (
    <div className="relative mx-auto flex h-44 w-44 items-center justify-center">
      <svg viewBox="0 0 150 150" className="h-full w-full -rotate-90">
        <circle
          cx="75"
          cy="75"
          r={radius}
          fill="transparent"
          stroke="var(--color-paper-deep)"
          strokeWidth="18"
        />
        {totalHours > 0 &&
          segments.map((seg) => {
            if (seg.value <= 0) return null;
            const ratio = seg.value / totalHours;
            const dashLength = ratio * circumference;
            const dashOffset = -accumulated * circumference;
            accumulated += ratio;
            return (
              <circle
                key={seg.id}
                cx="75"
                cy="75"
                r={radius}
                fill="transparent"
                stroke={seg.hex}
                strokeWidth="18"
                strokeDasharray={`${dashLength} ${circumference}`}
                strokeDashoffset={dashOffset}
              />
            );
          })}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-mono text-2xl font-bold text-ink">{totalHours}</span>
        <span className="text-[11px] font-medium text-ink-muted">ชม./สัปดาห์</span>
      </div>
    </div>
  );
}

function DashboardSubjectCard({
  subject,
  onEditSubject,
}: {
  subject: Subject;
  onEditSubject: () => void;
}) {
  const { dispatch } = useStudyStore();
  const [newChapter, setNewChapter] = useState("");
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const color = getSubjectColor(subject.color);
  const { done, total, pct } = subjectProgress(subject);

  const commitChapterEdit = (chapterId: string) => {
    const trimmed = editingTitle.trim();
    if (trimmed) {
      dispatch({ type: "updateChapter", subjectId: subject.id, chapterId, title: trimmed });
    }
    setEditingChapterId(null);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-line-strong bg-sheet">
      <div className="h-1.5" style={{ backgroundColor: color.hex }} />
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {/* Direct 1-click custom color picker */}
          <label
            className="relative flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/60 shadow-xs ring-1 ring-line-strong transition-transform hover:scale-110"
            style={{ backgroundColor: color.hex }}
            title="คลิกเพื่อเปลี่ยนสีวิชานี้ทันที"
          >
            <input
              type="color"
              value={color.hex}
              onChange={(e) =>
                dispatch({
                  type: "saveSubject",
                  id: subject.id,
                  name: subject.name,
                  color: e.target.value,
                })
              }
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label={`เปลี่ยนสีวิชา ${subject.name}`}
            />
            <Palette className="h-3 w-3 text-white opacity-85" />
          </label>
          <div className="min-w-0">
            <h3 className="truncate font-display text-base font-bold text-ink">{subject.name}</h3>
            <p className="font-mono text-[11px] text-ink-muted">
              อ่านจบ {done}/{total} บท ({pct}%)
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs" onClick={onEditSubject}>
          <Pencil className="h-3.5 w-3.5" /> แก้ไขวิชา
        </Button>
      </div>

      {/* Chapters list */}
      <ul className="max-h-56 divide-y divide-line/60 overflow-y-auto">
        {subject.chapters.length === 0 ? (
          <li className="px-4 py-4 text-xs text-ink-muted">ยังไม่มีบทเรียนในวิชานี้</li>
        ) : (
          subject.chapters.map((c, idx) => (
            <li
              key={c.id}
              className="group flex items-center gap-2 px-4 py-2 text-xs hover:bg-paper"
            >
              {editingChapterId === c.id ? (
                <form
                  className="flex flex-1 items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    commitChapterEdit(c.id);
                  }}
                >
                  <input
                    className={cn(inputClass, "h-7 text-xs")}
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => commitChapterEdit(c.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setEditingChapterId(null);
                    }}
                    autoFocus
                  />
                </form>
              ) : (
                <>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={c.done}
                    onClick={() =>
                      dispatch({ type: "toggleChapter", subjectId: subject.id, chapterId: c.id })
                    }
                    className="flex flex-1 items-center gap-2.5 text-left"
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                        c.done ? "border-sage bg-sage text-sheet" : "border-line-strong bg-sheet"
                      )}
                    >
                      {c.done && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    <span className="font-mono text-[11px] text-ink-muted">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className={c.done ? "text-ink-muted line-through" : "text-ink"}>
                      {c.title}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingChapterId(c.id);
                      setEditingTitle(c.title);
                    }}
                    className="rounded p-1 text-ink-muted hover:bg-paper-deep hover:text-ink"
                    aria-label="แก้ไขชื่อบท"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      dispatch({ type: "deleteChapter", subjectId: subject.id, chapterId: c.id })
                    }
                    className="rounded p-1 text-ink-muted hover:bg-slate-tint hover:text-slate-deep"
                    aria-label="ลบบทเรียน"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </li>
          ))
        )}
      </ul>

      <form
        className="flex gap-2 border-t border-line bg-paper px-4 py-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = newChapter.trim();
          if (!trimmed) return;
          dispatch({ type: "addChapter", subjectId: subject.id, title: trimmed });
          setNewChapter("");
        }}
      >
        <input
          className={cn(inputClass, "h-8 text-xs")}
          placeholder="เพิ่มบทเรียนใหม่..."
          value={newChapter}
          onChange={(e) => setNewChapter(e.target.value)}
        />
        <Button type="submit" size="sm" variant="outline" className="h-8 px-2.5 text-xs" disabled={!newChapter.trim()}>
          <Plus className="h-3.5 w-3.5" /> เพิ่ม
        </Button>
      </form>
    </div>
  );
}

