import type { Metadata } from "next";
import { SettingsBoard } from "@/components/settings/SettingsBoard";

export const metadata: Metadata = {
  title: "ตั้งค่าบัญชี — StudyTable",
  description:
    "จัดการข้อมูลโปรไฟล์ ชื่อผู้ใช้ รูปโปรไฟล์ และความปลอดภัยของบัญชี StudyTable ของคุณ",
};

export default function SettingsPage() {
  return (
    <main>
      <SettingsBoard />
    </main>
  );
}
