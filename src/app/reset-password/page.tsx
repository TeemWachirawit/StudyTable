import { Suspense } from "react";
import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "ตั้งรหัสผ่านใหม่ — StudyTable",
  description: "ตั้งรหัสผ่านใหม่สำหรับบัญชี StudyTable ของคุณ",
};

export default function ResetPasswordPage() {
  return (
    <main className="bg-ruled flex min-h-[calc(100vh-8rem)] items-center py-12 sm:py-16">
      <div className="mx-auto w-full max-w-md px-5 sm:px-8">
        <Suspense
          fallback={
            <div className="h-80 animate-pulse rounded-2xl border border-line bg-sheet p-8" />
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
