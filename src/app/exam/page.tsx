import type { Metadata } from "next";
import { ExamBoard } from "@/components/exam/ExamBoard";

export const metadata: Metadata = {
  title: "Exam — StudyTable",
  description: "นับถอยหลังวันสอบและดูขอบเขตเนื้อหาที่ออกสอบแต่ละวิชา",
};

export default function ExamPage() {
  return (
    <main>
      <ExamBoard />
    </main>
  );
}

