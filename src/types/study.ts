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
  chapters: Chapter[];
}

/** A recurring weekly study slot shown in the Planner grid. */
export interface StudyBlock {
  id: string;
  subjectId: string;
  /** 0 = Monday … 6 = Sunday */
  day: number;
  /** Hour of day, e.g. 18 = 18:00 */
  startHour: number;
  /** Length in whole hours */
  duration: number;
  topic: string;
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

