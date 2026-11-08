import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isDatabaseConfigured } from "@/db";
import { getUserStudyState, saveUserStudyState } from "@/db/study-service";
import { FIRST_HOUR, LAST_HOUR } from "@/lib/study";
import type { StudyState } from "@/types/study";

const MAX_SUBJECTS = 100;
const MAX_CHAPTERS_PER_SUBJECT = 300;
const MAX_BLOCKS = 500;
const MAX_EXAMS = 200;

function isValidStudyState(state: unknown): state is StudyState {
  if (!state || typeof state !== "object") return false;
  const s = state as Partial<StudyState>;
  if (
    !Array.isArray(s.subjects) ||
    !Array.isArray(s.blocks) ||
    !Array.isArray(s.exams) ||
    s.subjects.length > MAX_SUBJECTS ||
    s.blocks.length > MAX_BLOCKS ||
    s.exams.length > MAX_EXAMS
  ) {
    return false;
  }

  const subjectIds = new Set<string>();

  for (const subj of s.subjects) {
    if (
      !subj ||
      typeof subj.id !== "string" ||
      !subj.id ||
      subj.id.length > 100 ||
      subjectIds.has(subj.id) ||
      typeof subj.name !== "string" ||
      !subj.name.trim() ||
      subj.name.length > 120 ||
      typeof subj.color !== "string" ||
      !subj.color ||
      subj.color.length > 64 ||
      !Array.isArray(subj.chapters) ||
      subj.chapters.length > MAX_CHAPTERS_PER_SUBJECT
    ) {
      return false;
    }
    subjectIds.add(subj.id);

    for (const ch of subj.chapters) {
      if (
        !ch ||
        typeof ch.id !== "string" ||
        !ch.id ||
        ch.id.length > 100 ||
        typeof ch.title !== "string" ||
        !ch.title.trim() ||
        ch.title.length > 200 ||
        typeof ch.done !== "boolean"
      ) {
        return false;
      }
    }
  }

  for (const b of s.blocks) {
    if (
      !b ||
      typeof b.id !== "string" ||
      !b.id ||
      b.id.length > 100 ||
      typeof b.subjectId !== "string" ||
      !subjectIds.has(b.subjectId) ||
      typeof b.day !== "number" ||
      !Number.isInteger(b.day) ||
      b.day < 0 ||
      b.day > 6 ||
      typeof b.startHour !== "number" ||
      !Number.isInteger(b.startHour) ||
      b.startHour < FIRST_HOUR ||
      b.startHour >= LAST_HOUR ||
      typeof b.duration !== "number" ||
      !Number.isInteger(b.duration) ||
      b.duration < 1 ||
      b.startHour + b.duration > LAST_HOUR ||
      (b.topic !== undefined && (typeof b.topic !== "string" || b.topic.length > 200)) ||
      (b.type !== undefined && b.type !== "study" && b.type !== "class") ||
      (b.location !== undefined && (typeof b.location !== "string" || b.location.length > 200))
    ) {
      return false;
    }
  }

  for (const e of s.exams) {
    if (
      !e ||
      typeof e.id !== "string" ||
      !e.id ||
      e.id.length > 100 ||
      typeof e.subjectId !== "string" ||
      !subjectIds.has(e.subjectId) ||
      typeof e.title !== "string" ||
      !e.title.trim() ||
      e.title.length > 200 ||
      typeof e.date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(e.date) ||
      (e.time !== undefined && (typeof e.time !== "string" || e.time.length > 20)) ||
      (e.notes !== undefined && (typeof e.notes !== "string" || e.notes.length > 2000)) ||
      (e.chapterIds !== undefined &&
        (!Array.isArray(e.chapterIds) ||
          e.chapterIds.length > MAX_CHAPTERS_PER_SUBJECT ||
          e.chapterIds.some((id) => typeof id !== "string" || id.length > 100))) ||
      (e.extraTopics !== undefined &&
        (!Array.isArray(e.extraTopics) ||
          e.extraTopics.length > 100 ||
          e.extraTopics.some((t) => typeof t !== "string" || t.length > 200)))
    ) {
      return false;
    }
  }

  return true;
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "DATABASE_NOT_CONFIGURED" },
      { status: 503 }
    );
  }

  try {
    const state = await getUserStudyState(userId);
    return NextResponse.json({ state });
  } catch (err) {
    console.error("[GET /api/study]", err);
    return NextResponse.json(
      { error: "Failed to load study state from database" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "DATABASE_NOT_CONFIGURED" },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as { state?: unknown };
    if (!isValidStudyState(body.state)) {
      return NextResponse.json({ error: "Invalid study state payload" }, { status: 400 });
    }

    await saveUserStudyState(userId, body.state);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PUT /api/study]", err);
    return NextResponse.json(
      { error: "Failed to save study state to database" },
      { status: 500 }
    );
  }
}

