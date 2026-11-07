import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isDatabaseConfigured } from "@/db";
import { getUserStudyState, saveUserStudyState } from "@/db/study-service";
import type { StudyState } from "@/types/study";

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
    const body = (await request.json()) as { state?: StudyState };
    if (
      !body.state ||
      !Array.isArray(body.state.subjects) ||
      !Array.isArray(body.state.blocks) ||
      !Array.isArray(body.state.exams)
    ) {
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

