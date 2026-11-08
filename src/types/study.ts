import type { SubjectColor } from "@/lib/colors";

export interface Chapter {
  id: string;
  title: string;
  done: boolean;
}

export interface Subject {
  id: string;
  name: string;
  color: SubjectColor;
  emoji?: string;
  chapters: Chapter[];
}

export type BlockType = "study" | "class";

/** A recurring weekly slot shown in the Planner grid: class schedule or self-study. */
export interface StudyBlock {
  id: string;
  subjectId: string;
  /** 0 = Monday … 6 = Sunday */
  day: number;
  /** Hour of day, e.g. 18 = 18:00 */
  startHour: number;
  /** Minute of start, e.g. 0, 15, 30, 45 (default 0) */
  startMinute?: number;
  /** End hour, e.g. 20 (optional, defaults to startHour + duration) */
  endHour?: number;
  /** End minute, e.g. 30 (default 0) */
  endMinute?: number;
  /** Length in hours (can be fractional, e.g. 1.5) */
  duration: number;
  topic: string;
  /** "class" = ตารางเรียน (lecture/lab), "study" = ตารางอ่านหนังสือ (self-study/revision) */
  type?: BlockType;
  /** Classroom / building / link for classes, e.g. "SC-204", "Online" */
  location?: string;
}

export interface Exam {
  id: string;
  subjectId: string;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm, optional */
  time: string;
  /** Chapters of the subject that are covered by this exam */
  chapterIds: string[];
  /** Free-text topics that aren't tracked as chapters */
  extraTopics: string[];
  notes: string;
}

export interface StudyState {
  subjects: Subject[];
  blocks: StudyBlock[];
  exams: Exam[];
}

