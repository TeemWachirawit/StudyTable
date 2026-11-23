import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "ลืมรหัสผ่าน — StudyTable",
  description: "ขอลิงก์สำหรับตั้งรหัสผ่านใหม่เพื่อเข้าใช้งาน StudyTable",
};

export default function ForgotPasswordPage() {
  return (
    <main className="bg-ruled flex min-h-[calc(100vh-8rem)] items-center py-12 sm:py-16">
      <div className="mx-auto w-full max-w-md px-5 sm:px-8">
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
