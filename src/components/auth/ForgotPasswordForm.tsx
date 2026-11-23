"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = (await res.json()) as {
        message?: string;
        error?: string;
        devResetUrl?: string;
      };

      if (!res.ok) {
        setError(data.error || "ไม่สามารถส่งคำขอได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง");
        setLoading(false);
        return;
      }

      setSubmittedMessage(
        data.message ||
          "หากอีเมลนี้ลงทะเบียนไว้ในระบบ เราได้ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้แล้ว"
      );
      setDevResetUrl(data.devResetUrl ?? null);
      setLoading(false);
    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line-strong bg-sheet p-6 shadow-xs sm:p-8">
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-mustard/30 bg-mustard-tint px-3 py-1 font-mono text-xs font-semibold text-mustard-deep">
          <span className="h-1.5 w-1.5 rounded-full bg-mustard" />
          FORGOT PASSWORD
        </span>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink sm:text-3xl">
          ลืมรหัสผ่าน?
        </h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          กรอกอีเมลที่ใช้สมัครสมาชิก เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้คุณ (ใช้ได้ภายใน 30 นาที)
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-xl border border-slate/30 bg-slate-tint px-3.5 py-3 text-sm text-slate-deep"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate" />
          <span>{error}</span>
        </div>
      )}

      {submittedMessage ? (
        <div className="space-y-4">
          <div
            role="status"
            className="flex items-start gap-2.5 rounded-xl border border-sage/35 bg-sage-tint px-4 py-3.5 text-sm text-sage-deep"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
            <div className="space-y-1">
              <p className="font-semibold text-ink">ส่งคำขอเรียบร้อยแล้ว</p>
              <p className="leading-relaxed">{submittedMessage}</p>
            </div>
          </div>

          {devResetUrl && (
            <div className="rounded-xl border border-mustard/35 bg-mustard-tint/60 p-3.5 text-xs text-mustard-deep">
              <p className="font-semibold">โหมดพัฒนา (ยังไม่ได้ตั้งค่า RESEND_API_KEY):</p>
              <Link
                href={devResetUrl}
                className="mt-1 block break-all font-mono underline hover:text-ink"
              >
                คลิกที่นี่เพื่อไปหน้าตั้งรหัสผ่านใหม่ →
              </Link>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setSubmittedMessage(null);
              setDevResetUrl(null);
            }}
          >
            ส่งคำขออีกครั้ง
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="อีเมลที่ใช้สมัครสมาชิก" htmlFor="forgot-email">
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <input
                id="forgot-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={cn(inputClass, "pl-9")}
              />
            </div>
          </Field>

          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังส่งลิงก์รีเซ็ต...
              </>
            ) : (
              <>
                ส่งลิงก์ตั้งรหัสผ่านใหม่
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      )}

      <div className="mt-6 border-t border-line pt-5 text-center text-sm text-ink-soft">
        <Link
          href="/signin"
          className="inline-flex items-center gap-1.5 font-semibold text-terracotta-deep hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          กลับไปหน้าเข้าสู่ระบบ
        </Link>
      </div>
    </div>
  );
}
