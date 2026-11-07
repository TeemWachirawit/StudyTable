import { Suspense } from "react";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "สมัครสมาชิก — StudyTable",
  description: "สร้างบัญชีใหม่เพื่อจัดตารางอ่านหนังสือและติดตามความคืบหน้าการสอบ",
};

const perks = [
  "จัดตารางอ่านหนังสือรายสัปดาห์พร้อมระบบเตือนเวลาชนกัน",
  "เพิ่มวิชาและบทเรียนได้ไม่จำกัด พร้อมคำนวณความคืบหน้าอัตโนมัติ",
  "นับถอยหลังวันสอบและผูกบทเรียนที่ออกสอบได้โดยตรง",
  "ซิงค์ข้อมูลทั้งหมดลงฐานข้อมูล PostgreSQL ส่วนตัวของคุณ",
];

export default function SignUpPage() {
  return (
    <main className="bg-ruled min-h-[calc(100vh-8rem)] py-12 sm:py-16">
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <div className="hidden lg:block">
          <p className="font-mono text-xs font-semibold tracking-widest text-sage uppercase">
            Get Started Free
          </p>
          <h2 className="mt-3 font-display text-3xl leading-snug font-bold text-ink">
            เริ่มต้นจัดโต๊ะอ่านหนังสือ
            <br />
            ที่เป็นระเบียบตั้งแต่วันนี้
          </h2>
          <p className="mt-4 leading-relaxed text-ink-soft">
            เมื่อสมัครสมาชิก ระบบจะเตรียมชุดข้อมูลตัวอย่างเริ่มต้นให้คุณทดลองปรับแต่งตารางเรียน
            วิชาเรียน และวันสอบได้ทันที
          </p>

          <ul className="mt-8 space-y-3.5 border-t border-line pt-6 text-sm text-ink">
            {perks.map((perk) => (
              <li key={perk} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
                <span>{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        <Suspense
          fallback={
            <div className="h-[28rem] animate-pulse rounded-2xl border border-line bg-sheet p-8" />
          }
        >
          <SignUpForm />
        </Suspense>
      </div>
    </main>
  );
}

