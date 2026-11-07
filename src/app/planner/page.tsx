import type { Metadata } from "next";
import { PlannerBoard } from "@/components/planner/PlannerBoard";

export const metadata: Metadata = {
  title: "Planner — StudyTable",
  description: "จัดตารางอ่านหนังสือรายสัปดาห์ แยกตามวันและเวลา",
};

export default function PlannerPage() {
  return (
    <main>
      <PlannerBoard />
    </main>
  );
}

