"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AlertCircle, ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือยังไม่ได้เชื่อมต่อฐานข้อมูล");
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("ไม่สามารถเข้าสู่ระบบได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line-strong bg-sheet p-6 shadow-xs sm:p-8">
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-terracotta/25 bg-terracotta-tint px-3 py-1 font-mono text-xs font-semibold text-terracotta-deep">
          <span className="h-1.5 w-1.5 rounded-full bg-terracotta" />
          SIGN IN
        </span>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink sm:text-3xl">
          เข้าสู่โต๊ะเรียนของคุณ
        </h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          เข้าสู่ระบบเพื่อซิงค์ตารางอ่านหนังสือ ความคืบหน้าบทเรียน และวันสอบของคุณ
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
        <Field label="อีเมล" htmlFor="signin-email">
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              id="signin-email"
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

        <Field label="รหัสผ่าน" htmlFor="signin-password">
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              id="signin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={cn(inputClass, "pl-9")}
            />
          </div>
        </Field>

        <Button type="submit" disabled={loading} className="mt-2 w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              กำลังเข้าสู่ระบบ...
            </>
          ) : (
            <>
              เข้าสู่ระบบ
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 border-t border-line pt-5 text-center text-sm text-ink-soft">
        ยังไม่มีบัญชีใช่ไหม?{" "}
        <Link
          href={`/signup${callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
          className="font-semibold text-terracotta-deep hover:underline"
        >
          สมัครสมาชิกใหม่
        </Link>
      </div>
    </div>
  );
}

