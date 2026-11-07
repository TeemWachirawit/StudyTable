"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AlertCircle, ArrowRight, Loader2, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get("callbackUrl") || "/";
  const callbackUrl =
    rawCallback.startsWith("/") &&
    !rawCallback.startsWith("//") &&
    !rawCallback.startsWith("/\\")
      ? rawCallback
      : "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (password !== confirmPassword) {
      setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);

    try {
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = (await registerRes.json()) as { error?: string };

      if (!registerRes.ok) {
        setError(data.error || "ไม่สามารถสร้างบัญชีได้ กรุณาลองใหม่อีกครั้ง");
        setLoading(false);
        return;
      }

      const signInRes = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        router.push("/signin");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
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
          SIGN UP
        </span>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink sm:text-3xl">
          สร้างบัญชีโต๊ะเรียนใหม่
        </h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          สมัครสมาชิกเพื่อเริ่มวางแผนอ่านหนังสือและบันทึกข้อมูลลงฐานข้อมูลส่วนตัว
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="ชื่อของคุณ" htmlFor="signup-name">
          <div className="relative">
            <User className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              id="signup-name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น น้องทีม"
              className={cn(inputClass, "pl-9")}
            />
          </div>
        </Field>

        <Field label="อีเมล" htmlFor="signup-email">
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              id="signup-email"
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

        <Field
          label="รหัสผ่าน"
          htmlFor="signup-password"
          hint="ความยาวอย่างน้อย 6 ตัวอักษร"
        >
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              id="signup-password"
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

        <Field label="ยืนยันรหัสผ่าน" htmlFor="signup-confirm-password">
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              id="signup-confirm-password"
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
              กำลังสร้างบัญชี...
            </>
          ) : (
            <>
              สมัครสมาชิกและเข้าใช้งาน
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 border-t border-line pt-5 text-center text-sm text-ink-soft">
        มีบัญชีอยู่แล้ว?{" "}
        <Link
          href={`/signin${callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
          className="font-semibold text-terracotta-deep hover:underline"
        >
          เข้าสู่ระบบ
        </Link>
      </div>
    </div>
  );
}

