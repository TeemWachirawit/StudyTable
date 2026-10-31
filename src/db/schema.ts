import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subjects = pgTable("subjects", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  name: text("name").notNull(),
  teacherOrNote: text("teacher_or_note"),
  color: text("color").notNull().default("terracotta"),
  weeklyTargetHours: integer("weekly_target_hours").notNull().default(4),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const homeworks = pgTable("homeworks", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  subjectId: text("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: text("due_date").notNull(),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("todo"),
  estimatedMinutes: integer("estimated_minutes").notNull().default(60),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const homeworkSubtasks = pgTable("homework_subtasks", {
  id: text("id").primaryKey(),
  homeworkId: text("homework_id")
    .notNull()
    .references(() => homeworks.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const studyBlocks = pgTable("study_blocks", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  subjectId: text("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  sessionType: text("session_type").notNull().default("review"),
  completed: boolean("completed").notNull().default(false),
  notes: text("notes"),
  linkedHomeworkId: text("linked_homework_id").references(() => homeworks.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const exams = pgTable("exams", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  subjectId: text("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  examDate: text("exam_date").notNull(),
  roomOrFormat: text("room_or_format"),
  targetScore: text("target_score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const examTopics = pgTable("exam_topics", {
  id: text("id").primaryKey(),
  examId: text("exam_id")
    .notNull()
    .references(() => exams.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  chapterCode: text("chapter_code"),
  completed: boolean("completed").notNull().default(false),
});

