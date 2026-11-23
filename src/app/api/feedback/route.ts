import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, isDatabaseConfigured } from "@/db";
import { feedbackReports } from "@/db/schema";
import { sendFeedbackNotificationEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const ALLOWED_TYPES = new Set(["bug", "feature", "general"] as const);
type FeedbackType = "bug" | "feature" | "general";

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rate = checkRateLimit(`feedback-ip:${clientIp}`, 5, 15 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "ส่งรายงานถี่เกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง" },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
      );
    }

    if (!isDatabaseConfigured() || !db) {
      return NextResponse.json(
        { error: "ยังไม่ได้เชื่อมต่อฐานข้อมูล ไม่สามารถส่งรายงานได้ในขณะนี้" },
        { status: 503 }
      );
    }

    const body = (await request.json()) as {
      type?: string;
      title?: string;
      description?: string;
      pagePath?: string;
      contactEmail?: string;
    };

    const type = (body.type ?? "").trim() as FeedbackType;
    const title = (body.title ?? "").trim();
    const description = (body.description ?? "").trim();
    const pagePath = (body.pagePath ?? "").trim().slice(0, 120);
    const contactEmail = (body.contactEmail ?? "").trim().toLowerCase();

    if (!ALLOWED_TYPES.has(type)) {
      return NextResponse.json(
        { error: "กรุณาเลือกประเภทของรายงานให้ถูกต้อง" },
        { status: 400 }
      );
    }

    if (title.length < 3 || title.length > 120) {
      return NextResponse.json(
        { error: "กรุณากรอกหัวข้อระหว่าง 3 ถึง 120 ตัวอักษร" },
        { status: 400 }
      );
    }

    if (description.length < 10 || description.length > 2000) {
      return NextResponse.json(
        { error: "กรุณากรอกรายละเอียดอย่างน้อย 10 ตัวอักษร (สูงสุด 2,000 ตัวอักษร)" },
        { status: 400 }
      );
    }

    if (
      contactEmail &&
      (contactEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail))
    ) {
      return NextResponse.json(
        { error: "รูปแบบอีเมลติดต่อกลับไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const session = await auth();
    const userId = session?.user?.id ?? null;
    const userAgent = (request.headers.get("user-agent") ?? "").slice(0, 300);

    const [created] = await db
      .insert(feedbackReports)
      .values({
        userId,
        type,
        title,
        description,
        pagePath,
        contactEmail: contactEmail || session?.user?.email || "",
        userAgent,
      })
      .returning({ id: feedbackReports.id });

    try {
      await sendFeedbackNotificationEmail({
        id: created.id,
        type,
        title,
        description,
        pagePath,
        contactEmail: contactEmail || session?.user?.email || "",
        userId,
      });
    } catch (notifyErr) {
      console.error("[POST /api/feedback] notification failed:", notifyErr);
    }

    return NextResponse.json(
      {
        ok: true,
        id: created.id,
        message: "ได้รับรายงานของคุณเรียบร้อยแล้ว ขอบคุณที่ช่วยพัฒนา StudyTable",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/feedback]", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการส่งรายงาน กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
