import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, isDatabaseConfigured } from "@/db";
import { users } from "@/db/schema";
import { isValidAvatarImage } from "@/lib/avatars";
import { hashPassword, MAX_PASSWORD_LENGTH, verifyPassword } from "@/lib/password";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured() || !db) {
    return NextResponse.json(
      { error: "DATABASE_NOT_CONFIGURED" },
      { status: 503 }
    );
  }

  try {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error("[GET /api/user/profile]", err);
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientIp = getClientIp(request);
  const rate = checkRateLimit(`profile:${userId}:${clientIp}`, 20, 15 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "ส่งคำขอถี่เกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
    );
  }

  if (!isDatabaseConfigured() || !db) {
    return NextResponse.json(
      { error: "DATABASE_NOT_CONFIGURED" },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as {
      name?: unknown;
      image?: unknown;
      currentPassword?: unknown;
      newPassword?: unknown;
    };

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updates: {
      name?: string;
      image?: string | null;
      passwordHash?: string;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    // 1. Validate & update Name
    if (body.name !== undefined) {
      if (typeof body.name !== "string" || !body.name.trim()) {
        return NextResponse.json(
          { error: "กรุณาระบุชื่อผู้ใช้" },
          { status: 400 }
        );
      }
      const trimmedName = body.name.trim();
      if (trimmedName.length > 60) {
        return NextResponse.json(
          { error: "ชื่อผู้ใช้ต้องมีความยาวไม่เกิน 60 ตัวอักษร" },
          { status: 400 }
        );
      }
      updates.name = trimmedName;
    }

    // 2. Validate & update Image
    if (body.image !== undefined) {
      if (body.image === null || body.image === "") {
        updates.image = null;
      } else if (typeof body.image === "string") {
        const trimmedImage = body.image.trim();
        if (trimmedImage.length > 500_000) {
          return NextResponse.json(
            { error: "ขนาดรูปภาพโปรไฟล์ต้องไม่เกิน 500 KB" },
            { status: 400 }
          );
        }
        if (!isValidAvatarImage(trimmedImage)) {
          return NextResponse.json(
            {
              error:
                "รูปแบบรูปภาพไม่ถูกต้อง รองรับเฉพาะอวาตาร์ในระบบ รูปภาพ JPG/PNG/WebP/GIF หรือลิงก์ http/https",
            },
            { status: 400 }
          );
        }
        updates.image = trimmedImage;
      } else {
        return NextResponse.json(
          { error: "ข้อมูลรูปภาพไม่ถูกต้อง" },
          { status: 400 }
        );
      }
    }

    // 3. Validate & update Password (optional)
    if (body.newPassword !== undefined && body.newPassword !== "") {
      if (
        typeof body.newPassword !== "string" ||
        body.newPassword.length < 6 ||
        body.newPassword.length > MAX_PASSWORD_LENGTH
      ) {
        return NextResponse.json(
          {
            error: `รหัสผ่านใหม่ต้องมีความยาวระหว่าง 6 ถึง ${MAX_PASSWORD_LENGTH} ตัวอักษร`,
          },
          { status: 400 }
        );
      }
      if (
        typeof body.currentPassword !== "string" ||
        !body.currentPassword ||
        body.currentPassword.length > MAX_PASSWORD_LENGTH
      ) {
        return NextResponse.json(
          { error: "กรุณากรอกรหัสผ่านปัจจุบันเพื่อยืนยันการเปลี่ยนรหัสผ่าน" },
          { status: 400 }
        );
      }

      if (!user.passwordHash) {
        return NextResponse.json(
          { error: "บัญชีนี้ไม่ได้ตั้งรหัสผ่านไว้" },
          { status: 400 }
        );
      }

      const isCurrentValid = await verifyPassword(
        body.currentPassword,
        user.passwordHash
      );
      if (!isCurrentValid) {
        return NextResponse.json(
          { error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" },
          { status: 400 }
        );
      }

      updates.passwordHash = await hashPassword(body.newPassword);
    }

    await db.update(users).set(updates).where(eq(users.id, userId));

    const updatedUser = {
      id: user.id,
      name: updates.name ?? user.name,
      email: user.email,
      image: updates.image !== undefined ? updates.image : user.image,
      createdAt: user.createdAt,
    };

    return NextResponse.json({ ok: true, user: updatedUser });
  } catch (err) {
    console.error("[PATCH /api/user/profile]", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการบันทึกข้อมูลโปรไฟล์" },
      { status: 500 }
    );
  }
}

