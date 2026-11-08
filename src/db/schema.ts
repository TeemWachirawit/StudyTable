import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  jsonb,
  primaryKey,
  foreignKey,
  index,
} from "drizzle-orm/pg-core";
import type { SubjectColor } from "@/lib/colors";

/**
 * Users & Authentication Tables (NextAuth / Auth.js + Credentials)
 */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
users.enableRLS();

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ]
);
accounts.enableRLS();

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});
sessions.enableRLS();

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);
verificationTokens.enableRLS();

/**
 * StudyTable Domain Tables (Subjects, Chapters, StudyBlocks, Exams)
 */
export const subjects = pgTable(
  "subjects",
  {
    id: text("id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color").$type<SubjectColor>().notNull(),
    position: integer("position").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.id] })]
).enableRLS();

export const chapters = pgTable(
  "chapters",
  {
    id: text("id").notNull(),
    subjectId: text("subject_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    done: boolean("done").default(false).notNull(),
    position: integer("position").default(0).notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.id] }),
    index("chapters_user_id_subject_id_idx").on(t.userId, t.subjectId),
    foreignKey({
      columns: [t.userId, t.subjectId],
      foreignColumns: [subjects.userId, subjects.id],
    }).onDelete("cascade"),
  ]
).enableRLS();

export const studyBlocks = pgTable(
  "study_blocks",
  {
    id: text("id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subjectId: text("subject_id").notNull(),
    day: integer("day").notNull(),
    startHour: integer("start_hour").notNull(),
    startMinute: integer("start_minute").default(0).notNull(),
    endHour: integer("end_hour"),
    endMinute: integer("end_minute").default(0).notNull(),
    duration: integer("duration").notNull(),
    topic: text("topic").default("").notNull(),
    type: text("type").default("study").notNull(),
    location: text("location").default("").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.id] }),
    index("study_blocks_user_id_subject_id_idx").on(t.userId, t.subjectId),
    foreignKey({
      columns: [t.userId, t.subjectId],
      foreignColumns: [subjects.userId, subjects.id],
    }).onDelete("cascade"),
  ]
).enableRLS();

export const exams = pgTable(
  "exams",
  {
    id: text("id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subjectId: text("subject_id").notNull(),
    title: text("title").notNull(),
    date: text("date").notNull(),
    time: text("time").default("").notNull(),
    chapterIds: jsonb("chapter_ids").$type<string[]>().default([]).notNull(),
    extraTopics: jsonb("extra_topics").$type<string[]>().default([]).notNull(),
    notes: text("notes").default("").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.id] }),
    index("exams_user_id_subject_id_idx").on(t.userId, t.subjectId),
    foreignKey({
      columns: [t.userId, t.subjectId],
      foreignColumns: [subjects.userId, subjects.id],
    }).onDelete("cascade"),
  ]
).enableRLS();

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type DbSubject = typeof subjects.$inferSelect;
export type DbChapter = typeof chapters.$inferSelect;
export type DbStudyBlock = typeof studyBlocks.$inferSelect;
export type DbExam = typeof exams.$inferSelect;
