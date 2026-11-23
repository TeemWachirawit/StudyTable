import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/db";
import { users, verificationTokens } from "@/db/schema";
import { hashPassword, MAX_PASSWORD_LENGTH } from "@/lib/password";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rate = checkRateLimit(`reset-ip:${clientIp}`, 10, 15 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "ทำรายการถี่เกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง" },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
      );
    }

    if (!isDatabaseConfigured() || !db) {
      return NextResponse.json(
        { error: "ยังไม่ได้เชื่อมต่อฐานข้อมูล ไม่สามารถตั้งรหัสผ่านใหม่ได้ในขณะนี้" },
        { status: 503 }
      );
    }

    const body = (await request.json()) as {
      email?: string;
      token?: string;
      password?: string;
    };

    const email = (body.email ?? "").trim().toLowerCase();
    const rawToken = (body.token ?? "").trim();
    const password = body.password ?? "";

    if (!email || !rawToken) {
      return NextResponse.json(
        { error: "ลิงก์ตั้งรหัสผ่านใหม่ไม่ถูกต้องหรือข้อมูลไม่ครบถ้วน" },
        { status: 400 }
      );
    }

    if (password.length < 6 || password.length > MAX_PASSWORD_LENGTH) {
      return NextResponse.json(
        {
          error: `รหัสผ่านใหม่ต้องมีความยาวระหว่าง 6 ถึง ${MAX_PASSWORD_LENGTH} ตัวอักษร`,
        },
        { status: 400 }
      );
    }

    const identifier = `reset:${email}`;
    const tokenHash = hashToken(rawToken);

    const [record] = await db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, identifier),
          eq(verificationTokens.token, tokenHash)
        )
      )
      .limit(1);

    if (!record || record.expires.getTime() < Date.now()) {
      if (record) {
        await db
          .delete(verificationTokens)
          .where(
            and(
              eq(verificationTokens.identifier, identifier),
              eq(verificationTokens.token, tokenHash)
            )
          );
      }
      return NextResponse.json(
        { error: "ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว กรุณาขอลิงก์ใหม่อีกครั้ง" },
        { status: 400 }
      );
    }

    const newPasswordHash = await hashPassword(password);

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ passwordHash: newPasswordHash, updatedAt: new Date() })
        .where(eq(users.email, email));

      await tx
        .delete(verificationTokens)
        .where(eq(verificationTokens.identifier, identifier));
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/auth/reset-password]", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการตั้งรหัสผ่านใหม่ กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
