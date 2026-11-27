import { Suspense } from "react";
import type { Metadata } from "next";
import { StudyDesk } from "@/components/table/StudyDesk";
import { LoadingDesk } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Table — StudyTable",
  description: "บันทึกความคืบหน้าการอ่านหนังสือแต่ละวิชาและแต่ละบท",
};

export default function TablePage() {
  return (
    <main>
      <Suspense fallback={<LoadingDesk />}>
        <StudyDesk />
      </Suspense>
    </main>
  );
}
