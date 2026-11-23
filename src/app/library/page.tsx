import type { Metadata } from "next";
import { LibraryBoard } from "@/components/library/LibraryBoard";

export const metadata: Metadata = {
  title: "Library — StudyTable",
  description: "คลังรวบรวมเนื้อหาที่จะออกสอบ TGAT, TPAT, A-Level และบทเรียน ม.ปลาย หยิบเข้าหน้า Table ได้ทันที",
};

export default function LibraryPage() {
  return (
    <main>
      <LibraryBoard />
    </main>
  );
}
