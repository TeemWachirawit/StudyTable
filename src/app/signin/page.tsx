import { Suspense } from "react";
import type { Metadata } from "next";
import { CalendarDays, BookOpenCheck, Hourglass } from "lucide-react";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ — StudyTable",
  description: "เข้าสู่ระบบเพื่อจัดการตารางอ่านหนังสือและติดตามความคืบหน้า",
};

export default function SignInPage() {
  return (
    <main className="bg-ruled min-h-[calc(100vh-8rem)] py-12 sm:py-16">
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <div className="hidden lg:block">
          <p className="font-mono text-xs font-semibold tracking-widest text-terracotta uppercase">
            StudyTable Workspace
          </p>
          <h2 className="mt-3 font-display text-3xl leading-snug font-bold text-ink">
            ข้อมูลการอ่านของคุณ
            <br />
            ซิงค์ปลอดภัยในที่เดียว
          </h2>
          <p className="mt-4 leading-relaxed text-ink-soft">
            ไม่ว่าจะเปิดจากคอมพิวเตอร์หรือมือถือ ตารางอ่านหนังสือรายสัปดาห์ รายการบทเรียนที่ติ๊กไว้
            และวันสอบทั้งหมดจะถูกบันทึกไว้ในบัญชีของคุณโดยอัตโนมัติ
          </p>

          <ul className="mt-8 space-y-4 border-t border-line pt-6 text-sm">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-terracotta/25 bg-terracotta-tint text-terracotta-deep">
                <CalendarDays className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold text-ink">Planner รายสัปดาห์</p>
                <p className="text-ink-soft">จัดช่วงเวลาอ่านหนังสือแยกสีตามวิชาชัดเจน</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-sage/25 bg-sage-tint text-sage-deep">
                <BookOpenCheck className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold text-ink">Table ติดตามบทเรียน</p>
                <p className="text-ink-soft">บันทึกบทที่อ่านจบแล้วและคำนวณเปอร์เซ็นต์อัตโนมัติ</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-mustard/35 bg-mustard-tint text-mustard-deep">
                <Hourglass className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold text-ink">Exam นับถอยหลังวันสอบ</p>
                <p className="text-ink-soft">เช็กความพร้อมของเนื้อหาที่ออกสอบก่อนถึงวันจริง</p>
              </div>
            </li>
          </ul>
        </div>

        <Suspense
          fallback={
            <div className="h-96 animate-pulse rounded-2xl border border-line bg-sheet p-8" />
          }
        >
          <SignInForm />
        </Suspense>
      </div>
    </main>
  );
}

