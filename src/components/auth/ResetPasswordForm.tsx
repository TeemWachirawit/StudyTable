"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Loader2, Lock } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const missingParams = !token || !email;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (password !== confirmPassword) {
      setError("รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok) {
        setError(data.error || "ไม่สามารถตั้งรหัสผ่านใหม่ได้ กรุณาขอลิงก์ใหม่อีกครั้ง");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line-strong bg-sheet p-6 shadow-xs sm:p-8">
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sage/25 bg-sage-tint px-3 py-1 font-mono text-xs font-semibold text-sage-deep">
          <span className="h-1.5 w-1.5 rounded-full bg-sage" />
          RESET PASSWORD
        </span>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink sm:text-3xl">
          ตั้งรหัสผ่านใหม่
        </h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          {email
            ? `กำหนดรหัสผ่านใหม่สำหรับบัญชี ${email}`
            : "กรอกรหัสผ่านใหม่ที่คุณต้องการใช้งาน"}
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

      {success ? (
        <div className="space-y-4">
          <div
            role="status"
            className="flex items-start gap-2.5 rounded-xl border border-sage/35 bg-sage-tint px-4 py-3.5 text-sm text-sage-deep"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
            <div className="space-y-1">
              <p className="font-semibold text-ink">เปลี่ยนรหัสผ่านสำเร็จแล้ว</p>
              <p>คุณสามารถใช้รหัสผ่านใหม่เพื่อเข้าสู่ระบบได้ทันที</p>
            </div>
          </div>

          <Link href="/signin" className={cn(buttonVariants(), "w-full gap-1.5")}>
            ไปหน้าเข้าสู่ระบบ
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : missingParams ? (
        <div className="space-y-4">
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-slate/30 bg-slate-tint px-4 py-3.5 text-sm text-slate-deep"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate" />
            <span>ลิงก์ตั้งรหัสผ่านใหม่ไม่ถูกต้องหรือไม่ครบถ้วน กรุณาขอลิงก์ใหม่อีกครั้ง</span>
          </div>
          <Link href="/forgot-password" className={cn(buttonVariants(), "w-full")}>
            ขอลิงก์ตั้งรหัสผ่านใหม่
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="รหัสผ่านใหม่" htmlFor="reset-password" hint="อย่างน้อย 6 ตัวอักษร">
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <input
                id="reset-password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={cn(inputClass, "pl-9")}
              />
            </div>
          </Field>

          <Field label="ยืนยันรหัสผ่านใหม่" htmlFor="reset-password-confirm">
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <input
                id="reset-password-confirm"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={cn(inputClass, "pl-9")}
              />
            </div>
          </Field>

          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังบันทึกรหัสผ่านใหม่...
              </>
            ) : (
              <>
                บันทึกรหัสผ่านใหม่
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
