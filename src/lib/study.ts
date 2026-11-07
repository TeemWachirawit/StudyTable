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
  const end = candidate.startHour + candidate.duration;
  return blocks.find(
    (b) =>
      b.id !== candidate.id &&
      b.day === candidate.day &&
      b.startHour < end &&
      candidate.startHour < b.startHour + b.duration
  );
}

export function examReadiness(exam: Exam, subject: Subject | undefined): { done: number; total: number; pct: number } {
  if (!subject) return { done: 0, total: 0, pct: 0 };
  const chapters = subject.chapters.filter((c) => exam.chapterIds.includes(c.id));
  const done = chapters.filter((c) => c.done).length;
  return { done, total: chapters.length, pct: chapters.length === 0 ? 0 : Math.round((done / chapters.length) * 100) };
}

/** Starter data so first-time visitors see a filled-in desk. */
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
    chapters: [ch("ไฟฟ้าสถิต", true), ch("ไฟฟ้ากระแส", true), ch("แม่เหล็กและไฟฟ้า"), ch("คลื่นแม่เหล็กไฟฟ้า")],
  };
  const bio: Subject = {
    id: uid(),
    name: "ชีววิทยา",
    color: "sage",
    chapters: [ch("เซลล์", true), ch("พันธุศาสตร์", true), ch("วิวัฒนาการ")],
  };
  const english: Subject = {
    id: uid(),
    name: "ภาษาอังกฤษ",
    color: "mustard",
    chapters: [ch("Reading Comprehension", true), ch("Tenses"), ch("Conditionals"), ch("Vocabulary Unit 5")],
  };

  const block = (s: Subject, day: number, startHour: number, duration: number, topic: string): StudyBlock => ({
    id: uid(),
    subjectId: s.id,
    day,
    startHour,
    duration,
    topic,
  });

  return {
    subjects: [math, physics, bio, english],
    blocks: [
      block(math, 0, 17, 2, "ปริพันธ์"),
      block(english, 0, 20, 1, "Tenses"),
      block(physics, 1, 18, 2, "แม่เหล็กและไฟฟ้า"),
      block(bio, 2, 17, 1, "วิวัฒนาการ"),
      block(math, 2, 19, 2, "ลำดับและอนุกรม"),
      block(english, 3, 18, 1, "Conditionals"),
      block(bio, 3, 20, 2, "ทบทวนพันธุศาสตร์"),
      block(physics, 4, 17, 2, "ทำโจทย์ไฟฟ้า"),
      block(math, 5, 9, 3, "ติวข้อสอบเก่า"),
      block(physics, 6, 13, 2, "สรุปทั้งบท"),
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

