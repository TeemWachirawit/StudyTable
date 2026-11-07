import type { Metadata } from "next";
import { DashboardBoard } from "@/components/dashboard/DashboardBoard";

export const metadata: Metadata = {
  title: "Dashboard — StudyTable",
  description:
    "ดูแผนภูมิสัดส่วนชั่วโมงเรียน ความคืบหน้าแต่ละรายวิชา และจัดการข้อมูลตารางเรียน บทเรียน และวันสอบในที่เดียว",
};

export default function DashboardPage() {
  return (
    <main>
      <DashboardBoard />
    </main>
  );
}

