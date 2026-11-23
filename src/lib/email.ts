export interface EmailSendResult {
  sent: boolean;
  provider: "resend" | "none";
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<EmailSendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim() || "StudyTable <onboarding@resend.dev>";

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[StudyTable] Password reset link for ${to}: ${resetUrl}`);
    } else {
      console.warn(
        "[StudyTable] RESEND_API_KEY is not configured; password reset email was not sent."
      );
    }
    return { sent: false, provider: "none" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "ตั้งรหัสผ่านใหม่ — StudyTable",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #0f172a;">
          <h2 style="margin: 0 0 12px; font-size: 20px;">ตั้งรหัสผ่านใหม่สำหรับ StudyTable</h2>
          <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #475569;">
            เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชี <strong>${to}</strong> กดปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่ (ลิงก์จะหมดอายุภายใน 30 นาที)
          </p>
          <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 20px; border-radius: 10px;">
            ตั้งรหัสผ่านใหม่
          </a>
          <p style="margin: 16px 0 0; font-size: 12px; color: #64748b; line-height: 1.5; word-break: break-all;">
            หรือคัดลอกลิงก์นี้ไปวางในเบราว์เซอร์:<br />
            <a href="${resetUrl}" style="color: #2563eb;">${resetUrl}</a>
          </p>
          <p style="margin: 16px 0 0; font-size: 12px; color: #64748b; line-height: 1.5;">
            หากคุณไม่ได้ส่งคำขอนี้ สามารถละเว้นอีเมลฉบับนี้ได้ รหัสผ่านเดิมของคุณจะยังคงปลอดภัย
          </p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("[sendPasswordResetEmail] Resend error:", res.status, errText);
    return { sent: false, provider: "resend" };
  }

  return { sent: true, provider: "resend" };
}
