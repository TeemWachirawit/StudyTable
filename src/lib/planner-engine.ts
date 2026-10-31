import {
  DayOfWeek,
  DailyLoadSummary,
  ExamGoal,
  HomeworkItem,
  StudyBlock,
  Subject,
  SubjectAnalytics,
} from "@/types/study";

export const THAI_DAYS: {
  dayOfWeek: DayOfWeek;
  label: string;
  shortLabel: string;
}[] = [
  { dayOfWeek: 0, label: "วันจันทร์", shortLabel: "จ." },
  { dayOfWeek: 1, label: "วันอังคาร", shortLabel: "อ." },
  { dayOfWeek: 2, label: "วันพุธ", shortLabel: "พ." },
  { dayOfWeek: 3, label: "วันพฤหัสบดี", shortLabel: "พฤ." },
  { dayOfWeek: 4, label: "วันศุกร์", shortLabel: "ศ." },
  { dayOfWeek: 5, label: "วันเสาร์", shortLabel: "ส." },
  { dayOfWeek: 6, label: "วันอาทิตย์", shortLabel: "อา." },
];

export function parseTimeToMinutes(timeStr: string): number {
  const [hoursStr, minutesStr] = timeStr.split(":");
  const hours = Number(hoursStr) || 0;
  const minutes = Number(minutesStr) || 0;
  return hours * 60 + minutes;
}

export function minutesToTimeString(totalMinutes: number): string {
  const clamped = Math.max(0, Math.min(23 * 60 + 59, totalMinutes));
  const hours = Math.floor(clamped / 60);
  const mins = clamped % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function getBlockDurationMinutes(
  block: Pick<StudyBlock, "startTime" | "endTime">
): number {
  const start = parseTimeToMinutes(block.startTime);
  const end = parseTimeToMinutes(block.endTime);
  return Math.max(0, end - start);
}

export function formatMinutesAsReadable(minutes: number): string {
  if (minutes <= 0) return "0 นาที";
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs} ชม. ${mins} นาที`;
  if (hrs > 0) return `${hrs} ชม.`;
  return `${mins} นาที`;
}

export function findConflictingBlocks(
  existingBlocks: StudyBlock[],
  candidate: {
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
  },
  ignoreBlockId?: string
): StudyBlock[] {
  const candStart = parseTimeToMinutes(candidate.startTime);
  const candEnd = parseTimeToMinutes(candidate.endTime);

  if (candEnd <= candStart) return [];

  return existingBlocks.filter((block) => {
    if (ignoreBlockId && block.id === ignoreBlockId) return false;
    if (block.dayOfWeek !== candidate.dayOfWeek) return false;

    const blockStart = parseTimeToMinutes(block.startTime);
    const blockEnd = parseTimeToMinutes(block.endTime);

    return candStart < blockEnd && candEnd > blockStart;
  });
}

export function createStudyBlockFromHomework(
  homework: HomeworkItem,
  slot: {
    dayOfWeek: DayOfWeek;
    startTime: string;
    durationMinutes?: number;
    notes?: string;
  }
): StudyBlock {
  const duration = slot.durationMinutes || homework.estimatedMinutes || 60;
  const startMins = parseTimeToMinutes(slot.startTime);
  const endTime = minutesToTimeString(startMins + duration);

  return {
    id: `blk-hw-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    subjectId: homework.subjectId,
    title: `ทำการบ้าน: ${homework.title}`,
    dayOfWeek: slot.dayOfWeek,
    startTime: slot.startTime,
    endTime,
    sessionType: "homework",
    completed: homework.status === "done",
    notes: slot.notes || homework.description || "ดึงมาจากรายการการบ้าน",
    linkedHomeworkId: homework.id,
  };
}

export function calculateHomeworkProgress(homework: HomeworkItem): {
  completedCount: number;
  totalCount: number;
  percentage: number;
} {
  const totalCount = homework.subtasks.length;
  if (totalCount === 0) {
    const pct =
      homework.status === "done"
        ? 100
        : homework.status === "in_progress"
        ? 50
        : 0;
    return {
      completedCount: homework.status === "done" ? 1 : 0,
      totalCount: 0,
      percentage: pct,
    };
  }

  const completedCount = homework.subtasks.filter((s) => s.completed).length;
  const percentage = Math.round((completedCount / totalCount) * 100);
  return { completedCount, totalCount, percentage };
}

function parseIsoDateUtc(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return Date.UTC(y, (m || 1) - 1, d || 1);
}

export function getTodayIsoString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getDueUrgency(
  dueDateStr: string,
  isCompleted: boolean,
  referenceDateStr: string = getTodayIsoString()
): {
  daysDiff: number;
  level: "completed" | "overdue" | "today" | "soon" | "normal";
  label: string;
} {
  const dueMs = parseIsoDateUtc(dueDateStr);
  const refMs = parseIsoDateUtc(referenceDateStr);
  const daysDiff = Math.round((dueMs - refMs) / (1000 * 60 * 60 * 24));

  if (isCompleted) {
    return { daysDiff, level: "completed", label: "ส่งแล้ว / เสร็จสิ้น" };
  }

  if (daysDiff < 0) {
    return {
      daysDiff,
      level: "overdue",
      label: `เลยกำหนด ${Math.abs(daysDiff)} วัน`,
    };
  }
  if (daysDiff === 0) {
    return { daysDiff: 0, level: "today", label: "ส่งวันนี้" };
  }
  if (daysDiff === 1) {
    return { daysDiff: 1, level: "soon", label: "พรุ่งนี้" };
  }
  if (daysDiff <= 3) {
    return { daysDiff, level: "soon", label: `อีก ${daysDiff} วัน` };
  }
  return { daysDiff, level: "normal", label: `อีก ${daysDiff} วัน` };
}

export function getExamReadiness(
  exam: ExamGoal,
  referenceDateStr: string = getTodayIsoString()
): {
  daysRemaining: number;
  completedTopics: number;
  totalTopics: number;
  readinessPercent: number;
  urgencyLevel: "past" | "critical" | "approaching" | "steady";
} {
  const examMs = parseIsoDateUtc(exam.examDate);
  const refMs = parseIsoDateUtc(referenceDateStr);
  const daysRemaining = Math.round((examMs - refMs) / (1000 * 60 * 60 * 24));

  const totalTopics = exam.topics.length;
  const completedTopics = exam.topics.filter((t) => t.completed).length;
  const readinessPercent =
    totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

  let urgencyLevel: "past" | "critical" | "approaching" | "steady" = "steady";
  if (daysRemaining < 0) urgencyLevel = "past";
  else if (daysRemaining <= 5) urgencyLevel = "critical";
  else if (daysRemaining <= 14) urgencyLevel = "approaching";

  return {
    daysRemaining,
    completedTopics,
    totalTopics,
    readinessPercent,
    urgencyLevel,
  };
}

export function calculateSubjectAnalytics(
  subjects: Subject[],
  blocks: StudyBlock[],
  homeworks: HomeworkItem[]
): SubjectAnalytics[] {
  return subjects.map((subject) => {
    const subjectBlocks = blocks.filter((b) => b.subjectId === subject.id);
    const plannedMinutes = subjectBlocks.reduce(
      (sum, b) => sum + getBlockDurationMinutes(b),
      0
    );
    const completedMinutes = subjectBlocks
      .filter((b) => b.completed)
      .reduce((sum, b) => sum + getBlockDurationMinutes(b), 0);

    const plannedHours = Number((plannedMinutes / 60).toFixed(1));
    const completedHours = Number((completedMinutes / 60).toFixed(1));

    const completionRate =
      plannedMinutes === 0
        ? 0
        : Math.round((completedMinutes / plannedMinutes) * 100);

    const targetMinutes = subject.weeklyTargetHours * 60;
    const targetProgressRate =
      targetMinutes === 0
        ? 0
        : Math.min(100, Math.round((completedMinutes / targetMinutes) * 100));

    const pendingHomeworkCount = homeworks.filter(
      (hw) => hw.subjectId === subject.id && hw.status !== "done"
    ).length;

    return {
      subjectId: subject.id,
      subjectName: subject.name,
      subjectCode: subject.code,
      color: subject.color,
      weeklyTargetHours: subject.weeklyTargetHours,
      plannedHours,
      completedHours,
      completionRate,
      targetProgressRate,
      pendingHomeworkCount,
    };
  });
}

export function calculateDailyStudyLoad(
  blocks: StudyBlock[]
): DailyLoadSummary[] {
  return THAI_DAYS.map((day) => {
    const dayBlocks = blocks.filter((b) => b.dayOfWeek === day.dayOfWeek);
    const plannedMins = dayBlocks.reduce(
      (acc, b) => acc + getBlockDurationMinutes(b),
      0
    );
    const completedMins = dayBlocks
      .filter((b) => b.completed)
      .reduce((acc, b) => acc + getBlockDurationMinutes(b), 0);

    return {
      dayOfWeek: day.dayOfWeek,
      dayLabel: day.label,
      shortLabel: day.shortLabel,
      plannedHours: Number((plannedMins / 60).toFixed(1)),
      completedHours: Number((completedMins / 60).toFixed(1)),
      sessionCount: dayBlocks.length,
    };
  });
}

