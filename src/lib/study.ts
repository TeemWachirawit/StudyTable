import type { Exam, StudyBlock, StudyState, Subject } from "@/types/study";

export const DAYS = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];
export const DAYS_SHORT = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."];

/** Planner grid covers 06:00 – 24:00 */
export const FIRST_HOUR = 6;
export const LAST_HOUR = 24;

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function formatHour(h: number): string {
  return `${String(h).padStart(2, "0")}:00`;
}

export function formatTime(h: number, m: number = 0): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function blockStartMinutes(b: StudyBlock): number {
  return b.startHour * 60 + (b.startMinute ?? 0);
}

export function blockEndMinutes(b: StudyBlock): number {
  if (b.endHour !== undefined && b.endHour !== null) {
    return b.endHour * 60 + (b.endMinute ?? 0);
  }
  return Math.round(blockStartMinutes(b) + b.duration * 60);
}

export function blockDurationMinutes(b: StudyBlock): number {
  return Math.max(1, blockEndMinutes(b) - blockStartMinutes(b));
}

export function formatBlockTime(b: StudyBlock): string {
  const startM = b.startMinute ?? 0;
  const endTotal = blockEndMinutes(b);
  const endH = Math.floor(endTotal / 60);
  const endM = endTotal % 60;
  return `${formatTime(b.startHour, startM)}–${formatTime(endH, endM)}`;
}

export function formatDuration(durationMinutes: number): string {
  const hours = Math.floor(durationMinutes / 60);
  const mins = durationMinutes % 60;
  if (hours > 0 && mins > 0) return `${hours} ชม. ${mins} นาที`;
  if (hours > 0) return `${hours} ชม.`;
  return `${mins} นาที`;
}

export function formatStudySeconds(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  if (safe === 0) return "0 นาที";
  if (safe < 60) return `${safe} วินาที`;
  const totalMinutes = Math.floor(safe / 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours > 0 && mins > 0) return `${hours} ชม. ${mins} นาที`;
  if (hours > 0) return `${hours} ชม.`;
  return `${mins} นาที`;
}

export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  const mm = String(mins).padStart(2, "0");
  const ss = String(secs).padStart(2, "0");
  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

/** Monday-based weekday index (0 = Monday) for a Date. */
export function weekdayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Whole days from today until the given YYYY-MM-DD (negative if past). */
export function daysUntil(isoDate: string, today: Date = new Date()): number {
  const target = new Date(`${isoDate}T00:00:00`);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target.getTime() - start.getTime()) / 86_400_000);
}

export function formatThaiDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("th-TH", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function subjectProgress(subject: Subject): { done: number; total: number; pct: number } {
  const total = subject.chapters.length;
  const done = subject.chapters.filter((c) => c.done).length;
  return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
}

/** Returns the first block that overlaps `candidate` on the same day, ignoring itself. */
export function findConflict(blocks: StudyBlock[], candidate: StudyBlock): StudyBlock | undefined {
  const candStart = blockStartMinutes(candidate);
  const candEnd = blockEndMinutes(candidate);
  return blocks.find(
    (b) =>
      b.id !== candidate.id &&
      b.day === candidate.day &&
      blockStartMinutes(b) < candEnd &&
      candStart < blockEndMinutes(b)
  );
}

export function examReadiness(exam: Exam, subject: Subject | undefined): { done: number; total: number; pct: number } {
  if (!subject) return { done: 0, total: 0, pct: 0 };
  const chapters = subject.chapters.filter((c) => exam.chapterIds.includes(c.id));
  const done = chapters.filter((c) => c.done).length;
  return { done, total: chapters.length, pct: chapters.length === 0 ? 0 : Math.round((done / chapters.length) * 100) };
}

export function isClassBlock(b: StudyBlock): boolean {
  return b.type === "class";
}

export function isStudyBlock(b: StudyBlock): boolean {
  return b.type !== "class";
}

export interface TodayTodoItem {
  /** Unique render key */
  key: string;
  /** "planner" = auto-pulled from today's study blocks; "custom" = user-added daily task */
  source: "planner" | "custom";
  /** For custom todos: DailyTodo.id; for planner blocks: StudyBlock.id */
  id: string;
  subjectId: string;
  title: string;
  done: boolean;
  /** Optional formatted time range for planner blocks (e.g. "18:00–20:00") */
  timeLabel?: string;
}

/**
 * Builds Today's Study To-Do list by combining:
 * 1. Today's planned self-study blocks (auto-synced from Planner, completion tracked per date via sourceBlockId)
 * 2. Custom daily to-do items created for today's date
 */
export function getTodayTodoItems(
  state: StudyState,
  today: Date = new Date()
): { items: TodayTodoItem[]; done: number; total: number; pct: number } {
  const todayISO = toISODate(today);
  const todayIdx = weekdayIndex(today);
  const todos = state.todos ?? [];

  const subjectNameById = new Map(state.subjects.map((s) => [s.id, s.name]));

  const blockDoneMap = new Map<string, boolean>();
  for (const t of todos) {
    if (t.date === todayISO && t.sourceBlockId) {
      blockDoneMap.set(t.sourceBlockId, t.done);
    }
  }

  const plannerItems: TodayTodoItem[] = state.blocks
    .filter((b) => b.day === todayIdx && isStudyBlock(b))
    .sort((a, b) => blockStartMinutes(a) - blockStartMinutes(b))
    .map((b) => ({
      key: `block:${b.id}`,
      source: "planner" as const,
      id: b.id,
      subjectId: b.subjectId,
      title: b.topic.trim() || `อ่าน ${subjectNameById.get(b.subjectId) ?? "วิชาตามตาราง"}`,
      done: blockDoneMap.get(b.id) ?? false,
      timeLabel: formatBlockTime(b),
    }));

  const customItems: TodayTodoItem[] = todos
    .filter((t) => t.date === todayISO && !t.sourceBlockId)
    .map((t) => ({
      key: `todo:${t.id}`,
      source: "custom" as const,
      id: t.id,
      subjectId: t.subjectId,
      title: t.title,
      done: t.done,
    }));

  const items = [...plannerItems, ...customItems];
  const total = items.length;
  const done = items.filter((i) => i.done).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return { items, done, total, pct };
}

/**
 * Returns a new subject array with `pinnedSubjectId` moved to index 0,
 * preserving the original order of all other subjects.
 */
export function orderSubjectsWithPinned(
  subjects: Subject[],
  pinnedSubjectId: string | null | undefined
): Subject[] {
  if (!pinnedSubjectId) return subjects;
  const idx = subjects.findIndex((s) => s.id === pinnedSubjectId);
  if (idx <= 0) return subjects;
  return [subjects[idx], ...subjects.slice(0, idx), ...subjects.slice(idx + 1)];
}

/** Starter data so first-time visitors see a filled-in desk with classes and study slots. */
export function createSeedState(today: Date = new Date()): StudyState {
  const ch = (title: string, done = false) => ({ id: uid(), title, done });
  const inDays = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return toISODate(d);
  };

  const math: Subject = {
    id: uid(),
    name: "คณิตศาสตร์",
    color: "terracotta",
    emoji: "📐",
    chapters: [
      ch("ลิมิตและความต่อเนื่อง", true),
      ch("อนุพันธ์", true),
      ch("การประยุกต์อนุพันธ์", true),
      ch("ปริพันธ์"),
      ch("ลำดับและอนุกรม"),
    ],
  };
  const physics: Subject = {
    id: uid(),
    name: "ฟิสิกส์",
    color: "slate",
    emoji: "⚡",
    chapters: [ch("ไฟฟ้าสถิต", true), ch("ไฟฟ้ากระแส", true), ch("แม่เหล็กและไฟฟ้า"), ch("คลื่นแม่เหล็กไฟฟ้า")],
  };
  const bio: Subject = {
    id: uid(),
    name: "ชีววิทยา",
    color: "sage",
    emoji: "🧬",
    chapters: [ch("เซลล์", true), ch("พันธุศาสตร์", true), ch("วิวัฒนาการ")],
  };
  const english: Subject = {
    id: uid(),
    name: "ภาษาอังกฤษ",
    color: "mustard",
    emoji: "🇬🇧",
    chapters: [ch("Reading Comprehension", true), ch("Tenses"), ch("Conditionals"), ch("Vocabulary Unit 5")],
  };

  const classBlock = (s: Subject, day: number, startHour: number, duration: number, topic: string, location: string): StudyBlock => ({
    id: uid(),
    subjectId: s.id,
    day,
    startHour,
    duration,
    topic,
    type: "class",
    location,
  });

  const studyBlock = (s: Subject, day: number, startHour: number, duration: number, topic: string): StudyBlock => ({
    id: uid(),
    subjectId: s.id,
    day,
    startHour,
    duration,
    topic,
    type: "study",
  });

  return {
    subjects: [math, physics, bio, english],
    blocks: [
      // 🎓 ตารางเรียน (Classes in daytime)
      classBlock(math, 0, 9, 3, "บรรยาย: แคลคูลัสและปริพันธ์", "ห้อง SC-302"),
      classBlock(english, 1, 10, 2, "English for Academic Purposes", "อาคาร 4 ห้อง 401"),
      classBlock(physics, 2, 13, 3, "ฟิสิกส์แม่เหล็กไฟฟ้า & Lab", "ตึกฟิสิกส์ Lab 2"),
      classBlock(bio, 3, 9, 2, "ชีววิทยาเซลล์และพันธุศาสตร์", "ห้องชีวะ 205"),
      classBlock(math, 4, 13, 2, "แบบฝึกหัดคณิตศาสตร์", "ห้อง SC-101"),

      // 📖 ตารางอ่านหนังสือ (Study sessions after classes & weekend)
      studyBlock(math, 0, 18, 2, "ปริพันธ์ (ทบทวนหลังเรียน)"),
      studyBlock(english, 1, 19, 1, "Tenses & Vocabulary"),
      studyBlock(physics, 2, 18, 2, "แม่เหล็กและไฟฟ้า"),
      studyBlock(bio, 3, 17, 2, "ทบทวนพันธุศาสตร์"),
      studyBlock(physics, 4, 17, 2, "ทำโจทย์ไฟฟ้า"),
      studyBlock(math, 5, 9, 3, "ติวข้อสอบเก่าแคลคูลัส"),
      studyBlock(bio, 6, 13, 2, "สรุปเนื้อหาวิวัฒนาการ"),
    ],
    exams: [
      {
        id: uid(),
        subjectId: physics.id,
        title: "สอบกลางภาค",
        date: inDays(4),
        time: "09:00",
        chapterIds: physics.chapters.slice(0, 3).map((c) => c.id),
        extraTopics: [],
        notes: "อนุญาตให้ใช้เครื่องคิดเลข",
      },
      {
        id: uid(),
        subjectId: math.id,
        title: "สอบกลางภาค",
        date: inDays(11),
        time: "13:00",
        chapterIds: math.chapters.slice(1, 4).map((c) => c.id),
        extraTopics: [],
        notes: "",
      },
      {
        id: uid(),
        subjectId: english.id,
        title: "Quiz 2",
        date: inDays(16),
        time: "",
        chapterIds: english.chapters.slice(1, 3).map((c) => c.id),
        extraTopics: ["Writing: Opinion paragraph"],
        notes: "",
      },
    ],
  };
}

