import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";

export const metadata: Metadata = {
  title: "แจ้งบั๊ก & เสนอแนะ — StudyTable",
  description: "แจ้งปัญหาการใช้งาน เสนอฟีเจอร์ใหม่ หรือส่งความคิดเห็นเพื่อช่วยพัฒนา StudyTable",
};

export default function FeedbackPage() {
  return (
    <main className="pb-16">
      <PageHeader
        eyebrow="Feedback"
        title="แจ้งบั๊ก & เสนอแนะ"
        description="เจอปัญหาการใช้งาน อยากได้ฟีเจอร์เพิ่ม หรือมีข้อเสนอแนะอะไร ส่งมาบอกทีมพัฒนาได้เลย"
        tone="coral"
      />
      <section className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <FeedbackForm />
      </section>
    </main>
  );
}
