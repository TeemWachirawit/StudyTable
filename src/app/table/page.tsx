import type { Metadata } from "next";
import { StudyDesk } from "@/components/table/StudyDesk";

export const metadata: Metadata = {
  title: "Table — StudyTable",
  description: "บันทึกความคืบหน้าการอ่านหนังสือแต่ละวิชาและแต่ละบท",
};

export default function TablePage() {
  return (
    <main>
      <StudyDesk />
    </main>
  );
}

