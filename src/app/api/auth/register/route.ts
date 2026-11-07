import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/db";
import { users } from "@/db/schema";
import { saveUserStudyState } from "@/db/study-service";
import { hashPassword, MAX_PASSWORD_LENGTH } from "@/lib/password";
import { createSeedState } from "@/lib/study";

export async function POST(request: Request) {
  try {
    if (!isDatabaseConfigured() || !db) {
      return NextResponse.json(
        {
          error:
            "ยังไม่ได้ตั้งค่าการเชื่อมต่อฐานข้อมูล (DATABASE_URL) กรุณาใส่ค่า DATABASE_URL ในไฟล์ .env.local แล้วรัน npm run db:push",
        },
        { status: 503 }
      );
    }

    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    const name = (body.name ?? "").trim();
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";

    if (!name || name.length > 100) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อผู้ใช้งาน (ไม่เกิน 100 ตัวอักษร)" },
        { status: 400 }
      );
    }

    if (
      !email ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { error: "รูปแบบอีเมลไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    if (password.length < 6 || password.length > MAX_PASSWORD_LENGTH) {
      return NextResponse.json(
        {
          error: `รหัสผ่านต้องมีความยาวระหว่าง 6 ถึง ${MAX_PASSWORD_LENGTH} ตัวอักษร`,
        },
        { status: 400 }
      );
    }

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบหรือใช้อีเมลอื่น" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const [createdUser] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
      });

    // Seed starter StudyState for the new user; roll back user if seeding fails
    const starterState = createSeedState();
    try {
      await saveUserStudyState(createdUser.id, starterState);
    } catch (seedErr) {
      await db.delete(users).where(eq(users.id, createdUser.id));
      throw seedErr;
    }

    return NextResponse.json(
      { user: createdUser },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    const message = err instanceof Error ? err.message : "";
    if (
      message.includes("ECONNREFUSED") ||
      message.includes("connect") ||
      message.includes("relation")
    ) {
      return NextResponse.json(
        {
          error:
            "ไม่สามารถเชื่อมต่อฐานข้อมูล หรือยังไม่ได้สร้างตารางในฐานข้อมูล กรุณาตรวจสอบ DATABASE_URL ใน .env.local และรันคำสั่ง npm run db:push",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างบัญชี กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}

