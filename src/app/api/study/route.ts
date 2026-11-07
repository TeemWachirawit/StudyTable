import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isDatabaseConfigured } from "@/db";
import { getUserStudyState, saveUserStudyState } from "@/db/study-service";
import { FIRST_HOUR, LAST_HOUR } from "@/lib/study";
import type { StudyState } from "@/types/study";

function isValidStudyState(state: unknown): state is StudyState {
  if (!state || typeof state !== "object") return false;
  const s = state as Partial<StudyState>;
  if (!Array.isArray(s.subjects) || !Array.isArray(s.blocks) || !Array.isArray(s.exams)) {
    return false;
  }

  for (const subj of s.subjects) {
    if (
      !subj ||
      typeof subj.id !== "string" ||
      !subj.id ||
      typeof subj.name !== "string" ||
      !subj.name.trim() ||
      typeof subj.color !== "string" ||
      !Array.isArray(subj.chapters)
    ) {
      return false;
    }
    for (const ch of subj.chapters) {
      if (
        !ch ||
        typeof ch.id !== "string" ||
        !ch.id ||
        typeof ch.title !== "string" ||
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
      typeof b.subjectId !== "string" ||
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
      b.startHour + b.duration > LAST_HOUR
    ) {
      return false;
    }
  }

  for (const e of s.exams) {
    if (
      !e ||
      typeof e.id !== "string" ||
      !e.id ||
      typeof e.subjectId !== "string" ||
      typeof e.title !== "string" ||
      typeof e.date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(e.date)
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

