export type SubjectColorKey =
  | "terracotta"
  | "sage"
  | "ochre"
  | "indigo"
  | "plum"
  | "crimson";

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = จันทร์ (Mon) ... 6 = อาทิตย์ (Sun)

export type StudySessionType = "review" | "homework" | "exam-prep";

export type HomeworkPriority = "high" | "medium" | "low";

export type HomeworkStatus = "todo" | "in_progress" | "done";

export interface Subject {
  id: string;
  code: string;
  name: string;
  teacherOrNote?: string;
  color: SubjectColorKey;
  weeklyTargetHours: number;
}

export interface StudyBlock {
  id: string;
  subjectId: string;
  title: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "HH:mm" e.g. "17:00"
  endTime: string;   // "HH:mm" e.g. "19:00"
  sessionType: StudySessionType;
  completed: boolean;
  notes?: string;
  linkedHomeworkId?: string;
}

export interface HomeworkSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface HomeworkItem {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  dueDate: string; // ISO date "YYYY-MM-DD"
  priority: HomeworkPriority;
  status: HomeworkStatus;
  estimatedMinutes: number;
  subtasks: HomeworkSubtask[];
  scheduledBlockIds: string[];
}

export interface SyllabusTopic {
  id: string;
  title: string;
  chapterCode?: string;
  completed: boolean;
}

export interface ExamGoal {
  id: string;
  subjectId: string;
  title: string;
  examDate: string; // ISO date "YYYY-MM-DD"
  roomOrFormat?: string;
  targetScore?: string;
  topics: SyllabusTopic[];
}

export interface SubjectAnalytics {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  color: SubjectColorKey;
  weeklyTargetHours: number;
  plannedHours: number;
  completedHours: number;
  completionRate: number; // 0 - 100
  targetProgressRate: number; // 0 - 100 (completed vs weeklyTargetHours)
  pendingHomeworkCount: number;
}

export interface DailyLoadSummary {
  dayOfWeek: DayOfWeek;
  dayLabel: string;
  shortLabel: string;
  plannedHours: number;
  completedHours: number;
  sessionCount: number;
}

