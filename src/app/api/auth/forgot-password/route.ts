import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/db";
import { users, verificationTokens } from "@/db/schema";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

function resolveAppOrigin(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "");
  if (configured && /^https?:\/\//i.test(configured)) {
    return configured;
  }
  const url = new URL(request.url);
  return url.origin;
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const ipRate = checkRateLimit(`forgot-ip:${clientIp}`, 10, 15 * 60 * 1000);
    if (!ipRate.allowed) {
      return NextResponse.json(
        { error: "ส่งคำขอถี่เกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง" },
        { status: 429, headers: { "Retry-After": String(ipRate.retryAfterSeconds) } }
      );
    }

    if (!isDatabaseConfigured() || !db) {
      return NextResponse.json(
        { error: "ยังไม่ได้เชื่อมต่อฐานข้อมูล ไม่สามารถรีเซ็ตรหัสผ่านได้ในขณะนี้" },
        { status: 503 }
      );
    }

    const body = (await request.json()) as { email?: string };
    const email = (body.email ?? "").trim().toLowerCase();

    if (
      !email ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { error: "กรุณากรอกอีเมลให้ถูกต้อง" },
        { status: 400 }
      );
    }

    const emailRate = checkRateLimit(`forgot-email:${email}`, 5, 15 * 60 * 1000);
    if (!emailRate.allowed) {
      return NextResponse.json(
        { error: "ส่งคำขอสำหรับอีเมลนี้ถี่เกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง" },
        { status: 429, headers: { "Retry-After": String(emailRate.retryAfterSeconds) } }
      );
    }

    const [user] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    let devResetUrl: string | undefined;

    if (user) {
      const identifier = `reset:${email}`;
      const rawToken = randomBytes(32).toString("hex");
      const tokenHash = hashToken(rawToken);
      const expires = new Date(Date.now() + RESET_TOKEN_TTL_MS);

      await db.transaction(async (tx) => {
        await tx
          .delete(verificationTokens)
          .where(eq(verificationTokens.identifier, identifier));
        await tx.insert(verificationTokens).values({
          identifier,
          token: tokenHash,
          expires,
        });
      });

      const origin = resolveAppOrigin(request);
      const resetUrl = `${origin}/reset-password?token=${encodeURIComponent(rawToken)}&email=${encodeURIComponent(email)}`;
      const emailResult = await sendPasswordResetEmail(email, resetUrl);

      if (!emailResult.sent && process.env.NODE_ENV !== "production") {
        devResetUrl = resetUrl;
      }
    }

    // Always return generic success message to prevent user enumeration
    return NextResponse.json({
      ok: true,
      message:
        "หากอีเมลนี้ลงทะเบียนไว้ในระบบ เราได้ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้แล้ว กรุณาตรวจสอบกล่องจดหมาย (และโฟลเดอร์สแปม)",
      ...(devResetUrl ? { devResetUrl } : {}),
    });
  } catch (err) {
    console.error("[POST /api/auth/forgot-password]", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการส่งคำขอ กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
