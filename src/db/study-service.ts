import { asc, eq } from "drizzle-orm";
import { db } from "./index";
import { chapters, exams, studyBlocks, subjects } from "./schema";
import type { StudyState } from "@/types/study";

export async function getUserStudyState(userId: string): Promise<StudyState | null> {
  if (!db) return null;

  const [subjectRows, chapterRows, blockRows, examRows] = await Promise.all([
    db
      .select()
      .from(subjects)
      .where(eq(subjects.userId, userId))
      .orderBy(asc(subjects.position), asc(subjects.createdAt)),
    db
      .select()
      .from(chapters)
      .where(eq(chapters.userId, userId))
      .orderBy(asc(chapters.position)),
    db.select().from(studyBlocks).where(eq(studyBlocks.userId, userId)),
    db.select().from(exams).where(eq(exams.userId, userId)),
  ]);

  const chaptersBySubject = new Map<string, typeof chapterRows>();
  for (const ch of chapterRows) {
    const list = chaptersBySubject.get(ch.subjectId) ?? [];
    list.push(ch);
    chaptersBySubject.set(ch.subjectId, list);
  }

  return {
    subjects: subjectRows.map((s) => ({
      id: s.id,
      name: s.name,
      color: s.color,
      chapters: (chaptersBySubject.get(s.id) ?? []).map((c) => ({
        id: c.id,
        title: c.title,
        done: c.done,
      })),
    })),
    blocks: blockRows.map((b) => ({
      id: b.id,
      subjectId: b.subjectId,
      day: b.day,
      startHour: b.startHour,
      duration: b.duration,
      topic: b.topic,
    })),
    exams: examRows.map((e) => ({
      id: e.id,
      subjectId: e.subjectId,
      title: e.title,
      date: e.date,
      time: e.time,
      chapterIds: e.chapterIds ?? [],
      extraTopics: e.extraTopics ?? [],
      notes: e.notes,
    })),
  };
}

export async function saveUserStudyState(userId: string, state: StudyState): Promise<void> {
  if (!db) throw new Error("DATABASE_NOT_CONFIGURED");

  await db.transaction(async (tx) => {
    await tx.delete(exams).where(eq(exams.userId, userId));
    await tx.delete(studyBlocks).where(eq(studyBlocks.userId, userId));
    await tx.delete(chapters).where(eq(chapters.userId, userId));
    await tx.delete(subjects).where(eq(subjects.userId, userId));

    if (state.subjects.length > 0) {
      await tx.insert(subjects).values(
        state.subjects.map((s, idx) => ({
          id: s.id,
          userId,
          name: s.name,
          color: s.color,
          position: idx,
        }))
      );

      const allChapters = state.subjects.flatMap((s) =>
        s.chapters.map((c, idx) => ({
          id: c.id,
          subjectId: s.id,
          userId,
          title: c.title,
          done: Boolean(c.done),
          position: idx,
        }))
      );

      if (allChapters.length > 0) {
        await tx.insert(chapters).values(allChapters);
      }
    }

    if (state.blocks.length > 0) {
      await tx.insert(studyBlocks).values(
        state.blocks.map((b) => ({
          id: b.id,
          userId,
          subjectId: b.subjectId,
          day: b.day,
          startHour: b.startHour,
          duration: b.duration,
          topic: b.topic ?? "",
        }))
      );
    }

    if (state.exams.length > 0) {
      await tx.insert(exams).values(
        state.exams.map((e) => ({
          id: e.id,
          userId,
          subjectId: e.subjectId,
          title: e.title,
          date: e.date,
          time: e.time ?? "",
          chapterIds: Array.isArray(e.chapterIds) ? e.chapterIds : [],
          extraTopics: Array.isArray(e.extraTopics) ? e.extraTopics : [],
          notes: e.notes ?? "",
        }))
      );
    }
  });
}

